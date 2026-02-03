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
 * - Admin: requires password verification via bcrypt
 * - User: passwordless auto-register
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";

    // Admin Login
    if (email === adminEmail) {
      if (!password) {
        return res.status(400).json({ error: "Password required for admin" });
      }

      let admin = await User.findOne({ email });

      if (!admin) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      const isPasswordValid = await admin.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      const token = generateToken(admin);

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          name: admin.name,
        },
      });
    }

    // User Login (Passwordless)
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register new user
      user = await User.create({
        email,
        role: "user",
        isEmailVerified: false,
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(email, "");
      } catch (err) {
        console.error("Welcome email failed:", err.message);
      }
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "User login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Forgot Password - Send OTP
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: "If email exists, OTP will be sent",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email (non-blocking - OTP is saved even if email fails)
    try {
      await sendOTPEmail(email, otp);
      console.log(`✅ OTP email sent successfully to ${email}`);
    } catch (err) {
      console.error("⚠️ OTP email failed (OTP still saved):", err.message);
      console.log(`📝 OTP for ${email}: ${otp} (Email failed to send. Check server logs.)`);
      // Don't fail the request - OTP is saved, user can still reset password manually
    }

    // We removed the code that sent the OTP in the response here
    res.json({
      success: true,
      message: "OTP sent successfully. Please check your Gmail inbox.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify OTP and Reset Password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        error: "Email, OTP, and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(401).json({ error: "OTP expired" });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        preferences,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Password Strength Validator
 */
const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 12,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isStrong = Object.values(requirements).every((req) => req);

  return {
    isStrong,
    requirements,
    message: !isStrong
      ? `Password must contain: at least 12 characters, uppercase letters, lowercase letters, numbers, and special characters`
      : null,
  };
};

/**
 * Setup Admin Account
 */
exports.setupAdmin = async (req, res) => {
  try {
    const { password, name } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isStrong) {
      return res.status(400).json({
        error: passwordValidation.message,
        requirements: passwordValidation.requirements,
      });
    }

    // Check if admin account already exists with password
    let admin = await User.findOne({ email: adminEmail });

    if (admin && admin.password) {
      return res.status(403).json({
        error: "Admin account already initialized. Use forgot-password to reset.",
      });
    }

    if (!admin) {
      // Create new admin account
      admin = new User({
        email: adminEmail,
        role: "admin",
        name: name || "Admin",
        isEmailVerified: true,
      });
    } else {
      // Update existing admin account
      admin.name = name || admin.name || "Admin";
      admin.role = "admin"; // Explicitly set role to admin
    }

    admin.password = password;
    await admin.save();

    res.json({
      success: true,
      message: "Admin account setup successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check Admin Setup Status
 */
exports.checkAdminStatus = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "bhsrinivas94@gmail.com";
    const admin = await User.findOne({ email: adminEmail });

    const isSetup = admin && admin.password ? true : false;

    res.json({
      success: true,
      isAdminSetup: isSetup,
      adminEmail: adminEmail,
    });
  } catch (error) {
    console.error("Check admin status error:", error);
    res.status(500).json({ error: error.message });
  }
};