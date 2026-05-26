import { JsonRpcProvider, Contract } from "ethers";
import config from "../config/index.js";

let _provider = null;

export function getProvider() {
  if (!_provider) {
    _provider = new JsonRpcProvider(config.rpc.url);
  }
  return _provider;
}

export async function verifyConnection() {
  const provider = getProvider();
  const network = await provider.getNetwork();
  console.log(`Connected to chain: ${network.name} (chainId: ${network.chainId})`);
  const blockNumber = await provider.getBlockNumber();
  console.log(`Current block number: ${blockNumber}`);
  return { network, blockNumber };
}

export function createContracts(contractRecords) {
  const provider = getProvider();
  return contractRecords.map((record) => {
    const abi = JSON.parse(record.abi.toString("utf-8"));
    const contract = new Contract(record.address, abi, provider);
    console.log(`Loaded contract: ${record.name} (${record.address}) from block ${record.start_block}`);
    return {
      contract,
      address: record.address,
      name: record.name,
      startBlock: record.start_block,
    };
  });
}
