import dotenv from "dotenv";

dotenv.config();

const REQUIRED = ["PG_HOST", "PG_USER", "PG_PASSWORD", "PG_DATABASE"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

const config = Object.freeze({
  pg: {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || "5432", 10),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  api: {
    port: parseInt(process.env.API_PORT || "3000", 10),
  },
});

export default config;
