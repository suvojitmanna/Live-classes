import React, { useState } from "react";
import {
  FaTimes,
  FaShapes,
  FaChartBar,
  FaPencilAlt,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaLock,
  FaPlay,
  FaStop,
  FaVoteYea,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ActivitiesPanel = ({
  polls = [],
  onCreatePoll,
  onVotePoll,
  onClosePoll,
  onDeletePoll,
  isHost = false,
  currentUserId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("menu");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error("Maximum 6 options allowed per poll");
      return;
    }
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      toast.error("A poll must have at least 2 options");
      return;
    }
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleLaunchPoll = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("Please enter a poll question");
      return;
    }

    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 non-empty options");
      return;
    }

    onCreatePoll?.(question.trim(), validOptions);
    setQuestion("");
    setOptions(["", ""]);
    setActiveTab("polls");
  };

  const handleSelectOption = (pollId, optionIndex) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [pollId]: optionIndex,
    }));
  };

  const handleSubmitVote = (pollId) => {
    const optIdx = selectedOptions[pollId];
    if (optIdx === undefined) {
      toast.error("Please select an option to vote");
      return;
    }
    onVotePoll?.(pollId, optIdx);
  };

  const myIdStr = (currentUserId || "").toString();

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
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {activeTab === "menu" && (
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("polls")}
              className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#282a2d] dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/60 text-left flex items-start justify-between transition-colors shadow-sm cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <FaChartBar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] transition-colors">
                    Polls & Voting
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Launch live polls and collect instant participant feedback
                  </div>
                </div>
              </div>

              {polls.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  {polls.length}
                </span>
              )}
            </button>

            {/* Whiteboard Card */}
            <button
              onClick={() => setActiveTab("whiteboard")}
              className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#282a2d] dark:hover:bg-[#3c4043] border border-gray-200 dark:border-gray-700/60 text-left flex items-start gap-3 transition-colors shadow-sm cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-[#1a73e8] dark:text-[#8ab4f8] mt-0.5">
                <FaPencilAlt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] transition-colors">
                  Whiteboarding
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Brainstorm and collaborate with interactive sketching
                </div>
              </div>
            </button>
          </div>
        )}

        {/* POLLS TAB */}
        {activeTab === "polls" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab("menu")}
                className="text-xs text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-semibold cursor-pointer"
              >
                ← Back to activities
              </button>

              {isHost && (
                <button
                  onClick={() => setActiveTab("create_poll")}
                  className="px-3 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <FaPlus className="w-2.5 h-2.5" />
                  <span>Create a Poll</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Live Polls ({polls.length})
              </h3>
            </div>

            {polls.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60 space-y-3">
                <FaChartBar className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto opacity-50" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  No polls active yet
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isHost
                    ? "Click 'Create a Poll' above to launch a question for participants."
                    : "When the host launches a poll, it will appear here for you to vote."}
                </p>
                {isHost && (
                  <button
                    onClick={() => setActiveTab("create_poll")}
                    className="mt-2 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FaPlus className="w-2.5 h-2.5" />
                    <span>Create First Poll</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {polls.map((poll) => {
                  const totalVotes = poll.options.reduce(
                    (acc, o) => acc + (o.votes || 0),
                    0
                  );

                  // Has the current user voted on this poll?
                  const userVotedOptionIndex = poll.options.findIndex((opt) =>
                    opt.voters?.some((v) => v.toString() === myIdStr)
                  );
                  const hasVoted = userVotedOptionIndex !== -1;
                  const showResults = hasVoted || isHost || !poll.isActive;

                  return (
                    <div
                      key={poll.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/70 space-y-3 shadow-sm"
                    >
                      {/* Poll Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${poll.isActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            >
                              {poll.isActive ? "🟢 Active" : "🛑 Ended"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              by {poll.createdBy?.name || "Host"}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {poll.question}
                          </h4>
                        </div>

                        {/* Host Poll Actions */}
                        {isHost && (
                          <div className="flex items-center gap-1 shrink-0">
                            {poll.isActive && (
                              <button
                                onClick={() => onClosePoll?.(poll.id)}
                                className="p-1.5 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="End poll"
                              >
                                <FaStop className="w-2 h-2" />
                                <span>End</span>
                              </button>
                            )}
                            <button
                              onClick={() => onDeletePoll?.(poll.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-red-500 transition-colors cursor-pointer"
                              title="Delete poll"
                            >
                              <FaTrash className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Poll Options (Results view or Voting view) */}
                      {showResults ? (
                        <div className="space-y-2">
                          {poll.options.map((opt, optIdx) => {
                            const pct =
                              totalVotes > 0
                                ? Math.round(((opt.votes || 0) / totalVotes) * 100)
                                : 0;
                            const isMyChoice = userVotedOptionIndex === optIdx;

                            return (
                              <div
                                key={opt.id || optIdx}
                                className={`w-full p-2.5 rounded-xl text-left text-xs transition-all relative overflow-hidden border ${isMyChoice
                                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 text-gray-800 dark:text-gray-200"
                                  }`}
                              >
                                {/* Percentage fill bar */}
                                <div
                                  className={`absolute inset-0 pointer-events-none transition-all duration-500 ${isMyChoice
                                      ? "bg-emerald-500/20 dark:bg-emerald-500/30"
                                      : "bg-blue-500/15 dark:bg-blue-600/20"
                                    }`}
                                  style={{ width: `${pct}%` }}
                                />

                                <div className="relative flex justify-between items-center z-10">
                                  <div className="flex items-center gap-1.5 truncate mr-2">
                                    {isMyChoice && (
                                      <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 w-3 h-3 shrink-0" />
                                    )}
                                    <span className="truncate">{opt.text}</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 shrink-0 font-bold">
                                    {pct}% ({opt.votes || 0})
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1">
                            <span>
                              {totalVotes} {totalVotes === 1 ? "vote" : "votes"} recorded
                            </span>
                            {hasVoted && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                ✓ You voted
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Voting Mode for Participant
                        <div className="space-y-2.5">
                          <div className="space-y-1.5">
                            {poll.options.map((opt, optIdx) => {
                              const isSelected =
                                selectedOptions[poll.id] === optIdx;

                              return (
                                <button
                                  key={opt.id || optIdx}
                                  type="button"
                                  onClick={() =>
                                    handleSelectOption(poll.id, optIdx)
                                  }
                                  className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center gap-2.5 border transition-all cursor-pointer ${isSelected
                                      ? "border-[#1a73e8] bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200"
                                    }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                                        ? "border-[#1a73e8] bg-[#1a73e8]"
                                        : "border-gray-400 dark:border-gray-500"
                                      }`}
                                  >
                                    {isSelected && (
                                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <span className="truncate">{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => handleSubmitVote(poll.id)}
                            disabled={selectedOptions[poll.id] === undefined}
                            className="w-full py-2 px-4 rounded-xl bg-[#1a73e8] disabled:bg-gray-300 dark:disabled:bg-gray-700 hover:bg-[#1557b0] text-white disabled:text-gray-500 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <FaVoteYea className="w-3.5 h-3.5" />
                            <span>Submit Vote 🗳️</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE POLL TAB (Host only) */}
        {activeTab === "create_poll" && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab("polls")}
              className="text-xs text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-semibold cursor-pointer"
            >
              ← Back to polls
            </button>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/70 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <FaChartBar className="text-[#1a73e8] dark:text-[#8ab4f8] w-4 h-4" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Create a New Poll
                </h3>
              </div>

              <form onSubmit={handleLaunchPoll} className="space-y-3.5">
                {/* Question */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Question
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Should we extend the class by 15 mins?"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#1a73e8]"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    Options
                  </label>

                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8]"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <FaPlus className="w-2.5 h-2.5" />
                      <span>Add option</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setActiveTab("polls")}
                    className="flex-1 py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FaPlay className="w-2.5 h-2.5" />
                    <span>Launch Poll</span>
                  </button>
                </div>
              </form>
            </div>
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
                    "Opened collaboration whiteboard in new tab 🎨"
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
