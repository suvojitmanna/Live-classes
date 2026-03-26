import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../uttils/constants.js";
import WelcomeSection from "../component/dashboard/WelcomeSection";
import ActionCard from "../component/dashboard/ActionCard";
import FeaturesGrid from "../component/dashboard/FeaturesGrid";
import SessionList from "../component/dashboard/SessionList";
import { useSession } from "../context/SessionContext";
import { FaExclamationCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const { createSession, listSessions, error, loading } = useSession();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const handleCreateSession = async () => {
    setCreating(true);
    const result = await createSession();
    if (result.success) {
      navigate(`${ROUTES.HOST}?roomId=${result.session.roomId}`);
    }
    setCreating(false);
  };

  useEffect(() => {
    const load = async () => {
      const result = await listSessions(statusFilter);
      if (result.success) {
        setSessions(result.sessions);
      }
    };
    load();
  }, [listSessions, statusFilter]);

  const handleRejoinSession = (session) => {
    if (session.status === "active") {
      if (session.isHost) {
        navigate(`${ROUTES.HOST}?roomId=${session.roomId}`);
      } else {
        navigate(`${ROUTES.JOIN}?roomId=${session.roomId}`);
      }
    }
  };

  const handleJoinSession = () => {
    navigate(ROUTES.JOIN);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/*Page Refresh Animation */}
      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <WelcomeSection userName={user?.name} />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            className="max-w-2xl mx-auto mb-8"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
          >
            <div className="bg-red-50 border-1-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm ">
              <div className="flex items-center">
                <FaExclamationCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <ActionCard
            onCreateSession={handleCreateSession}
            onJoinSession={handleJoinSession}
            creating={creating}
          />
        </motion.div>

        {/* Features */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <FeaturesGrid />
        </motion.div>

        {/* Sessions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <SessionList
            sessions={sessions}
            loading={loading}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            onRejoinSession={handleRejoinSession}
          />
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Dashboard;
