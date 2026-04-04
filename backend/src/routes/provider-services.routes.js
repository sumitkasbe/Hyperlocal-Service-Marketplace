import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

// GET provider's own services
router.get("/my-services", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         ps.*,
         sc.name as service_name,
         sc.description as service_description,
         sc.icon,
         sc.category
       FROM provider_services ps
       JOIN service_categories sc ON ps.service_id = sc.id
       WHERE ps.provider_id = $1
       ORDER BY ps.created_at DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST add a new service offering
router.post("/", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const { service_id, price, description, experience_years } = req.body;
    
    // Check if already exists
    const existing = await pool.query(
      `SELECT id FROM provider_services WHERE provider_id = $1 AND service_id = $2`,
      [req.user.id, service_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already offer this service"
      });
    }
    
    const result = await pool.query(
      `INSERT INTO provider_services (provider_id, service_id, price, description, experience_years)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, service_id, price, description, experience_years]
    );
    
    res.status(201).json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT update service offering
router.put("/:id", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, description, experience_years, is_available } = req.body;
    
    // Verify ownership
    const check = await pool.query(
      `SELECT id FROM provider_services WHERE id = $1 AND provider_id = $2`,
      [id, req.user.id]
    );
    
    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    const result = await pool.query(
      `UPDATE provider_services 
       SET price = COALESCE($1, price),
           description = COALESCE($2, description),
           experience_years = COALESCE($3, experience_years),
           is_available = COALESCE($4, is_available),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [price, description, experience_years, is_available, id]
    );
    
    res.json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE service offering
router.delete("/:id", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM provider_services WHERE id = $1 AND provider_id = $2 RETURNING id`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    res.json({
      success: true,
      message: "Service removed successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;