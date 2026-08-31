import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const isRecognizingRef = useRef(false);
  const manualStopRef = useRef(false);

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
      }, 5500);
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
      console.warn("Audio meter notice:", e);
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

  const startRecognition = useCallback(() => {
    if (!isMountedRef.current || !isEnabled || isAudioMuted) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        manualStopRef.current = true;
        recognitionRef.current.abort();
      } catch (e) {
        console.log(e);
      }
      recognitionRef.current = null;
    }

    try {
      manualStopRef.current = false;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || "en-US";

      recognition.onstart = () => {
        isRecognizingRef.current = true;
        if (isMountedRef.current) {
          setSpeechError(null);
        }
      };

      recognition.onresult = (event) => {
        if (!event.results || event.results.length === 0) return;

        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res && res[0] && res[0].transcript) {
            if (res.isFinal) {
              final += res[0].transcript + " ";
            } else {
              interim += res[0].transcript + " ";
            }
          }
        }

        const fullText = (final + interim).trim();

        if (fullText) {
          const captionPayload = {
            text: fullText,
            userName: userName || "You",
            timestamp: Date.now(),
          };

          setCurrentCaption(captionPayload);

          const socket = getSocket();
          if (socket.connected && roomId) {
            socket.emit("send-caption", {
              roomId,
              text: fullText,
              userName: userName || "You",
            });
          }

          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          clearTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setCurrentCaption(null);
            }
          }, 5000);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") {
          return;
        }

        console.warn("Speech recognition notice:", event.error);
        if (isMountedRef.current) {
          if (event.error === "not-allowed") {
            setSpeechError("Microphone permission required for live captions.");
          } else if (event.error === "audio-capture") {
            setSpeechError("Microphone in use by another tab or app.");
          } else if (event.error === "network") {
            setSpeechError("Speech service network reconnecting...");
          }
        }
      };

      recognition.onend = () => {
        isRecognizingRef.current = false;

        if (
          isMountedRef.current &&
          isEnabled &&
          !isAudioMuted &&
          !manualStopRef.current
        ) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && isEnabled && !isAudioMuted) {
              startRecognition();
            }
          }, 250);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Recognition start notice:", err.message);
      if (isMountedRef.current && isEnabled && !isAudioMuted) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isMountedRef.current && isEnabled && !isAudioMuted) {
            startRecognition();
          }
        }, 500);
      }
    }
  }, [isEnabled, isAudioMuted, userName, roomId]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isEnabled) {
      manualStopRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log(e);
        }
        recognitionRef.current = null;
      }
      isRecognizingRef.current = false;
      setCurrentCaption(null);
      setSpeechError(null);
      return;
    }

    if (isAudioMuted) {
      manualStopRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log(e);
        }
        recognitionRef.current = null;
      }
      isRecognizingRef.current = false;
      return;
    }

    startRecognition();

    return () => {
      manualStopRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log(e);
        }
        recognitionRef.current = null;
      }
      isRecognizingRef.current = false;
    };
  }, [isEnabled, isAudioMuted, startRecognition]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      manualStopRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log(e);
        }
      }
    };
  }, []);

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
              <span className="text-amber-300 truncate">{speechError}</span>
            ) : isAudioMuted ? (
              <span className="flex items-center gap-1.5 text-amber-300">
                <FaMicrophoneSlash className="w-3 h-3 text-red-400 shrink-0" />
                <span>Captions on • Your mic is muted</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-gray-300">
                {isSpeaking ? (
                  <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    <span>[Speaking: {userName}]</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                    <span>
                      Live captions on • Speak into your mic to see subtitles
                    </span>
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
