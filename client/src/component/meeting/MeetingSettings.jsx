import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaMicrophone,
  FaVideo,
  FaCog,
  FaMoon,
  FaSun,
  FaDesktop,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const MeetingSettings = ({
  isOpen,
  onClose,
  devices = { audioInputs: [], videoInputs: [], audioOutputs: [] },
  selectedDevices = { audioInput: "", videoInput: "", audioOutput: "" },
  setSelectedDevices,
  onDeviceChange,
  localStream,
}) => {
  const [activeTab, setActiveTab] = useState("audio");
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();

  const [reduceAnimations, setReduceAnimations] = useState(() => {
    return localStorage.getItem("reduce_animations") === "true";
  });
  const [audioLevel, setAudioLevel] = useState(0);

  const previewVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (activeTab === "video" && previewVideoRef.current && localStream) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [activeTab, localStream]);

  useEffect(() => {
    if (!isOpen || activeTab !== "audio" || !localStream) return;

    try {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      const source = audioCtx.createMediaStreamSource(localStream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };

      animFrameRef.current = requestAnimationFrame(checkLevel);
    } catch (err) {
      console.warn("Audio meter error:", err);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, activeTab, localStream]);

  const handleAnimationToggle = () => {
    const next = !reduceAnimations;
    setReduceAnimations(next);
    localStorage.setItem("reduce_animations", String(next));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#202124] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Settings
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
          <button
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "audio"
                ? "border-[#1a73e8] text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FaMicrophone className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "video"
                ? "border-[#1a73e8] text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FaVideo className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "general"
                ? "border-[#1a73e8] text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <FaCog className="w-3.5 h-3.5" />
            <span>General</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "audio" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Microphone
                </label>
                <select
                  value={selectedDevices.audioInput}
                  onChange={(e) => {
                    setSelectedDevices((prev) => ({
                      ...prev,
                      audioInput: e.target.value,
                    }));
                    onDeviceChange?.("audioInput", e.target.value);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8]"
                >
                  {devices.audioInputs.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  <span>Microphone level</span>
                  <span className="text-gray-500 font-mono text-[10px]">
                    {audioLevel > 5 ? "Speaking..." : "Silent"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#1a73e8] dark:to-[#8ab4f8] transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(4, audioLevel)}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Speakers
                </label>
                <select
                  value={selectedDevices.audioOutput}
                  onChange={(e) => {
                    setSelectedDevices((prev) => ({
                      ...prev,
                      audioOutput: e.target.value,
                    }));
                    onDeviceChange?.("audioOutput", e.target.value);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8]"
                >
                  {devices.audioOutputs.length > 0 ? (
                    devices.audioOutputs.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Speaker ${i + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Speaker</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Camera
                </label>
                <select
                  value={selectedDevices.videoInput}
                  onChange={(e) => {
                    setSelectedDevices((prev) => ({
                      ...prev,
                      videoInput: e.target.value,
                    }));
                    onDeviceChange?.("videoInput", e.target.value);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#282a2d] border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-gray-200 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8]"
                >
                  {devices.videoInputs.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Camera preview
                </div>
                <div className="w-full h-44 bg-gray-900 dark:bg-[#282a2d] rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Theme Appearance
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-[#8ab4f8] bg-blue-100 dark:bg-[#8ab4f8]/10 px-2 py-0.5 rounded-full">
                    {themeMode} ({effectiveTheme})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-gray-200 dark:bg-[#202124] p-1.5 rounded-xl border border-gray-300 dark:border-gray-800">
                  <button
                    onClick={() => setThemeMode("system")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      themeMode === "system"
                        ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <FaDesktop className="w-3.5 h-3.5" />
                    <span>System Default</span>
                  </button>

                  <button
                    onClick={() => setThemeMode("dark")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      themeMode === "dark"
                        ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <FaMoon className="w-3.5 h-3.5" />
                    <span>Dark Mode</span>
                  </button>

                  <button
                    onClick={() => setThemeMode("light")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      themeMode === "light"
                        ? "bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <FaSun className="w-3.5 h-3.5" />
                    <span>Light Mode</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Reduce animations
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Optimize for low-power hardware
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={reduceAnimations}
                  onChange={handleAnimationToggle}
                  className="w-4 h-4 accent-[#1a73e8] rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#a8c7fa] text-white dark:text-[#202124] font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingSettings;
