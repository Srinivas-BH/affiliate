const express = require("express");
const {
  submitNotifyRequest,
  getUserRequests,
  cancelRequest,
  getAllRequests,
  getRequestStats,
} = require("../controllers/userRequestController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/", authMiddleware, submitNotifyRequest);
router.get("/user/my-requests", authMiddleware, getUserRequests);
router.delete("/:id", authMiddleware, cancelRequest);

// Admin routes
router.get("/admin/all", authMiddleware, adminOnly, getAllRequests);
router.get("/admin/stats", authMiddleware, adminOnly, getRequestStats);

module.exports = router;
