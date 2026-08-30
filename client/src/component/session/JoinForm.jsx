import React from "react";
import {
  FaArrowRight,
  FaExclamationCircle,
  FaKeyboard,
  FaInfoCircle,
  FaSpinner,
  FaVideo,
} from "react-icons/fa";
import { APP_CONFIG } from "../../utils/constants";
import { motion } from "framer-motion";

const JoinForm = ({ roomId, error, loading, onChange, onSubmit }) => {
  return (
    <motion.div
      className="max-w-xl mx-auto bg-white dark:bg-[#282a2d] rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-4 text-white">
          <FaVideo className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {APP_CONFIG.SESSION_CONTENT.JOIN_FORM.HEADING}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {APP_CONFIG.SESSION_CONTENT.JOIN_FORM.DESCRIPTION}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-xs flex items-center">
          <FaExclamationCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="roomId"
            className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
          >
            {APP_CONFIG.SESSION_CONTENT.JOIN_FORM.ROOM_ID_LABEL}
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaKeyboard className="h-5 w-5" />
            </div>

            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={onChange}
              placeholder="e.g. abc-defg-hij"
              className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#202124] border-2 border-gray-300 dark:border-gray-700 rounded-2xl focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] text-center text-lg font-mono tracking-wider text-gray-900 dark:text-white transition-all shadow-sm"
            />
          </div>

          <p className="mt-2.5 text-xs text-gray-500 dark:text-gray-400 text-center">
            <FaInfoCircle className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            Enter the 10-character meeting code or paste full URL
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !roomId.trim()}
          className="w-full flex justify-center items-center py-3.5 px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full shadow-lg text-sm font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01]"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2 h-4 w-4 text-white" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Join Meeting</span>
              <FaArrowRight className="w-3.5 h-3.5 ml-2" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default JoinForm;
