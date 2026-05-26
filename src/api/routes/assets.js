import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { name, owner, asset_type, limit, offset } = req.query;
    const conditions = [];
    const params = [];
    let i = 1;

    if (name) {
      conditions.push(`name ILIKE $${i++}`);
      params.push(`%${name}%`);
    }
    if (owner) {
      conditions.push(`owner ILIKE $${i++}`);
      params.push(`%${owner}%`);
    }
    if (asset_type !== undefined) {
      conditions.push(`asset_type = $${i++}`);
      params.push(parseInt(asset_type, 10));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const lim = Math.min(parseInt(limit || "50", 10), 500);
    const off = parseInt(offset || "0", 10);

    const result = await pool.query(
      `SELECT * FROM asset_v1 ${where} ORDER BY asset_id LIMIT $${i++} OFFSET $${i++}`,
      [...params, lim, off]
    );

    const countResult = await pool.query(`SELECT COUNT(*) FROM asset_v1 ${where}`, params);

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
    const result = await pool.query(`SELECT * FROM asset_v1 WHERE asset_id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Asset not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
