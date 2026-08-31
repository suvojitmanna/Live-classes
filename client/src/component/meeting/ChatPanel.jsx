import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane, FaComments } from "react-icons/fa";
import Avatar from "../common/Avatar";

const ChatPanel = ({
  messages = [],
  onSendMessage,
  onClose,
  currentUserId,
  isHost = false,
  roomPermissions = { allowChat: true },
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const isChatDisabled = !isHost && roomPermissions.allowChat === false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isChatDisabled) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaComments className="text-[#1a73e8] dark:text-[#8ab4f8]" />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            In-call messages
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close chat"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      <div className="mx-4 mt-3 p-3 rounded-xl bg-gray-100 dark:bg-[#282a2d]/70 border border-gray-200 dark:border-gray-700/40 text-[11px] text-gray-600 dark:text-gray-400">
        Messages can be seen only by people in the call and are deleted when the
        call ends.
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-xs text-center px-4">
            <FaComments className="w-8 h-8 mb-2 opacity-30 text-gray-400" />
            <p>No messages yet.</p>
            <p className="mt-1 text-gray-500 dark:text-gray-600">
              Send a message to everyone in the meeting.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSelf =
              msg.sender?.id === currentUserId ||
              msg.sender?._id === currentUserId ||
              msg.sender?.name === "You";

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                {!isSelf && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <Avatar
                      name={msg.sender?.name}
                      avatar={msg.sender?.avatar}
                      size="sm"
                    />
                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      {msg.sender?.name || "Participant"}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs break-words shadow-sm ${
                    isSelf
                      ? "bg-[#1a73e8] text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-[#3c4043] text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-transparent"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {isSelf && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 px-1">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#202124]"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            disabled={isChatDisabled}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isChatDisabled
                ? "Chat is disabled by the host 🔒"
                : "Send a message to everyone"
            }
            className={`w-full border rounded-full pl-4 pr-11 py-2.5 text-xs placeholder-gray-500 focus:outline-none transition-all ${
              isChatDisabled
                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                : "bg-gray-100 dark:bg-[#282a2d] border-gray-300 dark:border-gray-700/80 text-gray-900 dark:text-white focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8]"
            }`}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isChatDisabled}
            className="absolute right-1.5 p-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white disabled:bg-gray-200 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:hover:scale-100"
            aria-label="Send message"
          >
            <FaPaperPlane className="w-3 h-3" />
          </button>
        </div>
      </form>
    </aside>
  );
};

export default ChatPanel;
