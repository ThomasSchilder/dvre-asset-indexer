import dotenv from "dotenv";

dotenv.config();

const REQUIRED = ["RPC_URL", "PG_HOST", "PG_USER", "PG_PASSWORD", "PG_DATABASE"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

const config = Object.freeze({
  rpc: {
    url: process.env.RPC_URL,
  },
  pg: {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || "5432", 10),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  indexer: {
    catchupBatchSize: parseInt(process.env.CATCHUP_BATCH_SIZE || "1000", 10),
    gapCheckInterval: parseInt(process.env.GAP_CHECK_INTERVAL || "10000", 10),
  },
});

export default config;
