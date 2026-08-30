import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FaArrowRight, FaCheckCircle, FaRocket } from "react-icons/fa";
import { APP_CONFIG, ROUTES } from "../../utils/constants";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#181818] dark:via-[#1f1f1f] dark:to-[#181818] text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-full text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-8 shadow-sm"
        >
          <FaRocket className="w-3.5 h-3.5 mr-2 text-blue-600 dark:text-blue-400" />
          {APP_CONFIG.HOME_CONTENT.HERO.BADGE_TEXT}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
        >
          {APP_CONFIG.HOME_CONTENT.HERO.HEADING}{" "}
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#8ab4f8] dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {APP_CONFIG.HOME_CONTENT.HERO.HEADING_HIGHLIGHT}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed"
        >
          {APP_CONFIG.HOME_CONTENT.HERO.SUBHEADING}
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {isAuthenticated ? (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => toast.success("Opening your dashboard 📊")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-base sm:text-lg flex items-center shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative flex items-center">
                  {APP_CONFIG.HOME_CONTENT.HERO.CTA_AUTHENTICATED}
                  <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => toast.success("Let's get you started ✨")}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold text-base sm:text-lg flex items-center justify-center shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative flex items-center">
                    {APP_CONFIG.HOME_CONTENT.HERO.CTA_PRIMARY}
                    <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => toast.success("Welcome back 👋")}
                  className="group px-8 py-4 bg-white dark:bg-[#282a2d] text-blue-600 dark:text-[#8ab4f8] border-2 border-blue-600 dark:border-[#8ab4f8] rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 hover:bg-blue-50 dark:hover:bg-[#3c4043] shadow-md flex items-center justify-center transform hover:scale-105"
                >
                  <span>{APP_CONFIG.HOME_CONTENT.HERO.CTA_SECONDARY}</span>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
        >
          {APP_CONFIG.TRUST_INDICATORS.map((indicator, index) => (
            <motion.div key={index} className="flex items-center font-medium">
              <FaCheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
              <span>{indicator}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
