import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Check if email matches admin email
  const ADMIN_EMAIL = "bhsrinivas94@gmail.com";
  const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // If admin email, show password field
    if (isAdminEmail) {
      setShowPassword(true);
      return;
    }

    // For regular users, login without password
    setLoading(true);
    setError("");

    try {
      const response = await login(email, null);
      // Redirect based on role - use window.location for reliable redirect
      if (response && response.user) {
        if (response.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.error || err?.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required for admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);
      
      // Verify response structure
      if (!response || !response.user || !response.token) {
        console.error("Invalid response structure:", response);
        setError("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }
      
      // Verify admin role
      const userRole = response.user.role;
      if (userRole !== "admin") {
        console.error("Admin login failed - user role is:", userRole);
        setError("Invalid admin credentials. Role mismatch.");
        setLoading(false);
        return;
      }
      
      // Save to localStorage immediately
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      
      // Force page reload to ensure clean state
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Admin login error:", err);
      const errorMessage = err?.response?.data?.error || err?.error || err?.message || "Invalid admin credentials";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DIS-CYRA</h1>
          <p className="text-blue-100 text-lg mt-2">Login to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {!showPassword ? (
          <form className="space-y-6 bg-white rounded-2xl shadow-2xl p-8" onSubmit={handleEmailSubmit}>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form className="space-y-6 bg-white rounded-2xl shadow-2xl p-8" onSubmit={handlePasswordSubmit}>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 font-semibold">🔐 Admin Login Detected</p>
              <p className="text-xs text-blue-600 mt-1">Please enter your password to continue</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔒 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="Enter your password"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPassword(false);
                  setPassword("");
                  setError("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
