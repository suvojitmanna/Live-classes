import React from "react";
import { useAuth } from "../../context/authcontext";
import { FaArrowRight, FaCheckCircle, FaRocket } from "react-icons/fa";
import { APP_CONFIG, ROUTES } from "../../uttils/constants";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full blur-xl opacity-20"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full blur-xl opacity-20"
        />
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-8"
        >
          <FaRocket className="w-4 h-4 mr-2" />
          {APP_CONFIG.HOME_CONTENT.HERO.BADGE_TEXT}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
        >
          {APP_CONFIG.HOME_CONTENT.HERO.HEADING}
          <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {APP_CONFIG.HOME_CONTENT.HERO.HEADING_HIGHLIGHT}
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto"
        >
          {APP_CONFIG.HOME_CONTENT.HERO.SUBHEADING}
        </motion.p>

        {/* Buttons */}
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
          className="flex flex-col sm:flex-row gap-8 lg:gap-4 justify-center items-center"
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
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg flex items-center"
              >
                {APP_CONFIG.HOME_CONTENT.HERO.CTA_AUTHENTICATED}
                <FaArrowRight className="ml-2" />
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
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg flex items-center"
                >
                  {APP_CONFIG.HOME_CONTENT.HERO.CTA_PRIMARY}
                  <FaArrowRight className="ml-2" />
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
                  className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold text-lg"
                >
                  {APP_CONFIG.HOME_CONTENT.HERO.CTA_SECONDARY}
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-gray-600"
        >
          {APP_CONFIG.TRUST_INDICATORS.map((indicator, index) => (
            <motion.div key={index} className="flex items-center">
              <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>{indicator}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
