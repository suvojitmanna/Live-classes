import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaThumbtack,
  FaDesktop,
  FaHandPaper,
  FaExternalLinkAlt,
  FaCrown,
} from "react-icons/fa";
import Avatar from "../common/Avatar";

const VideoTile = ({
  stream,
  isLocal,
  userName,
  avatar,
  isHost,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isSpeaking,
  isPinned,
  onTogglePin,
  onFloatSelf,
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
        activeTrack.readyState === "live" && activeTrack.enabled,
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
    <div
      className={`relative w-full h-full min-h-[140px] bg-[#1a1c1e] dark:bg-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 group flex items-center justify-center select-none shadow-lg ${
        isSpeaking
          ? "border-[#1a73e8] dark:border-[#8ab4f8] ring-4 ring-[#1a73e8]/40 dark:ring-[#8ab4f8]/50 shadow-[0_0_25px_rgba(26,115,232,0.4)]"
          : "border-gray-800/80 dark:border-white/5"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLocal && !isScreenSharing ? "transform scale-x-[-1]" : ""
        } ${showAvatar ? "opacity-0 pointer-events-none absolute scale-95" : "opacity-100 scale-100"}`}
      />

      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-[#1e2023] to-[#141517] dark:from-[#202124] dark:to-[#17181a]">
          <div className={`relative flex items-center justify-center transition-all duration-300 ${isSpeaking ? "scale-105" : "scale-100"}`}>
            {isSpeaking && (
              <div className="absolute -inset-3 rounded-full bg-[#1a73e8]/25 dark:bg-[#8ab4f8]/25 animate-ping" />
            )}
            <div className={`rounded-full transition-all duration-300 ${isSpeaking ? "ring-4 ring-[#1a73e8] dark:ring-[#8ab4f8] shadow-[0_0_20px_rgba(26,115,232,0.5)]" : ""}`}>
              <Avatar name={userName} avatar={avatar} size="xl" />
            </div>
          </div>
        </div>
      )}

      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
        {isHost && (
          <div className="flex items-center gap-1 bg-amber-500/90 text-gray-950 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
            <FaCrown className="w-2.5 h-2.5" />
            <span>Host</span>
          </div>
        )}
        {isHandRaised && (
          <div className="flex items-center gap-1.5 bg-[#fbbc04] text-gray-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-bounce backdrop-blur-md">
            <FaHandPaper className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Raised hand</span>
          </div>
        )}
        {isScreenSharing && (
          <div className="flex items-center gap-1.5 bg-[#1a73e8] text-white text-xs px-2.5 py-1 rounded-lg shadow-md backdrop-blur-md">
            <FaDesktop className="w-3 h-3" />
            <span>Presenting</span>
          </div>
        )}
      </div>

      {/* Top Right Status (Muted/Speaking) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {isMuted ? (
          <div className="w-7 h-7 rounded-full bg-[#ea4335] text-white flex items-center justify-center shadow-md backdrop-blur-sm">
            <FaMicrophoneSlash className="w-3.5 h-3.5" />
          </div>
        ) : isSpeaking ? (
          <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md ring-2 ring-blue-300 dark:ring-blue-400">
            <FaMicrophone className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          </div>
        ) : null}
      </div>

      {/* Bottom Info Bar & Actions */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 dark:bg-[#1a1c1e]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md max-w-[75%] truncate">
          {isSpeaking && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
          <span className="text-xs font-medium text-white truncate">
            {userName} {isLocal ? "(You)" : ""}
          </span>
          {isHost && (
            <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
              Host
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200">
          {isLocal && onFloatSelf && (
            <button
              onClick={onFloatSelf}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 dark:bg-[#202124]/80 dark:hover:bg-[#3c4043] text-gray-200 hover:text-white shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
              title="Float self view"
              aria-label="Float self view"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
            </button>
          )}

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className={`p-2 rounded-full shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10 ${
                isPinned
                  ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "bg-black/60 hover:bg-black/90 dark:bg-[#202124]/80 dark:hover:bg-[#3c4043] text-gray-200 hover:text-white"
              }`}
              title={isPinned ? "Unpin video" : "Pin video"}
              aria-label={isPinned ? "Unpin video" : "Pin video"}
            >
              <FaThumbtack className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTile;
