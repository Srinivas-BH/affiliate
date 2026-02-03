/**
 * Detect platform from affiliate link
 */
const detectPlatform = (affiliateLink) => {
  const url = affiliateLink.toLowerCase();

  if (url.includes("amazon")) {
    return "AMAZON";
  } else if (url.includes("flipkart")) {
    return "FLIPKART";
  } else if (url.includes("myntra")) {
    return "MYNTRA";
  } else if (url.includes("meesho")) {
    return "MEESHO";
  }

  return "OTHER";
};

/**
 * Extract ASIN from Amazon URL
 */
const extractAsin = (url) => {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
};

/**
 * Generate strategy based on platform
 */
const getStrategy = (platform) => {
  if (platform === "AMAZON") {
    return "AMAZON_API";
  } else if (platform === "MEESHO") {
    return "LINK_ONLY";
  }

  return "MANUAL";
};

module.exports = {
  detectPlatform,
  extractAsin,
  getStrategy,
};
