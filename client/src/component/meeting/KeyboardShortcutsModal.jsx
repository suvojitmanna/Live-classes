import React from "react";
import Modal from "../common/Modal";

const KEYBOARD_SHORTCUTS = [
  { key: "Ctrl + D", description: "Turn microphone on or off" },
  { key: "Ctrl + E", description: "Turn camera on or off" },
  { key: "Ctrl + H", description: "Raise or lower your hand" },
  { key: "Esc", description: "Close modal or side panel" },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts">
      <div className="space-y-3">
        {KEYBOARD_SHORTCUTS.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#282a2d] border border-gray-200 dark:border-gray-700/60"
          >
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {item.description}
            </span>
            <kbd className="px-2.5 py-1 text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-[#1a73e8] dark:text-[#8ab4f8] rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
