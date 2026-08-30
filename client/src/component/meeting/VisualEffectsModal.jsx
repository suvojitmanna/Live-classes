import React, { useState } from "react";
import Modal from "../common/Modal";
import { FaBan, FaMagic, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";

const EFFECTS = [
  {
    id: "none",
    name: "No effect",
    icon: FaBan,
    preview: "bg-gray-300 dark:bg-gray-800",
  },
  {
    id: "slight-blur",
    name: "Slight blur",
    icon: FaMagic,
    preview: "backdrop-blur-sm bg-blue-400/40 dark:bg-blue-900/40",
  },
  {
    id: "heavy-blur",
    name: "Heavy blur",
    icon: FaMagic,
    preview: "backdrop-blur-md bg-purple-400/40 dark:bg-purple-900/40",
  },
  {
    id: "office",
    name: "Modern Office",
    preview:
      "bg-gradient-to-tr from-slate-400 to-slate-600 dark:from-slate-800 dark:to-slate-600",
  },
  {
    id: "cafe",
    name: "Cozy Cafe",
    preview:
      "bg-gradient-to-tr from-amber-300 to-amber-700 dark:from-amber-950 dark:to-stone-800",
  },
  {
    id: "sunset",
    name: "Sunset Horizon",
    preview:
      "bg-gradient-to-tr from-orange-400 to-indigo-600 dark:from-orange-800 dark:to-indigo-900",
  },
];

const VisualEffectsModal = ({
  isOpen,
  onClose,
  selectedEffect = "none",
  onSelectEffect,
}) => {
  const [current, setCurrent] = useState(selectedEffect);

  const handleApply = (effectId) => {
    setCurrent(effectId);
    onSelectEffect?.(effectId);
    toast.success("Visual effect applied ✨");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Visual effects & backgrounds"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Personalize your video stream with background blur and virtual
          presets.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EFFECTS.map((eff) => (
            <button
              key={eff.id}
              onClick={() => handleApply(eff.id)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 relative overflow-hidden cursor-pointer ${
                current === eff.id
                  ? "border-[#1a73e8] bg-blue-50 text-[#1a73e8] dark:border-[#8ab4f8] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] ring-2 ring-[#1a73e8]/50"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282a2d] hover:bg-gray-100 dark:hover:bg-[#3c4043] text-gray-800 dark:text-gray-300"
              }`}
            >
              <div
                className={`w-full h-12 rounded-xl ${eff.preview} flex items-center justify-center`}
              >
                {current === eff.id && (
                  <FaCheck className="text-white w-4 h-4" />
                )}
              </div>
              <span className="text-xs font-medium">{eff.name}</span>
            </button>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#a8c7fa] text-white dark:text-[#202124] font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VisualEffectsModal;
