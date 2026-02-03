const express = require("express");
const {
  initiateLogin,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  checkAdminStatus,
  handleHeartbeat,
  getAdminUserStats,
  getAllUsers,
  logout
} = require("../controllers/authController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * --- Public Routes ---
 * These do not require a token.
 */
router.post("/login-init", initiateLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/admin-status", checkAdminStatus);

/**
 * --- Protected Routes (Logged-in Users) ---
 * Require 'authMiddleware' to verify the JWT token.
 */

// Get current logged-in user details
router.get("/me", authMiddleware, getCurrentUser);

// Update user's own profile
router.put("/profile", authMiddleware, updateProfile);

// [NEW] Heartbeat - Updates "Last Active" timestamp in DB
router.post("/heartbeat", authMiddleware, handleHeartbeat);

// [NEW] Logout - Clears active session status in DB
router.post("/logout", authMiddleware, logout);

/**
 * --- Admin Only Routes ---
 * Require both 'authMiddleware' (valid token) AND 'adminOnly' (role check).
 */

// Get numerical stats for dashboard cards (Total Users, Live Now)
router.get("/admin/stats", authMiddleware, adminOnly, getAdminUserStats);

// Get full list of users for the User Directory table
router.get("/admin/users", authMiddleware, adminOnly, getAllUsers);

module.exports = router;