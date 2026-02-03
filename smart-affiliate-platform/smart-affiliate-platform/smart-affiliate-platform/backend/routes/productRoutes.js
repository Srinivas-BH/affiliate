const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  trackClick,
  getProductStats,
} = require("../controllers/productController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/:id/click", trackClick);

// Protected admin routes
router.post("/", authMiddleware, adminOnly, addProduct);
router.put("/:id", authMiddleware, adminOnly, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);
router.get("/admin/stats", authMiddleware, adminOnly, getProductStats);

module.exports = router;
