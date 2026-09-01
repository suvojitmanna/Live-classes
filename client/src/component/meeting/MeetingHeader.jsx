import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaInfoCircle, FaVideo, FaCopy, FaCheck, FaExpand, FaCompress } from "react-icons/fa";
import Tooltip from "../common/Tooltip";
import toast from "react-hot-toast";

const MeetingHeader = ({
  roomId,
  title = "Live Class Meeting",
  isConnected = true,
  onOpenDetails,
}) => {
  const [time, setTime] = useState("");
  const [isIdle, setIsIdle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Exit fullscreen error:", err);
        });
      }
    }
  };

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

  const handleCopyLink = () => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 px-4 sm:px-6 flex items-center justify-between z-30 transition-all duration-300 pointer-events-auto bg-white/90 dark:bg-[#1a1c1e]/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/5 shadow-sm ${isIdle ? "opacity-0 -translate-y-2 pointer-events-none hover:opacity-100 hover:translate-y-0 hover:pointer-events-auto" : "opacity-100 translate-y-0"
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FaVideo className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
              {roomId}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1 text-gray-400 hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors rounded hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              title="Copy meeting link"
              aria-label="Copy meeting link"
            >
              {copied ? <FaCheck className="w-3 h-3 text-emerald-500" /> : <FaCopy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Tooltip text="Direct WebRTC Peer-to-Peer Encrypted">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs shadow-sm">
            <FaShieldAlt className="text-emerald-500 dark:text-emerald-400 w-3 h-3" />
            <span className="font-medium">Encrypted</span>
          </div>
        </Tooltip>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${isConnected
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 animate-pulse"
            }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isConnected
              ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
              : "bg-amber-500 dark:bg-amber-400"
              }`}
          />
          <span className="hidden sm:inline">
            {isConnected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        <span className="text-xs sm:text-sm font-medium font-mono text-gray-700 dark:text-gray-300 px-1 sm:px-2">
          {time}
        </span>

        <Tooltip text={isFullscreen ? "Exit Full Screen" : "Full Screen"}>
          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all shadow-sm cursor-pointer"
            aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullscreen ? <FaCompress className="w-4 h-4 text-blue-500 dark:text-blue-400" /> : <FaExpand className="w-4 h-4" />}
          </button>
        </Tooltip>

        {onOpenDetails && (
          <Tooltip text="Meeting Details">
            <button
              onClick={onOpenDetails}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all shadow-sm cursor-pointer"
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
