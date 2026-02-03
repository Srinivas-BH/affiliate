/**
 * Utility to identify platforms from URLs, extract Amazon ASINs,
 * and assign the correct processing strategy.
 */

/**
 * Function 1: Detect the site name from the URL
 * Used to lock products to specific filters (AMAZON, MEESHO, etc.)
 */
const detectPlatform = (url) => {
  if (!url) return "OTHER";
  const link = url.toLowerCase();
  
  if (link.includes("amazon.in") || link.includes("amazon.com") || link.includes("amzn.to")) {
    return "AMAZON";
  }
  if (link.includes("flipkart.com")) return "FLIPKART";
  if (link.includes("meesho.com")) return "MEESHO";
  if (link.includes("myntra.com")) return "MYNTRA";
  
  return "OTHER";
};

/**
 * Function 2: Extract ASIN for Amazon PA-API
 * Required for automatic product data fetching
 */
const extractAsin = (url) => {
  if (!url) return null;
  const match = url.match(/(?:[/dp/]|$)([A-Z0-9]{10})(?:[/?&]|$)/);
  return match ? match[1] : null;
};

/**
 * Function 3: Generate strategy based on platform
 * Determines if we use the API or manual formatting
 */
const getStrategy = (platform) => {
  if (platform === "AMAZON") {
    return "AMAZON_API";
  } else if (platform === "MEESHO") {
    return "LINK_ONLY";
  }
  return "MANUAL";
};

// Unified Export Block - Resolves ReferenceError and exports all tools
module.exports = {
  detectPlatform,
  extractAsin,
  getStrategy
};
