import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import JoinForm from "../component/session/JoinForm";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../service/api";
import toast from "react-hot-toast";

const JoinSession = () => {
  const [roomId, setRoomId] = useState("");
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlRoomId = searchParams.get("roomId");
    if (urlRoomId) {
      setRoomId(urlRoomId.toLowerCase().trim());
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setRoomId(e.target.value.toLowerCase().trim());
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!roomId || !roomId.trim()) {
      setLocalError("Please enter a meeting code");
      toast.error("Please enter a meeting code");
      return;
    }

    let code = roomId.trim();
    if (code.includes("roomId=")) {
      const match = code.match(/roomId=([a-zA-Z0-9-]+)/);
      if (match) code = match[1];
    } else if (code.includes("/meeting/")) {
      const parts = code.split("/meeting/");
      if (parts[1]) code = parts[1].split("?")[0];
    }

    const cleanCode = code.toLowerCase().trim();

    // Verify session availability before joining
    setLoading(true);
    try {
      const response = await api.get(`/session/${cleanCode}`);
      if (response.data.success) {
        const session = response.data.data.session;
        if (session.isLinkDisabled || session.status === "expired") {
          setLocalError("This meeting link has been permanently disabled by the host.");
          toast.error("This meeting link is disabled");
          setLoading(false);
          return;
        }

        navigate(`${ROUTES.MEETING}/${cleanCode}`);
      }
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 404) {
        const msg = "Invalid meeting code. This meeting session does not exist.";
        setLocalError(msg);
        toast.error(msg);
      } else if (err.response?.status === 403 || err.response?.data?.isExpired) {
        const msg = "This meeting link has been permanently disabled by the host.";
        setLocalError(msg);
        toast.error(msg);
      } else {
        navigate(`${ROUTES.MEETING}/${cleanCode}`);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-xl mx-auto mb-6">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <motion.main
        className="max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <JoinForm
          roomId={roomId}
          error={localError}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </motion.main>
    </div>
  );
};

export default JoinSession;
