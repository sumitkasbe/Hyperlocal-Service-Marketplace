import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { config } from "../config/index.js";


// SIGNUP
export async function signup(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body; // Added phone

    if (!name || !email || !password || !role) {
      throw new AppError("All fields are required", 400);
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        throw new AppError("Please enter a valid 10-digit phone number", 400);
      }
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Added phone parameter ($6)
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, provider_status, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, provider_status, phone`,
      [name, email, hashedPassword, role, role === 'provider' ? 'pending' : 'none', phone || null],
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    console.log("✅ User created with role:", user.role);
    console.log("📱 Phone number saved:", user.phone);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider_status: user.provider_status,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
}

// LOGIN
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password required", 400);
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      throw new AppError("Invalid credentials", 400);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 400);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider_status: user.provider_status,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET CURRENT USER
export async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at, phone FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}