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
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } else {
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
      
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from server");
      }
      
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
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

  const deleteAccount = async () => {
    try {
      await api.delete("/auth/profile");
      logout();
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
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

  const checkIsAdmin = () => {
    if (user?.role === "admin") return true;
    if (!user && token) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          return parsedUser?.role === "admin";
        }
      } catch (e) {
        return false;
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
        deleteAccount,
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