import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get("/auth/me");
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error) {
          console.error("Fetch user error:", error);
          // Only clear if token is truly invalid (401)
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          } else {
            // For other errors, keep the user from localStorage
            console.warn("Failed to fetch user, using cached data");
          }
        }
      } else {
        // No token, clear user
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password = null) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Validate response
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from server");
      }
      
      // Save to localStorage first
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update state
      setToken(response.token);
      setUser(response.user);
      
      console.log("Login successful - User:", response.user.email, "Role:", response.user.role);
      
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const forgotPassword = async (email) => {
    return api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (email, otp, newPassword) => {
    return api.post("/auth/reset-password", { email, otp, newPassword });
  };

  const updateProfile = async (data) => {
    const response = await api.put("/auth/profile", data);
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
    return response;
  };

  // Check if admin - use user from state or localStorage
  const checkIsAdmin = () => {
    if (user?.role === "admin") return true;
    // Fallback: check localStorage if user not loaded yet
    if (!user && token) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          return parsedUser?.role === "admin";
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        isLoggedIn: !!token,
        isAdmin: checkIsAdmin(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
