import React from "react";
import { useAuth } from "../../context/authcontext";
import { APP_CONFIG, ROUTES } from "../../uttils/constants";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const CTASection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6"
        >
          {APP_CONFIG.HOME_CONTENT.CTA.HEADING}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8"
        >
          {APP_CONFIG.HOME_CONTENT.CTA.DESCRIPTION.replace(
            "{APP_NAME}",
            APP_CONFIG.APP_NAME,
          )}
        </motion.p>

        {/* Button */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          {isAuthenticated ? (
            <Link
              to={ROUTES.DASHBOARD}
              onClick={() =>
                toast("Taking you to dashboard 📊", {
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
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-semibold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105"
            >
              {APP_CONFIG.HOME_CONTENT.CTA.BUTTON_AUTHENTICATED}
              <FaArrowRight className="ml-2" />
            </Link>
          ) : (
            <Link
              to={ROUTES.REGISTER}
              onClick={() =>
                toast("Start your journey ✨", {
                  icon: "🚀",
                  style: {
                    background: "rgba(34,197,94,0.12)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    color: "black",
                  },
                })
              }
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-semibold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105"
            >
              {APP_CONFIG.HOME_CONTENT.CTA.BUTTON_GUEST}
              <FaArrowRight className="ml-2" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
