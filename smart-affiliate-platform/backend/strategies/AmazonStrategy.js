/**
 * Amazon Strategy - Uses PA-API for auto price fetching
 */
const { fetchProductByASIN } = require("../utils/amazonPAAPI");

class AmazonStrategy {
  constructor() {
    this.name = "AMAZON_API";
  }

  /**
   * Fetch product details from Amazon PA-API
   */
  async fetchProductData(asin) {
    try {
      console.log(`Fetching Amazon product data for ASIN: ${asin}`);
      const productData = await fetchProductByASIN(asin);
      return productData;
    } catch (error) {
      console.error("Amazon API error:", error);
      throw error;
    }
  }

  /**
   * Format product data for storage
   */
  formatProductData(rawData, affiliateLink) {
    return {
      title: rawData.title,
      description: rawData.description,
      price: rawData.price,
      originalPrice: rawData.originalPrice || rawData.price,
      discount: rawData.discount || 0,
      imageUrl: rawData.imageUrl,
      affiliateLink,
      platform: "AMAZON",
      strategy: "AMAZON_API",
      asin: rawData.asin,
      lastUpdated: new Date(),
      freshness: "FRESH",
    };
  }

  /**
   * Validate if product can be handled by this strategy
   */
  canHandle(affiliateLink) {
    return affiliateLink.toLowerCase().includes("amazon");
  }
}

module.exports = AmazonStrategy;
