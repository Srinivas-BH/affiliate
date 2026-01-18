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

    // CASE 1: Admin Login
    if (cleanEmail === ADMIN_EMAIL) {
      return res.json({
        success: true,
        mode: "PASSWORD",
        message: "Please enter admin password",
      });
    }

    // CASE 2: User Login (OTP)
    let user = await User.findOne({ email: cleanEmail });

    // Auto-register if user doesn't exist
    if (!user) {
      user = await User.create({
        email: cleanEmail,
        role: "user",
        isEmailVerified: false,
        lastActive: new Date(), // Set active immediately on creation
      });
      // Send welcome email asynchronously
      sendWelcomeEmail(cleanEmail, "").catch(e => console.error("Welcome email failed", e));
    }

    // Generate and save OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // Send OTP Email
    try {
      await sendOTPEmail(cleanEmail, otp);
      console.log(`✅ Login OTP sent to ${cleanEmail}`);
    } catch (err) {
      console.error(`❌ Failed to send OTP to ${cleanEmail}:`, err.message);
      return res.status(500).json({ error: "Could not send verification code." });
    }

    return res.json({
      success: true,
      mode: "OTP",
      message: `Verification code sent to ${cleanEmail}`,
    });
  } catch (error) {
    console.error("Initiate login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * STEP 2: Finalize Login
 * Verifies the Password (Admin) or OTP (User) and issues token
 */
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // --- ADMIN VERIFICATION ---
    if (cleanEmail === ADMIN_EMAIL) {
      const admin = await User.findOne({ email: cleanEmail });
      if (!admin) return res.status(401).json({ error: "Admin not initialized. Run initAdmin script." });

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: "Invalid Admin Password" });

      // Update Activity
      admin.lastActive = new Date();
      await admin.save();

      const token = generateToken(admin);
      return res.json({
        success: true,
        token,
        user: { id: admin._id, email: admin.email, role: "admin", name: admin.name },
      });
    }

    // --- USER VERIFICATION ---
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate OTP
    if (!otp) return res.status(400).json({ error: "OTP is required" });
    if (user.otp !== otp) return res.status(401).json({ error: "Invalid verification code" });
    if (new Date() > user.otpExpiry) return res.status(401).json({ error: "Verification code expired" });

    // Success: Clear OTP & Update Activity
    user.otp = null;
    user.otpExpiry = null;
    user.isEmailVerified = true;
    user.lastActive = new Date(); // Updates "Active Users" count immediately
    
    // Security fallback: Ensure regular email can't be admin via this route
    if (user.role === 'admin') user.role = 'user'; 
    
    await user.save();

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: "user", name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * [NEW] Logout - Instantly updates analytics
 * Sets lastActive to past (Epoch) so they drop off "Live Users" immediately
 */
exports.logout = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date(0) });
    res.json({ success: true, message: "Logged out and analytics updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Analytics: Get User Statistics for Admin Dashboard
 * "Active Users" = Users who pinged the server in the last 5 minutes
 */
exports.getAdminUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    
    // Calculate cutoff time (5 minutes ago)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeUsers = await User.countDocuments({
      role: "user",
      lastActive: { $gte: fiveMinutesAgo }
    });

    res.json({
      success: true,
      stats: { totalUsers, activeUsers }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin: Fetch all users list
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

/**
 * Real-time: Heartbeat Tracker Endpoint
 * Called by frontend every ~30 seconds to keep user "Active"
 */
exports.handleHeartbeat = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    res.json({ success: true });
  } catch (error) {
    // Silent fail for heartbeat is acceptable to avoid console spam
    res.status(500).json({ error: error.message });
  }
};

/**
 * Forgot Password (Request OTP)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    const user = await User.findOne({ email });
    // Security: Don't reveal if user exists or not, but send OTP if they do
    if (!user) return res.json({ success: true, message: "OTP sent if email exists" });
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    try { await sendOTPEmail(email, otp); } catch (e) { console.error("Forgot password email failed", e); }
    
    res.json({ success: true, message: "OTP sent" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Reset Password (Verify OTP & New Password)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "All fields required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > user.otpExpiry) return res.status(400).json({ error: "OTP expired" });
    
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Get Current User Profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { name, phone, preferences }, 
      { new: true }
    );
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Check Admin Setup Status
 */
exports.checkAdminStatus = async (req, res) => {
  try {
    const admin = await User.findOne({ email: ADMIN_EMAIL });
    res.json({ success: true, isAdminSetup: !!(admin && admin.password) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Setup Admin (Manual fallback if script not used)
 */
exports.setupAdmin = async (req, res) => {
  try {
    const { password, name } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });
    
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin && admin.password) {
      return res.status(403).json({ error: "Admin already initialized." });
    }
    
    if (!admin) {
      admin = new User({ email: ADMIN_EMAIL, role: "admin", name: name || "Admin", isEmailVerified: true });
    } else {
      admin.name = name || "Admin";
      admin.role = "admin";
    }
    
    admin.password = password;
    await admin.save();
    
    res.json({ success: true, message: "Admin setup success" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};