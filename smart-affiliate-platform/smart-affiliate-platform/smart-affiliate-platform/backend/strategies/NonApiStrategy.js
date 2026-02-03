/**
 * Non-API Strategy - For platforms without official APIs (Flipkart, Myntra, etc.)
 * Requires manual data entry or Excel upload
 */
class NonApiStrategy {
  constructor() {
    this.name = "MANUAL";
  }

  /**
   * Validate manual product data
   */
  validateProductData(data) {
    const required = [
      "title",
      "price",
      "category",
      "affiliateLink",
      "platform",
    ];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (isNaN(data.price) || data.price <= 0) {
      throw new Error("Price must be a positive number");
    }

    return true;
  }

  /**
   * Format product data for storage
   */
  formatProductData(data, affiliateLink) {
    return {
      title: data.title,
      description: data.description || "",
      price: data.price,
      originalPrice: data.originalPrice || data.price,
      discount: data.discount || 0,
      category: data.category,
      tags: data.tags || [],
      imageUrl: data.imageUrl || "",
      affiliateLink: affiliateLink || data.affiliateLink,
      platform: data.platform,
      strategy: "MANUAL",
      lastUpdated: new Date(),
      freshness: "FRESH",
    };
  }

  /**
   * Validate if product can be handled by this strategy
   */
  canHandle(platform) {
    return ["FLIPKART", "MYNTRA", "OTHER"].includes(platform);
  }
}

module.exports = NonApiStrategy;
