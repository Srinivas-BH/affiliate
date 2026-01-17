/**
 * Advanced NLP Parser - "GenAI Style" Logic with Extensive Training Data
 * Aggressively detects prices, ranges, categories, and platforms from human input.
 * Trained with diverse human language patterns for better accuracy.
 */

// --- 1. KNOWLEDGE BASE (The "Brain") - EXTENSIVELY TRAINED ---
const TRAINING_DATASET = {
  // Maps user words to database categories - EXPANDED with variations
  categoryMappings: {
    // ===== ELECTRONICS & GADGETS =====
    "laptop": "Laptops", "notebook": "Laptops", "macbook": "Laptops", "gaming laptop": "Laptops",
    "gaming pc": "Laptops", "ultrabook": "Laptops", "netbook": "Laptops", "chromebook": "Laptops",
    "dell": "Laptops", "hp": "Laptops", "lenovo": "Laptops", "asus": "Laptops", "acer": "Laptops",
    
    "mobile": "Mobile Phones", "phone": "Mobile Phones", "smartphone": "Mobile Phones", "iphone": "Mobile Phones",
    "android": "Mobile Phones", "realme": "Mobile Phones", "redmi": "Mobile Phones", "oneplus": "Mobile Phones",
    "samsung": "Mobile Phones", "poco": "Mobile Phones", "nokia": "Mobile Phones", "vivo": "Mobile Phones",
    "oppo": "Mobile Phones", "motorola": "Mobile Phones", "pixel": "Mobile Phones",
    
    "tv": "Televisions", "television": "Televisions", "led": "Televisions", "smart tv": "Televisions",
    "4k tv": "Televisions", "oled": "Televisions", "qled": "Televisions", "screen": "Televisions",
    "display": "Televisions",
    
    "watch": "Wearables", "smartwatch": "Wearables", "band": "Wearables", "apple watch": "Wearables",
    "fitness band": "Wearables", "tracker": "Wearables", "bracelet": "Wearables",
    
    "headphone": "Audio", "earphone": "Audio", "buds": "Audio", "airpods": "Audio", "airpod": "Audio",
    "speaker": "Audio", "soundbar": "Audio", "earbud": "Audio", "headset": "Audio", "earbuds": "Audio",
    "wireless headphones": "Audio", "bluetooth speaker": "Audio",
    
    "camera": "Cameras", "dslr": "Cameras", "mirrorless": "Cameras", "action camera": "Cameras",
    "gopro": "Cameras", "webcam": "Cameras", "cannon": "Cameras", "nikon": "Cameras", "sony": "Cameras",
    
    "tablet": "Tablets", "ipad": "Tablets", "tab": "Tablets", "pad": "Tablets",
    
    // ===== FASHION & APPAREL =====
    "shoe": "Fashion", "sneaker": "Fashion", "boot": "Fashion", "running shoes": "Fashion",
    "footwear": "Fashion", "shoes": "Fashion", "sneakers": "Fashion", "boots": "Fashion",
    "heels": "Fashion", "loafers": "Fashion", "sandals": "Fashion", "slippers": "Fashion",
    
    "shirt": "Fashion", "t-shirt": "Fashion", "top": "Fashion", "jeans": "Fashion", "trouser": "Fashion",
    "trousers": "Fashion", "pants": "Fashion", "shorts": "Fashion", "tshirt": "Fashion", "t shirt": "Fashion",
    "dress": "Fashion", "saree": "Fashion", "kurti": "Fashion", "lehenga": "Fashion", "suit": "Fashion",
    "jacket": "Fashion", "coat": "Fashion", "sweater": "Fashion", "hoodie": "Fashion", "sweatshirt": "Fashion",
    
    "bag": "Fashion", "backpack": "Fashion", "handbag": "Fashion", "purse": "Fashion", "tote": "Fashion",
    "luggage": "Fashion", "suitcase": "Fashion", "travel bag": "Fashion",
    
    // ===== HOME APPLIANCES =====
    "fridge": "Home Appliances", "refrigerator": "Home Appliances", "fridge freezer": "Home Appliances",
    "washing machine": "Home Appliances", "washer": "Home Appliances", "dryer": "Home Appliances",
    "ac": "Home Appliances", "air conditioner": "Home Appliances", "airconditioner": "Home Appliances",
    "microwave": "Home Appliances", "oven": "Home Appliances", "toaster": "Home Appliances",
    "blender": "Home Appliances", "mixer": "Home Appliances", "grinder": "Home Appliances",
    "cooker": "Home Appliances", "pressure cooker": "Home Appliances", "electric kettle": "Home Appliances",
    "iron": "Home Appliances", "vacuum": "Home Appliances", "cleaner": "Home Appliances",
    "geyser": "Home Appliances", "water heater": "Home Appliances", "fan": "Home Appliances",
    
    // ===== SPORTS & FITNESS =====
    "dumbbell": "Sports", "weights": "Sports", "yoga mat": "Sports", "treadmill": "Sports",
    "exercise bike": "Sports", "sports": "Sports", "gym": "Sports", "equipment": "Sports",
    "cricket bat": "Sports", "cricket": "Sports", "badminton": "Sports", "tennis": "Sports",
    "football": "Sports", "basketball": "Sports", "bicycle": "Sports", "bike": "Sports",
    
    // ===== BEAUTY & PERSONAL CARE =====
    "perfume": "Beauty", "fragrance": "Beauty", "cologne": "Beauty", "deodorant": "Beauty",
    "lipstick": "Beauty", "makeup": "Beauty", "cosmetics": "Beauty", "skincare": "Beauty",
    "moisturizer": "Beauty", "face wash": "Beauty", "shampoo": "Beauty", "conditioner": "Beauty",
    "soap": "Beauty", "toothbrush": "Beauty", "razor": "Beauty", "trimmer": "Beauty",
    
    // ===== BOOKS & MEDIA =====
    "book": "Books", "ebook": "Books", "novel": "Books", "magazine": "Books",
    
    // ===== KITCHEN & DINING =====
    "cookware": "Kitchen", "utensils": "Kitchen", "pan": "Kitchen", "pot": "Kitchen",
    "dish": "Kitchen", "plate": "Kitchen", "glass": "Kitchen", "bowl": "Kitchen",
    "knife": "Kitchen", "cutlery": "Kitchen", "fork": "Kitchen", "spoon": "Kitchen"
  },
  
  // Platform aliases - EXPANDED
  platforms: {
    "amazon": "AMAZON", "amzn": "AMAZON", "amz": "AMAZON", "amazon.in": "AMAZON", "amazonindia": "AMAZON",
    "flipkart": "FLIPKART", "fk": "FLIPKART", "flip": "FLIPKART", "flipkart.com": "FLIPKART",
    "myntra": "MYNTRA", "myntra.com": "MYNTRA",
    "meesho": "MEESHO", "meesha": "MEESHO",
    "ajio": "AJIO",
    "ebay": "EBAY",
    "olx": "OLX",
    "snapdeal": "SNAPDEAL",
    "jabong": "JABONG",
    "paytm": "PAYTM", "paytmmall": "PAYTM",
    "nykaa": "NYKAA", "firstcry": "FIRSTCRY", "shopclues": "SHOPCLUES"
  },

  // Words to ignore when extracting tags - EXPANDED
  stopWords: [
    // Pronouns & articles
    "i", "i'm", "im", "am", "am looking", "are", "you", "we", "they", "he", "she", "it",
    "me", "my", "our", "your", "his", "her", "its", "their", "a", "an", "the",
    
    // Common verbs
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "must", "can",
    
    // Common prepositions & conjunctions
    "in", "on", "at", "to", "from", "for", "with", "by", "about", "of", "or", "and", "but",
    "if", "then", "because", "while", "when", "where", "how", "why",
    
    // Shopping-related stop words
    "looking", "want", "need", "search", "find", "show", "please", "kindly", "get", "buy", "purchase",
    "order", "sell", "selling", "selling price", "looking for",
    
    // Price-related stop words
    "budget", "price", "range", "cost", "rate", "rates", "value", "around", "approx", "approximately",
    "under", "below", "above", "over", "between", "upto", "up to", "till", "till now", "not above",
    "rs", "rupees", "inr", "rs.", "₹", "₨", "buck", "bucks", "dollar", "dollars",
    
    // Quality/preference stop words
    "best", "good", "great", "nice", "okay", "ok", "fine", "poor", "bad", "worst",
    "prefer", "prefer to", "prefer the", "like", "suggest", "recommendation",
    "cheap", "expensive", "costly", "affordable", "budget", "premium", "luxury", "basic",
    
    // Quantity words
    "one", "two", "three", "four", "five", "many", "few", "some", "all", "more", "less", "most",
    
    // Time-related
    "now", "today", "tomorrow", "yesterday", "soon", "asap", "urgent",
    
    // Common filler words
    "just", "only", "really", "actually", "basically", "literally", "exactly", "probably",
    "maybe", "possibly", "definitely", "certainly", "surely", "perhaps", "apparently"
  ]
};

