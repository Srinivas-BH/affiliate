const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Universal Login Endpoint
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";
    let user = await User.findOne({ email });

    // Admin Login Logic
    if (email === adminEmail) {
      if (!password) return res.status(400).json({ error: "Password required for admin" });
      if (!user) return res.status(401).json({ error: "Invalid admin credentials" });
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // User Auto-Register Logic
    if (!user) {
      user = await User.create({
        email,
        role: "user",
        isEmailVerified: false,
        lastActive: Date.now()
      });
      try { await sendWelcomeEmail(email, ""); } catch (err) { console.error("Email failed", err); }
    } else {
      // Update activity on existing user login
      user.lastActive = Date.now();
      await user.save();
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * HEARTBEAT: Updates user's lastActive timestamp while they are online
 */
exports.updateHeartbeat = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastActive: Date.now() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * LOGOUT: Instantly hides user from "Live Now" count
 */
exports.logout = async (req, res) => {
  try {
    // Set lastActive to 10 minutes ago so they vanish from analytics immediately
    await User.findByIdAndUpdate(req.user.id, { 
      lastActive: new Date(Date.now() - 10 * 60 * 1000) 
    });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ANALYTICS: Real-Time "Live Now" Logic
 */
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });

    // Live Now: Pinged within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      role: "user",
      lastActive: { $gte: fiveMinutesAgo },
    });

    res.json({ success: true, stats: { totalUsers, activeUsers } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Forgot Password - Send OTP
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: "If email exists, OTP will be sent" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify OTP and Reset Password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("-password -otp");
    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Permanently delete account
 */
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Setup Admin Account
 */
exports.setupAdmin = async (req, res) => {
  try {
    const { password, name } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";

    let admin = await User.findOne({ email: adminEmail });
    if (admin && admin.password) return res.status(403).json({ error: "Admin already setup" });

    if (!admin) {
      admin = new User({ email: adminEmail, role: "admin", name: name || "Admin", isEmailVerified: true });
    }
    admin.password = password;
    await admin.save();

    res.json({ success: true, message: "Admin setup successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check Admin Status
 */
exports.checkAdminStatus = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";
    const admin = await User.findOne({ email: adminEmail });
    res.json({ success: true, isAdminSetup: !!(admin && admin.password), adminEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};