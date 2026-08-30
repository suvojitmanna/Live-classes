import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaInfoCircle, FaVideo } from "react-icons/fa";
import Tooltip from "../common/Tooltip";

const MeetingHeader = ({
  roomId,
  title = "Live Class Meeting",
  isConnected = true,
  onOpenDetails,
}) => {
  const [time, setTime] = useState("");
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout = null;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsIdle(true);
      }, 4000);
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    timeout = setTimeout(() => setIsIdle(true), 4000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 px-4 sm:px-6 flex items-center justify-between z-30 transition-opacity duration-300 pointer-events-auto bg-white/90 dark:bg-[#202124]/90 backdrop-blur-md border-b border-gray-200 dark:border-transparent ${
        isIdle ? "opacity-0 hover:opacity-100" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <FaVideo className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {roomId}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip text="Direct WebRTC Peer-to-Peer Encrypted">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#282a2d]/80 border border-gray-300 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 text-xs shadow-sm">
            <FaShieldAlt className="text-emerald-500 dark:text-emerald-400 w-3 h-3" />
            <span className="font-medium">Encrypted</span>
          </div>
        </Tooltip>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isConnected
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 animate-pulse"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                : "bg-amber-500 dark:bg-amber-400"
            }`}
          />
          <span className="hidden sm:inline">
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 px-2">
          {time}
        </span>

        {onOpenDetails && (
          <Tooltip text="Meeting Details">
            <button
              onClick={onOpenDetails}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#282a2d]/80 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700/60 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Meeting Details"
            >
              <FaInfoCircle className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default MeetingHeader;
