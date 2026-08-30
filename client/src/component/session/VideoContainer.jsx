import React from "react";
import {
  FaExclamationCircle,
  FaExpand,
  FaSpinner,
  FaVideo,
} from "react-icons/fa";
import { APP_CONFIG } from "../../utils/constants";
import { motion } from "framer-motion";

const VideoContainer = ({
  containerRef,
  isJoined,
  userHasJoined,
  error,
  loading,
  onFullscreen,
  onLeave,
  leaveButtonText,
}) => {
  const container = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border p-6 border-gray-100"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {///Header */}
      <motion.div
        className="flex items-center justify-between mb-4"
        variants={item}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FaVideo className="w-5 h-5 mr-2 text-blue-600" />
          {APP_CONFIG.SESSION_CONTENT.VIDEO.TITLE}
        </h2>

        <div className="flex items-center space-x-3">
          {isJoined && (
            <span className="flex items-center text-sm text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              {APP_CONFIG.SESSION_CONTENT.VIDEO.CONNECTED}
            </span>
          )}

          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaExpand className="inline-block mr-1" />
              {APP_CONFIG.SESSION_CONTENT.VIDEO.FULLSCREEN}
            </button>
          )}
        </div>
      </motion.div>

      {///Error */}
      {error && (
        <motion.div
          variants={item}
          className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
        >
          <div className="flex items-center">
            <FaExclamationCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </motion.div>
      )}

      {///Video Area */}
      <motion.div
        variants={item}
        ref={containerRef}
        className="w-full h-[calc(100vh-220px)] rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-200 shadow-inner flex items-center justify-center text-white"
      />

      {///Loading */}
      {loading && (
        <motion.div variants={item} className="mt-4 text-center">
          <div className="inline-flex items-center text-gray-600">
            <FaSpinner className="animate-spin h-5 w-5 mr-2" />
            {APP_CONFIG.SESSION_CONTENT.VIDEO.CONNECTING}
          </div>
        </motion.div>
      )}

      {///Leave Button */}
      {onLeave && (
        <motion.div variants={item} className="mt-6 flex justify-center">
          <button
            onClick={onLeave}
            className="px-8 py-3 font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 shadow-md transition-all transform hover:scale-105 cursor-pointer"
          >
            {leaveButtonText || APP_CONFIG.SESSION_CONTENT.VIDEO.LEAVE_BUTTON}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VideoContainer;
