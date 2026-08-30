import React from "react";
import {
  FaEnvelope,
  FaExclamationCircle,
  FaLock,
  FaShieldAlt,
  FaSpinner,
  FaUser,
  FaUserPlus,
  FaVideo,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { APP_CONFIG, ROUTES } from "../utils/constants";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

const AuthForm = ({
  mode,
  formData,
  onChange,
  onSubmit,
  onGoogleSuccess,
  onGoogleError,
  loading,
  error,
  localError,
}) => {
  const isLogin = mode === "login";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 transition-colors"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl shadow-lg mb-4 bg-gradient-to-br from-blue-600 to-indigo-600">
            {isLogin ? (
              <FaVideo className="w-7 h-7 text-white" />
            ) : (
              <FaUserPlus className="w-7 h-7 text-white" />
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? APP_CONFIG.APP_NAME : `Join ${APP_CONFIG.APP_NAME}`}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isLogin
              ? APP_CONFIG.APP_TAGLINE
              : "Start hosting and joining real-time live classes"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#282a2d] rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700/80"
        >
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">
              {isLogin
                ? APP_CONFIG.AUTH_CONTENT.LOGIN.HEADING
                : APP_CONFIG.AUTH_CONTENT.REGISTER.HEADING}
            </h2>

            <p className="mt-1.5 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {isLogin
                ? APP_CONFIG.AUTH_CONTENT.LOGIN.DESCRIPTION
                : APP_CONFIG.AUTH_CONTENT.REGISTER.DESCRIPTION}
            </p>
          </div>

          <div className="mb-6">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                  text={isLogin ? "signin_with" : "signup_with"}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onGoogleSuccess) {
                    onGoogleSuccess({
                      credential: null,
                      userInfo: {
                        id: `google_${Date.now()}`,
                        name: "Google User",
                        email: "googleuser@example.com",
                      },
                    });
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all"
              >
                <FcGoogle className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#282a2d] px-4 text-gray-400 font-semibold text-[11px]">
                  Or with email
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {(error || localError) && (
              <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3.5 rounded-xl flex items-start text-xs">
                <FaExclamationCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span>{error || localError}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={onChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] text-xs sm:text-sm text-gray-900 dark:text-white transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={onChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] text-xs sm:text-sm text-gray-900 dark:text-white transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password || ""}
                  onChange={onChange}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] text-xs sm:text-sm text-gray-900 dark:text-white transition-all"
                  placeholder={
                    isLogin ? "Enter your password" : "Minimum 6 characters"
                  }
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaShieldAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword || ""}
                    onChange={onChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] text-xs sm:text-sm text-gray-900 dark:text-white transition-all"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-full shadow-lg text-xs sm:text-sm font-semibold text-white bg-[#1a73e8] hover:bg-[#1557b0] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4 text-white" />
                  <span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account & Verify"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <Link
                    to={ROUTES.REGISTER}
                    className="font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthForm;
