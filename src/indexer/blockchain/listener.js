import { normalizeEvent } from "../processor/index.js";
import config from "../config.js";

const BATCH_SIZE = config.indexer.catchupBatchSize;
const CHECK_INTERVAL = config.indexer.gapCheckInterval;

function log(name, ...args) {
  console.log(`[${new Date().toISOString()}] [${name}]`, ...args);
}

function logError(name, ...args) {
  console.error(`[${new Date().toISOString()}] [${name}]`, ...args);
}

export function startListener(contracts, store, provider, normalizers = {}) {
  for (const entry of contracts) {
    listenToContract(entry, store, provider, normalizers);
  }
}

function listenToContract(entry, store, provider, normalizers) {
  const { contract, address, name, startBlock } = entry;
  const topicHashes = getTopicHashes(contract);
  const normalizer = normalizers[name] || null;

  log(name, `Starting listener for ${topicHashes.length} event(s)`);
  if (normalizer) {
    log(name, `Normalizer active → ${normalizer.tableName}`);
  }

  runCatchUp(contract, address, name, startBlock, topicHashes, store, provider, normalizer);
  startPolling(contract, address, name, topicHashes, store, provider, normalizer);
}

function getTopicHashes(contract) {
  return contract.interface.fragments
    .filter((f) => f.type === "event")
    .map((f) => contract.interface.getEvent(f.name).topicHash);
}

async function runCatchUp(contract, address, name, startBlock, topicHashes, store, provider, normalizer) {
  try {
    const lastIndexed = await store.getLastIndexedBlock(address);
    const fromBlock = lastIndexed !== null ? lastIndexed + 1 : startBlock;
    if (fromBlock == null) {
      logError(name, "No last indexed block and no start block — skipping catch-up");
      return;
    }
    const currentBlock = await provider.getBlockNumber();

    if (fromBlock > currentBlock) {
      log(name, `Already up to date (block ${currentBlock})`);
      await store.updateLastIndexedBlock(address, currentBlock);
      return;
    }

    log(name, `Catching up from block ${fromBlock} to ${currentBlock}`);

    for (let from = fromBlock; from <= currentBlock; from += BATCH_SIZE) {
      const to = Math.min(from + BATCH_SIZE - 1, currentBlock);
      const logs = await provider.getLogs({
        address,
        fromBlock: from,
        toBlock: to,
        topics: [topicHashes],
      });

      for (const rawLog of logs) {
        try {
          const event = normalizeEvent(rawLog, contract.interface);
          event.contractAddress = address;
          await store.store(event);
          await applyNormalizer(normalizer, event, store, name);
          log(name, `Event: ${event.eventName} at block ${event.blockNumber}`);
        } catch (err) {
          if (!err.message?.includes("duplicate")) {
            logError(name, "Error storing event:", err.message);
          }
        }
      }

      await store.updateLastIndexedBlock(address, to);
      log(name, `Catch-up: blocks ${from}-${to} (${logs.length} events)`);
    }

    log(name, "Catch-up complete");
  } catch (err) {
    logError(name, "Catch-up error:", err.message);
  }
}

function startPolling(contract, address, name, topicHashes, store, provider, normalizer) {
  log(name, "Starting polling for new events...");
  const interval = setInterval(async () => {
    try {
      const lastIndexed = await store.getLastIndexedBlock(address);
      const currentBlock = await provider.getBlockNumber();

      if (lastIndexed === null) return;

      if (currentBlock > lastIndexed) {
        await runCatchUp(contract, address, name, null, topicHashes, store, provider, normalizer);
      }
    } catch (err) {
      logError(name, "Polling error:", err.message);
    }
  }, CHECK_INTERVAL);

  return interval;
}

async function applyNormalizer(normalizer, event, store, contractName) {
  if (!normalizer) return;
  if (!normalizer.handlers[event.eventName]) return;

  try {
    const result = normalizer.handlers[event.eventName](event.args, event.blockNumber);
    if (result.action === "UPSERT") {
      await store.upsertNormalized(normalizer.tableName, result.data, normalizer.conflictColumn);
    }
  } catch (err) {
    logError(contractName, `Normalizer error for ${event.eventName}:`, err.message);
  }
}
