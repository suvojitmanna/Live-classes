import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingReactions = ({ reactions = [] }) => {
  return (
    <div className="fixed bottom-24 left-6 pointer-events-none z-50 flex flex-col gap-2">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 40, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1.15 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="flex items-center gap-2 bg-[#282a2d]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-700/60 shadow-2xl"
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="text-xs font-semibold text-gray-200">
              {r.userName}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingReactions;
