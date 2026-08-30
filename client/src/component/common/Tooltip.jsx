import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Tooltip = ({
  text,
  shortcut,
  children,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none whitespace-nowrap bg-[#282a2d] text-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-xl border border-gray-700/60 flex items-center gap-1.5`}
          >
            <span>{text}</span>
            {shortcut && (
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-gray-800 text-gray-400 rounded border border-gray-600">
                {shortcut}
              </kbd>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
