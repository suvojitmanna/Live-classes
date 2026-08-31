import React, { useState } from "react";
import {
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaCrown,
  FaSearch,
  FaLink,
  FaHandPaper,
  FaUserClock,
  FaCheck,
  FaUserMinus,
  FaEllipsisV,
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const ParticipantPanel = ({
  currentUser,
  localIsMuted,
  localIsVideoOff,
  localIsHandRaised,
  peers = [],
  pendingKnocks = [],
  onAdmit,
  onDeny,
  onControlParticipant,
  isHost,
  onClose,
  roomId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const allParticipants = [
    {
      id: "local",
      name: `${currentUser?.name || "You"} (You)`,
      avatar: currentUser?.avatar,
      isMuted: localIsMuted,
      isVideoOff: localIsVideoOff,
      isHandRaised: localIsHandRaised,
      isHost: !!isHost,
    },
    ...peers.map((p) => ({
      id: p.socketId,
      name: p.userName || "Participant",
      avatar: p.avatar,
      isMuted: p.isMuted,
      isVideoOff: p.isVideoOff,
      isHandRaised: p.isHandRaised,
      isHost: !!p.isHost,
    })),
  ];

  const filteredParticipants = allParticipants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join?roomId=${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success("Meeting link copied to clipboard 📋");
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            People
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {allParticipants.length}{" "}
            {allParticipants.length === 1 ? "person" : "people"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close people panel"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={handleCopyLink}
          className="w-full py-2.5 px-3 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-[#282a2d] dark:hover:bg-[#3c4043] border border-blue-200 dark:border-gray-700/60 text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <FaLink className="w-3 h-3" />
          <span>Add others / Copy link</span>
        </button>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3 h-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for people"
            className="w-full bg-gray-100 dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700/80 rounded-full pl-8 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isHost && pendingKnocks && pendingKnocks.length > 0 && (
          <div className="space-y-2 p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a73e8] dark:text-[#8ab4f8]">
              <FaUserClock className="w-3.5 h-3.5" />
              <span>Waiting to Join ({pendingKnocks.length})</span>
            </div>

            <div className="space-y-2">
              {pendingKnocks.map((knock) => (
                <div
                  key={knock.socketId}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#282a2d] shadow-sm border border-blue-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Avatar name={knock.userName} avatar={knock.avatar} size="sm" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {knock.userName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onAdmit?.(knock.socketId)}
                      className="p-1.5 px-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      title="Admit"
                    >
                      <FaCheck className="w-2.5 h-2.5" />
                      <span>Admit</span>
                    </button>
                    <button
                      onClick={() => onDeny?.(knock.socketId)}
                      className="p-1.5 px-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-[11px] transition-colors cursor-pointer"
                      title="Deny"
                    >
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-2 py-1 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          In-call ({filteredParticipants.length})
        </div>

        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors relative group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Avatar
                name={participant.name}
                avatar={participant.avatar}
                size="sm"
              />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {participant.name}
                  </span>
                  {participant.isHost && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-blue-900/60 text-amber-800 dark:text-blue-300 font-semibold border border-amber-300 dark:border-blue-700/50 flex items-center gap-1">
                      <FaCrown className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                      Host
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 shrink-0">
              {participant.isHandRaised && (
                <span title="Hand raised" className="text-amber-500">
                  <FaHandPaper className="w-3.5 h-3.5" />
                </span>
              )}
              {participant.isVideoOff ? (
                <FaVideoSlash
                  className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                  title="Camera off"
                />
              ) : (
                <FaVideo
                  className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300"
                  title="Camera on"
                />
              )}
              {participant.isMuted ? (
                <FaMicrophoneSlash
                  className="w-3.5 h-3.5 text-[#ea4335]"
                  title="Muted"
                />
              ) : (
                <FaMicrophone
                  className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                  title="Microphone on"
                />
              )}

              {/* Host Individual Moderation Menu */}
              {isHost && participant.id !== "local" && (
                <div className="relative ml-1">
                  <button
                    onClick={() =>
                      setActiveMenuId(
                        activeMenuId === participant.id ? null : participant.id
                      )
                    }
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                    title="Participant options"
                  >
                    <FaEllipsisV className="w-3 h-3" />
                  </button>

                  {activeMenuId === participant.id && (
                    <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-1.5 space-y-1 animate-fade-in text-xs">
                      <button
                        onClick={() => {
                          onControlParticipant?.(participant.id, "mute");
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-left transition-colors cursor-pointer"
                      >
                        <FaMicrophoneSlash className="w-3.5 h-3.5 text-red-500" />
                        <span>Mute participant</span>
                      </button>

                      <button
                        onClick={() => {
                          onControlParticipant?.(participant.id, "stop-video");
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-left transition-colors cursor-pointer"
                      >
                        <FaVideoSlash className="w-3.5 h-3.5 text-amber-500" />
                        <span>Turn off camera</span>
                      </button>

                      <button
                        onClick={() => {
                          onControlParticipant?.(participant.id, "kick");
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left transition-colors cursor-pointer font-medium"
                      >
                        <FaUserMinus className="w-3.5 h-3.5" />
                        <span>Remove from call</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ParticipantPanel;