// Add a few additional stopwords for improved tag filtering
TRAINING_DATASET.stopWords.push("seeking", "max", "lakhs", "only");

// --- 2. INTELLIGENT PARSER LOGIC - ENHANCED ---

/**
 * Converts any price string to a clean number.
 * Enhanced to handle many currency formats and variations
 * Handles: "50k" -> 50000, "1.5L" -> 150000, "Rs. 50,000" -> 50000, "2 lakhs" -> 200000
 */
const standardizePrice = (raw) => {
  if (!raw) return null;
  
  // Convert to string and normalize (but preserve spaces to avoid merging words)
  const rawStr = raw.toString().toLowerCase().trim();

  // Remove common currency words/symbols
  const cleaned = rawStr.replace(/rs\.?|rupees|inr|₹|₨/gi, "").trim();

  // Match number with optional multiplier unit (k, l, m, thousand, lakh, million)
  const match = cleaned.match(/(\d+(?:[.,]\d+)?)(?:\s*(k|l|m|thousand(?:s)?|lakh(?:s)?|lac(?:s)?|million(?:s)?)\b)?/i);
  if (!match) return null;

  const num = parseFloat(match[1].replace(/,/g, ""));
  if (isNaN(num) || num < 0) return null;

  let multiplier = 1;
  const unit = (match[2] || "").toLowerCase();
  if (/^k$|thousand/i.test(unit)) multiplier = 1000;
  if (/^l$|lakh|lac/i.test(unit)) multiplier = 100000;
  if (/^m$|million/i.test(unit)) multiplier = 1000000;

  const result = Math.floor(num * multiplier);
  return result > 0 ? result : null;
};

