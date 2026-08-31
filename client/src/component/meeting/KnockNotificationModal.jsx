import React from "react";
import { FaUserClock, FaCheck, FaTimes, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../common/Avatar";

const KnockNotificationModal = ({
  pendingKnocks = [],
  onAdmit,
  onDeny,
  onOpenParticipants,
}) => {
  if (!pendingKnocks || pendingKnocks.length === 0) return null;

  const count = pendingKnocks.length;
  const firstKnock = pendingKnocks[0];

  return (
    <div className="fixed top-20 left-4 sm:left-6 z-50 max-w-sm w-full pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={firstKnock?.socketId || "knock-modal"}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-[#202124] text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-800/80 p-4 space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#1a73e8] dark:text-[#8ab4f8]">
                <FaUserClock className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {count === 1
                  ? "Someone wants to join this call"
                  : `${count} people want to join this call`}
              </h4>
            </div>

            {count > 1 && (
              <button
                onClick={onOpenParticipants}
                className="text-[11px] text-[#1a73e8] dark:text-[#8ab4f8] font-semibold hover:underline cursor-pointer"
              >
                View all
              </button>
            )}
          </div>

          {/* Single or Multi Participant View */}
          {count === 1 ? (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  name={firstKnock.userName}
                  avatar={firstKnock.avatar}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {firstKnock.userName || "Guest Participant"}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Waiting in lobby
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onDeny(firstKnock.socketId)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FaTimes className="w-2.5 h-2.5 text-red-500" />
                  <span>Deny</span>
                </button>
                <button
                  onClick={() => onAdmit(firstKnock.socketId)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                >
                  <FaCheck className="w-2.5 h-2.5" />
                  <span>Admit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {pendingKnocks.slice(0, 3).map((knock) => (
                  <div
                    key={knock.socketId}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Avatar
                        name={knock.userName}
                        avatar={knock.avatar}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {knock.userName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDeny(knock.socketId)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Deny"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => onAdmit(knock.socketId)}
                        className="p-1.5 px-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                        title="Admit"
                      >
                        <FaCheck className="w-2 h-2" />
                        <span>Admit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Batch Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700/60">
                <button
                  onClick={() => {
                    pendingKnocks.forEach((k) => onDeny(k.socketId));
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer"
                >
                  Deny all
                </button>
                <button
                  onClick={() => {
                    pendingKnocks.forEach((k) => onAdmit(k.socketId));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                >
                  <FaUsers className="w-3 h-3" />
                  <span>Admit all ({count})</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default KnockNotificationModal;
