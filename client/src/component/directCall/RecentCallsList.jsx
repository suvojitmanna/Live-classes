import React from "react";
import {
  FaVideo,
  FaPhoneAlt,
  FaArrowDown,
  FaArrowUp,
  FaTrash,
  FaPhone,
  FaClock,
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import { useDirectCall } from "../../context/DirectCallContext";

const RecentCallsList = () => {
  const { callHistory, historyLoading, startDirectCall, deleteCallHistory } =
    useDirectCall();

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status, direction) => {
    switch (status) {
      case "completed":
        return (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            Completed
          </span>
        );
      case "missed":
        return (
          <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
            {direction === "incoming" ? "Missed" : "No Answer"}
          </span>
        );
      case "declined":
        return (
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaPhone className="text-blue-600 dark:text-[#8ab4f8] w-4 h-4" />
          <span>Recent Direct Calls</span>
        </h2>
        <span className="text-xs text-gray-500">
          {callHistory.length} {callHistory.length === 1 ? "call" : "calls"}
        </span>
      </div>

      {historyLoading ? (
        <div className="p-8 text-center bg-white dark:bg-[#282a2d] rounded-3xl border border-gray-200 dark:border-gray-800 text-xs text-gray-400">
          Loading call logs...
        </div>
      ) : callHistory.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#282a2d] rounded-3xl border border-gray-200 dark:border-gray-800 text-xs text-gray-500">
          No recent direct calls yet. Search for a registered user's email above
          to start a call!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {callHistory.map((call) => {
            const isIncoming = call.direction === "incoming";
            const peer = call.peer || {};
            const isVideo = call.callType === "video";
            const durationText = formatDuration(call.durationSeconds);

            return (
              <div
                key={call.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                {/* Header: Peer Info + Direction */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <Avatar
                      name={peer.name || "User"}
                      avatar={peer.avatar}
                      size="md"
                    />
                    <div className="truncate">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {peer.name || "User"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                        {peer.email || ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div
                      className={`flex items-center gap-1 text-[11px] font-bold ${
                        isIncoming
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isIncoming ? (
                        <FaArrowDown className="w-2.5 h-2.5" />
                      ) : (
                        <FaArrowUp className="w-2.5 h-2.5" />
                      )}
                      <span className="capitalize">{call.direction}</span>
                    </div>
                    {getStatusBadge(call.status, call.direction)}
                  </div>
                </div>

                {/* Footer: Date, Duration, Callback, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                    <FaClock className="w-3 h-3 text-gray-400" />
                    <span>
                      {new Date(
                        call.startedAt || Date.now()
                      ).toLocaleDateString()}{" "}
                      {new Date(
                        call.startedAt || Date.now()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {durationText && (
                      <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        • {durationText}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Delete Call Log Button */}
                    <button
                      onClick={() => deleteCallHistory(call.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete call record"
                      aria-label="Delete call record"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>

                    {/* Quick 1-Click Callback Buttons */}
                    {peer.email && (
                      <>
                        <button
                          onClick={() =>
                            startDirectCall(peer.email, "voice")
                          }
                          className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors cursor-pointer"
                          title="Call back with Voice"
                          aria-label="Call back with Voice"
                        >
                          <FaPhoneAlt className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() =>
                            startDirectCall(peer.email, "video")
                          }
                          className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm transition-colors cursor-pointer"
                          title="Call back with Video"
                          aria-label="Call back with Video"
                        >
                          <FaVideo className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentCallsList;
