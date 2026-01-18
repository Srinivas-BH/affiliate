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
  logout // [NEW] Import this function
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Public Routes ---
router.post("/login-init", initiateLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/admin-status", checkAdminStatus);

// --- Protected Routes (Logged in Users) ---
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);

// [NEW] Heartbeat Route - Updates "Last Active" time
router.post("/heartbeat", authMiddleware, handleHeartbeat);

// [NEW] Logout Route - Instantly clears "Active" status
router.post("/logout", authMiddleware, logout);

// --- Admin Only Routes ---
router.get("/admin/stats", authMiddleware, getAdminUserStats);
router.get("/admin/users", authMiddleware, getAllUsers);

module.exports = router;