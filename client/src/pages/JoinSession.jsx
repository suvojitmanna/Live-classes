import React, { useEffect, useRef, useState } from "react";
import { useSession } from "../context/SessionContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useZego } from "../hooks/useZego";
import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "../utils/constants";
import api from "../service/api";
import SessionHeader from "../component/session/SessionHeader";
import JoinForm from "../component/session/JoinForm";
import VideoContainer from "../component/session/VideoContainer";
import ParticipantsList from "../component/session/ParticipantsList";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const JoinSession = () => {
  const [roomId, setRoomId] = useState("");
  const [localError, setLocalError] = useState("");
  const [sessionJoined, setSessionJoined] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const zegoJoinedRef = useRef(false);

  const [searchParams] = useSearchParams();
  const { joinSession, getSession, loading, error } = useSession();
  const navigate = useNavigate();

  const {
    isJoined,
    userHasJoined,
    error: zegoError,
    loading: zegoLoading,
    containerRef,
    joinZegoRoom,
    leaveZegoRoom,
  } = useZego();

  // ===================== FULLSCREEN =====================
  const handleFullScreen = () => {
    const videoContainer = containerRef.current;
    if (!videoContainer) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      videoContainer.requestFullscreen?.().catch(() => {});
    }
  };

  // ===================== URL PARAM =====================
  useEffect(() => {
    const urlRoomId = searchParams.get("roomId");
    if (urlRoomId) {
      setRoomId(urlRoomId.toUpperCase());
    }
  }, [searchParams]);

  // ===================== INPUT =====================
  const handleChange = (e) => {
    setRoomId(e.target.value.toUpperCase().trim());
    setLocalError("");
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!roomId) {
      setLocalError("Please enter a room ID");
      toast.error("Please enter room ID ❌");
      return;
    }

    const t = toast.loading("Joining session... 🎥");

    const result = await joinSession(roomId);

    if (!result.success) {
      toast.error(result.error || "Failed to join session ❌", { id: t });
      return;
    }

    const session = result.session;

    setSessionInfo(session);
    setSessionJoined(true);

    // ✅ Success toast
    toast.success("Joined successfully 🎉", {
      id: t,
      icon: "🚀",
    });

    // 👑 Host redirect
    if (session.isHost) {
      setTimeout(() => {
        navigate(`${ROUTES.HOST}?roomId=${session.roomId}`);
      }, 800);
    }
  };

  // ===================== ZEGO JOIN =====================
  useEffect(() => {
    if (!sessionJoined || !roomId || zegoJoinedRef.current) return;

    const joinZego = async () => {
      if (containerRef.current) {
        zegoJoinedRef.current = true;

        const zegoResult = await joinZegoRoom(roomId);

        if (zegoResult.success) {
          toast.success("Connected to live session 🎥", {
            icon: "🟢",
          });
        } else {
          toast.error("Failed to connect ❌");
          zegoJoinedRef.current = false;
        }
      } else {
        setTimeout(joinZego, 200);
      }
    };

    joinZego();

    return () => {
      if (zegoJoinedRef.current) {
        leaveZegoRoom();
        zegoJoinedRef.current = false;
      }
    };
  }, [sessionJoined, roomId]);

  // ===================== POLLING =====================
  useEffect(() => {
    if (!sessionJoined || !roomId) return;

    const interval = setInterval(async () => {
      const res = await getSession(roomId);

      if (res.success) {
        setSessionInfo((prev) => {
          if (!prev) return res.session;

          // 🔔 Join/Leave notifications
          if (res.session.participantCount > prev.participantCount) {
            toast("Someone joined 👤", { icon: "➕" });
          }

          if (res.session.participantCount < prev.participantCount) {
            toast("Someone left 👋", { icon: "➖" });
          }

          return res.session;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionJoined, roomId, getSession]);

  // ===================== LEAVE =====================
  const handleLeave = async () => {
    toast("Leaving session...", { icon: "🚪" });

    if (zegoJoinedRef.current) {
      await leaveZegoRoom();
      zegoJoinedRef.current = false;
    }

    if (sessionJoined) {
      await api.post(API_ENDPOINTS.SESSION.LEAVE, { roomId });
    }

    navigate(ROUTES.DASHBOARD);
  };

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <SessionHeader
        title={APP_CONFIG.SESSION_CONTENT.HEADER.JOINING_TITLE}
        roomId={sessionJoined ? roomId : ""}
        onBack={() => navigate(ROUTES.DASHBOARD)}
      />

      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {!sessionJoined ? (
          <JoinForm
            roomId={roomId}
            error={error || localError}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="lg:col-span-2 space-y-6">
              <VideoContainer
                containerRef={containerRef}
                isJoined={isJoined}
                userHasJoined={userHasJoined}
                zegoError={zegoError}
                zegoLoading={zegoLoading}
                onFullscreen={handleFullScreen}
                onLeave={handleLeave}
                leaveButtonText={APP_CONFIG.SESSION_CONTENT.VIDEO.LEAVE_BUTTON}
              />
            </div>

            <div className="lg:col-span-1">
              <ParticipantsList
                participants={sessionInfo?.participants}
                hostName={sessionInfo?.hostName}
              />
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
};

export default JoinSession;
