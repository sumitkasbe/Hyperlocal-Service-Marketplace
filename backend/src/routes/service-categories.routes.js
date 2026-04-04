import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all service categories
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM service_categories WHERE is_active = true ORDER BY name`
    );
    
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET providers for a specific service
router.get("/:serviceId/providers", async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    
    console.log("Fetching providers for service:", serviceId);
    
    // First check if service exists
    const serviceCheck = await pool.query(
      `SELECT * FROM service_categories WHERE id = $1`,
      [serviceId]
    );
    
    if (serviceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    // Get providers - Only selecting columns that exist in users table
    const result = await pool.query(
      `SELECT 
         ps.id,
         ps.provider_id,
         ps.price,
         ps.description,
         ps.experience_years,
         ps.is_available,
         ps.created_at,
         u.name as provider_name,
         u.email,
         sc.name as service_name,
         sc.icon as service_icon,
         COALESCE((SELECT AVG(rating)::DECIMAL(10,2) FROM reviews WHERE provider_id = ps.provider_id), 0) as avg_rating,
         COALESCE((SELECT COUNT(*) FROM reviews WHERE provider_id = ps.provider_id), 0) as total_reviews
       FROM provider_services ps
       JOIN users u ON ps.provider_id = u.id
       JOIN service_categories sc ON ps.service_id = sc.id
       WHERE ps.service_id = $1 
         AND ps.is_available = true 
         AND u.role = 'provider'
       ORDER BY avg_rating DESC NULLS LAST, ps.price ASC`,
      [serviceId]
    );
    
    console.log(`Found ${result.rows.length} providers`);
    
    res.json({
      success: true,
      providers: result.rows
    });
  } catch (error) {
    console.error("Error in providers endpoint:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

export default router;