import pg from "pg";
import config from "./config.js";

const pool = new pg.Pool(config.pg);

export default pool;
