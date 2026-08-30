import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
      className={`fixed bottom-24 right-6 w-52 sm:w-60 h-32 sm:h-36 bg-gray-900 dark:bg-[#282a2d] rounded-2xl overflow-hidden shadow-2xl border transition-all z-40 cursor-grab active:cursor-grabbing select-none ${
        isSpeaking
          ? "border-[#1a73e8] dark:border-[#8ab4f8] ring-2 ring-[#1a73e8] dark:ring-[#8ab4f8]"
          : "border-gray-300 dark:border-gray-700/80"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform scale-x-[-1] ${
          isVideoOff ? "opacity-0" : "opacity-100"
        }`}
      />

      {isVideoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 dark:bg-[#202124]">
          <Avatar name={userName} avatar={avatar} size="md" />
        </div>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        {onDock && (
          <button
            onClick={onDock}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            title="Dock to grid"
          >
            <FaCompressAlt className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-medium text-white max-w-[85%] truncate">
        {isMuted ? (
          <FaMicrophoneSlash className="w-2.5 h-2.5 text-red-400" />
        ) : (
          <FaMicrophone className="w-2.5 h-2.5 text-green-400" />
        )}
        <span className="truncate">{userName} (You)</span>
      </div>
    </motion.div>
  );
};

export default FloatingSelfView;
