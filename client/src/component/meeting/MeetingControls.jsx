import React, { useState, useEffect, useRef } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash,
  FaComments,
  FaUsers,
  FaCog,
  FaHandPaper,
  FaSmile,
  FaEllipsisV,
  FaInfoCircle,
  FaExpand,
  FaCompress,
  FaThLarge,
  FaClosedCaptioning,
  FaMagic,
  FaShapes,
  FaKeyboard,
  FaLock,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import Tooltip from "../common/Tooltip";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["💖", "👍", "🎉", "👏", "😂", "😮", "🤔", "👎"];
const MeetingControls = ({
  roomId,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isCaptionsOn,
  activeSidebar,
  unreadChatCount,
  participantCount,
  layoutMode,
  isHost,
  roomPermissions = {
    allowMic: true,
    allowCamera: true,
    allowScreenShare: true,
    allowChat: true,
  },
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  toggleRaiseHand,
  toggleCaptions,
  onSendReaction,
  onChangeLayout,
  onToggleSidebar,
  onOpenSettings,
  onOpenVisualEffects,
  onOpenShortcuts,
  onLeaveMeeting,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { effectiveTheme, toggleTheme } = useTheme();

  const emojiPickerRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
        setShowLayoutMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
    setShowMoreMenu(false);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 dark:bg-[#202124]/95 text-gray-900 dark:text-white px-4 sm:px-6 flex items-center justify-between z-40 select-none border-t border-gray-200 dark:border-gray-800/80 backdrop-blur-md transition-colors">
      <div className="hidden md:flex items-center gap-3 w-1/4">
        <span className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-300 tracking-wider">
          {roomId}
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle Dark/Light theme"
        >
          {effectiveTheme === "dark" ? (
            <FaSun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <FaMoon className="w-3.5 h-3.5 text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 md:flex-initial">
        <Tooltip
          text={isAudioMuted ? "Turn on microphone" : "Turn off microphone"}
          shortcut="Ctrl+D"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudio}
            aria-label={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isAudioMuted
                ? "bg-[#ea4335] hover:bg-[#d93025] text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
              }`}
          >
            {isAudioMuted ? (
              <FaMicrophoneSlash className="w-5 h-5" />
            ) : (
              <FaMicrophone className="w-5 h-5" />
            )}
          </motion.button>
        </Tooltip>

        <Tooltip
          text={isVideoOff ? "Turn on camera" : "Turn off camera"}
          shortcut="Ctrl+E"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isVideoOff
                ? "bg-[#ea4335] hover:bg-[#d93025] text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
              }`}
          >
            {isVideoOff ? (
              <FaVideoSlash className="w-5 h-5" />
            ) : (
              <FaVideo className="w-5 h-5" />
            )}
          </motion.button>
        </Tooltip>

        <Tooltip
          text={isCaptionsOn ? "Turn off captions" : "Turn on captions (CC)"}
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCaptions}
            aria-label="Toggle captions"
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isCaptionsOn
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124] ring-2 ring-[#1a73e8] dark:ring-[#8ab4f8]"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
              }`}
          >
            <FaClosedCaptioning className="w-5 h-5" />
          </motion.button>
        </Tooltip>

        <Tooltip text={isHandRaised ? "Lower hand" : "Raise hand"}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRaiseHand}
            aria-label={isHandRaised ? "Lower hand" : "Raise hand"}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isHandRaised
                ? "bg-[#fbbc04] hover:bg-[#f29900] text-gray-950"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
              }`}
          >
            <FaHandPaper className="w-4 h-4" />
          </motion.button>
        </Tooltip>

        <div className="relative" ref={emojiPickerRef}>
          <Tooltip text="Send a reaction">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              aria-label="Send a reaction"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${showEmojiPicker
                  ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
                }`}
            >
              <FaSmile className="w-5 h-5" />
            </motion.button>
          </Tooltip>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 rounded-full px-3 py-2 flex items-center gap-1.5 shadow-2xl z-50 backdrop-blur-md"
              >
                {EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-full transition-transform cursor-pointer"
                    aria-label={`Reaction ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Tooltip text={isScreenSharing ? "Stop presenting" : "Present now"}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleScreenShare}
            aria-label={isScreenSharing ? "Stop presenting" : "Present now"}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isScreenSharing
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124] ring-2 ring-[#1a73e8] dark:ring-[#8ab4f8]"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
              }`}
          >
            <FaDesktop className="w-5 h-5" />
          </motion.button>
        </Tooltip>

        <div className="relative" ref={moreMenuRef}>
          <Tooltip text="More options">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMoreMenu((prev) => !prev)}
              aria-label="More options"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${showMoreMenu
                  ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-[#3c4043] dark:hover:bg-[#474a4d] dark:text-white"
                }`}
            >
              <FaEllipsisV className="w-4 h-4" />
            </motion.button>
          </Tooltip>

          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 rounded-2xl p-2 w-56 shadow-2xl z-50 text-xs text-gray-800 dark:text-gray-200"
              >
                {onOpenVisualEffects && (
                  <button
                    onClick={() => {
                      onOpenVisualEffects();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-left transition-colors cursor-pointer"
                  >
                    <FaMagic className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span>Apply visual effects</span>
                  </button>
                )}

                <button
                  onClick={() => setShowLayoutMenu((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FaThLarge className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Change layout</span>
                  </div>
                  <span className="text-[10px] uppercase text-blue-600 dark:text-[#8ab4f8] font-bold">
                    {layoutMode}
                  </span>
                </button>

                {showLayoutMenu && (
                  <div className="bg-gray-50 dark:bg-[#202124] rounded-xl p-1.5 my-1 space-y-1 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        onChangeLayout("auto");
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${layoutMode === "auto"
                          ? "bg-blue-100 dark:bg-[#8ab4f8]/20 text-blue-700 dark:text-[#8ab4f8] font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043]"
                        }`}
                    >
                      <span>Auto / Grid</span>
                      {layoutMode === "auto" && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => {
                        onChangeLayout("spotlight");
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${layoutMode === "spotlight"
                          ? "bg-blue-100 dark:bg-[#8ab4f8]/20 text-blue-700 dark:text-[#8ab4f8] font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043]"
                        }`}
                    >
                      <span>Spotlight</span>
                      {layoutMode === "spotlight" && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => {
                        onChangeLayout("sidebar");
                        setShowMoreMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${layoutMode === "sidebar"
                          ? "bg-blue-100 dark:bg-[#8ab4f8]/20 text-blue-700 dark:text-[#8ab4f8] font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043]"
                        }`}
                    >
                      <span>Sidebar</span>
                      {layoutMode === "sidebar" && <span>✓</span>}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleToggleFullscreen}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-left transition-colors cursor-pointer"
                >
                  {isFullscreen ? (
                    <FaCompress className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <FaExpand className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <span>
                    {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-left transition-colors cursor-pointer"
                >
                  <FaCog className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Settings</span>
                </button>

                {onOpenShortcuts && (
                  <button
                    onClick={() => {
                      onOpenShortcuts();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-left transition-colors cursor-pointer"
                  >
                    <FaKeyboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Keyboard shortcuts</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Tooltip text="Leave call">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeaveMeeting}
            aria-label="Leave call"
            className="w-14 sm:w-16 h-11 sm:h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <FaPhoneSlash className="w-5 h-5" />
          </motion.button>
        </Tooltip>
      </div>

      <div className="flex items-center justify-end gap-1 sm:gap-2 w-auto md:w-1/4">
        <Tooltip text="Meeting details">
          <button
            onClick={() => onToggleSidebar("details")}
            aria-label="Meeting details"
            className={`p-3 rounded-full transition-colors cursor-pointer ${activeSidebar === "details"
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                : "hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <FaInfoCircle className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="People">
          <button
            onClick={() => onToggleSidebar("participants")}
            aria-label="People"
            className={`relative p-3 rounded-full transition-colors cursor-pointer ${activeSidebar === "participants"
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                : "hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <FaUsers className="w-5 h-5" />
            {participantCount > 0 && (
              <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-[#3c4043] text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                {participantCount}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip text="Chat with everyone">
          <button
            onClick={() => onToggleSidebar("chat")}
            aria-label="Chat with everyone"
            className={`relative p-3 rounded-full transition-colors cursor-pointer ${activeSidebar === "chat"
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                : "hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <FaComments className="w-5 h-5" />
            {unreadChatCount > 0 && activeSidebar !== "chat" && (
              <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#1a73e8] text-white animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip text="Activities">
          <button
            onClick={() => onToggleSidebar("activities")}
            aria-label="Activities"
            className={`p-3 rounded-full transition-colors cursor-pointer ${activeSidebar === "activities"
                ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                : "hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <FaShapes className="w-5 h-5" />
          </button>
        </Tooltip>

        {isHost && (
          <Tooltip text="Host controls">
            <button
              onClick={() => onToggleSidebar("host")}
              aria-label="Host controls"
              className={`p-3 rounded-full transition-colors cursor-pointer ${activeSidebar === "host"
                  ? "bg-[#c2e7ff] text-[#001d35] dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <FaLock className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </footer>
  );
};

export default MeetingControls;
