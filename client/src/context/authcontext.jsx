import { createContext, useContext, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../uttils/constants";
import api from "../service/api";

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

      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        name,
        email,
        password,
      });

      const { token, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", token);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || error.message || "Register failed";

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", token);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || error.message || "Login failed";

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    window.location.replace("/login");
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
