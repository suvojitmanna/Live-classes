import React from "react";
import VideoTile from "./VideoTile";

const VideoGrid = ({
  localUser,
  peers = [],
  layoutMode = "auto",
  pinnedId = null,
  activeSpeakerId = null,
  isSelfFloating = false,
  onTogglePin,
  onToggleFloatSelf,
}) => {
  const presentingPeer = peers.find((p) => p.isScreenSharing);
  const isAnyScreenSharing = localUser.isScreenSharing || !!presentingPeer;
  let primaryParticipant = null;

  if (pinnedId) {
    if (pinnedId === "local") {
      primaryParticipant = { isLocal: true, ...localUser };
    } else {
      const peer = peers.find((p) => p.socketId === pinnedId);
      if (peer) primaryParticipant = { isLocal: false, ...peer };
    }
  } else if (isAnyScreenSharing) {
    if (localUser.isScreenSharing) {
      primaryParticipant = { isLocal: true, ...localUser };
    } else if (presentingPeer) {
      primaryParticipant = { isLocal: false, ...presentingPeer };
    }
  } else if (layoutMode === "spotlight" || layoutMode === "sidebar") {
    if (activeSpeakerId && activeSpeakerId !== "local") {
      const speaker = peers.find((p) => p.socketId === activeSpeakerId);
      if (speaker) primaryParticipant = { isLocal: false, ...speaker };
    } else if (activeSpeakerId === "local") {
      primaryParticipant = { isLocal: true, ...localUser };
    } else if (peers.length > 0) {
      primaryParticipant = { isLocal: false, ...peers[0] };
    } else {
      primaryParticipant = { isLocal: true, ...localUser };
    }
  }
  if (primaryParticipant) {
    const mainParticipant = primaryParticipant;
    const secondaryPeers = peers.filter(
      (p) =>
        p.socketId !==
        (mainParticipant.isLocal ? null : mainParticipant.socketId),
    );
    const showLocalInSidebar = !mainParticipant.isLocal && !isSelfFloating;

    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-3 sm:gap-4 p-2 sm:p-4 items-center justify-center overflow-hidden">
        <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full max-h-full aspect-video flex items-center justify-center">
            <VideoTile
              stream={
                mainParticipant.isLocal
                  ? mainParticipant.isScreenSharing
                    ? localUser.screenStream
                    : localUser.stream
                  : mainParticipant.stream
              }
              isLocal={mainParticipant.isLocal}
              userName={mainParticipant.userName || mainParticipant.name}
              avatar={mainParticipant.avatar}
              isHost={mainParticipant.isHost}
              isMuted={mainParticipant.isMuted || mainParticipant.isAudioMuted}
              isVideoOff={
                mainParticipant.isVideoOff && !mainParticipant.isScreenSharing
              }
              isScreenSharing={mainParticipant.isScreenSharing}
              isHandRaised={mainParticipant.isHandRaised}
              isSpeaking={
                activeSpeakerId ===
                (mainParticipant.isLocal ? "local" : mainParticipant.socketId)
              }
              isPinned={
                pinnedId ===
                (mainParticipant.isLocal ? "local" : mainParticipant.socketId)
              }
              onTogglePin={() =>
                onTogglePin(
                  mainParticipant.isLocal ? "local" : mainParticipant.socketId,
                )
              }
              onFloatSelf={
                mainParticipant.isLocal ? onToggleFloatSelf : undefined
              }
            />
          </div>
        </div>

        <div className="w-full md:w-56 lg:w-64 h-32 md:h-full flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-gray-700 py-1">
          {showLocalInSidebar && (
            <div className="w-44 md:w-full h-full md:h-36 shrink-0 aspect-video">
              <VideoTile
                stream={
                  localUser.isScreenSharing
                    ? localUser.screenStream
                    : localUser.stream
                }
                isLocal={true}
                userName={localUser.name}
                avatar={localUser.avatar}
                isHost={localUser.isHost}
                isMuted={localUser.isAudioMuted}
                isVideoOff={localUser.isVideoOff && !localUser.isScreenSharing}
                isScreenSharing={localUser.isScreenSharing}
                isHandRaised={localUser.isHandRaised}
                isSpeaking={activeSpeakerId === "local"}
                isPinned={false}
                onTogglePin={() => onTogglePin("local")}
                onFloatSelf={onToggleFloatSelf}
              />
            </div>
          )}

          {secondaryPeers.map((peer) => (
            <div
              key={peer.socketId}
              className="w-44 md:w-full h-full md:h-36 shrink-0 aspect-video"
            >
              <VideoTile
                stream={peer.stream}
                isLocal={false}
                userName={peer.userName}
                avatar={peer.avatar}
                isHost={peer.isHost}
                isMuted={peer.isMuted}
                isVideoOff={peer.isVideoOff && !peer.isScreenSharing}
                isScreenSharing={peer.isScreenSharing}
                isHandRaised={peer.isHandRaised}
                isSpeaking={activeSpeakerId === peer.socketId}
                isPinned={false}
                onTogglePin={() => onTogglePin(peer.socketId)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalParticipants = (isSelfFloating ? 0 : 1) + peers.length;
  let gridLayoutClass = "grid-cols-1";

  if (totalParticipants === 2) {
    gridLayoutClass = "grid-cols-1 md:grid-cols-2";
  } else if (totalParticipants >= 3 && totalParticipants <= 4) {
    gridLayoutClass = "grid-cols-1 sm:grid-cols-2";
  } else if (totalParticipants >= 5 && totalParticipants <= 6) {
    gridLayoutClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  } else if (totalParticipants >= 7 && totalParticipants <= 9) {
    gridLayoutClass = "grid-cols-2 sm:grid-cols-3";
  } else if (totalParticipants > 9) {
    gridLayoutClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }

  return (
    <div className="w-full h-full p-2 sm:p-4 flex items-center justify-center overflow-hidden">
      <div
        className={`grid ${gridLayoutClass} gap-3 sm:gap-4 w-full h-full max-w-7xl max-h-full items-center justify-center auto-rows-fr`}
      >
        {!isSelfFloating && (
          <div className="w-full h-full min-h-0 aspect-video flex items-center justify-center">
            <VideoTile
              stream={
                localUser.isScreenSharing
                  ? localUser.screenStream
                  : localUser.stream
              }
              isLocal={true}
              userName={localUser.name}
              avatar={localUser.avatar}
              isHost={localUser.isHost}
              isMuted={localUser.isAudioMuted}
              isVideoOff={localUser.isVideoOff && !localUser.isScreenSharing}
              isScreenSharing={localUser.isScreenSharing}
              isHandRaised={localUser.isHandRaised}
              isSpeaking={activeSpeakerId === "local"}
              isPinned={pinnedId === "local"}
              onTogglePin={() => onTogglePin("local")}
              onFloatSelf={onToggleFloatSelf}
            />
          </div>
        )}

        {peers.map((peer) => (
          <div
            key={peer.socketId}
            className="w-full h-full min-h-0 aspect-video flex items-center justify-center"
          >
            <VideoTile
              stream={peer.stream}
              isLocal={false}
              userName={peer.userName}
              avatar={peer.avatar}
              isHost={peer.isHost}
              isMuted={peer.isMuted}
              isVideoOff={peer.isVideoOff && !peer.isScreenSharing}
              isScreenSharing={peer.isScreenSharing}
              isHandRaised={peer.isHandRaised}
              isSpeaking={activeSpeakerId === peer.socketId}
              isPinned={pinnedId === peer.socketId}
              onTogglePin={() => onTogglePin(peer.socketId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
