/**
 * Meesho Strategy - Link-only strategy
 * Stores affiliate link for redirection only, no price tracking
 */
class MeeshoStrategy {
  constructor() {
    this.name = "LINK_ONLY";
  }

  /**
   * Validate Meesho product data
   */
  validateProductData(data) {
    if (!data.affiliateLink) {
      throw new Error("Affiliate link is required");
    }

    if (!data.affiliateLink.toLowerCase().includes("meesho")) {
      throw new Error("Invalid Meesho link");
    }

    return true;
  }

  /**
   * Format product data for storage (minimal data for link-only strategy)
   */
  formatProductData(data, affiliateLink) {
    return {
      title: data.title || "Meesho Product",
      description: data.description || "",
      category: data.category || "General",
      tags: data.tags || [],
      imageUrl: data.imageUrl || "",
      affiliateLink: affiliateLink || data.affiliateLink,
      platform: "MEESHO",
      strategy: "LINK_ONLY",
      price: 0, // Not tracked for Meesho
      lastUpdated: new Date(),
      freshness: "FRESH",
    };
  }

  /**
   * Validate if product can be handled by this strategy
   */
  canHandle(affiliateLink) {
    return affiliateLink.toLowerCase().includes("meesho");
  }
}

module.exports = MeeshoStrategy;
