const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/mailer");
const fs = require("fs");
const path = require("path");

// [CONFIG] strict admin email
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "discyra2026@gmail.com").toLowerCase().trim();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Helper: Safely update .env file
 */
const updateEnvFile = (key, value) => {
  try {
    const envPath = path.join(__dirname, "../.env");
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, `${key}=${value}\n`);
      return;
    }

    let envContent = fs.readFileSync(envPath, "utf8");
    const regex = new RegExp(`^${key}=.*`, "m");
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated ${key} in .env file`);
  } catch (error) {
    console.error("❌ Failed to update .env file:", error.message);
  }
};

/**
 * STEP 1: Initiate Login
 */
exports.initiateLogin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const cleanEmail = email.toLowerCase().trim();

    // CASE 1: Admin Login (Ask for Password)
    if (cleanEmail === ADMIN_EMAIL) {
      return res.json({
        success: true,
        mode: "PASSWORD",
        message: "Please enter admin password",
      });
    }

    // CASE 2: User Login (Send OTP)
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        email: cleanEmail,
        role: "user",
        isEmailVerified: false,
        lastActive: new Date(),
      });
      // Send welcome email background task
      sendWelcomeEmail(cleanEmail, "").catch(e => console.error(e));
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
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
 */
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // --- ADMIN LOGIN ---
    if (cleanEmail === ADMIN_EMAIL) {
      const admin = await User.findOne({ email: cleanEmail });
      if (!admin) return res.status(401).json({ error: "Admin not initialized." });

      const isMatch = await admin.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: "Invalid Admin Password" });

      admin.lastActive = new Date();
      await admin.save();

      const token = generateToken(admin);
      return res.json({
        success: true,
        token,
        user: { id: admin._id, email: admin.email, role: "admin", name: admin.name },
      });
    }

    // --- USER LOGIN ---
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!otp) return res.status(400).json({ error: "OTP is required" });
    if (user.otp !== otp) return res.status(401).json({ error: "Invalid OTP" });
    if (new Date() > user.otpExpiry) return res.status(401).json({ error: "OTP expired" });

    user.otp = null;
    user.otpExpiry = null;
    user.isEmailVerified = true;
    user.lastActive = new Date();
    if (user.role === 'admin') user.role = 'user'; // Security fallback
    
    await user.save();

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: "user", name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Forgot Password (Admin & User)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ success: true, message: "OTP sent if email exists" });
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    try { await sendOTPEmail(user.email, otp); } catch (e) {}
    
    res.json({ success: true, message: "OTP sent" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Reset Password (Updates DB & .env)
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "All fields required" });
    
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > user.otpExpiry) return res.status(400).json({ error: "OTP expired" });
    
    // 1. Update DB
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    // 2. Update .env if Admin
    if (cleanEmail === ADMIN_EMAIL) {
      updateEnvFile("ADMIN_PASSWORD", newPassword);
    }
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

/**
 * Delete User Account (Permanent)
 */
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === 'admin') return res.status(403).json({ error: "Admin account cannot be deleted" });

    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: "Account deleted permanently" });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ... (Rest of existing functions: logout, getAdminUserStats, getAllUsers, etc.) ...
exports.logout = async (req, res) => {
  try { await User.findByIdAndUpdate(req.user.id, { lastActive: new Date(0) }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
};
exports.getAdminUserStats = async (req, res) => { try { const total = await User.countDocuments({ role: "user" }); const active = await User.countDocuments({ role: "user", lastActive: { $gte: new Date(Date.now() - 5*60000) } }); res.json({ success: true, stats: { totalUsers: total, activeUsers: active } }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.getAllUsers = async (req, res) => { try { const users = await User.find({ role: "user" }).select("-password -otp").sort({ createdAt: -1 }); res.json({ success: true, users }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.handleHeartbeat = async (req, res) => { try { await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.getCurrentUser = async (req, res) => { try { const user = await User.findById(req.user.id).select("-password -otp"); res.json({ success: true, user }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.updateProfile = async (req, res) => { try { const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }); res.json({ success: true, user }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.checkAdminStatus = async (req, res) => { try { const admin = await User.findOne({ email: ADMIN_EMAIL }); res.json({ success: true, isAdminSetup: !!(admin && admin.password) }); } catch (e) { res.status(500).json({ error: e.message }); } };
exports.setupAdmin = async (req, res) => { /* Same as before... */ res.status(403).json({ error: "Use initAdmin script" }); };