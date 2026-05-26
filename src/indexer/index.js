import config from "./config.js";
import { verifyConnection, createContracts, getProvider } from "./blockchain/provider.js";
import { startListener } from "./blockchain/listener.js";
import { PostgresStore } from "./storage/postgres.js";

async function main() {
  console.log("Starting dvre-asset-indexer...");
  console.log("Config:", {
    rpc: config.rpc.url,
    pg: `${config.pg.user}@${config.pg.host}:${config.pg.port}/${config.pg.database}`,
    catchupBatchSize: config.indexer.catchupBatchSize,
    gapCheckInterval: config.indexer.gapCheckInterval,
  });

  await verifyConnection();

  const store = new PostgresStore();
  await store.init();

  const contractRecords = await store.getContracts();
  if (contractRecords.length === 0) {
    console.warn("No contracts found in database. Run 'npm run import-contracts' to add contracts.");
  }

  const contracts = createContracts(contractRecords);
  const provider = getProvider();

  if (contracts.length > 0) {
    startListener(contracts, store, provider);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
