import express from "express";
import { getUsers, createUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

/**
 * ADMIN ONLY – View all users
 */
router.get(
  "/users",
  protect,
  allowRoles("admin"),
  getUsers
);

/**
 * CREATE USER
 */
router.post("/users", protect, createUser);

/**
 * GET OWN PROFILE
 */
router.get(
  "/me",
  protect,
  allowRoles("user", "provider", "admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, name, email, phone, avatar_url, role, created_at, provider_status FROM users WHERE id = $1",
        [req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * UPDATE USER PROFILE (for customers)
 */
router.put(
  "/me",
  protect,
  allowRoles("user"),
  async (req, res) => {
    try {
      const { name, phone } = req.body;
      
      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             updated_at = NOW()
         WHERE id = $3 AND role = 'user'
         RETURNING id, name, email, phone, role, avatar_url, created_at`,
        [name, phone, req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json({
        success: true,
        user: result.rows[0],
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * UPLOAD USER AVATAR
 */
router.post(
  "/avatar",
  protect,
  allowRoles("user"),
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      await pool.query(
        "UPDATE users SET avatar_url = $1 WHERE id = $2",
        [avatarUrl, req.user.id]
      );
      
      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        url: avatarUrl
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;