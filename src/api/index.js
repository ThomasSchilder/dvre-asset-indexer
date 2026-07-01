import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";
import assetsRouter from "./routes/assets.js";
import eventsRouter from "./routes/events.js";
import contractsRouter from "./routes/contracts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());

const openapiPath = path.join(__dirname, "openapi.yaml");
if (fs.existsSync(openapiPath)) {
  const spec = YAML.parse(fs.readFileSync(openapiPath, "utf8"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

app.use(express.json());

app.use("/api/assets", assetsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/contracts", contractsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.api.port, () => {
  console.log(`dvre-asset-api listening on port ${config.api.port}`);
});
