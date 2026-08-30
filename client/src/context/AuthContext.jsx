import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
        if (response.data?.data?.user) {
          setUser(response.data.data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.warn("Session validation error:", err.message);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  //Register with Email & Password -> Requires OTP Verification
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
      toast.success("Verification code sent to your email 📧", { id: t });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  //Verify 6-Digit Email OTP
  const verifyEmail = async (email, otp) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        email,
        otp,
      });

      const { token, user: loggedInUser } = response.data.data;
      if (token) {
        localStorage.setItem("token", token);
      }
      if (loggedInUser) {
        setUser(loggedInUser);
      }

      return { success: true, user: loggedInUser };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Verification failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  //Resend Verification OTP
  const resendOtp = async (email) => {
    try {
      setError(null);
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to resend OTP";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  //Login with Email & Password
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
      toast.success("Welcome back! 🎉", { id: t });
      return { success: true, user: loggedInUser };
    } catch (err) {
      const resData = err?.response?.data;
      const errorMessage =
        resData?.message ||
        resData?.error ||
        err.message ||
        "Invalid email or password";

      setError(errorMessage);

      if (resData?.requiresVerification) {
        toast.error("Please verify your email with the 6-digit code");
        return {
          success: false,
          requiresVerification: true,
          email: resData.email || email,
          error: errorMessage,
        };
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  //Google OAuth Login / Signup
  const googleLogin = async (credential, userInfo) => {
    try {
      setError(null);
      setLoading(true);
      const t = toast.loading("Authenticating with Google...");
      const response = await api.post(API_ENDPOINTS.AUTH.GOOGLE, {
        credential,
        userInfo,
      });

      const { token, user: loggedInUser } = response.data.data;

      localStorage.setItem("token", token);
      setUser(loggedInUser);
      toast.success("Signed in with Google successfully! 🎉", { id: t });
      return { success: true, user: loggedInUser };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Google authentication failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  //Forgot Password - Send Reset Code
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to send reset code";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  //Reset Password with Verified OTP
  const resetPassword = async (email, otp, newPassword) => {
    try {
      setError(null);
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      const { token, user: loggedInUser } = response.data.data || {};
      if (token) {
        localStorage.setItem("token", token);
      }
      if (loggedInUser) {
        setUser(loggedInUser);
      }

      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Password reset failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  //Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    toast.success("Logged out successfully 👋");
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    verifyEmail,
    resendOtp,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
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
