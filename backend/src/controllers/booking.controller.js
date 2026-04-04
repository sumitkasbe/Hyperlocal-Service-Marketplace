import pool from "../config/db.js";

export async function getProviderBookings(req, res, next) {
  try {
    const providerId = req.user.id;

    const result = await pool.query(
      `
      SELECT b.id, b.status, s.title, u.name AS user_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = $1
        AND b.status = 'pending'
      `,
      [providerId]
    );

    res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
}
