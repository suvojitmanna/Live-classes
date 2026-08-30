import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaCog,
  FaSpinner,
  FaExclamationCircle,
  FaArrowLeft,
  FaMoon,
  FaSun,
  FaClock,
  FaCrown,
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const MeetingLobby = ({
  roomId,
  userName,
  setUserName,
  localStream,
  isAudioMuted,
  isVideoOff,
  isHost,
  knockStatus,
  onAskToJoin,
  onCancelKnock,
  toggleAudio,
  toggleVideo,
  onOpenSettings,
  onBackToDashboard,
  loading,
  error,
}) => {
  const videoRef = useRef(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (!localStream || isAudioMuted) {
      setAudioLevel(0);
      return;
    }

    let audioContext = null;
    let animFrame = null;

    try {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;

        const source = audioContext.createMediaStreamSource(localStream);
        source.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          analyser.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) sum += buffer[i];
          const avg = sum / buffer.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrame = requestAnimationFrame(checkAudio);
        };

        animFrame = requestAnimationFrame(checkAudio);
      }
    } catch (err) {
      console.warn("Lobby audio level error:", err);
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch(() => {});
      }
    };
  }, [localStream, isAudioMuted]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none transition-colors">
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Leave lobby</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FaSun className="w-4 h-4 text-amber-400" />
            ) : (
              <FaMoon className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <div className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#282a2d] px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2">
            {isHost && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <FaCrown className="w-2.5 h-2.5" /> Host
              </span>
            )}
            <span>
              Meeting code:{" "}
              <span className="font-bold text-gray-900 dark:text-gray-200">
                {roomId}
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-gray-900 dark:bg-[#282a2d] rounded-3xl overflow-hidden shadow-2xl border border-gray-300 dark:border-gray-700/80 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-200 ${
                isVideoOff ? "opacity-0" : "opacity-100"
              }`}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 dark:bg-[#282a2d]">
                <Avatar name={userName || "You"} size="xl" />
                <span className="mt-3 text-xs text-gray-400 font-medium">
                  Camera is off
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-gray-700/60 text-white">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isAudioMuted
                    ? "bg-red-500"
                    : audioLevel > 5
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                }`}
              />
              <span className="text-[10px] font-medium text-gray-200">
                {isAudioMuted
                  ? "Mic Off"
                  : audioLevel > 5
                    ? "Speaking"
                    : "Mic On"}
              </span>
            </div>

            <div className="absolute bottom-4 flex items-center gap-4 z-10">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  isAudioMuted
                    ? "bg-[#ea4335] text-white"
                    : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
                }`}
                title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isAudioMuted ? (
                  <FaMicrophoneSlash className="w-5 h-5" />
                ) : (
                  <FaMicrophone className="w-5 h-5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                  isVideoOff
                    ? "bg-[#ea4335] text-white"
                    : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
                }`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? (
                  <FaVideoSlash className="w-5 h-5" />
                ) : (
                  <FaVideo className="w-5 h-5" />
                )}
              </motion.button>

              {onOpenSettings && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenSettings}
                  className="w-12 h-12 rounded-full bg-[#3c4043] hover:bg-[#474a4d] text-white flex items-center justify-center transition-all shadow-lg cursor-pointer"
                  title="Audio & Video settings"
                >
                  <FaCog className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:pl-6 text-center lg:text-left">
          {knockStatus === "waiting" ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 shadow-xl space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-[#8ab4f8] flex items-center justify-center mx-auto">
                <FaSpinner className="animate-spin w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Asking to join...
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You'll join the call automatically when the host admits you.
                </p>
              </div>

              <button
                onClick={onCancelKnock}
                className="w-full py-2.5 px-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel request
              </button>
            </div>
          ) : knockStatus === "denied" ? (
            <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 shadow-xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <FaExclamationCircle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-300">
                  Entry Denied
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">
                  The meeting host denied your request to join this call.
                </p>
              </div>

              <button
                onClick={onBackToDashboard}
                className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : knockStatus === "expired" ? (
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <FaClock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">
                  Meeting Link Expired
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This meeting link has expired and is disabled by the host.
                </p>
              </div>

              <button
                onClick={onBackToDashboard}
                className="w-full py-2.5 px-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {isHost ? "Start as Host" : "Ready to join?"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {isHost
                    ? "You are the creator and host of this meeting."
                    : "Make sure your camera and mic are working before asking to join."}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                  <FaExclamationCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Your display name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700/80 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={onAskToJoin}
                  disabled={loading || !userName.trim()}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin w-4 h-4" />
                      <span>Connecting...</span>
                    </>
                  ) : isHost ? (
                    <span className="flex items-center gap-2">
                      <FaCrown className="text-amber-300" />
                      <span>Join now as Host</span>
                    </span>
                  ) : (
                    <span>Ask to join</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 max-w-6xl mx-auto w-full">
        🔒 End-to-end peer-to-peer WebRTC video stream
      </footer>
    </div>
  );
};

export default MeetingLobby;
