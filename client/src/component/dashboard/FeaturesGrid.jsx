import React from "react";
import { APP_CONFIG } from "../../uttils/constants.js";
import { FaComments, FaShieldAlt, FaUsers, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const iconMap = {
  FaVideo: FaVideo,
  FaComments: FaComments,
  FaShieldAlt: FaShieldAlt,
  FaUsers: FaUsers,
};

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

const FeaturesGrid = () => {
  const features = APP_CONFIG.FEATURES.slice(0, 4);

  //  Container (stagger grid items)
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  //  Each feature card
  const item = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {features.map((feature, index) => {
        const IconComponent = iconMap[feature.icon];

        return (
          <motion.div
            key={index}
            variants={item}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:scale-[1.1]"
          >
            <div
              className={`w-12 h-12 ${colorMap[feature.color]} rounded-lg flex items-center justify-center mb-4 `}
            >
              {IconComponent && <IconComponent className="w-6 h-6" />}
            </div>

            <h4 className="font-semibold text-gray-900 mb-2">
              {feature.title}
            </h4>

            <p className="text-sm text-gray-600">{feature.shortDescription}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default FeaturesGrid;
