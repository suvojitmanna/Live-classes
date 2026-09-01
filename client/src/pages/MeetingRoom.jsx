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
import KnockNotificationModal from "../component/meeting/KnockNotificationModal";
import MeetingSettings from "../component/meeting/MeetingSettings";
import LeaveConfirmModal from "../component/meeting/LeaveConfirmModal";
import KeyboardShortcutsModal from "../component/meeting/KeyboardShortcutsModal";
import MeetingEndedView from "../component/meeting/MeetingEndedView";
import Avatar from "../component/common/Avatar";
import api from "../service/api";
import toast from "react-hot-toast";

const normalizeRoomId = (raw) => {
  if (!raw) return "";
  try {
    let str = decodeURIComponent(raw).toLowerCase().trim();
    return str.replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  } catch (e) {
    return raw.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  }
};

const MeetingRoom = () => {
  const { roomId: paramRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const queryRoomId = searchParams.get("roomId");
  const roomId = normalizeRoomId(paramRoomId || queryRoomId);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name || "Guest User");
  const [sessionDetails, setSessionDetails] = useState(null);
  const [layoutMode, setLayoutMode] = useState("auto");
  const [pinnedId, setPinnedId] = useState(null);
  const [isSelfFloating, setIsSelfFloating] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
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
    visualEffect,
    applyVisualEffect,
    roomPermissions,
    updateRoomPermissions,
    muteAllParticipants,
    stopAllVideo,
    controlParticipant,
    isSocketConnected,
    polls,
    createPoll,
    votePoll,
    closePoll,
    deletePoll,
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
        isConnected={isSocketConnected}
        onOpenDetails={() => handleToggleSidebar("details")}
      />

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
            isHost={isHost}
            roomPermissions={roomPermissions}
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
            onControlParticipant={controlParticipant}
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
          <ActivitiesPanel
            polls={polls}
            onCreatePoll={createPoll}
            onVotePoll={votePoll}
            onClosePoll={closePoll}
            onDeletePoll={deletePoll}
            isHost={isHost}
            currentUserId={user?.id || user?._id}
            onClose={() => setActiveSidebar(null)}
          />
        )}

        {activeSidebar === "host" && (
          <HostControlsPanel
            roomId={roomId}
            roomPermissions={roomPermissions}
            onUpdatePermissions={updateRoomPermissions}
            onMuteAll={muteAllParticipants}
            onStopAllVideo={stopAllVideo}
            onSetLinkExpiration={setLinkExpiration}
            onClose={() => setActiveSidebar(null)}
          />
        )}
      </div>
      {isHost && (
        <KnockNotificationModal
          pendingKnocks={pendingKnocks}
          onAdmit={admitUser}
          onDeny={denyUser}
          onOpenParticipants={() => setActiveSidebar("participants")}
        />
      )}

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
        pendingKnocksCount={pendingKnocks.length}
        layoutMode={layoutMode}
        isHost={isHost}
        roomPermissions={roomPermissions}
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
        onSelectEffect={applyVisualEffect}
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
