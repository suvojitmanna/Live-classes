import React, { useState, useRef, useEffect } from "react";
import Modal from "../common/Modal";
import {
  FaBan,
  FaMagic,
  FaCheck,
  FaPlus,
  FaImage,
  FaPalette,
  FaBuilding,
  FaTree,
  FaVideo,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  BACKGROUND_PRESETS,
  VideoBackgroundProcessor,
} from "../../utils/videoBackgroundProcessor";

const CATEGORIES = [
  { id: "all", name: "All Effects", icon: FaMagic },
  { id: "blur", name: "Blur", icon: FaMagic },
  { id: "remove", name: "Remove / Solid", icon: FaPalette },
  { id: "office", name: "Offices & Rooms", icon: FaBuilding },
  { id: "scenery", name: "Nature & City", icon: FaTree },
];

const VisualEffectsModal = ({
  isOpen,
  onClose,
  selectedEffect = "none",
  onSelectEffect,
  localStream,
}) => {
  const [current, setCurrent] = useState(selectedEffect);
  const [activeTab, setActiveTab] = useState("all");
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const fileInputRef = useRef(null);

  const previewVideoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const processorRef = useRef(null);

  useEffect(() => {
    setCurrent(selectedEffect);
  }, [selectedEffect]);

  // Handle custom image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const customId = `custom-${Date.now()}`;
      const newCustomBg = {
        id: customId,
        name: file.name.replace(/\.[^/.]+$/, "").slice(0, 15),
        category: "custom",
        type: "image",
        imageUrl: event.target.result,
        thumbnailUrl: event.target.result,
        description: "Custom uploaded wallpaper",
        isCustom: true,
      };

      setCustomBackgrounds((prev) => [newCustomBg, ...prev]);
      handleApply(customId, newCustomBg);
      toast.success("Custom background uploaded & applied! 🎨");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleApply = (effectId, customObj = null) => {
    setCurrent(effectId);
    if (customObj) {
      onSelectEffect?.(customObj);
    } else {
      const preset = BACKGROUND_PRESETS.find((p) => p.id === effectId);
      onSelectEffect?.(preset || effectId);
    }
    toast.success("Background effect updated ✨", { id: "bg-toast", duration: 1500 });
  };

  const allPresets = [...customBackgrounds, ...BACKGROUND_PRESETS];
  const filteredPresets =
    activeTab === "all"
      ? allPresets
      : allPresets.filter((p) => p.category === activeTab);

  const activePreset = allPresets.find((p) => p.id === current) || BACKGROUND_PRESETS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Background Effects & Virtual Presets"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Apply background blur, clean solid backdrops, or realistic virtual rooms.
          </p>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1a73e8] dark:text-[#8ab4f8] text-xs font-semibold border border-blue-200 dark:border-blue-800/40 transition-all cursor-pointer shadow-sm"
            >
              <FaPlus className="w-2.5 h-2.5" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${isActive
                  ? "bg-[#1a73e8] text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredPresets.map((preset) => {
            const isSelected = current === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApply(preset.id, preset.isCustom ? preset : null)}
                className={`group relative flex flex-col rounded-2xl border text-left overflow-hidden transition-all p-1.5 cursor-pointer ${isSelected
                  ? "border-[#1a73e8] dark:border-[#8ab4f8] bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-[#1a73e8]/50 shadow-md"
                  : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#202124] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-[#282a2d]"
                  }`}
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center bg-gray-900 shadow-inner">
                  {preset.type === "none" ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-[#1a1c1e] flex flex-col items-center justify-center text-gray-500">
                      <FaBan className="w-5 h-5 mb-1 opacity-70" />
                      <span className="text-[10px] font-medium">Off</span>
                    </div>
                  ) : preset.type === "blur" ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-blue-900 via-indigo-900 to-purple-900">
                      <div className={`absolute inset-0 ${preset.blurAmount > 15 ? "backdrop-blur-md" : "backdrop-blur-sm"} bg-white/10`} />
                      <div className="relative z-10 flex flex-col items-center text-white">
                        <FaMagic className="w-4 h-4 mb-0.5 text-blue-300 animate-pulse" />
                        <span className="text-[10px] font-semibold">{preset.blurAmount > 15 ? "Heavy" : "Slight"}</span>
                      </div>
                    </div>
                  ) : preset.type === "color" ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: preset.color }}
                    >
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-md bg-black/40 text-white"
                      >
                        {preset.name}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={preset.thumbnailUrl || preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}

                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
                      <FaCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="p-1.5 pt-2">
                  <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {preset.description || preset.type}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>Active:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {activePreset.name}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#a8c7fa] text-white dark:text-[#202124] font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VisualEffectsModal;
