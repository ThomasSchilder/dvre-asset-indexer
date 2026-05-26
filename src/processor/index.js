export function normalizeEvent(log, contractInterface = null) {
  let eventName = log.fragment?.name ?? null;
  let args = {};

  if (eventName && log.args) {
    args = serializeArgs(log.args, log.fragment?.inputs);
  } else if (contractInterface && log.topics?.length > 0) {
    try {
      const parsed = contractInterface.parseLog({ topics: [...log.topics], data: log.data });
      eventName = parsed.name;
      args = serializeArgs(parsed.args, parsed.fragment.inputs);
    } catch (err) {
      console.error(`[normalizeEvent] parseLog failed for topics ${log.topics[0]}: ${err.message}`);
    }
  }

  return {
    contractAddress: log.address ?? null,
    eventName,
    blockNumber: log.blockNumber ?? null,
    transactionHash: log.transactionHash ?? null,
    logIndex: log.index ?? log.logIndex ?? null,
    timestamp: null,
    args,
  };
}

function serializeArgs(args, inputs) {
  const obj = {};
  if (args == null || !inputs) return obj;
  for (const input of inputs) {
    if (input.name) {
      const value = args[input.name];
      obj[input.name] = typeof value === "bigint" ? value.toString() : value;
    }
  }
  return obj;
}
