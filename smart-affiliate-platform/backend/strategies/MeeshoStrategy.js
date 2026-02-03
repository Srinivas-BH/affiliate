/**
 * Meesho Strategy - Manual Data Entry
 * Strictly locks platform to "MEESHO" for distribution filtering.
 */
class MeeshoStrategy {
  constructor() {
    this.name = "MANUAL";
  }

  /**
   * Format product data for storage
   * CRITICAL: Sets platform to "MEESHO" to enable exact filtering.
   */
  formatProductData(data, affiliateLink) {
    return {
      title: data.title || "Meesho Product",
      description: data.description || "",
      category: data.category || "Fashion",
      tags: data.tags || [],
      imageUrl: data.imageUrl || "",
      affiliateLink: affiliateLink || data.affiliateLink,
      platform: "MEESHO", // Key for distribution filter
      strategy: "MANUAL",
      price: data.price || 0,
      originalPrice: data.originalPrice || data.price || 0,
      discount: data.discount || 0,
      lastUpdated: new Date(),
      freshness: "FRESH",
    };
  }

  canHandle(affiliateLink) {
    return affiliateLink.toLowerCase().includes("meesho");
  }
}

module.exports = MeeshoStrategy;