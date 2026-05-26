import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { contract_address, event_name, block_number, from_block, to_block, q, limit, offset } = req.query;
    const conditions = [];
    const params = [];
    let i = 1;

    if (contract_address) {
      conditions.push(`contract_address = $${i++}`);
      params.push(contract_address);
    }
    if (event_name) {
      conditions.push(`event_name = $${i++}`);
      params.push(event_name);
    }
    if (block_number) {
      conditions.push(`block_number = $${i++}`);
      params.push(parseInt(block_number, 10));
    }
    if (from_block) {
      conditions.push(`block_number >= $${i++}`);
      params.push(parseInt(from_block, 10));
    }
    if (to_block) {
      conditions.push(`block_number <= $${i++}`);
      params.push(parseInt(to_block, 10));
    }
    if (q) {
      conditions.push(`args::text ILIKE $${i++}`);
      params.push(`%${q}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const lim = Math.min(parseInt(limit || "50", 10), 500);
    const off = parseInt(offset || "0", 10);

    const result = await pool.query(
      `SELECT * FROM events ${where} ORDER BY block_number DESC, log_index ASC LIMIT $${i++} OFFSET $${i++}`,
      [...params, lim, off]
    );

    const countResult = await pool.query(`SELECT COUNT(*) FROM events ${where}`, params);

    res.json({
      total: parseInt(countResult.rows[0].count, 10),
      limit: lim,
      offset: off,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM events WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