/**
 * Finds the best matching category from a query string
 * Priority: Longer matches first (more specific)
 */
const findBestCategory = (query) => {
  const lowerQuery = query.toLowerCase();
  
  // Sort category mappings by key length (longest first = most specific)
  const sortedCategories = Object.entries(TRAINING_DATASET.categoryMappings)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [word, category] of sortedCategories) {
    // Check for word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      return category;
    }
  }
  
  return null;
};

/**
 * Finds all mentioned platforms
 */
const findPlatforms = (query) => {
  const lowerQuery = query.toLowerCase();
  const foundPlatforms = [];
  
  for (const [word, platform] of Object.entries(TRAINING_DATASET.platforms)) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerQuery) && !foundPlatforms.includes(platform)) {
      foundPlatforms.push(platform);
    }
  }
  
  return foundPlatforms;
};

/**
 * Main NLP Parser Function
 */
const parseNLPQuery = (query) => {
  const parsed = {
    category: null,
    tags: [],
    maxPrice: null,
    minPrice: 0,
    platforms: [],
    originalQuery: query
  };

  const lowerQuery = query.toLowerCase();

  // ------------------------------------------
  // A. PRICE DETECTION ENGINE (ADVANCED)
  // ------------------------------------------
  
  // Pattern 1: Explicit "max"/"min" keywords
  // Examples: "under 50k", "max 50000", "budget 50000", "within 50000"
  const maxPatterns = [
    // "under X", "below X", "max X", "upto X", "budget X", "within X"
    /(?:under|below|less\s+than|maximum?|max|upto|up\s+to|within|budget|cost\s+is|price\s+(?:is|around)|worth|costing|limit|spending)\s+(?:of|is|at|around|:)??\s*(?:rs\.?|rupees|inr|₹)?\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand(?:s)?|lakh(?:s)?|lac(?:s)?|million(?:s)?)\b)?)/gi,
    // "Rs/₹/INR X max/limit"
    /(?:rs\.?|rupees|inr|₹)\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand(?:s)?|lakh(?:s)?|lac(?:s)?|million(?:s)?)\b)?)\s*(?:max|limit|budget|ceiling|only)?/gi,
    // "budget: 50k" or "budget - 50000"
    /budget\s*[:\-]?\s*(?:rs\.?|rupees|inr|₹)?\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand(?:s)?|lakh(?:s)?|lac(?:s)?|million(?:s)?)\b)?)/gi,
    // number followed by currency and trailing words like 'max' or 'budget'
    /(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand(?:s)?|lakh(?:s)?|lac(?:s)?|million(?:s)?)\b)?)\s*(?:rs\.?|rupees|inr|₹)?\s*(?:max|budget|only|ceiling)?/gi
  ];

  const minPatterns = [
    // "above X", "more than X", "min X", "at least X", "from X", "starting X"
    /(?:above|more\s+than|greater\s+than|minimum?|min|at\s+least|from|starting|above|minimum\s+price|starting\s+from)\s+(?:rs\.?|rupees|inr|₹)?\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million)\b)?)/gi,
    // "Rs/₹ X onwards/above"
    /(?:rs\.?|rupees|inr|₹)\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million)\b)?)\s*(?:onwards|and\s+above|above|or\s+more)/gi,
    // "min: 2000" or "min - 2000"
    /min(?:imum)?\s*[:\-]?\s*(?:rs\.?|rupees|inr|₹)?\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million)\b)?)/gi
  ];

  // Extract all max prices from patterns
  let maxPrices = [];
  for (const pattern of maxPatterns) {
    let match;
    while ((match = pattern.exec(lowerQuery)) !== null) {
      const price = standardizePrice(match[1]);
      if (price) maxPrices.push(price);
    }
  }

  // Extract all min prices from patterns
  let minPrices = [];
  for (const pattern of minPatterns) {
    let match;
    while ((match = pattern.exec(lowerQuery)) !== null) {
      const price = standardizePrice(match[1]);
      if (price) minPrices.push(price);
    }
  }

  // Use the highest max price and lowest min price (most reasonable)
  if (maxPrices.length > 0) {
    parsed.maxPrice = Math.max(...maxPrices);
  }
  if (minPrices.length > 0) {
    parsed.minPrice = Math.min(...minPrices);
  }

  // Pattern 2: Detect price ranges ("50k to 80k", "50000-80000", "1-2 lakhs")
  if (!parsed.maxPrice) {
    const rangeRegex = /(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million))?)\s*(?:to|-|through|till|and|–)\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million))?)/gi;
    let match;
    
    while ((match = rangeRegex.exec(lowerQuery)) !== null) {
      const p1 = standardizePrice(match[1]);
      const p2 = standardizePrice(match[2]);
      if (p1 && p2) {
        parsed.minPrice = Math.min(p1, p2);
        parsed.maxPrice = Math.max(p1, p2);
        break;  // Use first range found
      }
    }
  }

  // Pattern 3: Smart Context Detection
  // If no explicit price keywords, look for standalone numbers that look like prices
  if (!parsed.maxPrice && !parsed.minPrice) {
    // Find all numbers in query
    const numberRegex = /\b(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million))?)\b/gi;
    const potentialPrices = [];
    let match;
    
    while ((match = numberRegex.exec(lowerQuery)) !== null) {
      const numberStr = match[1];
      // Check if this looks like a price (not a model number or spec)
      // Heuristics: Contains 'k', 'l', 'm', or is > 500
      const hasMultiplier = /[klm]|thousand|lakh|lac|million/i.test(numberStr);
      const val = standardizePrice(numberStr);
      
      if (val) {
        // Accept if: has multiplier OR value is large (likely a price)
        if (hasMultiplier || val > 500) {
          potentialPrices.push(val);
        }
      }
    }

    if (potentialPrices.length > 0) {
      // Multiple numbers = range; Single number = max budget
      if (potentialPrices.length === 1) {
        parsed.maxPrice = potentialPrices[0];
      } else {
        parsed.minPrice = Math.min(...potentialPrices);
        parsed.maxPrice = Math.max(...potentialPrices);
      }
    }

    // Fallback: If still no explicit maxPrice but query contains explicit price keywords
    if (!parsed.maxPrice) {
      const simpleUnder = /(?:under|below|upto|up to|budget)\s*(?:rs\.?|rupees|inr|₹)?\s*(\d+(?:[.,]\d+)?(?:\s*(?:k|l|m|thousand|lakh|lac|million))?)/i;
      const su = lowerQuery.match(simpleUnder);
      if (su && su[1]) {
        const v = standardizePrice(su[1]);
        if (v) parsed.maxPrice = v;
      }
    }
  }

  // ------------------------------------------
  // B. CATEGORY DETECTION (SMART MATCHING)
  // ------------------------------------------
  parsed.category = findBestCategory(query);

  // ------------------------------------------
  // C. PLATFORM DETECTION
  // ------------------------------------------
  parsed.platforms = findPlatforms(query);

  // ------------------------------------------
  // D. TAGS EXTRACTION (CLEANED)
  // ------------------------------------------
  
  // Extract specifications (16gb, 256gb, 1tb, 5000mah, 48mp, etc)
  const specRegex = /(\d+\s*(?:gb|tb|mb|mah|mp|fps|hz|v|w|ghz|inch))\b/gi;
  let specMatch;
  while ((specMatch = specRegex.exec(query)) !== null) {
    const spec = specMatch[1].toLowerCase().replace(/\s/g, "");
    if (!parsed.tags.includes(spec)) {
      parsed.tags.push(spec);
    }
  }

  // Extract meaningful words (filtered by stopwords)
  const words = lowerQuery
    .replace(/[^\w\s]/g, "")  // Remove special chars
    .split(/\s+/)
    .filter(w => w.length > 2 && !(!isNaN(parseInt(w))));  // Remove short words & pure numbers

  // Prepare platform keys normalized to filter them out from tags
  const platformKeysNormalized = Object.keys(TRAINING_DATASET.platforms).map(k => k.replace(/[^a-z0-9]/gi, ""));
  const unitWords = new Set(["k","l","m","thousand","lakh","lac","million","rs","rupees","inr","kg","gm","gb","tb","inch","inches","mah","mp","hz","w"]);

  for (const word of words) {
    const cleaned = word.replace(/[^a-z0-9]/gi, "");
    // Skip if: stopword, already in tags, number, already in category/platform
    if (
      TRAINING_DATASET.stopWords.includes(cleaned) ||
      parsed.tags.includes(cleaned) ||
      !isNaN(cleaned) ||
      parsed.category === cleaned ||
      unitWords.has(cleaned) ||
      // If this cleaned word matches or contains a platform token, skip it
      platformKeysNormalized.includes(cleaned) ||
      platformKeysNormalized.some(pk => cleaned.includes(pk) || pk.includes(cleaned))
    ) {
      continue;
    }

    // Check if word is part of a category (already covered)
    const isPartOfCategory = Object.keys(TRAINING_DATASET.categoryMappings).some(
      cat => cat.includes(word) && cat !== word
    );
    if (isPartOfCategory) continue;

    parsed.tags.push(word);
  }

  // Remove duplicates
  parsed.tags = [...new Set(parsed.tags)];

  // Ensure minPrice is not greater than maxPrice
  if (parsed.maxPrice && parsed.minPrice > parsed.maxPrice) {
    [parsed.minPrice, parsed.maxPrice] = [parsed.maxPrice, parsed.minPrice];
  }

  return parsed;
};

module.exports = { parseNLPQuery };