import React, { useState, useEffect, useRef } from "react";
import { FaClosedCaptioning } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MeetingCaptions = ({ isEnabled, userName = "You" }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log(e);
        }
      }
      setTranscript("");
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTranscript(
        "Live captioning is not supported on this browser (supported on Chrome/Edge).",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
      };

      recognition.onend = () => {
        if (isEnabled) {
          try {
            recognition.start();
          } catch (e) {
            console.log(e);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Captions error:", err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log(e);
        }
      }
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[90%] pointer-events-none">
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-black/85 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-700/60 flex items-start gap-2.5"
          >
            <div className="flex items-center gap-1.5 text-[#8ab4f8] font-bold shrink-0 mt-0.5 text-xs">
              <FaClosedCaptioning className="w-3.5 h-3.5" />
              <span>{userName}:</span>
            </div>
            <p className="text-gray-100 italic leading-relaxed">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingCaptions;
