import React from "react";
import { APP_CONFIG } from "../../uttils/constants.js";
import { FaCircle, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import { formatDate } from "../../uttils/helper.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const SessionList = ({
  sessions,
  loading,
  statusFilter,
  onFilterChange,
  onRejoinSession,
}) => {
  const statusBadge = (status) => {
    const map = {
      active: "bg-green-100 text-green-700",
      ended: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="mt-16 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h3 className="text-2xl yexy-gray-900 font-bold">
            {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.HEADING}
          </h3>
          <p className="text-gray-600">
            {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.DESCRIPTION}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">
              {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.FILTER_ALL}
            </option>
            <option value="active">
              {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.FILTER_ACTIVE}
            </option>
            <option value="ended">
              {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.FILTER_ENDED}
            </option>
          </select>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && sessions.length === 0 ? (
        <div className="flex items-center text-gray-600">
          <FaSpinner className="animate-spin h-5 w-5 mr-2" />
          {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.LOADING}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-600">
          {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.EMPTY}
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {sessions.map((s) => (
            <motion.div
              key={s.id}
              variants={item}
              className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-md transition-shadow"
            >
              {/* Left */}
              <div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                      s.status,
                    )}`}
                  >
                    <FaCircle className="w-2 h-2 mr-2" />
                    {s.status}
                  </span>

                  {s.isHost && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>

                <div className="mt-2 text-lg font-semibold text-gray-900">
                  Room : {s.roomId}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Host: {s.hostName}
                </div>

                <div className="text-sm text-gray-600">
                  Participants: {s.participantCount}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Started: {s.startedAt ? formatDate(s.startedAt) : "N/A"}
                  {s.endedAt && <>. Ended: {formatDate(s.endedAt)}</>}
                </div>
              </div>

              {/* Right Buttons */}
              <div className="flex items-center space-x-2">
                {/* Rejoin */}

                <button
                  onClick={() => {
                    if (s.status === "active") {
                      toast("Rejoining session 🚀", {
                        icon: "🎥",
                        style: {
                          background: "rgba(59,130,246,0.12)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          color: "black",
                        },
                      });

                      onRejoinSession(s);
                    } else {
                      toast.error("Session already ended ❌", {
                        icon: "⛔",
                        style: {
                          border: "1px solid rgba(239,68,68,0.35)",
                        },
                      });
                    }
                  }}
                  disabled={s.status !== "active"}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {s.status === "active" ? (
                    <>
                      {APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.REJOIN_BUTTON}
                      <FaExternalLinkAlt className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    APP_CONFIG.DASHBOARD_CONTENT.SESSIONS_LIST.ENDED_BUTTON
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SessionList;
