import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get("/auth/me");
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        } catch (error) {
          if (error.response?.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  // Step 1: Send Email to Backend
  const initiateLogin = async (email) => {
    return await api.post("/auth/login-init", { email });
  };

  // Step 2: Send Credential
  const login = async (email, password = null, otp = null) => {
    const response = await api.post("/auth/login", { email, password, otp });
    
    if (response?.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  // [UPDATED] Logout: Notify backend -> Clear local data
  const logout = async () => {
    try {
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout server error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
  const resetPassword = (data) => api.post("/auth/reset-password", data);
  const updateProfile = async (data) => {
    const res = await api.put("/auth/profile", data);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user));
    return res;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      initiateLogin,
      login, logout, forgotPassword, resetPassword, updateProfile,
      isLoggedIn: !!token,
      isAdmin: user?.role === "admin"
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth error");
  return context;
};