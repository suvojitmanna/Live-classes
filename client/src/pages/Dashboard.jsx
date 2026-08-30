import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import { useSession } from "../context/SessionContext";
import { getSocket } from "../service/socket";
import {
  FaVideo,
  FaLink,
  FaKeyboard,
  FaPlus,
  FaTrash,
  FaRedo,
  FaClock,
  FaCopy,
  FaCheck,
  FaShieldAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { createSession, listSessions, deleteSession, error, loading } =
    useSession();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [meetingCodeInput, setMeetingCodeInput] = useState("");
  const [showNewMeetingMenu, setShowNewMeetingMenu] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(null);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowNewMeetingMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSessions = async () => {
    const result = await listSessions("all");
    if (result.success) {
      setSessions(result.sessions);
    }
  };

  useEffect(() => {
    loadSessions();
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleSessionDeleted = ({ roomId: deletedRoomId }) => {
      if (!deletedRoomId) return;
      setSessions((prev) =>
        prev.filter(
          (s) => s.roomId.toLowerCase() !== deletedRoomId.toLowerCase(),
        ),
      );
    };
    socket.on("session-deleted", handleSessionDeleted);
    return () => {
      socket.off("session-deleted", handleSessionDeleted);
    };
  }, [listSessions]);

  const handleStartInstantMeeting = async () => {
    setShowNewMeetingMenu(false);
    setCreating(true);
    const result = await createSession();
    if (result.success && result.session) {
      navigate(`${ROUTES.MEETING}/${result.session.roomId}`);
    }
    setCreating(false);
  };

  const handleCreateMeetingForLater = async () => {
    setShowNewMeetingMenu(false);
    setCreating(true);
    const result = await createSession();
    if (result.success && result.session) {
      const url = `${window.location.origin}/join?roomId=${result.session.roomId}`;
      navigator.clipboard.writeText(url);
      toast.success(
        <div>
          <p className="font-semibold">Meeting created! Link copied: 📋</p>
          <p className="text-xs font-mono mt-1 opacity-90">
            {result.session.roomId}
          </p>
        </div>,
        { duration: 5000 },
      );
      loadSessions();
    }
    setCreating(false);
  };

  const handleJoinWithCode = (e) => {
    e.preventDefault();
    if (!meetingCodeInput.trim()) {
      toast.error("Please enter a meeting code or link");
      return;
    }

    let code = meetingCodeInput.trim();
    if (code.includes("roomId=")) {
      const match = code.match(/roomId=([a-zA-Z0-9-]+)/);
      if (match) code = match[1];
    } else if (code.includes("/meeting/")) {
      const parts = code.split("/meeting/");
      if (parts[1]) code = parts[1].split("?")[0];
    }
    navigate(`${ROUTES.MEETING}/${code.toLowerCase()}`);
  };

  const handleCopyLink = (roomId) => {
    const url = `${window.location.origin}/join?roomId=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedRoomId(roomId);
    toast.success("Meeting link copied to clipboard");
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const handleDeleteSession = async (roomId) => {
    setDeletingRoomId(roomId);
    const res = await deleteSession(roomId);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.roomId !== roomId));
      toast.success("Meeting session deleted successfully 🗑️");
    } else {
      toast.error(res.error || "Failed to delete session");
    }
    setDeletingRoomId(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Video calls and meetings for everyone
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Connect, collaborate, and celebrate from anywhere with secure
                WebRTC video conferencing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowNewMeetingMenu((prev) => !prev)}
                  disabled={creating}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
                >
                  <FaVideo className="w-4 h-4" />
                  <span>New meeting</span>
                </button>

                <AnimatePresence>
                  {showNewMeetingMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 z-50 text-xs"
                    >
                      <button
                        onClick={handleCreateMeetingForLater}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-800 dark:text-gray-200 text-left transition-colors cursor-pointer"
                      >
                        <FaLink className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8]" />
                        <span>Create a meeting for later</span>
                      </button>

                      <button
                        onClick={handleStartInstantMeeting}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-800 dark:text-gray-200 text-left transition-colors cursor-pointer"
                      >
                        <FaPlus className="w-4 h-4 text-blue-600 dark:text-[#8ab4f8]" />
                        <span>Start an instant meeting</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form
                onSubmit={handleJoinWithCode}
                className="flex-1 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <FaKeyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={meetingCodeInput}
                    onChange={(e) => setMeetingCodeInput(e.target.value)}
                    placeholder="Enter a code or link"
                    className="w-full bg-white dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700 rounded-full pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!meetingCodeInput.trim()}
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8] disabled:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/80 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
                <FaShieldAlt className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Your meeting is safe
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No one can join a meeting unless invited or admitted by the
                host. All calls use direct WebRTC peer encryption.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FaClock className="text-[#1a73e8] dark:text-[#8ab4f8] w-4 h-4" />
              <span>Recent Meetings</span>
            </h2>
            <span className="text-xs text-gray-500">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#282a2d] rounded-2xl border border-gray-200 dark:border-gray-800 text-xs text-gray-500">
              No recent meetings found. Start a new meeting above to get
              started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session._id || session.id || session.roomId}
                  className="p-4 rounded-2xl bg-white dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {session.title || "Live Class Meeting"}
                      </h4>
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                        {session.roomId}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {session.isHost && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/50">
                          Host
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                          session.status === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                            : session.status === "expired"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {session.status === "active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                        {session.status === "active"
                          ? "Live Now"
                          : session.status === "expired"
                          ? "Expired"
                          : "Ended"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                    <span className="text-gray-500 text-[11px]">
                      {session.hostName ? `Host: ${session.hostName}` : new Date(session.startedAt || session.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyLink(session.roomId)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy meeting link"
                        aria-label="Copy meeting link"
                      >
                        {copiedRoomId === session.roomId ? (
                          <FaCheck className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <FaCopy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {session.isHost && (
                        <button
                          onClick={() => handleDeleteSession(session.roomId)}
                          disabled={deletingRoomId === session.roomId}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete meeting session"
                          aria-label="Delete meeting session"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          navigate(`${ROUTES.MEETING}/${session.roomId}`)
                        }
                        className={`px-3.5 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          session.status === "active"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                            : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
                        }`}
                      >
                        {session.status === "active" ? (
                          <>
                            <FaVideo className="w-3 h-3" />
                            <span>Rejoin Live</span>
                          </>
                        ) : (
                          <>
                            <FaRedo className="w-2.5 h-2.5" />
                            <span>Rejoin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
