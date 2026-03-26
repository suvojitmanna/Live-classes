import { createContext, useContext, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../utils/constants";
import api from "../service/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(API_ENDPOINTS.AUTH.ME);
        setUser(response.data?.data?.user);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const t = toast.loading("Creating account...");

      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
      });

      const { token, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", token);
      setUser(loggedInUser);

      setTimeout(() => {
        toast.success("Account created successfully 🎉", {
          id: t,
          icon: "🟢",
          style: {
            background: "rgba(22,163,74,0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            color: "black",
          },
        });
      }, 700);

      return { success: true, user: loggedInUser };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || error.message || "Register failed";

      setError(errorMessage);

      // error toast added
      toast.error(errorMessage, {
        style: {
          border: "1px solid rgba(239,68,68,0.35)",
        },
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const t = toast.loading("Logging in...");

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", token);
      setUser(loggedInUser);

      // small delay = premium feel
      setTimeout(() => {
        toast.success("Welcome back! 🎉", {
          id: t,
          icon: "🟢",
          style: {
            background: "rgba(22,163,74,0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            color: "black",
          },
        });
      }, 700);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || error.message || "Login failed";

      setError(errorMessage);
      toast.error(errorMessage); // ✅ show error toast

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const t = toast.loading("Logging out...");

    localStorage.removeItem("token");
    setUser(null);
    setError(null);

    setTimeout(() => {
      toast.success("Logged out successfully 👋", {
        id: t,
        icon: "🔒",
        style: {
          background: "rgba(239,68,68,0.12)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: "14px",
          padding: "12px 16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          color: "black",
        },
      });

      // better UX: delay + optional navigation
      setTimeout(() => {
        window.location.replace("/login");
        // OR navigate("/login");
      }, 800);
    }, 500);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
