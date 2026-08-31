import React, { useState } from "react";
import {
  FaTimes,
  FaLock,
  FaDesktop,
  FaComments,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaClock,
  FaBan,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

const HostControlsPanel = ({
  roomId,
  roomPermissions = {
    allowMic: true,
    allowCamera: true,
    allowScreenShare: true,
    allowChat: true,
  },
  onUpdatePermissions,
  onMuteAll,
  onStopAllVideo,
  onSetLinkExpiration,
  onClose,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(null);

  const handleToggle = (key, label) => {
    const nextVal = !roomPermissions[key];
    const updated = { ...roomPermissions, [key]: nextVal };
    onUpdatePermissions?.(updated);
    toast.success(`${label} ${nextVal ? "enabled" : "restricted for participants"}`);
  };

  const handleApplyExpiration = (minutes) => {
    setSelectedDuration(minutes);
    onSetLinkExpiration?.(roomId, minutes);
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-[#1a73e8] dark:text-[#8ab4f8] w-4 h-4" />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            Host Controls & Moderation
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
        {/* Quick Batch Actions */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Quick Actions (All Participants)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onMuteAll}
              className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FaMicrophoneSlash className="w-3.5 h-3.5 text-red-500" />
              <span>Mute Everyone</span>
            </button>

            <button
              onClick={onStopAllVideo}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FaVideoSlash className="w-3.5 h-3.5 text-amber-500" />
              <span>Turn Off All Video</span>
            </button>
          </div>
        </div>

        {/* Global Permissions */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Participant Permissions
            </h3>
            <span className="text-[10px] text-gray-400">Apply to all</span>
          </div>

          {/* Microphones */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#1a73e8] dark:text-[#8ab4f8]">
                <FaMicrophone className="w-3.5 h-3.5" />
              </div>
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
              checked={roomPermissions.allowMic !== false}
              onChange={() => handleToggle("allowMic", "Microphone access")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>

          {/* Cameras / Video */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                <FaVideo className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Turn on their camera
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow participants to start video
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={roomPermissions.allowCamera !== false}
              onChange={() => handleToggle("allowCamera", "Camera access")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>

          {/* Screen Share */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <FaDesktop className="w-3.5 h-3.5" />
              </div>
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
              checked={roomPermissions.allowScreenShare !== false}
              onChange={() => handleToggle("allowScreenShare", "Screen sharing")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>

          {/* Chat Messages */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <FaComments className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-200">
                  Send in-call chat messages
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Allow in-meeting messaging
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={roomPermissions.allowChat !== false}
              onChange={() => handleToggle("allowChat", "In-call chat")}
              className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Link Expiration Limit */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FaClock className="text-[#1a73e8] dark:text-[#8ab4f8] w-3.5 h-3.5" />
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Meeting Link Expiration
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Disable or set an auto-expiry countdown on this meeting link.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleApplyExpiration(0)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedDuration === 0
                  ? "bg-red-100 border-red-400 text-red-700 dark:bg-red-950 dark:border-red-500 dark:text-red-300 font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
                }`}
            >
              <FaBan className="w-3 h-3 text-red-500 dark:text-red-400" />
              <span>Disable Now</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(15)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedDuration === 15
                  ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-[#004a77] dark:border-[#8ab4f8] dark:text-[#c2e7ff] font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
                }`}
            >
              <span>15 Minutes</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(60)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedDuration === 60
                  ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-[#004a77] dark:border-[#8ab4f8] dark:text-[#c2e7ff] font-bold"
                  : "bg-gray-50 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300"
                }`}
            >
              <span>1 Hour</span>
            </button>

            <button
              onClick={() => handleApplyExpiration(1440)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedDuration === 1440
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
