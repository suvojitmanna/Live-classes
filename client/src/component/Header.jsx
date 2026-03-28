import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "../utils/constants";
import { FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Title */}

          <Link
            to={"/"}
            onClick={() =>
              toast("Welcome to the home page 🏠", {
                icon: "👋",
                style: {
                  background: "rgba(59,130,246,0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "black",
                },
              })
            }
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
            >
              <FaVideo className="w-5 h-5 text-white" />
            </motion.div>

            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              {APP_CONFIG.APP_NAME}
            </motion.h1>
          </Link>

          {/* Nav */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ y: -2 }}>
                  <Link
                    to={ROUTES.DASHBOARD}
                    onClick={() =>
                      toast("Opening dashboard 📊", {
                        icon: "🚀",
                        style: {
                          background: "rgba(59,130,246,0.12)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          color: "black",
                        },
                      })
                    }
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </motion.div>

                {/* User */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm hidden sm:inline">
                    {user?.name}
                  </span>
                </motion.div>

                {/* Logout */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                >
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }}>
                  <Link
                    to={ROUTES.LOGIN}
                    onClick={() =>
                      toast("Redirecting to login 🔐", {
                        icon: "👋",
                        style: {
                          background: "rgba(30,30,30,0.6)",
                          color: "#fff",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "10px 14px",
                        },
                      })
                    }
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={ROUTES.REGISTER}
                    onClick={() =>
                      toast.success("Let’s create your account 🚀", {
                        icon: "✨",
                        style: {
                          background: "rgba(22,163,74,0.15)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(34,197,94,0.4)",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          color: "black",
                        },
                      })
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
