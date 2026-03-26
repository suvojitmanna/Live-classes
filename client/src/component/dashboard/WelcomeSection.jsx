import React from "react";
import { APP_CONFIG } from "../../utils/constants";
import { motion } from "framer-motion";

const WelcomeSection = ({ userName }) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="text-center mb-12"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <h2 className="text-4xl font-bold text-gray-900 mb-3">
        {APP_CONFIG.DASHBOARD_CONTENT.WELCOME.GREETING.replace(
          "{userName}",
          userName,
        )}
      </h2>

      <p className="text-lg text-gray-600">
        {APP_CONFIG.DASHBOARD_CONTENT.WELCOME.DESCRIPTION}
      </p>
    </motion.div>
  );
};

export default WelcomeSection;
