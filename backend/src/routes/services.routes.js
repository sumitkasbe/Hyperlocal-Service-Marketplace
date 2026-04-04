import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema } from "../validators/service.schema.js";
import pool from "../config/db.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("provider"),
  validate(createBookingSchema),
  async (req, res, next) => {
    try {
      const { title, description, price } = req.body;

      const result = await pool.query(
        `INSERT INTO services (provider_id, title, description, price)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [req.user.id, title, description, price]
      );

      res.status(201).json({
        success: true,
        service: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT services.*, users.name AS provider_name
       FROM services
       JOIN users ON services.provider_id = users.id`
    );

    res.json({
      success: true,
      services: result.rows,
    });
  } catch (error) {
    next(error);
    
  }
});

export default router;
