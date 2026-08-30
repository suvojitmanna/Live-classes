import React from "react";
import { FaVideo, FaHome, FaRedo } from "react-icons/fa";
import { motion } from "framer-motion";

const MeetingEndedView = ({ onRejoin, onReturnHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 rounded-3xl p-8 text-center shadow-2xl space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg">
          <FaVideo className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            You left the meeting
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Have a great day! You can rejoin if you left accidentally.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRejoin && (
            <button
              onClick={onRejoin}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <FaRedo className="w-3 h-3" />
              <span>Rejoin</span>
            </button>
          )}

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-300 dark:border-gray-700 cursor-pointer"
          >
            <FaHome className="w-3.5 h-3.5" />
            <span>Return to home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingEndedView;
