import pg from "pg";
import config from "../config.js";

export class PostgresStore {
  constructor() {
    this.pool = new pg.Pool(config.pg);
  }

  async init(normalizers = []) {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        address TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        abi BYTEA NOT NULL,
        start_block INTEGER NOT NULL DEFAULT 0,
        last_indexed_block INTEGER DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        contract_address TEXT NOT NULL,
        event_name TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        transaction_hash TEXT NOT NULL,
        log_index INTEGER NOT NULL,
        timestamp TIMESTAMP,
        args JSONB NOT NULL DEFAULT '{}',
        UNIQUE (transaction_hash, log_index)
      );

      CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
      CREATE INDEX IF NOT EXISTS idx_events_block ON events(block_number);
      CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
    `);
    console.log("Database tables initialized");

    for (const normalizer of normalizers) {
      await this.createNormalizedTable(normalizer.tableName, normalizer.columns);
    }
  }

  async createNormalizedTable(tableName, columns) {
    const colDefs = columns.map((c) => `${c.name} ${c.type}`).join(", ");
    await this.pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${colDefs})`);
    console.log(`Normalized table "${tableName}" initialized`);
  }

  async insertNormalized(tableName, data, conflictColumn) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const colNames = keys.join(", ");
    await this.pool.query(
      `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders}) ON CONFLICT (${conflictColumn}) DO NOTHING`,
      values
    );
  }

  async store(event) {
    await this.pool.query(
      `INSERT INTO events (contract_address, event_name, block_number, transaction_hash, log_index, timestamp, args)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (transaction_hash, log_index) DO NOTHING`,
      [
        event.contractAddress,
        event.eventName,
        event.blockNumber,
        event.transactionHash,
        event.logIndex,
        event.timestamp ? new Date(event.timestamp * 1000) : null,
        JSON.stringify(event.args),
      ]
    );
  }

  async getLastIndexedBlock(contractAddress) {
    const result = await this.pool.query(
      `SELECT last_indexed_block FROM contracts WHERE address = $1`,
      [contractAddress]
    );
    const block = result.rows[0]?.last_indexed_block;
    return block !== null && block !== undefined ? parseInt(block, 10) : null;
  }

  async updateLastIndexedBlock(contractAddress, blockNumber) {
    await this.pool.query(
      `UPDATE contracts SET last_indexed_block = GREATEST(last_indexed_block, $2) WHERE address = $1 AND (last_indexed_block IS NULL OR $2 > last_indexed_block)`,
      [contractAddress, blockNumber]
    );
  }

  async getContracts() {
    const result = await this.pool.query(`SELECT id, address, name, abi, start_block FROM contracts`);
    return result.rows;
  }

  async importContract(address, name, abiBuffer, startBlock) {
    const result = await this.pool.query(
      `INSERT INTO contracts (address, name, abi, start_block)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (address) DO UPDATE SET
         name = EXCLUDED.name,
         abi = EXCLUDED.abi,
         start_block = EXCLUDED.start_block
       RETURNING id, address, name`,
      [address, name, abiBuffer, startBlock]
    );
    console.log(`Upserted: ${result.rows[0].name} (${result.rows[0].address}) — id ${result.rows[0].id}`);
  }

  async close() {
    await this.pool.end();
  }
}
