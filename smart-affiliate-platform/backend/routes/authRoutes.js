const express = require("express");
const {
  initiateLogin, login, forgotPassword, resetPassword,
  getCurrentUser, updateProfile, checkAdminStatus,
  handleHeartbeat, getAdminUserStats, getAllUsers,
  logout, deleteAccount // [NEW]
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login-init", initiateLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/admin-status", checkAdminStatus);

router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);
router.post("/heartbeat", authMiddleware, handleHeartbeat);
router.post("/logout", authMiddleware, logout);
router.delete("/delete-account", authMiddleware, deleteAccount); // [NEW]

router.get("/admin/stats", authMiddleware, getAdminUserStats);
router.get("/admin/users", authMiddleware, getAllUsers);

module.exports = router;