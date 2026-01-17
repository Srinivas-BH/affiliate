const cron = require("node-cron");
const Product = require("../models/Product");

/**
 * Price Freshness Manager
 * Marks products as stale if not updated in 30 days
 * Archives products stale for 60 days
 */
const startPriceFreshnessManager = () => {
  console.log("Price Freshness Manager started - Schedule: 0 1 * * * (Daily at 1 AM)");

  cron.schedule("0 1 * * *", async () => {
    console.log("Running freshness check job...");

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Mark stale products
      const staleResult = await Product.updateMany(
        {
          lastUpdated: { $lt: thirtyDaysAgo },
          freshness: "FRESH",
        },
        { freshness: "STALE" }
      );

      console.log(`Marked ${staleResult.modifiedCount} products as STALE`);

      // Archive old stale products
      const archiveResult = await Product.updateMany(
        {
          lastUpdated: { $lt: sixtyDaysAgo },
          freshness: "STALE",
        },
        { freshness: "ARCHIVED" }
      );

      console.log(`Archived ${archiveResult.modifiedCount} products`);
      console.log("Freshness check job completed");
    } catch (error) {
      console.error("Freshness manager error:", error);
    }
  });
};

module.exports = {
  startPriceFreshnessManager,
};
