import React, { useRef, useEffect, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaCompressAlt } from "react-icons/fa";
import Avatar from "../common/Avatar";
import { motion } from "framer-motion";

const FloatingSelfView = ({
  stream,
  userName = "You",
  avatar,
  isMuted,
  isVideoOff,
  isSpeaking,
  onDock,
}) => {
  const videoRef = useRef(null);
  const [hasValidVideo, setHasValidVideo] = useState(false);

  useEffect(() => {
    if (!stream || isVideoOff) {
      setHasValidVideo(false);
      return;
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      setHasValidVideo(false);
      return;
    }

    const activeTrack = videoTracks[0];
    const checkTrackState = () => {
      setHasValidVideo(
        activeTrack.readyState === "live" && activeTrack.enabled
      );
    };

    checkTrackState();

    activeTrack.addEventListener("ended", checkTrackState);
    activeTrack.addEventListener("mute", checkTrackState);
    activeTrack.addEventListener("unmute", checkTrackState);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    return () => {
      activeTrack.removeEventListener("ended", checkTrackState);
      activeTrack.removeEventListener("mute", checkTrackState);
      activeTrack.removeEventListener("unmute", checkTrackState);
    };
  }, [stream, isVideoOff]);

  const showAvatar = isVideoOff || !hasValidVideo;

  return (
    <motion.div
      drag
      dragConstraints={{
        top: 70,
        left: 10,
        right: window.innerWidth - 240,
        bottom: window.innerHeight - 200,
      }}
      whileHover={{ scale: 1.02 }}
      className={`fixed bottom-24 right-6 w-52 sm:w-60 h-32 sm:h-36 bg-[#1a1c1e] dark:bg-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border transition-all z-40 cursor-grab active:cursor-grabbing select-none ${
        isSpeaking
          ? "border-[#1a73e8] dark:border-[#8ab4f8] ring-4 ring-[#1a73e8]/40 dark:ring-[#8ab4f8]/50 shadow-[0_0_20px_rgba(26,115,232,0.4)]"
          : "border-white/15 dark:border-white/10"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${
          showAvatar ? "opacity-0 pointer-events-none absolute" : "opacity-100"
        }`}
      />

      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-[#1e2023] to-[#141517] dark:from-[#202124] dark:to-[#17181a]">
          <div className={`relative flex items-center justify-center transition-all duration-300 ${isSpeaking ? "scale-105" : "scale-100"}`}>
            {isSpeaking && (
              <div className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
            )}
            <div className={`rounded-full transition-all duration-300 ${isSpeaking ? "ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : ""}`}>
              <Avatar name={userName} avatar={avatar} size="md" />
            </div>
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5 font-medium">Camera off</span>
        </div>
      )}

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
        {onDock && (
          <button
            onClick={onDock}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
            title="Dock to grid"
          >
            <FaCompressAlt className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 dark:bg-[#1a1c1e]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium text-white max-w-[85%] truncate border border-white/10 shadow-sm">
        {isMuted ? (
          <FaMicrophoneSlash className="w-2.5 h-2.5 text-red-400 shrink-0" />
        ) : (
          <FaMicrophone className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
        )}
        <span className="truncate">{userName} (You)</span>
      </div>
    </motion.div>
  );
};

export default FloatingSelfView;
