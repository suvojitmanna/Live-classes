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
} from "react-icons/fa";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

const ParticipantPanel = ({
  currentUser,
  localIsMuted,
  localIsVideoOff,
  localIsHandRaised,
  peers = [],
  hostName,
  onClose,
  roomId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allParticipants = [
    {
      id: "local",
      name: `${currentUser?.name || "You"} (You)`,
      avatar: currentUser?.avatar,
      isMuted: localIsMuted,
      isVideoOff: localIsVideoOff,
      isHandRaised: localIsHandRaised,
      isHost: hostName ? currentUser?.name === hostName : true,
    },
    ...peers.map((p) => ({
      id: p.socketId,
      name: p.userName || "Participant",
      avatar: p.avatar,
      isMuted: p.isMuted,
      isVideoOff: p.isVideoOff,
      isHandRaised: p.isHandRaised,
      isHost: hostName ? p.userName === hostName : !!p.isHost,
    })),
  ];

  const filteredParticipants = allParticipants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
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

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
          In-call ({filteredParticipants.length})
        </div>

        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors"
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
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ParticipantPanel;
