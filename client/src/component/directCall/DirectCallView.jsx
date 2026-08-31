import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash,
  FaShieldAlt,
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import { useDirectCall } from "../../context/DirectCallContext";

const DirectCallView = () => {
  const {
    callState,
    activeCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isPeerSpeaking,
    isLocalSpeaking,
    callDuration,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    endActiveCall,
  } = useDirectCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState !== "connected" && callState !== "connecting") {
    return null;
  }

  const isVideo = activeCall?.callType === "video";
  const peer = activeCall?.peer || {};

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().some((t) => t.enabled && t.readyState === "live");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 text-white select-none overflow-hidden font-sans">
        {/* Top Header Bar */}
        <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent px-4 sm:px-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <Avatar name={peer.name || "Peer"} avatar={peer.avatar} size="sm" />
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {peer.name || "Direct Call"}
              </h3>
              <div className="text-[11px] text-gray-400 font-mono truncate">
                {peer.email || ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Call Duration Timer */}
            <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatDuration(callDuration)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <FaShieldAlt className="w-3 h-3 text-emerald-400" />
              <span>Encrypted</span>
            </div>
          </div>
        </header>

        {/* Main Calling Canvas */}
        <main className="flex-1 w-full h-full relative flex items-center justify-center p-2 sm:p-4">
          {isVideo ? (
            /* ======================================================== */
            /* Video Call Screen (Google Meet style 1-on-1 UI)          */
            /* ======================================================== */
            <div className="w-full h-full max-w-6xl max-h-[85vh] relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl flex items-center justify-center">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  hasRemoteVideo ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                }`}
              />

              {/* Remote Avatar Fallback if Video Off */}
              {!hasRemoteVideo && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`relative p-2 rounded-full transition-all duration-300 ${
                    isPeerSpeaking ? "ring-4 ring-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : ""
                  }`}>
                    <Avatar name={peer.name || "Peer"} avatar={peer.avatar} size="2xl" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{peer.name || "Peer"}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{peer.email}</div>
                  </div>
                </div>
              )}

              {/* Floating Self-View Picture-in-Picture Tile */}
              <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                className="absolute bottom-6 right-6 w-36 sm:w-52 aspect-video bg-gray-900/90 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 cursor-grab active:cursor-grabbing group"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform scale-x-[-1] ${
                    isVideoOff ? "hidden" : "block"
                  }`}
                />

                {isVideoOff && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                    <Avatar name="You" size="sm" />
                    <span className="text-[10px] text-gray-400 mt-1">Camera off</span>
                  </div>
                )}

                <div className="absolute bottom-1.5 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-medium text-white/90">
                  You {isLocalSpeaking ? "🎙️" : ""}
                </div>
              </motion.div>
            </div>
          ) : (
            /* ======================================================== */
            /* Voice Call Screen (Modern Audio-Only Interface)         */
            /* ======================================================== */
            <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-8 backdrop-blur-xl relative">
              {/* Audio Visualizer Background Waves */}
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                {isPeerSpeaking && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <span className="absolute -inset-4 rounded-full border border-emerald-400/40 animate-pulse" />
                    <span className="absolute -inset-8 rounded-full border border-emerald-400/20 animate-pulse" />
                  </>
                )}
                <Avatar name={peer.name || "Peer"} avatar={peer.avatar} size="2xl" />
              </div>

              {/* Peer Details */}
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {peer.name || "Direct Voice Call"}
                </h3>
                <p className="text-xs text-gray-400 font-mono">{peer.email || ""}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Voice connected • {formatDuration(callDuration)}</span>
                  </span>
                </div>
              </div>

              {/* Hidden audio element for remote stream */}
              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            </div>
          )}
        </main>

        {/* Bottom Floating Call Controls Pill */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 sm:gap-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-2xl">
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isAudioMuted
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
              title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isAudioMuted ? <FaMicrophoneSlash className="w-4 h-4" /> : <FaMicrophone className="w-4 h-4" />}
            </button>

            {/* Camera Toggle (Video call or upgrade) */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isVideo
                  ? "bg-white/15 hover:bg-white/25 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              title={isVideoOff ? "Turn on camera" : isVideo ? "Turn off camera" : "Switch to video"}
            >
              {isVideoOff ? <FaVideoSlash className="w-4 h-4" /> : <FaVideo className="w-4 h-4" />}
            </button>

            {/* Screen Share (Video only) */}
            {isVideo && (
              <button
                onClick={toggleScreenShare}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isScreenSharing
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              >
                <FaDesktop className="w-4 h-4" />
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={endActiveCall}
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="End call"
              aria-label="End call"
            >
              <FaPhoneSlash className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
};

export default DirectCallView;
