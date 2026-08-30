import React, { useState } from "react";
import {
  FaTimes,
  FaCopy,
  FaCheck,
  FaInfoCircle,
  FaLink,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

const MeetingDetailsPanel = ({ roomId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const meetingUrl = `${window.location.origin}/join?roomId=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    toast.success("Joining info copied to clipboard 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaInfoCircle className="text-[#1a73e8] dark:text-[#8ab4f8]" />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            Meeting details
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Joining info
          </h3>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60 space-y-3">
            <div className="flex items-start gap-3">
              <FaLink className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8] mt-0.5 shrink-0" />
              <div className="break-all text-xs text-gray-800 dark:text-gray-300 font-mono select-all">
                {meetingUrl}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
              <span>Meeting code:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded select-all">
                {roomId}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#a8c7fa] text-white dark:text-[#202124] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          {copied ? (
            <FaCheck className="text-green-300 dark:text-green-700" />
          ) : (
            <FaCopy />
          )}
          {copied ? "Copied to clipboard" : "Copy joining info"}
        </button>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d]/50 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <FaShieldAlt className="w-3.5 h-3.5" />
            <span>Secure WebRTC Encryption</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Audio and video streams are transmitted directly between peers. Only
            participants with the meeting code can join.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default MeetingDetailsPanel;
