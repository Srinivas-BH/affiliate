/**
 * Amazon Product Advertising API (PA-API) Integration
 * 
 * This utility handles fetching product data from Amazon using PA-API
 * 
 * Setup:
 * 1. Sign up for Amazon Associates: https://affiliate-program.amazon.com/
 * 2. Get your Access Key, Secret Key, and Associate Tag
 * 3. Add credentials to .env file
 * 
 * Documentation: https://webservices.amazon.com/paapi5/documentation/
 */

const crypto = require("crypto");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
const AMAZON_REGION = process.env.AMAZON_REGION || "IN";

/**
 * Generate AWS signature for PA-API request
 */
const generateSignature = (method, uri, queryString, payload, timestamp) => {
  const canonicalRequest = [
    method,
    uri,
    queryString,
    `host:webservices.amazon.${AMAZON_REGION.toLowerCase()}`,
    `x-amz-date:${timestamp}`,
    "",
    "host;x-amz-date",
    crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    `${timestamp.substring(0, 8)}/${AMAZON_REGION.toLowerCase()}/ProductAdvertisingAPI/aws4_request`,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = crypto
    .createHmac("sha256", `AWS4${AMAZON_SECRET_KEY}`)
    .update(timestamp.substring(0, 8))
    .digest();

  const kRegion = crypto.createHmac("sha256", kDate).update(AMAZON_REGION.toLowerCase()).digest();
  const kService = crypto.createHmac("sha256", kRegion).update("ProductAdvertisingAPI").digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();

  return crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
};

/**
 * Fetch product data from Amazon PA-API using ASIN
 */
const fetchProductByASIN = async (asin) => {
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_ASSOCIATE_TAG) {
    console.warn("Amazon PA-API credentials not configured. Using mock data.");
    return getMockProductData(asin);
  }

  try {
    const endpoint = `https://webservices.amazon.${AMAZON_REGION.toLowerCase()}/paapi5/getitems`;
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");

    const payload = {
      PartnerTag: AMAZON_ASSOCIATE_TAG,
      PartnerType: "Associates",
      Marketplace: `www.amazon.${AMAZON_REGION.toLowerCase()}`,
      ItemIds: [asin],
      Resources: [
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "ItemInfo.Classifications",
        "ItemInfo.ExternalIds",
        "ItemInfo.Features",
        "ItemInfo.ManufactureInfo",
        "ItemInfo.ProductInfo",
        "ItemInfo.TechnicalInfo",
        "ItemInfo.TradeInInfo",
        "Offers.Listings.Price",
        "Offers.Listings.Availability",
        "Offers.Summaries.HighestPrice",
        "Offers.Summaries.LowestPrice",
        "Images.Primary.Large",
        "Images.Variants.Large",
      ],
    };

    const signature = generateSignature("POST", "/paapi5/getitems", "", payload, timestamp);

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Amz-Date": timestamp,
      Authorization: `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${timestamp.substring(0, 8)}/${AMAZON_REGION.toLowerCase()}/ProductAdvertisingAPI/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`,
    };

    const response = await axios.post(endpoint, payload, { headers });

    if (response.data.Errors) {
      console.error("Amazon PA-API Errors:", response.data.Errors);
      return getMockProductData(asin);
    }

    const item = response.data.ItemsResult?.Items?.[0];
    if (!item) {
      console.warn(`No product found for ASIN: ${asin}`);
      return getMockProductData(asin);
    }

    // Extract product data
    const title = item.ItemInfo?.Title?.DisplayValue || "Amazon Product";
    const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
    const currency = item.Offers?.Listings?.[0]?.Price?.Currency || "INR";
    const originalPrice = item.Offers?.Listings?.[0]?.Price?.WasPrice?.Amount || price;
    const imageUrl = item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL || "";
    const description = item.ItemInfo?.Features?.DisplayValues?.join(" ") || "";
    const availability = item.Offers?.Listings?.[0]?.Availability?.Message || "In Stock";

    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return {
      title,
      price: Math.round(price),
      originalPrice: Math.round(originalPrice),
      discount,
      imageUrl,
      description,
      asin,
      availability,
      currency,
    };
  } catch (error) {
    console.error("Amazon PA-API Error:", error.message);
    // Fallback to mock data on error
    return getMockProductData(asin);
  }
};

/**
 * Mock product data (used when PA-API is not configured or fails)
 */
const getMockProductData = (asin) => {
  console.log(`Using mock data for ASIN: ${asin}`);
  return {
    title: `Amazon Product ${asin}`,
    price: 2999,
    originalPrice: 4999,
    discount: 40,
    imageUrl: "https://via.placeholder.com/500",
    description: "High quality product from Amazon",
    asin,
    availability: "In Stock",
    currency: "INR",
  };
};

/**
 * Search products by keyword (optional feature)
 */
const searchProducts = async (keywords, page = 1) => {
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_ASSOCIATE_TAG) {
    console.warn("Amazon PA-API credentials not configured.");
    return { items: [], totalPages: 0 };
  }

  try {
    const endpoint = `https://webservices.amazon.${AMAZON_REGION.toLowerCase()}/paapi5/searchitems`;
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");

    const payload = {
      PartnerTag: AMAZON_ASSOCIATE_TAG,
      PartnerType: "Associates",
      Marketplace: `www.amazon.${AMAZON_REGION.toLowerCase()}`,
      Keywords: keywords,
      SearchIndex: "All",
      ItemCount: 10,
      Resources: [
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "Offers.Listings.Price",
        "Images.Primary.Large",
      ],
    };

    const signature = generateSignature("POST", "/paapi5/searchitems", "", payload, timestamp);

    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Amz-Date": timestamp,
      Authorization: `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${timestamp.substring(0, 8)}/${AMAZON_REGION.toLowerCase()}/ProductAdvertisingAPI/aws4_request, SignedHeaders=host;x-amz-date, Signature=${signature}`,
    };

    const response = await axios.post(endpoint, payload, { headers });

    if (response.data.Errors) {
      console.error("Amazon PA-API Search Errors:", response.data.Errors);
      return { items: [], totalPages: 0 };
    }

    const items = response.data.SearchResult?.Items || [];
    return {
      items: items.map((item) => ({
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue,
        price: item.Offers?.Listings?.[0]?.Price?.Amount,
        imageUrl: item.Images?.Primary?.Large?.URL,
      })),
      totalPages: Math.ceil((response.data.SearchResult?.TotalResultCount || 0) / 10),
    };
  } catch (error) {
    console.error("Amazon PA-API Search Error:", error.message);
    return { items: [], totalPages: 0 };
  }
};

module.exports = {
  fetchProductByASIN,
  searchProducts,
};
