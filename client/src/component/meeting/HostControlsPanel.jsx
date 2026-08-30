import React, { useState } from "react";
import {
  FaTimes,
  FaLock,
  FaDesktop,
  FaComments,
  FaMicrophone,
  FaClock,
  FaBan,
} from "react-icons/fa";
import toast from "react-hot-toast";

const HostControlsPanel = ({ roomId, onSetLinkExpiration, onClose }) => {
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowMic, setAllowMic] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(null);

  const handleToggle = (setter, label) => {
    setter((prev) => {
      const next = !prev;
      toast.success(`${label} ${next ? "enabled" : "restricted"}`);
      return next;
    });
  };

  const handleApplyExpiration = (minutes) => {
    setSelectedDuration(minutes);
    onSetLinkExpiration?.(roomId, minutes);
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaLock className="text-[#1a73e8] dark:text-[#8ab4f8]" />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            Host controls
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close host controls"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Use these host settings to moderate the call and manage meeting link
          permissions.
        </p>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Meeting moderation
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <FaDesktop className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Share their screen
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow participants to present
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowScreenShare}
              onChange={() =>
                handleToggle(setAllowScreenShare, "Screen sharing")
              }
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <FaComments className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Send chat messages
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow in-call messaging
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowChat}
              onChange={() => handleToggle(setAllowChat, "In-call chat")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <FaMicrophone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Turn on their microphone
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow participants to unmute
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowMic}
              onChange={() => handleToggle(setAllowMic, "Microphone access")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FaClock className="text-[#1a73e8] dark:text-[#8ab4f8] w-3.5 h-3.5" />
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Link Expiration Limit
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Set when this meeting link becomes disabled and inaccessible to
            participants.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleApplyExpiration(0)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedDuration === 0
                  ? "bg-red-100 border-red-400 text-red-700 dark:bg-red-950 dark:border-red-500 dark:text-red-300 font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              <FaBan className="w-3 h-3 text-red-500 dark:text-red-400" />
              <span>Disable Now</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(15)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedDuration === 15
                  ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-[#004a77] dark:border-[#8ab4f8] dark:text-[#c2e7ff] font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              <span>15 Minutes</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(60)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedDuration === 60
                  ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-[#004a77] dark:border-[#8ab4f8] dark:text-[#c2e7ff] font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              <span>1 Hour</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(1440)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedDuration === 1440
                  ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-[#004a77] dark:border-[#8ab4f8] dark:text-[#c2e7ff] font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              <span>24 Hours</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default HostControlsPanel;
