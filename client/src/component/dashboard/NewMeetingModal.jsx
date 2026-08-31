import React, { useState } from "react";
import Modal from "../common/Modal";
import { FaPlus, FaLink, FaKeyboard, FaCopy, FaCheck, FaVideo, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import { useSession } from "../../context/SessionContext";
import toast from "react-hot-toast";

const NewMeetingModal = ({ isOpen, onClose, onSessionCreated }) => {
  const { createSession } = useSession();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleStartInstant = async () => {
    setLoading(true);
    const res = await createSession();
    setLoading(false);
    if (res.success && res.session) {
      onClose();
      if (onSessionCreated) onSessionCreated();
      navigate(`${ROUTES.MEETING}/${res.session.roomId}`);
    } else {
      toast.error(res.error || "Failed to create meeting");
    }
  };

  const handleCreateForLater = async () => {
    setLoading(true);
    const res = await createSession();
    setLoading(false);
    if (res.success && res.session) {
      setCreatedRoomId(res.session.roomId);
      const url = `${window.location.origin}/join?roomId=${res.session.roomId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      if (onSessionCreated) onSessionCreated();
      toast.success("Meeting created! Link copied to clipboard 📋");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error(res.error || "Failed to create meeting");
    }
  };

  const handleCopyExisting = () => {
    if (!createdRoomId) return;
    const url = `${window.location.origin}/join?roomId=${createdRoomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }

    let code = joinCode.trim();
    if (code.includes("roomId=")) {
      const match = code.match(/roomId=([a-zA-Z0-9-]+)/);
      if (match) code = match[1];
    } else if (code.includes("/meeting/")) {
      const parts = code.split("/meeting/");
      if (parts[1]) code = parts[1].split("?")[0];
    }

    onClose();
    navigate(`${ROUTES.MEETING}/${code.toLowerCase()}`);
  };

  const handleModalClose = () => {
    setCreatedRoomId(null);
    setCopied(false);
    setJoinCode("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="New Meeting" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* If a meeting was just created for later, show the shareable link card */}
        {createdRoomId ? (
          <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <FaVideo className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">Here's your joining link</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Share this link with people you want to join the meeting.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 bg-white dark:bg-[#202124] rounded-xl border border-gray-300 dark:border-gray-700 shadow-inner">
              <span className="text-xs font-mono text-gray-800 dark:text-gray-200 truncate">
                {window.location.origin}/join?roomId={createdRoomId}
              </span>
              <button
                onClick={handleCopyExisting}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-[#8ab4f8] transition-colors cursor-pointer shrink-0"
                title="Copy link"
              >
                {copied ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`${ROUTES.MEETING}/${createdRoomId}`);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Join Now
              </button>
              <button
                onClick={handleModalClose}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Option 1: Start an instant meeting */}
            <button
              onClick={handleStartInstant}
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-white dark:bg-[#282a2d] hover:bg-blue-50 dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 group-hover:bg-blue-600 text-blue-600 dark:text-[#8ab4f8] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                {loading ? <FaSpinner className="w-5 h-5 animate-spin" /> : <FaPlus className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#8ab4f8] transition-colors">
                  Start an instant meeting
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Launch a live video session right now and invite others
                </p>
              </div>
            </button>

            {/* Option 2: Create a meeting for later */}
            <button
              onClick={handleCreateForLater}
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-white dark:bg-[#282a2d] hover:bg-emerald-50 dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 group-hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                <FaLink className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Create a meeting for later
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Get a shareable link to send to participants in advance
                </p>
              </div>
            </button>

            {/* Option 3: Join with a code form */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FaKeyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter meeting code or link"
                    className="w-full bg-gray-50 dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewMeetingModal;
