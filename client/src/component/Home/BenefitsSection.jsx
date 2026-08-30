import React from "react";
import { APP_CONFIG } from "../../utils/constants";
import { FaCheckCircle, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = APP_CONFIG.BENEFITS;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="aspect-video bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/20">
                <FaVideo className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-white opacity-70" />
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-20 sm:w-24 h-20 sm:h-24 bg-blue-400 rounded-full opacity-20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-20 sm:w-24 h-20 sm:h-24 bg-purple-400 rounded-full opacity-20 blur-2xl pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {APP_CONFIG.HOME_CONTENT.BENEFITS.HEADING.replace(
                "{APP_NAME}",
                APP_CONFIG.APP_NAME,
              )}
            </h2>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {APP_CONFIG.HOME_CONTENT.BENEFITS.DESCRIPTION}
            </p>

            <ul className="space-y-3.5 pt-2">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start"
                >
                  <FaCheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
