import React from "react";
import { APP_CONFIG } from "../../utils/constants";
import { FaComments, FaShieldAlt, FaUsers, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const iconMap = {
  FaVideo: FaVideo,
  FaComments: FaComments,
  FaShieldAlt: FaShieldAlt,
  FaUsers: FaUsers,
};

const FeatureSection = () => {
  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 transition-colors scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {APP_CONFIG.HOME_CONTENT.FEATURES.HEADING}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto">
            {APP_CONFIG.HOME_CONTENT.FEATURES.DESCRIPTION}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {APP_CONFIG.FEATURES.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];

            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-gray-50 dark:bg-[#282a2d] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700/80 transition-all"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${
                    feature.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : feature.color === "green"
                        ? "from-green-500 to-green-600"
                        : feature.color === "purple"
                          ? "from-purple-500 to-purple-600"
                          : "from-indigo-500 to-indigo-600"
                  } rounded-2xl flex items-center justify-center text-white mb-5 sm:mb-6 shadow-md`}
                >
                  {IconComponent && (
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
