import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash,
  FaShieldAlt,
  FaExpand,
  FaCompress,
  FaMagic,
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import VisualEffectsModal from "../meeting/VisualEffectsModal";
import { useDirectCall } from "../../context/DirectCallContext";
import { useAuth } from "../../context/AuthContext";

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
    visualEffect,
    applyVisualEffect,
  } = useDirectCall();

  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [hasValidLocalVideo, setHasValidLocalVideo] = useState(false);
  const [hasValidRemoteVideo, setHasValidRemoteVideo] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [remotePlaying, setRemotePlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisualEffectsOpen, setIsVisualEffectsOpen] = useState(false);

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
        console.warn("Error entering full screen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Error exiting full screen:", err);
        });
      }
    }
  };

  useEffect(() => {
    if (!localStream || isVideoOff) {
      setHasValidLocalVideo(false);
      setLocalPlaying(false);
      return;
    }

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      setHasValidLocalVideo(false);
      setLocalPlaying(false);
      return;
    }

    const activeTrack = videoTracks[0];
    const checkTrackState = () => {
      const isValid = activeTrack.readyState === "live" && activeTrack.enabled;
      setHasValidLocalVideo(isValid);
      if (!isValid) setLocalPlaying(false);
    };

    checkTrackState();

    activeTrack.addEventListener("ended", checkTrackState);
    activeTrack.addEventListener("mute", checkTrackState);
    activeTrack.addEventListener("unmute", checkTrackState);

    if (localVideoRef.current) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      localVideoRef.current.play().catch(() => { });
    }

    return () => {
      activeTrack.removeEventListener("ended", checkTrackState);
      activeTrack.removeEventListener("mute", checkTrackState);
      activeTrack.removeEventListener("unmute", checkTrackState);
    };
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (!remoteStream) {
      setHasValidRemoteVideo(false);
      setRemotePlaying(false);
      return;
    }

    const videoTracks = remoteStream.getVideoTracks();
    if (videoTracks.length === 0) {
      setHasValidRemoteVideo(false);
      setRemotePlaying(false);
      return;
    }

    const activeTrack = videoTracks[0];
    const checkTrackState = () => {
      const isValid = activeTrack.readyState === "live" && activeTrack.enabled;
      setHasValidRemoteVideo(isValid);
      if (!isValid) setRemotePlaying(false);
    };

    checkTrackState();

    activeTrack.addEventListener("ended", checkTrackState);
    activeTrack.addEventListener("mute", checkTrackState);
    activeTrack.addEventListener("unmute", checkTrackState);

    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      remoteVideoRef.current.play().catch(() => { });
    }

    return () => {
      activeTrack.removeEventListener("ended", checkTrackState);
      activeTrack.removeEventListener("mute", checkTrackState);
      activeTrack.removeEventListener("unmute", checkTrackState);
    };
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

  const showRemoteVideo = remotePlaying && hasValidRemoteVideo;
  const showLocalVideo = localPlaying && hasValidLocalVideo && !isVideoOff;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#121316] text-white select-none overflow-hidden font-sans">
        <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 sm:px-6 flex items-center justify-between z-30 pointer-events-auto">
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

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-emerald-400 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{formatDuration(callDuration)}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <FaShieldAlt className="w-3 h-3 text-emerald-400" />
              <span>Encrypted</span>
            </div>

            <button
              onClick={handleToggleFullscreen}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md flex items-center justify-center"
              title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
              aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullscreen ? (
                <FaCompress className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <FaExpand className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 w-full h-full relative flex items-center justify-center p-2 sm:p-6 pb-24 sm:pb-28">
          {isVideo ? (
            <div className="w-full h-full max-w-6xl max-h-[82vh] relative rounded-3xl overflow-hidden bg-[#1a1c1e] border border-white/10 shadow-2xl flex items-center justify-center">
              <video
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream) {
                    if (el.srcObject !== remoteStream) {
                      el.srcObject = remoteStream;
                    }
                    el.play().catch(() => { });
                  }
                }}
                autoPlay
                playsInline
                onLoadedData={() => setRemotePlaying(true)}
                onPlaying={() => setRemotePlaying(true)}
                onPause={() => setRemotePlaying(false)}
                onEnded={() => setRemotePlaying(false)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${showRemoteVideo ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                  }`}
              />

              {!showRemoteVideo && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div
                    className={`relative p-2 rounded-full transition-all duration-300 ${isPeerSpeaking ? "ring-4 ring-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.4)]" : ""
                      }`}
                  >
                    {isPeerSpeaking && (
                      <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping" />
                    )}
                    <Avatar name={peer.name || "Peer"} avatar={peer.avatar} size="2xl" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{peer.name || "Peer"}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{peer.email}</div>
                  </div>
                </div>
              )}

              <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                className="absolute bottom-6 right-6 w-36 sm:w-56 aspect-video bg-[#1a1c1e] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 cursor-grab active:cursor-grabbing group select-none"
              >
                <video
                  ref={(el) => {
                    localVideoRef.current = el;
                    if (el && localStream && !isVideoOff) {
                      if (el.srcObject !== localStream) {
                        el.srcObject = localStream;
                      }
                      el.play().catch(() => { });
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={() => setLocalPlaying(true)}
                  onPlaying={() => setLocalPlaying(true)}
                  onPause={() => setLocalPlaying(false)}
                  onEnded={() => setLocalPlaying(false)}
                  className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${showLocalVideo ? "opacity-100" : "opacity-0 pointer-events-none absolute"
                    }`}
                />

                {!showLocalVideo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-[#1e2023] to-[#141517] dark:from-[#202124] dark:to-[#17181a]">
                    <div className={`relative flex items-center justify-center transition-all duration-300 ${isLocalSpeaking ? "scale-105" : "scale-100"}`}>
                      {isLocalSpeaking && (
                        <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                      )}
                      <div className={`rounded-full transition-all duration-300 ${isLocalSpeaking ? "ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : ""}`}>
                        <Avatar name={user?.name || "You"} avatar={user?.avatar} size="md" />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5 font-medium">
                      {isVideoOff ? "Camera off" : "Camera starting..."}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white/90 border border-white/10 flex items-center gap-1.5 shadow-sm">
                  {isAudioMuted ? (
                    <FaMicrophoneSlash className="w-2.5 h-2.5 text-red-400" />
                  ) : (
                    <FaMicrophone className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                  <span>You</span>
                  {isLocalSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-[#1a1c1e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-8 backdrop-blur-2xl relative">
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

              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {peer.name || "Direct Voice Call"}
                </h3>
                <p className="text-xs text-gray-400 font-mono">{peer.email || ""}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/60 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Voice connected • {formatDuration(callDuration)}</span>
                  </span>
                </div>
              </div>

              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            </div>
          )}
        </main>

        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 dark:bg-black/60 backdrop-blur-2xl border border-white/15 px-6 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleAudio}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${isAudioMuted
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/25"
                : "bg-white/15 hover:bg-white/25 text-white"
                }`}
              title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isAudioMuted ? <FaMicrophoneSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleVideo}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${isVideoOff
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/25"
                : isVideo
                  ? "bg-white/15 hover:bg-white/25 text-white"
                  : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                }`}
              title={isVideoOff ? "Turn on camera" : isVideo ? "Turn off camera" : "Switch to video"}
            >
              {isVideoOff ? <FaVideoSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaVideo className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>

            {isVideo && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleScreenShare}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${isScreenSharing
                  ? "bg-[#1a73e8] text-white ring-2 ring-blue-400"
                  : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              >
                <FaDesktop className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}

            {isVideo && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsVisualEffectsOpen(true)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${visualEffect !== "none"
                  ? "bg-[#1a73e8] text-white ring-2 ring-blue-400"
                  : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                title="Background Effects & Blur"
                aria-label="Background Effects"
              >
                <FaMagic className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleFullscreen}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${isFullscreen
                ? "bg-[#1a73e8] text-white ring-2 ring-blue-400"
                : "bg-white/15 hover:bg-white/25 text-white"
                }`}
              title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
              aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullscreen ? (
                <FaCompress className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FaExpand className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={endActiveCall}
              className="w-13 sm:w-16 h-11 sm:h-12 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
              title="End call"
              aria-label="End call"
            >
              <FaPhoneSlash className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </footer>

        {/* Background Visual Effects Modal */}
        <VisualEffectsModal
          isOpen={isVisualEffectsOpen}
          onClose={() => setIsVisualEffectsOpen(false)}
          selectedEffect={visualEffect}
          onSelectEffect={applyVisualEffect}
          localStream={localStream}
        />
      </div>
    </AnimatePresence>
  );
};

export default DirectCallView;
