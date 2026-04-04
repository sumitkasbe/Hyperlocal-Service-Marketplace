import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema } from "../validators/booking.schema.js";
import { idParamSchema } from "../validators/common.schema.js";
import pool from "../config/db.js";
import { 
  sendWhatsAppBookingConfirmation, 
  sendWhatsAppNewBookingRequest 
} from "../services/whatsapp.service.js";

const router = express.Router();

/**
 * USER → CREATE BOOKING
 */
router.post(
  "/",
  protect,
  allowRoles("user"),
  validate(createBookingSchema),
  async (req, res, next) => {
    try {
      const { service_id, provider_id, booking_date, booking_time, address, notes } = req.body?.body ?? req.body;

      if (!service_id) {
        return res.status(400).json({ success: false, message: "service_id is required" });
      }

      if (!provider_id) {
        return res.status(400).json({ success: false, message: "provider_id is required" });
      }

      // Get provider service details
      const providerServiceResult = await pool.query(
        `SELECT ps.*, sc.name as service_name, u.name as provider_name
         FROM provider_services ps
         JOIN service_categories sc ON ps.service_id = sc.id
         JOIN users u ON ps.provider_id = u.id
         WHERE ps.service_id = $1 AND ps.provider_id = $2 AND ps.is_available = true`,
        [service_id, provider_id],
      );

      if (providerServiceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider service not found or unavailable",
        });
      }

      const providerService = providerServiceResult.rows[0];
      const price = providerService.price;

      // Run booking insert + user/provider lookups in parallel
      const [bookingResult, userResult, providerResult] = await Promise.all([
        pool.query(
          `INSERT INTO bookings (
             user_id, provider_id, service_id,
             booking_date, booking_time, address,
             notes, price, status, payment_status
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'UNPAID')
           RETURNING id, status, payment_status, created_at`,
          [
            req.user.id, provider_id, service_id,
            booking_date || null, booking_time || null,
            address || null, notes || null, price,
          ],
        ),
        pool.query("SELECT name, email, phone FROM users WHERE id = $1", [req.user.id]),
        pool.query("SELECT name, email, phone FROM users WHERE id = $1", [provider_id]),
      ]);

      const booking = bookingResult.rows[0];
      const userRow = userResult.rows[0];
      const providerRow = providerResult.rows[0];

      // Create payment record
      await pool.query(
        `INSERT INTO payments (booking_id, user_id, provider_id, amount, status)
         VALUES ($1, $2, $3, $4, 'PENDING')`,
        [booking.id, req.user.id, provider_id, price],
      );

      // ========== FIRE-AND-FORGET WHATSAPP NOTIFICATIONS ==========
      const bookingData = {
        id: booking.id,
        service_name: providerService.service_name,
        provider_name: providerRow.name,
        user_name: userRow.name,
        booking_date: booking_date || null,
        booking_time: booking_time || null,
        price,
      };

      Promise.allSettled([
        userRow.phone
          ? sendWhatsAppBookingConfirmation(userRow, bookingData)
          : Promise.resolve(),
        providerRow.phone
          ? sendWhatsAppNewBookingRequest(providerRow, bookingData)
          : Promise.resolve(),
      ]).then((results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(`❌ WhatsApp notification [${i}] failed:`, r.reason);
          }
        });
      });
      // ========== END WHATSAPP NOTIFICATIONS ==========

      return res.status(201).json({
        success: true,
        booking: {
          ...booking,
          price,
          service_name: providerService.service_name,
          provider_name: providerService.provider_name,
        },
        message: "Booking created successfully. Payment pending.",
      });
    } catch (err) {
      console.error("Error creating booking:", err);
      next(err);
    }
  },
);

/**
 * GET SINGLE BOOKING DETAILS
 */
