import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { config } from "../config/index.js";
import { 
  approveProviderSchema, 
  rejectProviderSchema,
  createAdminSchema,
  updateAdminSchema 
} from "../validators/admin.schema.js";

const router = express.Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

// Admin Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Check if admin exists
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1 AND status = 'active'",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const admin = result.rows[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login
    await pool.query(
      "UPDATE admins SET last_login = NOW() WHERE id = $1",
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    // Remove password from response
    delete admin.password;

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar_url: admin.avatar_url,
        phone: admin.phone
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin Logout (client-side token removal only)
router.post("/logout", protect, allowRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

// ============================================
// ADMIN MANAGEMENT
// ============================================

// Get all admins
router.get("/admins", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, status, avatar_url, phone, last_login, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      admins: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get current admin profile
router.get("/profile", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, status, avatar_url, phone, last_login, created_at
       FROM admins 
       WHERE id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    res.json({
      success: true,
      admin: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create new admin (Super admin only)
router.post(
  "/admins",
  protect,
  allowRoles("admin"),
  validate(createAdminSchema),
  async (req, res, next) => {
    try {
      const { name, email, password, phone, avatar_url } = req.body;

      // Check if admin already exists
      const existing = await pool.query(
        "SELECT id FROM admins WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Admin with this email already exists"
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO admins (name, email, password, phone, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, status, phone, avatar_url, created_at`,
        [name, email, hashedPassword, phone || null, avatar_url || null]
      );

      res.status(201).json({
        success: true,
        admin: result.rows[0],
        message: "Admin created successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update admin profile
router.put(
  "/profile",
  protect,
  allowRoles("admin"),
  validate(updateAdminSchema),
  async (req, res, next) => {
    try {
      const { name, phone, avatar_url } = req.body;
      
      const result = await pool.query(
        `UPDATE admins 
         SET name = COALESCE($1, name),
             phone = COALESCE($2, phone),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, email, role, status, phone, avatar_url`,
        [name, phone, avatar_url, req.user.id]
      );
      
      res.json({
        success: true,
        admin: result.rows[0],
        message: "Profile updated successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change admin password
router.put("/change-password", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Get current admin
    const result = await pool.query(
      "SELECT password FROM admins WHERE id = $1",
      [req.user.id]
    );

    const admin = result.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Delete admin (cannot delete self)
router.delete("/admins/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const adminId = req.params.id;
    
    // Prevent self-deletion
    if (adminId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }
    
    const result = await pool.query(
      "DELETE FROM admins WHERE id = $1 RETURNING id",
      [adminId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DASHBOARD STATS
// ============================================

router.get("/stats", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    // Total Revenue
    const revenueResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED'"
    );
    
    // Total Bookings
    const bookingsResult = await pool.query(
      "SELECT COUNT(*) as total FROM bookings"
    );
    
    // Completed Services (bookings with status 'completed')
    const completedServicesResult = await pool.query(
      "SELECT COUNT(*) as total FROM bookings WHERE status = 'completed'"
    );
    
    // Active Users
    const usersResult = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as total FROM bookings"
    );
    
    // Total Users
    const totalUsersResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'user'"
    );
    
    // Total Providers
    const providersResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'provider' AND provider_status = 'approved'"
    );
    
    // Pending Providers
    const pendingProvidersResult = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role = 'provider' AND provider_status = 'pending'"
    );
    
    // Total Admins
    const adminsResult = await pool.query(
      "SELECT COUNT(*) as total FROM admins"
    );
    
    res.json({
      success: true,
      stats: {
        totalRevenue: revenueResult.rows[0].total,
        totalBookings: bookingsResult.rows[0].total,
        completedServices: completedServicesResult.rows[0].total,
        activeUsers: usersResult.rows[0].total,
        totalUsers: totalUsersResult.rows[0].total,
        activeProviders: providersResult.rows[0].total,
        pendingProviders: pendingProvidersResult.rows[0].total,
        totalAdmins: adminsResult.rows[0].total
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    next(error);
  }
});

// ============================================
// PROVIDER MANAGEMENT (from users table)
// ============================================

// Get all providers (with optional status filter)
router.get("/providers", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT id, name, email, phone, city, avatar_url, provider_status, 
             verified, verified_at, created_at, bio, experience_years,
             business_name, verification_document, document_type, rejection_reason
      FROM users 
      WHERE role = 'provider'
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += " AND provider_status = $1";
      params.push(status);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      providers: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get single provider details
router.get(
  "/providers/:id",
  protect,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
          id, 
          name, 
          email, 
          phone, 
          city, 
          avatar_url, 
          provider_status, 
          verified, 
          verified_at, 
          created_at, 
          bio, 
          experience_years,
          business_name,
          business_address,
          gst_number,
          verification_document,
          document_type,
          rejection_reason
        FROM users 
        WHERE id = $1 AND role = 'provider'`,
        [id]
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
      next(error);
    }
  }
);

// Approve provider
router.patch(
  "/providers/:id/approve",
  protect,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE users 
         SET provider_status = 'approved', 
             verified = true, 
             verified_at = NOW(),
             rejection_reason = NULL
         WHERE id = $1 AND role = 'provider' 
         RETURNING id, name, email, provider_status`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider not found"
        });
      }

      res.json({
        success: true,
        message: `Provider ${result.rows[0].name} approved successfully`,
        provider: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reject provider with reason
router.patch(
  "/providers/:id/reject",
  protect,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid rejection reason (minimum 3 characters)"
        });
      }

      const result = await pool.query(
        `UPDATE users 
         SET provider_status = 'rejected', 
             verified = false,
             rejection_reason = $1
         WHERE id = $2 AND role = 'provider' 
         RETURNING id, name, email, provider_status`,
        [reason, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Provider not found"
        });
      }

      res.json({
        success: true,
        message: `Provider ${result.rows[0].name} rejected`,
        provider: result.rows[0],
        reason: reason
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get provider statistics
router.get("/providers/stats/summary", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_providers,
        COUNT(CASE WHEN provider_status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN provider_status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN provider_status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_count
      FROM users 
      WHERE role = 'provider'
    `);
    
    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// USER MANAGEMENT (Customers from users table)
// ============================================

// Get all customers
router.get("/users", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        phone,
        role,
        status,
        created_at,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as total_bookings
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Block a user
router.patch("/users/:id/block", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const result = await pool.query(
      "UPDATE users SET status = 'blocked' WHERE id = $1 AND role = 'user' RETURNING id, name",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: `User ${result.rows[0].name} blocked successfully`
    });
  } catch (error) {
    next(error);
  }
});

// Unblock a user
router.patch("/users/:id/unblock", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const result = await pool.query(
      "UPDATE users SET status = 'active' WHERE id = $1 AND role = 'user' RETURNING id, name",
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: `User ${result.rows[0].name} unblocked successfully`
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// BOOKING MANAGEMENT
// ============================================

// Get all bookings
router.get("/bookings", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        b.id,
        b.status,
        b.price,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        p.name as provider_name,
        sc.name as service_name,
        b.payment_status,
        b.booking_date,
        b.booking_time
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN users p ON b.provider_id = p.id
      JOIN service_categories sc ON b.service_id = sc.id
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += " WHERE b.status = $1";
      params.push(status);
    }
    
    query += " ORDER BY b.created_at DESC";
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get single booking details
router.get("/bookings/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    
    const result = await pool.query(`
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        p.name as provider_name,
        p.email as provider_email,
        p.phone as provider_phone,
        sc.name as service_name,
        sc.category as service_category
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN users p ON b.provider_id = p.id
      JOIN service_categories sc ON b.service_id = sc.id
      WHERE b.id = $1
    `, [bookingId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// SERVICE CATEGORIES MANAGEMENT
// ============================================

// Get all service categories
router.get("/categories", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM service_categories ORDER BY name"
    );
    
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Add new service category
router.post("/categories", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { name, description, icon, category } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    
    // Check if category already exists
    const existing = await pool.query(
      "SELECT id FROM service_categories WHERE name = $1",
      [name]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }
    
    const result = await pool.query(
      "INSERT INTO service_categories (name, description, icon, category) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description || null, icon || 'Tool', category || 'General']
    );
    
    res.status(201).json({
      success: true,
      category: result.rows[0],
      message: "Category added successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Delete service category
router.delete("/categories/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has provider services
    const services = await pool.query(
      "SELECT id FROM provider_services WHERE service_id = $1 LIMIT 1",
      [categoryId]
    );
    
    if (services.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing services"
      });
    }
    
    const result = await pool.query(
      "DELETE FROM service_categories WHERE id = $1 RETURNING id",
      [categoryId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PAYMENTS MANAGEMENT
// ============================================

// Get all payments
router.get("/payments", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.amount,
        p.status as payment_status,
        p.created_at,
        p.booking_id,
        b.status as booking_status,
        sc.name as service_name,
        u.name as user_name,
        pr.name as provider_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN service_categories sc ON b.service_id = sc.id
      JOIN users u ON p.user_id = u.id
      JOIN users pr ON b.provider_id = pr.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({
      success: true,
      payments: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Get revenue summary
router.get("/revenue", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN amount END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '30 days' THEN amount END), 0) as monthly_revenue,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '7 days' THEN amount END), 0) as weekly_revenue,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' AND created_at::date = CURRENT_DATE THEN amount END), 0) as daily_revenue
      FROM payments
    `);
    
    res.json({
      success: true,
      revenue: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;