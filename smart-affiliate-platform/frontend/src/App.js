import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HeartbeatTracker from "./components/HeartbeatTracker";

// General Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminSetupPage from "./pages/AdminSetupPage";
import UserDashboard from "./pages/UserDashboard";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import WriteToUsPage from "./pages/WriteToUsPage";
import ProfilePage from "./pages/ProfilePage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminUserRequestsPage from "./pages/AdminUserRequestsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminUsersListPage from "./pages/AdminUsersListPage";
import MeeshoProductsPage from "./pages/MeeshoProductsPage"; // New Import

import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <HeartbeatTracker />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/setup" element={<AdminSetupPage />} />
          
          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write-to-us"
            element={
              <ProtectedRoute>
                <WriteToUsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Specific Meesho Route (Integrated into Distribution View) */}
          <Route
            path="/admin/products/meesho"
            element={
              <ProtectedRoute adminOnly={true}>
                <MeeshoProductsPage />
              </ProtectedRoute>
            }
          />

          {/* General Dynamic Platform Route */}
          <Route
            path="/admin/products/:platform?"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/user-requests"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUserRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsersListPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;