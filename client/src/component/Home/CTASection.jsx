import React from "react";
import { useAuth } from "../../context/AuthContext";
import { APP_CONFIG, ROUTES } from "../../utils/constants";
import { Link } from "react-router-dom";
import { FaArrowRight, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const CTASection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto border border-white/20 shadow-lg">
          <FaVideo className="w-6 h-6 text-white" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
        >
          {APP_CONFIG.HOME_CONTENT.CTA.HEADING}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base md:text-lg text-blue-100 max-w-2xl mx-auto"
        >
          {APP_CONFIG.HOME_CONTENT.CTA.DESCRIPTION.replace(
            "{APP_NAME}",
            APP_CONFIG.APP_NAME,
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="pt-2"
        >
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-blue-600 rounded-full hover:bg-gray-100 font-semibold text-sm shadow-xl transition-all transform hover:scale-105"
            >
              <span>{APP_CONFIG.HOME_CONTENT.CTA.BUTTON_AUTHENTICATED}</span>
              <FaArrowRight className="ml-2 w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-blue-600 rounded-full hover:bg-gray-100 font-semibold text-sm shadow-xl transition-all transform hover:scale-105"
            >
              <span>{APP_CONFIG.HOME_CONTENT.CTA.BUTTON_GUEST}</span>
              <FaArrowRight className="ml-2 w-3.5 h-3.5" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
