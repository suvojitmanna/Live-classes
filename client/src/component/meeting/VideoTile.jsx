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
      className={`relative w-full h-full min-h-[140px] bg-gray-900 dark:bg-[#2d2e30] rounded-2xl overflow-hidden border transition-all duration-200 group flex items-center justify-center select-none shadow-md ${
        isSpeaking
          ? "border-[#1a73e8] dark:border-[#8ab4f8] ring-3 ring-[#1a73e8]/40 dark:ring-[#8ab4f8]/60 shadow-[0_0_20px_rgba(26,115,232,0.3)]"
          : "border-gray-300 dark:border-gray-800"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLocal && !isScreenSharing ? "transform scale-x-[-1]" : ""
        } ${showAvatar ? "opacity-0 pointer-events-none absolute" : "opacity-100"}`}
      />

      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 dark:bg-[#202124]">
          <Avatar name={userName} avatar={avatar} size="xl" />
        </div>
      )}

      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
        {isHost && (
          <div className="flex items-center gap-1 bg-amber-500/90 text-gray-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
            <FaCrown className="w-2.5 h-2.5" />
            <span>Host</span>
          </div>
        )}
        {isHandRaised && (
          <div className="flex items-center gap-1.5 bg-[#fbbc04] text-gray-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-bounce">
            <FaHandPaper className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Raised hand</span>
          </div>
        )}
        {isScreenSharing && (
          <div className="flex items-center gap-1.5 bg-[#1a73e8] text-white text-xs px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
            <FaDesktop className="w-3 h-3" />
            <span>Presenting</span>
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {isMuted ? (
          <div className="w-7 h-7 rounded-full bg-[#ea4335] text-white flex items-center justify-center shadow-md">
            <FaMicrophoneSlash className="w-3.5 h-3.5" />
          </div>
        ) : isSpeaking ? (
          <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md ring-2 ring-blue-300">
            <FaMicrophone className="w-3.5 h-3.5 text-green-300 animate-pulse" />
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 dark:bg-[#202124]/90 backdrop-blur-md px-3 py-1 rounded-md border border-gray-700/50 shadow-sm max-w-[75%] truncate">
          <span className="text-xs font-medium text-white truncate">
            {userName} {isLocal ? "(You)" : ""}
          </span>
          {isHost && (
            <span className="text-[9px] uppercase font-bold text-amber-400">
              Host
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
          {isLocal && onFloatSelf && (
            <button
              onClick={onFloatSelf}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 dark:bg-[#202124]/80 dark:hover:bg-[#3c4043] text-gray-200 hover:text-white shadow-md transition-colors cursor-pointer"
              title="Float self view"
              aria-label="Float self view"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
            </button>
          )}

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className={`p-2 rounded-full shadow-md transition-all cursor-pointer ${
                isPinned
                  ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]"
                  : "bg-black/60 hover:bg-black/80 dark:bg-[#202124]/80 dark:hover:bg-[#3c4043] text-gray-200 hover:text-white"
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
