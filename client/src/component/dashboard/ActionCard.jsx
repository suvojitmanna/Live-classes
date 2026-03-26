import React from "react";
import { FaPlus, FaSpinner, FaUsers } from "react-icons/fa";
import { APP_CONFIG } from "../../uttils/constants.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ActionCard = ({ onCreateSession, onJoinSession, creating }) => {
  //  Container (stagger both cards)
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Each card animation
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
      className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Host Card */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:translate-y-5 border border-gray-100 "
      >
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-6 mx-auto">
          <FaPlus className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.HOST.TITLE}
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.HOST.DESCRIPTION}
        </p>
        <button
          onClick={async () => {
            if (creating) return;

            const t = toast.loading("Creating session... 🎥");

            try {
              await onCreateSession();

              toast.success("Session created successfully 🚀", {
                id: t,
                icon: "🎉",
                style: {
                  background: "rgba(34,197,94,0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "black",
                },
              });
            } catch (err) {
              toast.error("Failed to create session ❌", {
                id: t,
                icon: "⛔",
              });
            }
          }}
          disabled={creating}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-[1.02] shadow-md cursor-pointer"
        >
          {creating ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.HOST.BUTTON_LOADING}
            </span>
          ) : (
            APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.HOST.BUTTON
          )}
        </button>
      </motion.div>

      {/* Join Card */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:translate-y-5 border border-gray-100"
      >
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-6 mx-auto ">
          <FaUsers className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.JOIN.TITLE}
        </h3>

        <p className="text-gray-600 mb-6 text-center">
          {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.JOIN.DESCRIPTION}
        </p>

        <button
          onClick={async () => {
            const t = toast.loading("Let's Joining... 🎥");

            try {
              await onJoinSession();

              toast.success("Let's join... 🎉", {
                id: t,
                icon: "🚀",
                style: {
                  background: "rgba(34,197,94,0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "black",
                },
              });
            } catch (err) {
              toast.error("Failed to join session ❌", {
                id: t,
                icon: "⛔",
              });
            }
          }}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform hover:scale-[1.02] shadow-md cursor-pointer"
        >
          {APP_CONFIG.DASHBOARD_CONTENT.ACTION_CARDS.JOIN.BUTTON}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ActionCard;
