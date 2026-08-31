import React, { useState, useEffect, useRef } from "react";
import { FaClosedCaptioning, FaMicrophoneSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../../service/socket";

const MeetingCaptions = ({
  isEnabled,
  userName = "You",
  roomId,
  isAudioMuted = false,
  localStream = null,
}) => {
  const [currentCaption, setCurrentCaption] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const clearTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // 1. Listen for real-time captions and chat messages from anyone in the room
  useEffect(() => {
    if (!isEnabled || !roomId) return;

    const socket = getSocket();

    const handleCaptionUpdate = (captionData) => {
      if (!captionData || !captionData.text) return;
      setCurrentCaption(captionData);

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setCurrentCaption(null);
        }
      }, 6000);
    };

    const handleChatMessage = (msg) => {
      if (msg && msg.text) {
        handleCaptionUpdate({
          text: msg.text,
          userName: msg.sender?.name || "Participant",
          timestamp: Date.now(),
        });
      }
    };

    socket.on("caption-update", handleCaptionUpdate);
    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("caption-update", handleCaptionUpdate);
      socket.off("chat-message", handleChatMessage);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [isEnabled, roomId]);

  // 2. Real-time microphone audio volume meter using Web Audio API on localStream
  useEffect(() => {
    if (!isEnabled || isAudioMuted || !localStream) {
      setAudioLevel(0);
      return;
    }

    let audioCtx;
    let analyser;
    let microphone;
    let scriptNode;
    let isCancelled = false;

    try {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0 && audioTracks[0].enabled) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        microphone = audioCtx.createMediaStreamSource(localStream);
        scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 512;

        microphone.connect(analyser);
        analyser.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);

        scriptNode.onaudioprocess = () => {
          if (isCancelled) return;
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let sum = 0;
          for (let i = 0; i < array.length; i++) {
            sum += array[i];
          }
          const avg = sum / array.length;
          const level = Math.min(100, Math.round(avg * 2.2));
          setAudioLevel(level);
        };
      }
    } catch (e) {
      console.warn("Audio meter init notice:", e);
    }

    return () => {
      isCancelled = true;
      if (scriptNode) scriptNode.disconnect();
      if (microphone) microphone.disconnect();
      if (analyser) analyser.disconnect();
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isEnabled, isAudioMuted, localStream]);

  // 3. Web Speech Recognition
  useEffect(() => {
    isMountedRef.current = true;

    if (!isEnabled) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setCurrentCaption(null);
      setSpeechError(null);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setSpeechError(null);

    if (isAudioMuted) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    let recognition;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || "en-US";

      recognition.onstart = () => {
        if (isMountedRef.current) {
          setSpeechError(null);
        }
      };

      recognition.onresult = (event) => {
        if (!event.results || event.results.length === 0) return;

        let accumulated = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0] && item[0].transcript) {
            accumulated += item[0].transcript + " ";
          }
        }

        const trimmed = accumulated.trim();
        if (trimmed) {
          const captionPayload = {
            text: trimmed,
            userName: userName || "You",
            timestamp: Date.now(),
          };

          setCurrentCaption(captionPayload);

          const socket = getSocket();
          if (socket.connected && roomId) {
            socket.emit("send-caption", {
              roomId,
              text: trimmed,
              userName: userName || "You",
            });
          }

          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          clearTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setCurrentCaption(null);
            }
          }, 5500);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") return;

        console.warn("Speech recognition notice:", event.error);
        if (isMountedRef.current) {
          if (event.error === "not-allowed") {
            setSpeechError("Microphone permission required for speech recognition.");
          } else if (event.error === "audio-capture") {
            setSpeechError("Microphone in use by another application.");
          } else if (event.error === "network") {
            setSpeechError("Speech service network timeout. Reconnecting...");
          }
        }
      };

      recognition.onend = () => {
        if (isMountedRef.current) {
          if (isEnabled && !isAudioMuted) {
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              try {
                if (isMountedRef.current && isEnabled && !isAudioMuted && recognitionRef.current) {
                  recognitionRef.current.start();
                }
              } catch (e) {}
            }, 400);
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Captions initialize notice:", err.message);
    }

    return () => {
      isMountedRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isEnabled, isAudioMuted, userName, roomId]);

  if (!isEnabled) return null;

  const isSpeaking = audioLevel > 8;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        {currentCaption && currentCaption.text ? (
          <motion.div
            key={currentCaption.text}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bg-black/90 dark:bg-[#1a1a1c]/95 backdrop-blur-xl text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl border border-gray-700/60 flex items-start gap-3 max-w-xl w-full"
          >
            <div className="flex items-center gap-1.5 text-[#8ab4f8] font-bold shrink-0 mt-0.5 text-xs">
              <FaClosedCaptioning className="w-4 h-4 text-blue-400" />
              <span>{currentCaption.userName}:</span>
            </div>
            <p className="text-gray-100 italic leading-relaxed break-words flex-1">
              "{currentCaption.text}"
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-black/80 dark:bg-[#202124]/90 backdrop-blur-md text-gray-200 text-xs px-4 py-2 rounded-full border border-gray-700/50 flex items-center gap-2.5 shadow-lg max-w-lg truncate"
          >
            <FaClosedCaptioning className="w-3.5 h-3.5 text-blue-400 shrink-0" />

            {!isSupported ? (
              <span className="text-amber-300 truncate">
                Live captions not supported on this browser (use Chrome or Edge)
              </span>
            ) : speechError ? (
              <span className="text-amber-300 truncate">
                {speechError}
              </span>
            ) : isAudioMuted ? (
              <span className="flex items-center gap-1.5 text-amber-300">
                <FaMicrophoneSlash className="w-3 h-3 text-red-400 shrink-0" />
                <span>Captions on • Your mic is muted</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-300">
                {isSpeaking ? (
                  <span className="flex items-center gap-1 text-green-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    <span>[Speaking: {userName}]</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                    <span>Live captions on • Speak into your mic to see subtitles</span>
                  </span>
                )}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingCaptions;
