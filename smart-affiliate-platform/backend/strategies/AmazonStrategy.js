const { fetchProductByASIN } = require("../utils/amazonPAAPI");

class AmazonStrategy {
  constructor() {
    this.name = "AMAZON_API";
  }

  async fetchProductData(asin) {
    try {
      console.log(`[AmazonStrategy] Fetching data for ASIN: ${asin}`);
      const productData = await fetchProductByASIN(asin);
      if (!productData) throw new Error("No data returned from Amazon PA-API");
      return productData;
    } catch (error) {
      console.error("Amazon API error:", error.message);
      throw error;
    }
  }

  formatProductData(apiData, affiliateLink) {
    return {
      title: apiData.title || "Amazon Product",
      description: apiData.description || "",
      price: apiData.price || 0,
      originalPrice: apiData.originalPrice || apiData.price || 0,
      discount: apiData.discount || 0,
      imageUrl: apiData.imageUrl || "",
      affiliateLink: affiliateLink,
      asin: apiData.asin || null,
      platform: "AMAZON", // LOCKS filter to Amazon
      category: apiData.category || "General",
      strategy: "AMAZON_API",
      freshness: "FRESH",
      lastUpdated: new Date(),
    };
  }

  canHandle(affiliateLink) {
    const url = affiliateLink.toLowerCase();
    return url.includes("amazon.in") || url.includes("amazon.com") || url.includes("amzn.to");
  }
}

module.exports = AmazonStrategy;