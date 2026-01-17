/**
 * Parse natural language query into structured tags
 * This is a simple regex-based parser. For production, use NLP libraries like compromise.js
 */

const parseNLPQuery = (query) => {
  const parsed = {
    category: null,
    tags: [],
    maxPrice: null,
    minPrice: 0,
    platforms: [],
  };

  const lowerQuery = query.toLowerCase();

  // Extract price range
  const priceMatch = query.match(/(?:under|below|up to|less than)\s*(?:₹|rs\.?\s*)(\d+(?:,\d+)?)/i);
  if (priceMatch) {
    parsed.maxPrice = parseInt(priceMatch[1].replace(/,/g, ""));
  }

  const minPriceMatch = query.match(/(?:above|over|more than|at least)\s*(?:₹|rs\.?\s*)(\d+(?:,\d+)?)/i);
  if (minPriceMatch) {
    parsed.minPrice = parseInt(minPriceMatch[1].replace(/,/g, ""));
  }

  // Extract platforms
  const platformKeywords = {
    amazon: "AMAZON",
    flipkart: "FLIPKART",
    myntra: "MYNTRA",
    meesho: "MEESHO",
  };

  Object.entries(platformKeywords).forEach(([keyword, platform]) => {
    if (lowerQuery.includes(keyword)) {
      parsed.platforms.push(platform);
    }
  });

  // Extract category (simple approach)
  const categoryKeywords = {
    electronics: "Electronics",
    mobile: "Mobile Phones",
    laptop: "Laptops",
    headphones: "Audio",
    watch: "Wearables",
    shoe: "Fashion",
    shirt: "Fashion",
    dress: "Fashion",
    book: "Books",
    home: "Home Appliances",
  };

  Object.entries(categoryKeywords).forEach(([keyword, category]) => {
    if (lowerQuery.includes(keyword)) {
      parsed.category = category;
      parsed.tags.push(keyword);
    }
  });

  // Extract tags from query
  const words = query.split(/\s+/);
  const stopWords = [
    "a",
    "an",
    "the",
    "is",
    "are",
    "for",
    "under",
    "up",
    "to",
    "best",
    "good",
    "looking",
    "need",
    "want",
    "find",
    "search",
    "show",
    "me",
    "i",
    "you",
    "we",
    "they",
    "on",
    "in",
    "at",
  ];

  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanWord.length > 2 && !stopWords.includes(cleanWord)) {
      if (!parsed.tags.includes(cleanWord)) {
        parsed.tags.push(cleanWord);
      }
    }
  });

  return parsed;
};

module.exports = {
  parseNLPQuery,
};
