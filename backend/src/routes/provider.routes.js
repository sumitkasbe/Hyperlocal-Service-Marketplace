import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { requestProvider } from "../controllers/provider.controller.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Configure Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'provider-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configure Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'provider-documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const uploadDocument = multer({ 
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

router.post("/request", protect, requestProvider);

router.get(
  "/jobs",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const result = await pool.query(
        "SELECT provider_status FROM users WHERE id = $1",
        [req.user.id]
      );

      if (result.rows[0].provider_status !== "approved") {
        return res.status(403).json({
          success: false,
          message: "Provider not approved yet",
        });
      }

      res.json({
        success: true,
        message: "Provider jobs",
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET PROVIDER PROFILE
 */
router.get(
  "/profile",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT 
          id, 
          name, 
          email, 
          phone, 
          avatar_url, 
          bio, 
          experience_years,
          address,
          city,
          pincode,
          verified,
          provider_status,
          rejection_reason,
          verification_document,
          document_type,
          created_at,
          updated_at
        FROM users 
        WHERE id = $1 AND role = 'provider'`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider not found"
        });
      }

      res.json({
        success: true,
        provider: result.rows[0]
      });

    } catch (error) {
      console.error("Error fetching provider profile:", error);
      next(error);
    }
  }
);

/**
 * UPDATE PROVIDER PROFILE
 */
router.put(
  "/profile",
  protect,
  allowRoles("provider"),
  async (req, res, next) => {
    try {
      const {
        name,
        phone,
        bio,
        experience_years,
        address,
        city,
        pincode
      } = req.body;

      const result = await pool.query(
        `UPDATE users 
         SET 
           name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           bio = COALESCE($3, bio),
           experience_years = COALESCE($4, experience_years),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           pincode = COALESCE($7, pincode),
           updated_at = NOW()
         WHERE id = $8 AND role = 'provider'
         RETURNING id, name, email, phone, avatar_url, bio, experience_years, 
                   address, city, pincode, verified, provider_status, updated_at`,
        [name, phone, bio, experience_years, address, city, pincode, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider not found"
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        provider: result.rows[0]
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      next(error);
    }
  }
);

/**
 * UPLOAD PROFILE AVATAR (Cloudinary)
 */
router.post(
  "/avatar",
  protect,
  allowRoles("provider"),
  uploadAvatar.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const avatarUrl = req.file.path; // Cloudinary URL

      const result = await pool.query(
        `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url`,
        [avatarUrl, req.user.id]
      );

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        url: avatarUrl
      });

    } catch (error) {
      console.error("Error uploading avatar:", error);
      next(error);
    }
  }
);

/**
 * UPLOAD VERIFICATION DOCUMENT (Cloudinary with resubmission handling)
 */
router.post(
  "/verification-document",
  protect,
  allowRoles("provider"),
  uploadDocument.single('document'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const documentUrl = req.file.path; // Cloudinary URL
      const { documentType } = req.body;

      // Check current provider status
      const currentProvider = await pool.query(
        "SELECT provider_status FROM users WHERE id = $1",
        [req.user.id]
      );

      // Reset status to pending for rejected providers (resubmission)
      const newStatus = currentProvider.rows[0].provider_status === 'rejected' ? 'pending' : currentProvider.rows[0].provider_status;

      const result = await pool.query(
        `UPDATE users 
         SET verification_document = $1, 
             document_type = $2,
             provider_status = $3,
             verified = false,
             rejection_reason = NULL,
             updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, provider_status, verification_document`,
        [documentUrl, documentType, newStatus, req.user.id]
      );

      res.json({
        success: true,
        message: newStatus === 'pending' 
          ? "Document uploaded successfully. Your application will be reviewed again."
          : "Document uploaded successfully.",
        url: documentUrl,
        provider: result.rows[0]
      });

    } catch (error) {
      console.error("Error uploading document:", error);
      next(error);
    }
  }
);

export default router;