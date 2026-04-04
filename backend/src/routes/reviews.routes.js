import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReviewSchema, updateReviewSchema } from "../validators/review.schema.js";
import pool from "../config/db.js";

const router = express.Router();

/**
 * CREATE REVIEW (after completed booking)
 * Only the user who booked can review
 */
router.post(
  "/",
  protect,
  allowRoles("user"),
  validate(createReviewSchema),
  async (req, res, next) => {
    try {
      const { booking_id, rating, comment } = req.body;

      console.log("Creating review for booking:", booking_id);

      // Check if booking exists and belongs to user
      const bookingCheck = await pool.query(
        `SELECT b.* 
         FROM bookings b
         WHERE b.id = $1 AND b.user_id = $2`,
        [booking_id, req.user.id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or you don't have permission"
        });
      }

      const booking = bookingCheck.rows[0];
      console.log("Booking found:", booking);

      // Check if booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: "You can only review completed bookings"
        });
      }

      // Check if review already exists
      const existingReview = await pool.query(
        `SELECT id FROM reviews WHERE booking_id = $1`,
        [booking_id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this booking"
        });
      }

      // Create review
      const result = await pool.query(
        `INSERT INTO reviews (booking_id, user_id, provider_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [booking_id, req.user.id, booking.provider_id, rating, comment]
      );

      console.log("Review created:", result.rows[0]);

      res.status(201).json({
        success: true,
        review: result.rows[0],
        message: "Review submitted successfully"
      });

    } catch (error) {
      console.error("Error in create review:", error);
      next(error);
    }
  }
);

/**
 * GET ALL REVIEWS FOR A PROVIDER
 */
router.get("/provider/:providerId", async (req, res, next) => {
  try {
    const { providerId } = req.params;

    console.log("Fetching reviews for provider:", providerId);

    // First, check if provider exists
    const providerCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'provider'`,
      [providerId]
    );

    if (providerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Provider not found"
      });
    }

    // Get reviews with user details - REMOVED avatar_url
    const result = await pool.query(
      `SELECT 
         r.id,
         r.rating,
         r.comment,
         r.created_at,
         u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.provider_id = $1
       ORDER BY r.created_at DESC`,
      [providerId]
    );

    console.log(`Found ${result.rows.length} reviews`);

    // Calculate average rating and stats
    const avgResult = await pool.query(
      `SELECT 
         COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0) as average_rating,
         COUNT(*) as total_reviews,
         COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
         COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
         COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
         COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
         COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE provider_id = $1`,
      [providerId]
    );

    res.json({
      success: true,
      reviews: result.rows,
      stats: avgResult.rows[0] || {
        average_rating: 0,
        total_reviews: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    });

  } catch (error) {
    console.error("Error fetching provider reviews:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET REVIEWS WRITTEN BY CURRENT USER
 */
router.get("/user/me", protect, allowRoles("user"), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         r.*,
         u.name as provider_name
       FROM reviews r
       JOIN users u ON r.provider_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      reviews: result.rows
    });

  } catch (error) {
    console.error("Error fetching user reviews:", error);
    next(error);
  }
});

/**
 * CHECK IF BOOKING HAS REVIEW
 */
router.get("/booking/:bookingId", protect, async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      `SELECT * FROM reviews WHERE booking_id = $1`,
      [bookingId]
    );

    res.json({
      success: true,
      hasReview: result.rows.length > 0,
      review: result.rows[0] || null
    });

  } catch (error) {
    console.error("Error checking booking review:", error);
    next(error);
  }
});

/**
 * UPDATE REVIEW (only by review author)
 */
router.put(
  "/:id",
  protect,
  allowRoles("user"),
  validate(updateReviewSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      // Check if review exists and belongs to user
      const reviewCheck = await pool.query(
        `SELECT * FROM reviews WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
      );

      if (reviewCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found or you don't have permission"
        });
      }

      // Update review
      const result = await pool.query(
        `UPDATE reviews 
         SET rating = $1, comment = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [rating, comment, id]
      );

      res.json({
        success: true,
        review: result.rows[0],
        message: "Review updated successfully"
      });

    } catch (error) {
      console.error("Error updating review:", error);
      next(error);
    }
  }
);

/**
 * DELETE REVIEW (only by review author)
 */
router.delete("/:id", protect, allowRoles("user"), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission"
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    next(error);
  }
});

export default router;