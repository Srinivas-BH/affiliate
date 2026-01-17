import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/UserNavbar";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Only updating name as per your requirements
      await updateProfile({
        name: formData.name,
      });
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
    // Brief delay to show the "Signing out" container before clearing state
    setTimeout(() => {
      logout();
      navigate("/");
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      navigate("/");
    } catch (err) {
      setError("Failed to delete account. Please try again.");
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Sign Out Confirmation Overlay */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl animate-pulse">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-800">You're signing out...</h2>
            <p className="text-gray-500 mt-2">Redirecting you to the home page.</p>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Permanent Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account permanently? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              👤 Profile Settings
            </h1>
            <p className="text-gray-600">Update your account information</p>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📧 Email Address (Read-Only)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600 font-medium"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
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

              {/* Messages */}
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {/* Update Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            </form>

            <hr className="my-8 border-gray-100" />

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                🚪 Sign Out
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 text-red-600 font-bold py-3 hover:bg-red-50 rounded-xl transition"
              >
                🗑️ Permanent Delete Account
              </button>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">ℹ️ Account Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-gray-600 text-xs font-semibold">Role</p>
                <p className="text-md font-bold text-blue-600">
                  {user?.role === "admin" ? "👑 Admin" : "👤 User"}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                <p className="text-gray-600 text-xs font-semibold">Member Since</p>
                <p className="text-md font-bold text-green-600">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}