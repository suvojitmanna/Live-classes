import React, { useState } from "react";
import Modal from "../common/Modal";
import { FaPhoneSlash, FaBan, FaClock } from "react-icons/fa";

const LeaveConfirmModal = ({
  isOpen,
  onClose,
  onConfirmLeave,
  onEndMeetingForEveryone,
  onSetLinkExpiration,
  roomId,
  isHost,
}) => {
  const [expirationMinutes, setExpirationMinutes] = useState(0);

  const handleEndWithExpiration = () => {
    if (onSetLinkExpiration && roomId) {
      onSetLinkExpiration(roomId, expirationMinutes);
    }
    if (onEndMeetingForEveryone) {
      onEndMeetingForEveryone();
    } else {
      onConfirmLeave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHost ? "Host: End or leave meeting?" : "Leave meeting?"}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {isHost
            ? "As the meeting host, you can leave the call, end the meeting for all participants, or configure a link expiration limit to disable this link."
            : "Are you sure you want to leave this call? You can rejoin at any time using the meeting code."}
        </p>

        {isHost && (
          <div className="p-3.5 bg-gray-50 dark:bg-[#282a2d] rounded-2xl border border-gray-200 dark:border-gray-700/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
              <FaClock className="text-[#1a73e8] dark:text-[#8ab4f8] w-3.5 h-3.5" />
              <span>Link Expiration Limit</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-gray-500 dark:text-gray-400">
                After ending, disable this meeting link:
              </label>
              <select
                value={expirationMinutes}
                onChange={(e) => setExpirationMinutes(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#202124] border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8]"
              >
                <option value={0}>Disable link immediately</option>
                <option value={15}>Disable after 15 minutes</option>
                <option value={60}>Disable after 1 hour</option>
                <option value={1440}>Disable after 24 hours</option>
                <option value={-1}>Keep link active</option>
              </select>
            </div>
          </div>
        )}

        <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {isHost && (
            <button
              onClick={handleEndWithExpiration}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <FaBan className="w-3.5 h-3.5" />
              <span>End & Disable Link</span>
            </button>
          )}

          <button
            onClick={onConfirmLeave}
            className="px-5 py-2.5 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <FaPhoneSlash className="w-3 h-3" />
            <span>Just leave</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveConfirmModal;
