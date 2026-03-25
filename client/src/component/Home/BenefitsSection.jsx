import React from "react";
import { APP_CONFIG } from "../../uttils/constants";
import { FaCheckCircle, FaVideo } from "react-icons/fa";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  const benefits = APP_CONFIG.BENEFITS;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center">

          {/* LEFT SIDE (Video Card) */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 shadow-2xl">
              
              <div className="aspect-video bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center">
                <FaVideo className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-white opacity-50" />
              </div>

            </div>

            {/* Glow effects */}
            <div className="absolute -top-4 -right-4 w-20 sm:w-24 h-20 sm:h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 sm:w-24 h-20 sm:h-24 bg-pink-400 rounded-full opacity-20 blur-2xl"></div>
          </motion.div>

          {/* RIGHT SIDE (Text Content) */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {APP_CONFIG.HOME_CONTENT.BENEFITS.HEADING.replace(
                "{APP_NAME}",
                APP_CONFIG.APP_NAME
              )}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              {APP_CONFIG.HOME_CONTENT.BENEFITS.DESCRIPTION}
            </p>

            <ul className="space-y-3 sm:space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <FaCheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg text-gray-700">
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