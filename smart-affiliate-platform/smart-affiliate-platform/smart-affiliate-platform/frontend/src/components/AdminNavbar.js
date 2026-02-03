import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showApplicationDropdown, setShowApplicationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const platforms = ["AMAZON", "FLIPKART", "MYNTRA", "MEESHO", "OTHER"];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/admin/dashboard" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            🛍️ Admin Panel
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/admin/dashboard"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Dashboard
            </Link>

            {/* Application Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowApplicationDropdown(!showApplicationDropdown)}
                className="text-gray-700 hover:text-blue-600 font-semibold transition flex items-center gap-1"
              >
                Application
                <span className="text-xs">▼</span>
              </button>
              {showApplicationDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {platforms.map((platform) => (
                    <Link
                      key={platform}
                      to={`/admin/products/${platform.toLowerCase()}`}
                      onClick={() => setShowApplicationDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      {platform === "AMAZON" && "🟠 "}
                      {platform === "FLIPKART" && "🔵 "}
                      {platform === "MYNTRA" && "💙 "}
                      {platform === "MEESHO" && "📱 "}
                      {platform}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/admin/user-requests"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              User Requests
            </Link>

            <Link
              to="/admin/analytics"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Analytics
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition"
              >
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  A
                </span>
                <span className="text-xs">▼</span>
              </button>
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showApplicationDropdown || showProfileDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowApplicationDropdown(false);
            setShowProfileDropdown(false);
          }}
        />
      )}
    </nav>
  );
}
