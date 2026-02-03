import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword(email);
      setSuccess("OTP sent to your email! Please check your inbox.");
      setStep(2);
      setOtpSent(true);
      
      // Show OTP in console for development (if email not configured)
      if (response.otp) {
        console.log(`📧 OTP for ${email}: ${response.otp}`);
        setSuccess(`OTP sent! Check your email. (Dev: OTP is ${response.otp})`);
      }
    } catch (err) {
      const errorMsg = err?.error || err?.message || "Failed to send OTP. Please check your email configuration.";
      setError(errorMsg);
      // If email fails, still allow user to proceed (OTP is saved in DB)
      if (errorMsg.includes("email") || errorMsg.includes("EMAIL")) {
        setSuccess("OTP generated. Check server console for OTP if email is not configured.");
        setStep(2);
        setOtpSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    setOtp(""); // Clear current OTP
    
    try {
      await handleSendOTP(null); // Pass null to prevent form submission
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.error || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-lg mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Reset your password using OTP</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
            <p className="font-semibold">✅ Success</p>
            <p className="text-sm">{success}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📧 Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔢 Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                required
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-2">Check your email for the 6-digit OTP</p>
            </div>
            
            {/* Resend OTP Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline disabled:text-gray-400 disabled:no-underline"
              >
                {resending ? "Resending..." : "🔄 Resend OTP"}
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setOtpSent(false);
                  setError("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔒 New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                required
                minLength={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setNewPassword("");
                  setError("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline font-semibold"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
