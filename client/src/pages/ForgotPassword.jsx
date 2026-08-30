import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";
import {
  FaKey,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      toast.success("Password reset code sent to your email 📧");
      setStep(2);
    } else {
      setError(result.error || "Failed to send reset code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit reset code");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const result = await resetPassword(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success("Password reset successfully! 🎉");
      setStep(3);
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 1500);
    } else {
      setError(result.error || "Invalid or expired reset code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-[#282a2d] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700/80 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg shadow-blue-500/20">
          {step === 3 ? <FaCheckCircle /> : <FaKey />}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Enter your email address and we'll send you a 6-digit code to
              reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-6 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    Sending Code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {email}
              </span>{" "}
              and your new password.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form
              onSubmit={handleResetPassword}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.trim());
                    setError("");
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 text-center tracking-widest font-mono text-base bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-4 h-4" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Complete!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your password has been reset successfully. Redirecting you to
              dashboard...
            </p>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
