import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading, user, token } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in (token exists)
  if (!isLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  // For admin-only routes, verify admin role
  if (adminOnly) {
    // Check user from state or localStorage
    let userRole = user?.role;
    if (!userRole && token) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          userRole = parsedUser?.role;
        }
      } catch (e) {
        console.error("Error parsing saved user:", e);
      }
    }
    
    // Wait a bit more if user data is still loading
    if (!userRole) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying admin access...</p>
          </div>
        </div>
      );
    }
    
    if (userRole !== "admin") {
      // User is logged in but not admin, redirect to user dashboard
      console.warn("Non-admin user tried to access admin route. Role:", userRole);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
