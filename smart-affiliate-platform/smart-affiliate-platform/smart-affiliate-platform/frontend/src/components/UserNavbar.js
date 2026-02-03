import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Books",
    "Mobile Phones",
    "Laptops",
    "Audio",
    "Wearables",
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            🛍️ DIS-CYRA
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Home
            </Link>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="text-gray-700 hover:text-blue-600 font-semibold transition flex items-center gap-1"
              >
                Category
                <span className="text-xs">▼</span>
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to="/dashboard"
                    onClick={() => {
                      setShowCategoryDropdown(false);
                      // Clear category filter
                      window.location.href = "/dashboard";
                    }}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/dashboard?category=${encodeURIComponent(cat)}`}
                      onClick={() => setShowCategoryDropdown(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/wishlist"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Wishlist
            </Link>

            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              About
            </Link>

            <Link
              to="/write-to-us"
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Write to Us
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition"
              >
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="text-xs">▼</span>
              </button>
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Edit Profile
                  </Link>
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
      {(showCategoryDropdown || showProfileDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCategoryDropdown(false);
            setShowProfileDropdown(false);
          }}
        />
      )}
    </nav>
  );
}
