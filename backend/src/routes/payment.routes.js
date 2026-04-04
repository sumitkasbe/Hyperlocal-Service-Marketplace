import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

/**
 * USER → PAY ONLINE (MOCK)
 */
router.post(
  "/:bookingId/pay",
  protect,
  async (req, res, next) => {
    try {
      const { bookingId } = req.params;

      //  Check payment exists
      const paymentResult = await pool.query(
        `SELECT id FROM payments WHERE booking_id = $1 AND user_id = $2`,
        [bookingId, req.user.id]
      );

      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: "Payment not found" });
      }

      //  Update payment → SUCCESS
      await pool.query(
        `UPDATE payments
         SET status = 'SUCCESS'
         WHERE booking_id = $1`,
        [bookingId]
      );

      //  Update booking → PAID
      await pool.query(
        `UPDATE bookings
         SET payment_status = 'PAID'
         WHERE id = $1`,
        [bookingId]
      );

      res.json({
        success: true,
        message: "Payment successful (mock)",
      });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * USER → CASH ON DELIVERY (COD)
 */
router.patch(
  "/:bookingId/cod",
  protect,
  async (req, res, next) => {
    try {
      const { bookingId } = req.params;

      //  Update payment
      await pool.query(
        `UPDATE payments
         SET status = 'SUCCESS', method = 'cod'
         WHERE booking_id = $1 AND user_id = $2`,
        [bookingId, req.user.id]
      );

      //  Update booking
      await pool.query(
        `UPDATE bookings
         SET payment_status = 'PAID'
         WHERE id = $1`,
        [bookingId]
      );

      res.json({
        success: true,
        message: "COD payment marked as paid",
      });
    } catch (error) {
      next(error);
    }
  }
);


export default router;