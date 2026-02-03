const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");
    
    // This forces EVERY product to be AMAZON so we can test the filter
    const result = await Product.updateMany({}, { 
      $set: { 
        platform: "AMAZON",
        strategy: "AMAZON_API" 
      } 
    });
    
    console.log(`✅ Success! Updated ${result.modifiedCount} products.`);
    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
fix();