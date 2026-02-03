const cron = require("node-cron");
const Product = require("../models/Product");
const { fetchProductByASIN } = require("../utils/amazonPAAPI");

/**
 * Amazon Price Updater - Runs daily at midnight
 * In production, integrate with actual Amazon PA-API
 */
const startAmazonPriceUpdater = () => {
  console.log("Amazon Price Updater started - Schedule: 0 0 * * * (Daily at midnight)");

  cron.schedule("0 0 * * *", async () => {
    console.log("Running Amazon price update job...");

    try {
      const amazonProducts = await Product.find({
        platform: "AMAZON",
        strategy: "AMAZON_API",
      });

      console.log(`Found ${amazonProducts.length} Amazon products to update`);

      for (const product of amazonProducts) {
        try {
          if (!product.asin) {
            console.warn(`Product ${product._id} missing ASIN, skipping...`);
            continue;
          }

          // Fetch latest data from Amazon PA-API
          const updatedData = await fetchProductByASIN(product.asin);

          // Update product with latest data
          product.price = updatedData.price;
          product.originalPrice = updatedData.originalPrice;
          product.discount = updatedData.discount;
          product.imageUrl = updatedData.imageUrl || product.imageUrl;
          product.title = updatedData.title || product.title;
          product.description = updatedData.description || product.description;
          product.lastUpdated = new Date();
          product.freshness = "FRESH";
          await product.save();

          console.log(`Updated ${product.title}: ₹${updatedData.price} (${updatedData.discount}% off)`);
        } catch (err) {
          console.error(`Failed to update ${product.asin}:`, err.message);
        }
      }

      console.log("Amazon price update job completed");
    } catch (error) {
      console.error("Amazon price updater error:", error);
    }
  });
};

module.exports = {
  startAmazonPriceUpdater,
};
