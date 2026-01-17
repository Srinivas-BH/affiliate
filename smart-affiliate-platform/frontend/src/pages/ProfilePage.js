import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/UserNavbar";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    categories: user?.preferences?.categories || [],
    maxPrice: user?.preferences?.maxPrice || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        preferences: {
          categories: formData.categories,
          maxPrice: formData.maxPrice ? parseInt(formData.maxPrice) : null,
        },
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            👤 Profile Settings
          </h1>
          <p className="text-gray-600">Manage your preferences and account information</p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📧 Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 font-medium"
              />
              <p className="text-xs text-gray-500 mt-2">Your email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                👤 Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="Your full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📱 Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            {/* Preferred Categories */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">
                🏷️ Preferred Categories
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Electronics",
                  "Mobile Phones",
                  "Laptops",
                  "Fashion",
                  "Home Appliances",
                  "Books",
                ].map((category) => (
                  <label key={category} className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-gray-700 font-medium cursor-pointer">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Price Budget */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                💰 Max Price Budget (Optional)
              </label>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) =>
                  setFormData({ ...formData, maxPrice: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="Enter max price in rupees"
              />
              <p className="text-xs text-gray-500 mt-2">Leave blank for no limit</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg animate-bounce">
                <p className="font-semibold">✅ Success!</p>
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "💾 Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Account Information Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            ℹ️ Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-semibold">Role</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {user?.role === "admin" ? "👑 Administrator" : "👤 User"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-semibold">Member Since</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-semibold">Email Status</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {user?.isEmailVerified ? "✅ Verified" : "⏳ Pending"}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
