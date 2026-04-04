import pool from "../config/db.js";

export async function requestProvider(req, res, next) {
  try {
    await pool.query(
      `UPDATE users 
       SET role = 'provider', provider_status = 'pending'
       WHERE id = $1`,
      [req.user.id],
    );

    res.json({
      success: true,
      message: "Provider request submitted, awaiting admin approval",
    });
  } catch (error) {
    next(error);
  }
}
