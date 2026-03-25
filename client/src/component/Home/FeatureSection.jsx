import React from "react";
import { APP_CONFIG } from "../../uttils/constants";
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
      className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }} //   scroll trigger
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {APP_CONFIG.HOME_CONTENT.FEATURES.HEADING}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto">
            {APP_CONFIG.HOME_CONTENT.FEATURES.DESCRIPTION}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} //  triggers on scroll
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
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
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${
                    feature.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : feature.color === "green"
                      ? "from-green-500 to-green-600"
                      : feature.color === "purple"
                      ? "from-purple-500 to-purple-600"
                      : "from-indigo-500 to-indigo-600"
                  } rounded-xl flex items-center justify-center text-white mb-5 sm:mb-6`}
                >
                  {IconComponent && (
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600">
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