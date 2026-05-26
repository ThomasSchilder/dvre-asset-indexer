import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, address, name, start_block, last_indexed_block, created_at FROM contracts ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:address", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, address, name, start_block, last_indexed_block, created_at FROM contracts WHERE address = $1`,
      [req.params.address]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Contract not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
