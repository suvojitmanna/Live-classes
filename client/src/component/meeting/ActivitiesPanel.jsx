import React, { useState } from "react";
import {
  FaTimes,
  FaShapes,
  FaChartBar,
  FaPencilAlt,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ActivitiesPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("menu");
  const [polls, setPolls] = useState([
    {
      id: "poll_1",
      question: "Is this meeting helpful?",
      options: [
        { text: "Very helpful", votes: 4 },
        { text: "Helpful", votes: 2 },
        { text: "Could be improved", votes: 0 },
      ],
      userVoted: null,
    },
  ]);

  const handleVote = (pollId, optIndex) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.userVoted !== null) return poll;
        const updatedOptions = [...poll.options];
        updatedOptions[optIndex] = {
          ...updatedOptions[optIndex],
          votes: updatedOptions[optIndex].votes + 1,
        };
        toast.success("Vote recorded! 🗳️");
        return { ...poll, options: updatedOptions, userVoted: optIndex };
      }),
    );
  };

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white dark:bg-[#202124] text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-80px)] z-30 shadow-2xl shrink-0 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaShapes className="text-[#1a73e8] dark:text-[#8ab4f8]" />
          <h2 className="font-semibold text-base text-gray-900 dark:text-gray-200">
            Activities
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Close activities"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        {activeTab === "menu" && (
          <div className="space-y-3">
            {/* Whiteboarding */}
            <button
              onClick={() => setActiveTab("whiteboard")}
              className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#282a2d] dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/60 text-left flex items-start gap-3 transition-colors shadow-sm cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 mt-0.5">
                <FaPencilAlt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Whiteboarding
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Brainstorm and collaborate with interactive sketching
                </div>
              </div>
            </button>

            {/* Polls */}
            <button
              onClick={() => setActiveTab("polls")}
              className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#282a2d] dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/60 text-left flex items-start gap-3 transition-colors shadow-sm cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <FaChartBar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Polls
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Launch interactive polls and collect quick feedback
                </div>
              </div>
            </button>
          </div>
        )}

        {/* POLLS TAB */}
        {activeTab === "polls" && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("menu")}
              className="text-xs text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-semibold cursor-pointer"
            >
              ← Back to activities
            </button>

            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Active Polls
            </h3>

            {polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (acc, o) => acc + o.votes,
                0,
              );

              return (
                <div
                  key={poll.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/70 space-y-3"
                >
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {poll.question}
                  </div>
                  <div className="space-y-2">
                    {poll.options.map((opt, optIdx) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round((opt.votes / totalVotes) * 100)
                          : 0;

                      return (
                        <button
                          key={optIdx}
                          disabled={poll.userVoted !== null}
                          onClick={() => handleVote(poll.id, optIdx)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-all relative overflow-hidden border cursor-pointer ${
                            poll.userVoted === optIdx
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {/* Progress bar fill */}
                          <div
                            className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/20 pointer-events-none transition-all"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative flex justify-between items-center z-10">
                            <div className="flex items-center gap-1.5">
                              {poll.userVoted === optIdx && (
                                <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 w-3 h-3" />
                              )}
                              <span>{opt.text}</span>
                            </div>
                            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                              {pct}% ({opt.votes})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WHITEBOARD TAB */}
        {activeTab === "whiteboard" && (
          <div className="space-y-4 text-center">
            <button
              onClick={() => setActiveTab("menu")}
              className="text-xs text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-semibold block text-left cursor-pointer"
            >
              ← Back to activities
            </button>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700 space-y-3">
              <FaPencilAlt className="w-8 h-8 text-[#1a73e8] dark:text-[#8ab4f8] mx-auto" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Live Whiteboard
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share your screen and open the canvas to sketch diagrams with
                your team.
              </p>
              <button
                onClick={() => {
                  window.open("https://excalidraw.com", "_blank");
                  toast.success(
                    "Opened collaboration whiteboard in new tab 🎨",
                  );
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs transition-colors shadow-md cursor-pointer"
              >
                Launch Whiteboard
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ActivitiesPanel;
