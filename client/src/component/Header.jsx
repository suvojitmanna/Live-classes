import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { APP_CONFIG, ROUTES } from "../utils/constants";
import {
  FaVideo,
  FaMoon,
  FaSun,
  FaDesktop,
  FaSignOutAlt,
  FaThLarge,
} from "react-icons/fa";
import Avatar from "./common/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { themeMode, effectiveTheme, setThemeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-[#202124]/90 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <FaVideo className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {APP_CONFIG.APP_NAME}
            </span>
          </Link>

          <nav className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              title={`Current theme: ${themeMode} (${effectiveTheme}). Click to toggle.`}
              aria-label="Toggle theme"
            >
              {effectiveTheme === "dark" ? (
                <FaSun className="w-4 h-4 text-amber-400" />
              ) : (
                <FaMoon className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FaThLarge className="w-3.5 h-3.5 text-blue-600 dark:text-[#8ab4f8]" />
                  <span>Dashboard</span>
                </Link>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                    aria-label="User profile menu"
                  >
                    <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3 z-50 text-xs text-gray-800 dark:text-gray-200"
                      >
                        <div className="p-3 bg-gray-50 dark:bg-[#202124] rounded-xl flex items-center gap-3 mb-2">
                          <Avatar
                            name={user?.name}
                            avatar={user?.avatar}
                            size="md"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user?.name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              {user?.email}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to={ROUTES.DASHBOARD}
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                          >
                            <FaThLarge className="w-3.5 h-3.5 text-blue-600 dark:text-[#8ab4f8]" />
                            <span>Meetings Dashboard</span>
                          </Link>

                          <div className="px-3 py-2 bg-gray-50 dark:bg-[#202124] rounded-xl">
                            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
                              Appearance
                            </div>
                            <div className="grid grid-cols-3 gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                              <button
                                onClick={() => setThemeMode("system")}
                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                  themeMode === "system"
                                    ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                              >
                                <FaDesktop className="w-3 h-3" />
                                <span>System</span>
                              </button>

                              <button
                                onClick={() => setThemeMode("dark")}
                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                  themeMode === "dark"
                                    ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                              >
                                <FaMoon className="w-3 h-3" />
                                <span>Dark</span>
                              </button>

                              <button
                                onClick={() => setThemeMode("light")}
                                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                  themeMode === "light"
                                    ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-bold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                              >
                                <FaSun className="w-3 h-3" />
                                <span>Light</span>
                              </button>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-semibold cursor-pointer"
                            >
                              <FaSignOutAlt className="w-3.5 h-3.5" />
                              <span>Sign out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
