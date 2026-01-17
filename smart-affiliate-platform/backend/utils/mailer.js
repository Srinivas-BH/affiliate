const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create transporter with error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Fix for "Self-signed certificate" errors in development
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify connection
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Email configuration error:", error.message);
      console.warn("⚠️  Email functionality may not work. Please configure EMAIL_USER and EMAIL_PASSWORD in .env");
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });
} catch (error) {
  console.error("Failed to create email transporter:", error.message);
}

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    throw new Error("Email transporter not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be set in .env file");
  }

  const mailOptions = {
    from: `"DIS-CYRA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Password Reset - DIS-CYRA",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your DIS-CYRA account.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #666; margin: 0;">Your OTP is:</p>
          <p style="font-size: 32px; font-weight: bold; color: #4CAF50; margin: 10px 0; letter-spacing: 5px;">${otp}</p>
        </div>
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p style="color: #666; font-size: 12px;">If you didn't request this password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from DIS-CYRA.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${email}:`, error.message);
    throw error;
  }
};

/**
 * Send notification for matched product
 */
const sendProductNotification = async (userEmail, product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🎉 Product Match: ${product.title}`,
    html: `
      <h2>We found a product matching your request!</h2>
      <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
        <img src="${product.imageUrl}" alt="${product.title}" style="max-width: 200px;" />
        <h3>${product.title}</h3>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p><strong>Platform:</strong> ${product.platform}</p>
        <p>${product.description}</p>
        <a href="${product.affiliateLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Product
        </a>
      </div>
      <p>Happy shopping!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Product notification sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending product notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to DIS-CYRA",
    html: `
      <h2>Welcome, ${userName || "User"}!</h2>
      <p>Thank you for joining the DIS-CYRA Platform.</p>
      <p>Get instant notifications on products matching your interests.</p>
      <p>Use our <strong>Notify Me</strong> feature to tell us what you're looking for!</p>
      <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Go to Platform
      </a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendProductNotification,
  sendWelcomeEmail,
};