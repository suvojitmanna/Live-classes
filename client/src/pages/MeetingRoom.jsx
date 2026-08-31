import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { ROUTES } from "../utils/constants";
import MeetingHeader from "../component/meeting/MeetingHeader";
import MeetingLobby from "../component/meeting/MeetingLobby";
import VideoGrid from "../component/meeting/VideoGrid";
import FloatingSelfView from "../component/meeting/FloatingSelfView";
import FloatingReactions from "../component/meeting/FloatingReactions";
import MeetingControls from "../component/meeting/MeetingControls";
import MeetingCaptions from "../component/meeting/MeetingCaptions";
import VisualEffectsModal from "../component/meeting/VisualEffectsModal";
import ChatPanel from "../component/meeting/ChatPanel";
import ParticipantPanel from "../component/meeting/ParticipantPanel";
import MeetingDetailsPanel from "../component/meeting/MeetingDetailsPanel";
import ActivitiesPanel from "../component/meeting/ActivitiesPanel";
import HostControlsPanel from "../component/meeting/HostControlsPanel";
import MeetingSettings from "../component/meeting/MeetingSettings";
import LeaveConfirmModal from "../component/meeting/LeaveConfirmModal";
import KeyboardShortcutsModal from "../component/meeting/KeyboardShortcutsModal";
import MeetingEndedView from "../component/meeting/MeetingEndedView";
import Avatar from "../component/common/Avatar";
import api from "../service/api";
import toast from "react-hot-toast";

