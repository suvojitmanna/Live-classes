import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhoneSlash, FaVideo, FaMicrophone } from "react-icons/fa";
import Avatar from "../common/Avatar";
import { useDirectCall } from "../../context/DirectCallContext";

const OutgoingCallModal = () => {
  const { outgoingCall, cancelOutgoingCall } = useDirectCall();

  if (!outgoingCall) return null;

  const isVideo = outgoingCall.callType === "video";
  const receiver = outgoingCall.receiver || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#202124] border border-gray-200 dark:border-gray-700/80 rounded-3xl p-6 shadow-2xl text-center space-y-6 overflow-hidden"
        > 
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full border border-emerald-400/50 dark:border-emerald-400/40 animate-pulse" />
            <Avatar name={receiver.name || receiver.email} avatar={receiver.avatar} size="2xl" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {receiver.name || "Recipient"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {receiver.email || outgoingCall.targetEmail || ""}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
                {isVideo ? <FaVideo className="w-3 h-3" /> : <FaMicrophone className="w-3 h-3" />}
                <span>{outgoingCall.statusText || "Ringing..."}</span>
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col items-center gap-1.5">
            <button
              onClick={cancelOutgoingCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Cancel call"
              aria-label="Cancel call"
            >
              <FaPhoneSlash className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              Cancel
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OutgoingCallModal;
