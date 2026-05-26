import fs from "fs";
import path from "path";
import { PostgresStore } from "./postgres.js";

const CONTRACTS_FILE = path.resolve("contracts.json");

async function importContracts() {
  if (!fs.existsSync(CONTRACTS_FILE)) {
    console.error(`No contracts.json found at ${CONTRACTS_FILE}`);
    process.exit(1);
  }

  const contracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE, "utf-8"));
  if (!Array.isArray(contracts) || contracts.length === 0) {
    console.error("contracts.json is empty or not an array");
    process.exit(1);
  }

  const store = new PostgresStore();
  await store.init();

  for (const entry of contracts) {
    const { address, name, abiPath, startBlock } = entry;

    if (!address || !name || !abiPath) {
      console.warn(`Skipping invalid entry: ${JSON.stringify(entry)}`);
      continue;
    }

    const resolvedAbiPath = path.resolve(abiPath);
    if (!fs.existsSync(resolvedAbiPath)) {
      console.warn(`ABI file not found: ${resolvedAbiPath} — skipping ${name}`);
      continue;
    }

    const abiJson = fs.readFileSync(resolvedAbiPath, "utf-8");
    const abiBuffer = Buffer.from(abiJson, "utf-8");

    await store.importContract(address, name, abiBuffer, startBlock ?? 0);
  }

  await store.close();
  console.log("Import complete.");
}

importContracts().catch((err) => {
  console.error("Import error:", err);
  process.exit(1);
});