const MeetingRoom = () => {
  const { roomId: paramRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const queryRoomId = searchParams.get("roomId");
  const roomId = (paramRoomId || queryRoomId || "").toLowerCase().trim();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name || "Guest User");
  const [sessionDetails, setSessionDetails] = useState(null);
  const [layoutMode, setLayoutMode] = useState("auto");
  const [pinnedId, setPinnedId] = useState(null);
  const [isSelfFloating, setIsSelfFloating] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [visualEffect, setVisualEffect] = useState("none");
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisualEffectsOpen, setIsVisualEffectsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isEndedLinkDisabled, setIsEndedLinkDisabled] = useState(false);

  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised,
    activeSpeakerId,
    isJoined,
    peers,
    error: rtcError,
    loading: rtcLoading,
    knockStatus,
    setKnockStatus,
    pendingKnocks,
    askToJoin,
    cancelKnock,
    admitUser,
    denyUser,
    setLinkExpiration,
    messages,
    unreadChatCount,
    sendChatMessage,
    resetUnreadChatCount,
    reactions,
    sendReaction,
    devices,
    selectedDevices,
    setSelectedDevices,
    startPreview,
    joinMeetingRoom,
    leaveMeetingRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRaiseHand,
  } = useWebRTC();

  const currentUserId = user?.id || user?._id;
  const isHost =
    sessionDetails?.isHost === true ||
    (sessionDetails?.host &&
      currentUserId &&
      sessionDetails.host.toString() === currentUserId.toString());

  useEffect(() => {
    if (!roomId) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    if (user?.name) {
      setDisplayName(user.name);
    }

    startPreview();

    const fetchSession = async () => {
      try {
        const response = await api.get(`/session/${roomId}`);
        if (response.data.success) {
          const sess = response.data.data.session;
          setSessionDetails(sess);

          if (sess.isLinkDisabled || sess.status === "expired") {
            setKnockStatus("expired");
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setKnockStatus("not_found");
        } else if (err.response?.status === 403 || err.response?.data?.isExpired) {
          setKnockStatus("expired");
        }
        console.warn("Session fetch info notice:", err.message);
      }
    };

    fetchSession();
  }, [roomId, navigate, user, startPreview, setKnockStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleAudio();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        toggleVideo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        toggleRaiseHand();
      } else if (e.key === "Escape") {
        setActiveSidebar(null);
        setIsSettingsOpen(false);
        setIsVisualEffectsOpen(false);
        setIsShortcutsOpen(false);
        setIsLeaveModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAudio, toggleVideo, toggleRaiseHand]);

  useEffect(() => {
    if (activeSidebar === "chat") {
      resetUnreadChatCount();
    }
  }, [activeSidebar, messages, resetUnreadChatCount]);

  const handleJoinOrAsk = async () => {
    if (sessionDetails?.isLinkDisabled || sessionDetails?.status === "expired" || knockStatus === "expired") {
      toast.error("This meeting link has been permanently disabled.");
      setKnockStatus("expired");
      return;
    }

    if (!displayName.trim()) {
      toast.error("Please enter your display name");
      return;
    }

    const currentUser = {
      id: user?.id || user?._id || `user_${Date.now()}`,
      name: displayName.trim(),
      avatar: user?.avatar || "",
    };

    if (isHost) {
      try {
        const joinRes = await api.post("/session/join", { roomId });
        if (joinRes.data.success === false && joinRes.data.isExpired) {
          toast.error("This meeting link has been disabled.");
          setKnockStatus("expired");
          return;
        }
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("This meeting link has been disabled.");
          setKnockStatus("expired");
          return;
        }
      }
      await joinMeetingRoom(roomId, currentUser, true);
      toast.success("Joined meeting as Host 👑", { icon: "🟢" });
    } else {
      askToJoin(roomId, currentUser);
    }
  };

  const handleConfirmLeave = async () => {
    setIsLeaveModalOpen(false);
    leaveMeetingRoom();

    try {
      await api.post("/session/leave", { roomId });
    } catch (err) {
      console.warn("Leave session notice:", err.message);
    }

    setHasEnded(true);
  };

  const handleEndMeetingForEveryone = async () => {
    setIsLeaveModalOpen(false);
    leaveMeetingRoom();

    try {
      await api.delete(`/session/${roomId}`);
    } catch (err) {
      try {
        await api.post(`/session/end/${roomId}`);
      } catch (e) {
        console.log(e);
      }
      console.log(err);
    }

    toast.success("Meeting ended and link permanently disabled");
    navigate(ROUTES.DASHBOARD);
  };

  // Toggle Sidebar
  const handleToggleSidebar = (sidebarType) => {
    if (activeSidebar === sidebarType) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(sidebarType);
      if (sidebarType === "chat") {
        resetUnreadChatCount();
      }
    }
  };

  const handleDeviceChange = async (type, deviceId) => {
    const audioId =
      type === "audioInput" ? deviceId : selectedDevices.audioInput;
    const videoId =
      type === "videoInput" ? deviceId : selectedDevices.videoInput;
    await startPreview(audioId, videoId);
  };

  if (hasEnded) {
    const isLinkDisabled =
      isEndedLinkDisabled ||
      sessionDetails?.isLinkDisabled ||
      sessionDetails?.status === "expired" ||
      knockStatus === "expired";

    return (
      <MeetingEndedView
        isLinkDisabled={isLinkDisabled}
        onRejoin={
          isLinkDisabled
            ? undefined
            : () => {
              setHasEnded(false);
              startPreview();
            }
        }
        onReturnHome={() => navigate(ROUTES.DASHBOARD)}
      />
    );
  }

  if (!isJoined) {
    return (
      <>
        <MeetingLobby
          roomId={roomId}
          userName={displayName}
          setUserName={setDisplayName}
          localStream={localStream}
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          isHost={isHost}
          knockStatus={knockStatus}
          onAskToJoin={handleJoinOrAsk}
          onCancelKnock={() => cancelKnock(roomId)}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onBackToDashboard={() => navigate(ROUTES.DASHBOARD)}
          loading={rtcLoading}
          error={rtcError}
        />

        <MeetingSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
          onDeviceChange={handleDeviceChange}
          localStream={localStream}
        />
      </>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f8fafd] dark:bg-[#202124] text-gray-900 dark:text-white flex flex-col justify-between overflow-hidden select-none relative transition-colors">
      <MeetingHeader
        roomId={roomId}
        title={sessionDetails?.title || "Live Class Meeting"}
        isConnected={true}
        onOpenDetails={() => handleToggleSidebar("details")}
      />

      {pendingKnocks.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 space-y-2">
          {pendingKnocks.map((knock) => (
            <div
              key={knock.socketId}
              className="bg-white dark:bg-[#282a2d] border-2 border-blue-500 dark:border-[#8ab4f8] text-gray-900 dark:text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md animate-bounce"
            >
              <div className="flex items-center gap-3 truncate">
                <Avatar name={knock.userName} avatar={knock.avatar} size="sm" />
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {knock.userName}
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Asking to join this meeting...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => admitUser(knock.socketId)}
                  className="px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Admit
                </button>
                <button
                  onClick={() => denyUser(knock.socketId)}
                  className="px-3.5 py-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FloatingReactions reactions={reactions} />
      <MeetingCaptions
        isEnabled={isCaptionsOn}
        userName={displayName}
        roomId={roomId}
        isAudioMuted={isAudioMuted}
        localStream={localStream}
      />

      {isScreenSharing && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 bg-[#1a73e8] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span>You are presenting to everyone</span>
          <button
            onClick={toggleScreenShare}
            className="underline hover:text-gray-200 ml-1 font-bold cursor-pointer"
          >
            Stop presenting
          </button>
        </div>
      )}

      <div className="flex-1 flex pt-14 pb-20 overflow-hidden relative">
        <main className="flex-1 h-full w-full overflow-hidden flex items-center justify-center">
          <VideoGrid
            localUser={{
              stream: localStream,
              screenStream,
              name: displayName,
              avatar: user?.avatar,
              isHost,
              isAudioMuted,
              isVideoOff,
              isScreenSharing,
              isHandRaised,
            }}
            peers={peers}
            layoutMode={layoutMode}
            pinnedId={pinnedId}
            activeSpeakerId={activeSpeakerId}
            isSelfFloating={isSelfFloating}
            onTogglePin={(id) =>
              setPinnedId((prev) => (prev === id ? null : id))
            }
            onToggleFloatSelf={() => setIsSelfFloating((prev) => !prev)}
          />
        </main>

        {isSelfFloating && (
          <FloatingSelfView
            stream={isScreenSharing ? screenStream : localStream}
            userName={displayName}
            avatar={user?.avatar}
            isMuted={isAudioMuted}
            isVideoOff={isVideoOff && !isScreenSharing}
            isSpeaking={activeSpeakerId === "local"}
            onDock={() => setIsSelfFloating(false)}
          />
        )}

        {activeSidebar === "chat" && (
          <ChatPanel
            messages={messages}
            onSendMessage={sendChatMessage}
            onClose={() => setActiveSidebar(null)}
            currentUserId={user?.id || user?._id}
          />
        )}

        {activeSidebar === "participants" && (
          <ParticipantPanel
            currentUser={{ name: displayName, avatar: user?.avatar }}
            localIsMuted={isAudioMuted}
            localIsVideoOff={isVideoOff}
            localIsHandRaised={isHandRaised}
            peers={peers}
            pendingKnocks={pendingKnocks}
            onAdmit={admitUser}
            onDeny={denyUser}
            isHost={isHost}
            hostName={sessionDetails?.hostName}
            onClose={() => setActiveSidebar(null)}
            roomId={roomId}
          />
        )}

        {activeSidebar === "details" && (
          <MeetingDetailsPanel
            roomId={roomId}
            onClose={() => setActiveSidebar(null)}
          />
        )}

        {activeSidebar === "activities" && (
          <ActivitiesPanel onClose={() => setActiveSidebar(null)} />
        )}

        {activeSidebar === "host" && (
          <HostControlsPanel
            roomId={roomId}
            onSetLinkExpiration={setLinkExpiration}
            onClose={() => setActiveSidebar(null)}
          />
        )}
      </div>

      <MeetingControls
        roomId={roomId}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        isCaptionsOn={isCaptionsOn}
        activeSidebar={activeSidebar}
        unreadChatCount={unreadChatCount}
        participantCount={1 + peers.length}
        layoutMode={layoutMode}
        isHost={isHost}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        toggleScreenShare={toggleScreenShare}
        toggleRaiseHand={toggleRaiseHand}
        toggleCaptions={() => setIsCaptionsOn((prev) => !prev)}
        onSendReaction={sendReaction}
        onChangeLayout={setLayoutMode}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVisualEffects={() => setIsVisualEffectsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onLeaveMeeting={() => setIsLeaveModalOpen(true)}
      />

      <MeetingSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
        onDeviceChange={handleDeviceChange}
        localStream={localStream}
      />

      <VisualEffectsModal
        isOpen={isVisualEffectsOpen}
        onClose={() => setIsVisualEffectsOpen(false)}
        selectedEffect={visualEffect}
        onSelectEffect={setVisualEffect}
      />

      <LeaveConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirmLeave={handleConfirmLeave}
        onEndMeetingForEveryone={handleEndMeetingForEveryone}
        onSetLinkExpiration={setLinkExpiration}
        roomId={roomId}
        isHost={isHost}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default MeetingRoom;
