const Product = require("../models/Product");
const UserRequest = require("../models/UserRequest");
const StrategyResolver = require("../strategies/StrategyResolver");
const { extractAsin } = require("../utils/detectPlatform");
const { sendProductNotification } = require("../utils/mailer");

/**
 * ADD NEW PRODUCT (Admin only)
 * Detects platform strategy and fetches data if applicable
 */
exports.addProduct = async (req, res) => {
  try {
    const { title, description, category, tags, price, originalPrice, discount, affiliateLink, imageUrl } = req.body;
    if (!affiliateLink) return res.status(400).json({ error: "Affiliate link is required" });

    const strategy = StrategyResolver.getStrategy(affiliateLink);
    let productData;

    if (strategy.name === "AMAZON_API") {
      const asin = extractAsin(affiliateLink);
      if (!asin) return res.status(400).json({ error: "Invalid Amazon URL." });
      
      try {
        const fetchedData = await strategy.fetchProductData(asin);
        productData = strategy.formatProductData({ 
          ...fetchedData, 
          category: category || "General" 
        }, affiliateLink);
      } catch (error) {
        // Fallback for Amazon if API fails, still tagged as AMAZON platform
        productData = strategy.formatProductData({ 
          title, description, category, price, imageUrl 
        }, affiliateLink);
      }
    } else {
      // Logic for Meesho, Flipkart, Myntra, etc.
      productData = strategy.formatProductData({ 
        title, description, category, price, imageUrl 
      }, affiliateLink);
    }

    productData.createdBy = req.user.id;
    const product = await Product.create(productData);
    
    // Trigger notification service
    await exports.saveAndNotify(product);
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ALL PRODUCTS (Public & Admin)
 * Implements strict platform filtering to stop "leaking"
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { platform, category, search, page = 1, limit = 50 } = req.query; 
    const filter = { freshness: "FRESH" };

    // STRICT FILTER: Check if platform is explicitly requested (e.g., MEESHO)
    if (platform && platform.toUpperCase() !== "ALL") {
      filter.platform = platform.toUpperCase();
    }

    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Product.countDocuments(filter);
    
    res.json({ 
      success: true, 
      count: products.length,
      products,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: parseInt(page) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET PRODUCT STATS (Admin Analytics)
 * Returns aggregated data for the Analytics Dashboard
 */
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $project: {
          _id: 1, 
          productName: { $ifNull: ["$title", "Unknown Product"] },
          // Send original platform case or default to OTHER
          platform: { $toUpper: { $ifNull: ["$platform", "OTHER"] } },
          category: { $ifNull: ["$category", "Uncategorized"] },
          imageUrl: { $ifNull: ["$imageUrl", ""] },
          totalClicks: { $ifNull: ["$clicks", 0] },
          totalViews: { $ifNull: ["$views", 0] },
          avgPrice: { $ifNull: ["$price", 0] }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * TRACK CLICK
 * Increments click count and returns redirect URL
 */
exports.trackClick = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { $inc: { clicks: 1 } }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, redirectUrl: product.affiliateLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET PRODUCT BY ID
 * Increments view count and returns single product
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE PRODUCT
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, lastUpdated: new Date() }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE PRODUCT
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * SAVE AND NOTIFY (Internal Helper)
 */
exports.saveAndNotify = async (product) => {
  try {
    const matches = await UserRequest.find({
      "parsedTags.category": { $regex: product.category, $options: "i" },
      isFulfilled: false,
      status: "ACTIVE",
    });

    for (const request of matches) {
      if (request.parsedTags.maxPrice && product.price > request.parsedTags.maxPrice) continue;
      try {
        await sendProductNotification(request.userEmail, product);
        if (!request.matchedProducts.includes(product._id)) {
          request.matchedProducts.push(product._id);
        }
        request.isFulfilled = true;
        request.status = "FULFILLED"; 
        await request.save();
      } catch (err) {
        console.error(`Notification failed for ${request.userEmail}:`, err.message);
      }
    }
  } catch (error) {
    console.error("SaveAndNotify internal error:", error);
  }
};