const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");

// [CONFIG] strict admin email
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "discyra2026@gmail.com").toLowerCase().trim();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * STEP 1: Initiate Login
 * Determines if the user is Admin (Password flow) or User (OTP flow)
 */
exports.initiateLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const cleanEmail = email.toLowerCase().trim();

    // CASE 1: Admin Login (Uses Password)
    if (cleanEmail === ADMIN_EMAIL) {
      return res.json({
        success: true,
        mode: "PASSWORD",
        message: "Please enter admin password",
      });
    }

    // CASE 2: User Login (Uses OTP)
    let user = await User.findOne({ email: cleanEmail });

    // Auto-register if user doesn't exist
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        role: "user",
        status: "ACTIVE", // Mark active on registration
        isEmailVerified: false,
        lastActive: new Date(),
      });
      sendWelcomeEmail(cleanEmail, "").catch(e => console.error("Welcome email failed", e));
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    try {
      await sendOTPEmail(cleanEmail, otp);
      console.log(`✅ Login OTP sent to ${cleanEmail}`);
    } catch (err) {
      return res.status(500).json({ error: "Could not send verification code." });
    }

    return res.json({
      success: true,
      mode: "OTP",
      message: `Verification code sent to ${cleanEmail}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * STEP 2: Finalize Login
 * Verifies Password/OTP and marks user as ACTIVE for analytics
 */
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(404).json({ error: "User not found" });

    // --- VERIFICATION LOGIC ---
    if (cleanEmail === ADMIN_EMAIL) {
      if (!user.password) return res.status(401).json({ error: "Admin not initialized." });
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: "Invalid Admin Password" });
    } else {
      if (!otp) return res.status(400).json({ error: "OTP is required" });
      if (user.otp !== otp) return res.status(401).json({ error: "Invalid verification code" });
      if (new Date() > user.otpExpiry) return res.status(401).json({ error: "Code expired" });
      
      user.otp = null;
      user.otpExpiry = null;
      user.isEmailVerified = true;
    }

    // --- ANALYTICS UPDATE ---
    user.status = "ACTIVE";
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * HEARTBEAT: Updates "Last Active" time
 * Called by frontend every 30s to keep "Live Now" count accurate
 */
exports.handleHeartbeat = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      lastActive: new Date(),
      status: "ACTIVE" 
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LOGOUT: Drops user from "Live Now" analytics
 */
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      status: "INACTIVE", 
      lastActive: new Date(0) // Set to epoch so they disappear from "Live" count
    });
    res.json({ success: true, message: "Logged out and analytics updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ADMIN STATS: Get counts for Dashboard Cards
 */
exports.getAdminUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeUsers = await User.countDocuments({
      role: "user",
      status: "ACTIVE",
      lastActive: { $gte: fiveMinutesAgo }
    });

    res.json({ success: true, stats: { totalUsers, activeUsers } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ADMIN: Get Full User Directory
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password -otp")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Profile & Setup Helpers ---
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.checkAdminStatus = async (req, res) => {
  try {
    const admin = await User.findOne({ email: ADMIN_EMAIL });
    res.json({ success: true, isAdminSetup: !!(admin && admin.password) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.forgotPassword = async (req, res) => { /* Reuse your existing logic here */ };
exports.resetPassword = async (req, res) => { /* Reuse your existing logic here */ };