/**
 * FORCE RESET ADMIN SCRIPT
 * Deletes the old admin and creates a fresh one.
 * Usage: node scripts/forceReset.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

// 1. Setup the credentials
const email = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";
const newPassword = "Admin@12345"; // Simple password to test

const reset = async () => {
  try {
    // 2. Connect to the Database
    await mongoose.connect(process.env.MONGO_URI);
    
    // CRITICAL CHECK: Print where we are connected
    console.log("------------------------------------------------");
    console.log("🔌 Connected to Database Host:", mongoose.connection.host);
    console.log("------------------------------------------------");

    if (mongoose.connection.host.includes("localhost") || mongoose.connection.host.includes("127.0.0.1")) {
      console.warn("⚠️  WARNING: You are connected to LOCALHOST, not Cloud!");
      console.warn("    ADMIN2 will NOT see these changes.");
    }

    // 3. Delete the existing Admin (Wipe the slate clean)
    const deleted = await User.deleteOne({ email: email });
    console.log(`🗑️  Deleted existing admin account: ${deleted.deletedCount > 0 ? "Yes" : "No (Wasn't found)"}`);

    // 4. Create FRESH Admin
    // We pass plain text password. The User model will hash it automatically.
    const admin = new User({
      email: email,
      password: newPassword, 
      role: "admin",
      name: "Super Admin",
      isEmailVerified: true
    });

    await admin.save();
    console.log("✅ NEW Admin Account Created Successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log("------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

reset();