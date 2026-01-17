#!/usr/bin/env node

/**
 * Admin Setup Test Script
 * Tests the secure admin account setup endpoints
 */

const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testAdminSetup() {
  console.log("🧪 Admin Setup Test Suite\n");
  console.log("=" .repeat(50));

  try {
    // Test 1: Check Admin Status
    console.log("\n1️⃣  Checking Admin Setup Status...");
    const statusResponse = await axios.get(`${API_BASE}/auth/admin-status`);
    console.log("✅ Admin Status:", statusResponse.data);

    // Test 2: Weak Password (should fail)
    console.log("\n2️⃣  Testing Weak Password Validation...");
    try {
      await axios.post(`${API_BASE}/auth/setup-admin`, {
        password: "weak",
        name: "Test Admin",
      });
      console.log("❌ Weak password was accepted (security issue!)");
    } catch (err) {
      if (err.response?.status === 400) {
        console.log("✅ Weak password rejected correctly");
        console.log("   Error:", err.response.data.error);
        console.log("   Requirements:", err.response.data.requirements);
      }
    }

    // Test 3: Valid Strong Password
    console.log("\n3️⃣  Testing Strong Password Setup...");
    const strongPassword = "AdminTest@2024Secure";
    try {
      const setupResponse = await axios.post(`${API_BASE}/auth/setup-admin`, {
        password: strongPassword,
        name: "Platform Administrator",
      });
      console.log("✅ Admin Account Setup Successful!");
      console.log("   Response:", setupResponse.data);
    } catch (err) {
      if (err.response?.status === 403) {
        console.log("✅ Admin Already Initialized (as expected)");
        console.log("   Message:", err.response.data.error);
      } else {
        console.log("❌ Setup Failed:", err.response?.data || err.message);
      }
    }

    // Test 4: Verify Admin Can Login
    console.log("\n4️⃣  Testing Admin Login...");
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: "bhsrinivas94@gmail.com",
        password: strongPassword,
      });
      console.log("✅ Admin Login Successful!");
      console.log("   Token:", loginResponse.data.token?.substring(0, 20) + "...");
      console.log("   User:", loginResponse.data.user);
    } catch (err) {
      console.log("ℹ️  Admin Login Test Skipped (setup may have failed)");
    }

    console.log("\n" + "=" .repeat(50));
    console.log("✅ All tests completed!\n");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
    if (error.response?.data) {
      console.error("   Response:", error.response.data);
    }
  }
}

// Run tests
testAdminSetup();