router.get("/:id", protect, async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        b.*,
        sc.name as service_name,
        sc.icon as service_icon,
        u_provider.name as provider_name,
        u_provider.email as provider_email,
        -- Removed u_provider.phone since it doesn't exist
        u_user.name as user_name,
        u_user.email as user_email
        -- Removed u_user.phone since it doesn't exist
      FROM bookings b
      JOIN service_categories sc ON b.service_id = sc.id
      JOIN users u_provider ON b.provider_id = u_provider.id
      JOIN users u_user ON b.user_id = u_user.id
      WHERE b.id = $1
    `;

    // If user is not admin, ensure they only see their own bookings
    if (userRole !== 'admin') {
      if (userRole === 'user') {
        query += ` AND b.user_id = $2`;
      } else if (userRole === 'provider') {
        query += ` AND b.provider_id = $2`;
      }
      const result = await pool.query(query, [bookingId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or access denied",
        });
      }
      
      return res.json({
        success: true,
        booking: result.rows[0],
      });
    } else {
      // Admin can see any booking
      const result = await pool.query(query, [bookingId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }
      
      return res.json({
        success: true,
        booking: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Error in get booking details:", error);
    next(error);
  }
});


/**
 * PROVIDER → ACCEPT BOOKING
 */
router.patch(
  "/:id/accept",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const bookingId = req.params.id;

      // Check if booking exists and belongs to this provider
      const result = await pool.query(
        `SELECT b.status, b.provider_id
         FROM bookings b
         WHERE b.id = $1`,
        [bookingId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (result.rows[0].provider_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (result.rows[0].status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending bookings can be accepted",
        });
      }

      await pool.query(
        `UPDATE bookings SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [bookingId],
      );

      res.json({
        success: true,
        message: "Booking accepted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);


/**
 * USER → VIEW MY BOOKINGS
 */
router.get("/user/me", protect, allowRoles("user"), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         b.id,
         b.status,
         b.price,
         b.booking_date,
         b.booking_time,
         b.created_at,
         sc.name as service_name,
         u.name as provider_name,
         u.email as provider_email
         -- Removed u.phone since it doesn't exist
       FROM bookings b
       JOIN service_categories sc ON b.service_id = sc.id
       JOIN users u ON b.provider_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error("Error in user bookings:", error);
    next(error);
  }
});


/**
 * PROVIDER → GET ALL BOOKINGS (with optional status filter)
 */
router.get(
  "/provider/me",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      
      let query = `
        SELECT 
          b.id,
          b.status,
          b.price,
          b.booking_date,
          b.booking_time,
          b.created_at,
          sc.name as service_name,
          u.name as user_name,
          u.email as user_email,
          -- REMOVED u.phone
          b.address,
          b.notes
        FROM bookings b
        JOIN service_categories sc ON b.service_id = sc.id
        JOIN users u ON b.user_id = u.id
        WHERE b.provider_id = $1
      `;
      
      const params = [req.user.id];
      
      if (status) {
        query += ` AND b.status = $2`;
        params.push(status);
      }
      
      query += ` ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 1
          WHEN b.status = 'accepted' THEN 2
          WHEN b.status = 'completed' THEN 3
          ELSE 4
        END,
        b.created_at DESC`;
      
      const result = await pool.query(query, params);

      res.json({
        success: true,
        bookings: result.rows
      });
    } catch (error) {
      console.error("Error in provider bookings:", error);
      next(error);
    }
  },
);

/**
 * PROVIDER → REJECT BOOKING
 */
router.patch(
  "/:id/reject",
  protect,
  allowRoles("provider"),
  validate(idParamSchema),
  async (req, res, next) => {
    try {
      const bookingId = req.params.id;

      const booking = await pool.query(
        `SELECT status, provider_id FROM bookings WHERE id = $1`,
        [bookingId],
      );

      if (booking.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (booking.rows[0].provider_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (booking.rows[0].status !== "pending") {
        return res.status(400).json({ 
          success: false, 
          message: "Only pending bookings can be rejected" 
        });
      }

      await pool.query(
        `UPDATE bookings SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
        [bookingId],
      );

      res.json({ 
        success: true, 
        message: "Booking rejected successfully" 
      });
    } catch (error) {
      next(error);
    }
  },
);


/**
 * PROVIDER → COMPLETE BOOKING
 */
router.patch(
  "/:id/complete",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const bookingId = req.params.id;

      const booking = await pool.query(
        `SELECT status, provider_id FROM bookings WHERE id = $1`,
        [bookingId],
      );

      if (booking.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (booking.rows[0].provider_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (booking.rows[0].status !== "accepted") {
        return res.status(400).json({
          success: false,
          message: "Booking must be accepted before completion",
        });
      }

      await pool.query(
        `UPDATE bookings SET status = 'completed', updated_at = NOW() WHERE id = $1`,
        [bookingId],
      );

      // Update payment status to COMPLETED (optional)
      await pool.query(
        `UPDATE payments SET status = 'COMPLETED' WHERE booking_id = $1`,
        [bookingId],
      );

      res.json({ 
        success: true, 
        message: "Booking completed successfully" 
      });
    } catch (error) {
      next(error);
    }
  },
);


/**
 * USER → CANCEL BOOKING
 */
router.patch(
  "/:id/cancel",
  protect,
  allowRoles("user"),
  validate(idParamSchema),
  async (req, res, next) => {
    try {
      const bookingId = req.params.id;

      const booking = await pool.query(
        `SELECT user_id, status FROM bookings WHERE id = $1`,
        [bookingId],
      );

      if (booking.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (booking.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (!["pending", "accepted"].includes(booking.rows[0].status)) {
        return res.status(400).json({
          success: false,
          message: "Only pending or accepted bookings can be cancelled",
        });
      }

      await pool.query(
        `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [bookingId],
      );

      res.json({ 
        success: true, 
        message: "Booking cancelled successfully" 
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;