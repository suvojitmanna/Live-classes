import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../component/AuthForm";
import toast from "react-hot-toast";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mode = location.pathname === ROUTES.REGISTER ? "register" : "login";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");

  const { login, register, googleLogin, loading, error, isAuthenticated } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (mode === "login") {
      if (!formData.email || !formData.password) {
        setLocalError("Please fill in all fields");
        return;
      }

      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(ROUTES.DASHBOARD);
      } else if (result.requiresVerification) {
        navigate(
          `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(formData.email)}`,
        );
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setLocalError("Please fill in all fields");
        return;
      }

      if (formData.password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }

      const result = await register(
        formData.name,
        formData.email,
        formData.password,
      );

      if (result.success) {
        navigate(
          `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(formData.email)}`,
        );
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(
        credentialResponse.credential,
        credentialResponse.userInfo,
      );
      if (result.success) {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      toast.error("Google authentication failed. Please try again.");
      console.log(err)
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In was cancelled or failed");
  };

  return (
    <AuthForm
      mode={mode}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={handleGoogleError}
      loading={loading}
      error={error}
      localError={localError}
    />
  );
};

export default Auth;
