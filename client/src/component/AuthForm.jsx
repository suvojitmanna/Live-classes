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
import { APP_CONFIG, ROUTES } from "../uttils/constants";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const AuthForm = ({
  mode,
  formData,
  onChange,
  onSubmit,
  loading,
  error,
  localError,
}) => {
  const isLogin = mode === "login";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isLogin
          ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
          : "bg-gradient-to-br from-purple-50 via-pink-50 to-red-50"
      }`}
    >
      <div className="max-w-md w-full">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 ${
              isLogin
                ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                : "bg-gradient-to-br from-purple-600 to-pink-600"
            }`}
          >
            {isLogin ? (
              <FaVideo className="w-8 h-8 text-white" />
            ) : (
              <FaUserPlus className="w-8 h-8 text-white" />
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? APP_CONFIG.APP_NAME : `Join ${APP_CONFIG.APP_NAME}`}
          </h1>

          <p className="text-gray-600">
            {isLogin
              ? APP_CONFIG.APP_TAGLINE
              : "Start your learning journey today"}
          </p>
        </motion.div>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {isLogin
                ? APP_CONFIG.AUTH_CONTENT.LOGIN.HEADING
                : APP_CONFIG.AUTH_CONTENT.REGISTER.HEADING}
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin
                ? APP_CONFIG.AUTH_CONTENT.LOGIN.DESCRIPTION
                : APP_CONFIG.AUTH_CONTENT.REGISTER.DESCRIPTION}
            </p>
          </div>

          {/* FORM */}
          <motion.form
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className={isLogin ? "space-y-5" : "space-y-4"}
            onSubmit={onSubmit}
          >
            {(error || localError) && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start">
                <FaExclamationCircle className="w-5 h-5 mr-2 mt-0.5" />
                <span className="text-sm">{error || localError}</span>
              </div>
            )}
            {/* NAME */}
            {!isLogin && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    name="name"
                    type="text"
                    value={formData.name || ""}
                    onChange={onChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Suvojit"
                  />
                </div>
              </motion.div>
            )}
            {/* EMAIL */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={onChange}
                  className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                    isLogin
                      ? "focus:ring-blue-500 focus:border-blue-500"
                      : "focus:ring-purple-500 focus:border-purple-500"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            {/* PASSWORD */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={formData.password || ""}
                    onChange={onChange}
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 ${
                      isLogin
                        ? "focus:ring-blue-500 focus:border-blue-500"
                        : "focus:ring-purple-500 focus:border-purple-500"
                    }`}
                    placeholder={
                      isLogin ? "Enter password" : "Minimum 6 Character"
                    }
                  />
                </div>
              </div>

              {/* Confirm Password (ONLY for Register) */}
              {!isLogin && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaShieldAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword || ""}
                      onChange={onChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              )}
            </motion.div>
            {/* BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]  ${isLogin ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500" : "bg-gradient-to-r from-purple-600 to-pink-600  hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 mt-6"}`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  {isLogin ? "Signing..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account{" "}
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() =>
                      toast("Let’s create your account 🚀", {
                        icon: "✨",
                        style: {
                          background: "rgba(59,130,246,0.12)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          color: "black",
                        },
                      })
                    }
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create one now
                  </Link>
                </>
              ) : (
                <>
                  Already have an account{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() =>
                      toast("Welcome back 👋", {
                        icon: "🔐",
                        style: {
                          background: "rgba(168,85,247,0.12)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(168,85,247,0.3)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          color: "black",
                        },
                      })
                    }
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign in here
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
