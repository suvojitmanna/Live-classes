import React, { useEffect, useRef, useState } from "react";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useZego } from "../hooks/useZego";
import { API_ENDPOINTS, APP_CONFIG, ROUTES } from "../utils/constants";
import { copyToClipboard } from "../utils/helper";
import api from "../service/api";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

import SessionHeader from "../component/session/SessionHeader";
import SessionInfoCard from "../component/session/SessionInfoCard";
import VideoContainer from "../component/session/VideoContainer";
import ParticipantsList from "../component/session/ParticipantsList";

const HostSession = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomCopied, setRoomCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { currentSession, getSession, clearSession } = useSession();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zegoJoinedRef = useRef(false);

  const roomId = searchParams.get("roomId") || currentSession?.roomId;

  const {
    isJoined,
    userHasJoined,
    error: zegoError,
    loading: zegoLoading,
    containerRef,
    joinZegoRoom,
    leaveZegoRoom,
  } = useZego();

  // Fullscreen
  const handleFullScreen = () => {
    const videoContainer = containerRef.current;
    if (!videoContainer) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      videoContainer.requestFullscreen?.().catch(() => {});
    }
  };

  // ===================== LOAD SESSION =====================
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      if (!roomId) {
        navigate(ROUTES.DASHBOARD);
        return;
      }

      setLoading(true);
      const result = await getSession(roomId);

      if (!isMounted) return;

      if (result.success) {
        setSessionInfo(result.session);

        // ✅ Notification
        toast.success("Session loaded successfully 🎉", {
          icon: "📡",
        });
      } else {
        toast.error("Session not found ❌");
        navigate(ROUTES.DASHBOARD);
      }

      setLoading(false);
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [roomId, getSession, navigate]);

  // ===================== ZEGO JOIN =====================
  useEffect(() => {
    if (!sessionInfo || !roomId || zegoJoinedRef.current) return;

    let isMounted = true;
    let retryTimeout = null;

    const joinZego = async () => {
      if (containerRef.current && isMounted && !zegoJoinedRef.current) {
        zegoJoinedRef.current = true;

        const zegoResult = await joinZegoRoom(roomId);

        if (!isMounted) return;

        if (zegoResult.success) {
          toast.success("Connected to live session 🎥", {
            icon: "🟢",
          });
        } else {
          toast.error("Failed to connect to session ❌");
          zegoJoinedRef.current = false;
        }
      } else if (isMounted && !zegoJoinedRef.current) {
        retryTimeout = setTimeout(joinZego, 200);
      }
    };

    joinZego();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);

      if (zegoJoinedRef.current) {
        leaveZegoRoom();
        zegoJoinedRef.current = false;
      }
    };
  }, [sessionInfo?.id, roomId]);

  // ===================== POLLING =====================
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(async () => {
      const res = await getSession(roomId);

      if (res.success && res.session) {
        setSessionInfo((prev) => {
          if (!prev) return res.session;

          // 🔔 Participant join/leave notifications
          if (res.session.participantCount > prev.participantCount) {
            toast("Someone joined 👤", { icon: "➕" });
          }

          if (res.session.participantCount < prev.participantCount) {
            toast("Someone left 👋", { icon: "➖" });
          }

          if (
            prev.participantCount === res.session.participantCount &&
            prev.status === res.session.status &&
            prev.participants?.length === res.session.participants?.length
          ) {
            return prev;
          }

          return res.session;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId, getSession]);

  // ===================== COPY =====================
  const handleCopyRoomId = async () => {
    if (roomId) {
      const success = await copyToClipboard(roomId);
      if (success) {
        setRoomCopied(true);
        toast.success("Room ID copied 📋");
        setTimeout(() => setRoomCopied(false), 2000);
      }
    }
  };

  const getShareableLink = () => {
    const baseURL = window.location.origin;
    return `${baseURL}/${ROUTES.JOIN}?roomId=${roomId}`;
  };

  const handleCopyLink = async () => {
    const link = getShareableLink();
    const success = await copyToClipboard(link);
    if (success) {
      setLinkCopied(true);
      toast.success("Invite link copied 🔗");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // ===================== END SESSION =====================
  const handleEndSession = async () => {
    if (!sessionInfo || !sessionInfo.isHost) return;

    try {
      if (zegoJoinedRef.current) {
        await leaveZegoRoom();
        zegoJoinedRef.current = false;
      }

      await api.post(`${API_ENDPOINTS.SESSION.END}/${sessionInfo.id}`);
      clearSession();

      toast.success("Session ended successfully 🎉", {
        icon: "✅",
      });

      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error("Failed to end session ❌");
    }
  };

  // ===================== LEAVE =====================
  const handleLeave = async () => {
    toast("Leaving session...", { icon: "🚪" });

    if (sessionInfo?.isHost) {
      handleEndSession();
    } else {
      if (zegoJoinedRef.current) {
        await leaveZegoRoom();
        zegoJoinedRef.current = false;
      }

      await api.post(API_ENDPOINTS.SESSION.LEAVE, { roomId });
      clearSession();

      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.DASHBOARD);
  };

  // ===================== LOADING =====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            {APP_CONFIG.LOADING_MESSAGES.SESSION}
          </p>
        </div>
      </div>
    );
  }

  if (!sessionInfo) return null;

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SessionHeader
        title={APP_CONFIG.SESSION_CONTENT.HEADER.HOSTING_TITLE}
        roomId={roomId}
        userName={user?.name}
        onBack={handleBack}
        showEndBUtton={sessionInfo.isHost}
        onEndSession={handleEndSession}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SessionInfoCard
              roomId={roomId}
              shareableLink={getShareableLink()}
              status={sessionInfo.status}
              participantCount={sessionInfo.participantCount}
              roomCopied ={roomCopied}
              linkCopied ={linkCopied}
              onCopyRoomId={handleCopyRoomId}
              onCopyLink={handleCopyLink}
            />

            <VideoContainer
              containerRef={containerRef}
              isJoined={isJoined}
              userHasJoined={userHasJoined}
              zegoError={zegoError}
              zegoLoading={zegoLoading}
              onFullscreen={handleFullScreen}
              onLeave={handleLeave}
              leaveButtonText={
                sessionInfo?.isHost
                  ? APP_CONFIG.SESSION_CONTENT.VIDEO.END_BUTTON
                  : APP_CONFIG.SESSION_CONTENT.VIDEO.LEAVE_BUTTON
              }
            />
          </div>

          <div className="lg:col-span-1">
            <ParticipantsList
              participants={sessionInfo.participants}
              hostName={sessionInfo.hostName}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostSession;
