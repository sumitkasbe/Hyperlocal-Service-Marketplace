import pool from "../config/db.js";

export async function approveProvider(req, res) {
  await pool.query(
    `UPDATE users
     SET provider_status='approved'
     WHERE id=$1`,
    [req.params.id]
  );

  res.json({
    success: true,
    message: "Provider approved",
  });
}
