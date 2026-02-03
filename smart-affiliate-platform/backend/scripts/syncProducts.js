const mongoose = require('mongoose');
const path = require('path');
// Ensure dotenv points to the correct .env file in the backend folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const { detectPlatform } = require('../utils/detectPlatform');

async function syncExistingProducts() {
  try {
    // UPDATED: Matches the URI name in your .env.example and fallback in server.js
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/smart-affiliate";
    
    console.log(`Connecting to: ${uri}`);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to synchronize...`);

    let updatedCount = 0;

    for (const product of products) {
      // 1. Fix Platform Distribution: Detect and set to uppercase for filtering
      const detected = detectPlatform(product.affiliateLink);
      product.platform = (detected || "OTHER").toUpperCase();

      // 2. Fix Blank Images: Ensure every product has a valid image URL
      if (!product.imageUrl || product.imageUrl.trim() === "") {
        product.imageUrl = "https://via.placeholder.com/400x400.png?text=Smart+Affiliate+Product";
      }

      await product.save();
      updatedCount++;
    }

    console.log(`✅ Successfully synchronized ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
    process.exit(1);
  }
}

syncExistingProducts();