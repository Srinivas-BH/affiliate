#!/usr/bin/env node
const axios = require("axios");

// Ensure this matches your running server
const API_BASE = "http://localhost:5001/api"; 

const ADMIN_EMAIL = "discyra2026@gmail.com";
// If you recently reset the password, update this string to test login!
const ADMIN_PASSWORD = "SBHaff$2706"; 

async function testAdminSetup() {
  console.log("🧪 Admin Workflow Test\n");

  try {
    // 1. Check if server is reachable
    console.log("1️⃣  Ping Server...");
    try {
      await axios.get(`${API_BASE}/auth/admin-status`);
      console.log("✅ Server is reachable.");
    } catch (e) {
      throw new Error(`Cannot connect to server at ${API_BASE}. Is it running? (npm start)`);
    }

    // 2. Test Login
    console.log("\n2️⃣  Testing Admin Login...");
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      console.log("✅ Admin Login Successful!");
      console.log("   Token:", res.data.token ? "Received" : "Missing");
    } catch (err) {
      console.log("❌ Admin Login Failed. (Did you change the password recently?)");
      console.log("   Error:", err.response?.data?.error || err.message);
    }

    console.log("\n✅ Test Complete.");
  } catch (error) {
    console.error("❌ FATAL ERROR:", error.message);
  }
}

testAdminSetup();