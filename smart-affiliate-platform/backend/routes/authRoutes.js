const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  deleteAccount,
  setupAdmin,
  checkAdminStatus,
  getUserStats,
  updateHeartbeat,
  logout, // <--- ADD THIS LINE
} = require("../controllers/authController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/setup-admin", setupAdmin);
router.get("/admin-status", checkAdminStatus);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteAccount);
router.post("/heartbeat", authMiddleware, updateHeartbeat);
router.post("/logout", authMiddleware, logout); // <--- NOW THIS WILL WORK

// Admin Analytics
router.get("/admin/stats", authMiddleware, adminOnly, getUserStats);

module.exports = router;