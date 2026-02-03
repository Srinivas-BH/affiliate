const express = require("express");
const { 
  addProduct, 
  getProductStats, 
  getAllProducts, 
  getProductById 
} = require("../controllers/productController");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/admin/stats", authMiddleware, adminOnly, getProductStats);
router.post("/", authMiddleware, adminOnly, addProduct);
router.get("/:id", getProductById);

module.exports = router;