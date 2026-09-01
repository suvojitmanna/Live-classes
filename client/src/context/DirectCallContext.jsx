import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getSocket } from "../service/socket";
import api from "../service/api";
import { API_ENDPOINTS, getIceServers } from "../utils/constants";
import { globalBackgroundProcessor } from "../utils/videoBackgroundProcessor";
import toast from "react-hot-toast";

const DirectCallContext = createContext();
export const DirectCallProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [callState, setCallState] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isPeerSpeaking, setIsPeerSpeaking] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [visualEffect, setVisualEffect] = useState("none");

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const rawCameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const targetSocketRef = useRef(null);
  const activeCallRef = useRef(null);
  const candidateQueueRef = useRef([]);
  const durationTimerRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const localAudioAnalyserRef = useRef(null);
  const remoteAudioAnalyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => { });
    }
    return audioContextRef.current;
  }, []);

  const stopRingtones = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
  }, []);

  const playIncomingRingtone = useCallback(() => {
    stopRingtones();
    try {
      const playChime = () => {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const tones = [523.25, 659.25, 783.99, 1046.5];

        tones.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          gain.gain.setValueAtTime(0, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.36);
        });
      };

      playChime();
      ringtoneIntervalRef.current = setInterval(playChime, 2200);
    } catch (e) {
      console.warn("Ringtone error:", e);
    }
  }, [getAudioContext, stopRingtones]);
  const playOutgoingRingtone = useCallback(() => {
    stopRingtones();
    try {
      const playBeep = () => {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [440, 480].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
          gain.gain.setValueAtTime(0.12, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.35);
        });
      };

      playBeep();
      ringtoneIntervalRef.current = setInterval(playBeep, 3500);
    } catch (e) {
      console.warn("Outgoing ringtone error:", e);
    }
  }, [getAudioContext, stopRingtones]);

  const playEndCallChime = useCallback(() => {
    stopRingtones();
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [480, 360].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0.15, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.22);
      });
    } catch (e) {
      console.log(e);
     }
  }, [getAudioContext, stopRingtones]);

  const setupAudioMonitor = useCallback(
    (stream, isLocal) => {
      try {
        if (!stream || stream.getAudioTracks().length === 0) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        if (isLocal) {
          localAudioAnalyserRef.current = analyser;
        } else {
          remoteAudioAnalyserRef.current = analyser;
        }

        const buffer = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (localAudioAnalyserRef.current) {
            localAudioAnalyserRef.current.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i];
            setIsLocalSpeaking(sum / buffer.length > 14);
          }

          if (remoteAudioAnalyserRef.current) {
            remoteAudioAnalyserRef.current.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i];
            setIsPeerSpeaking(sum / buffer.length > 14);
          }

          animFrameRef.current = requestAnimationFrame(checkVolume);
        };

        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
      } catch (err) {
        console.warn("Audio monitor setup notice:", err);
      }
    },
    [getAudioContext]
  );

  const createPeerConnection = useCallback(
    (targetSocketId, callId) => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      const socket = getSocket();
      const pc = new RTCPeerConnection({
        iceServers: getIceServers(),
        iceCandidatePoolSize: 10,
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && targetSocketId) {
          socket.emit("direct-call:ice-candidate", {
            callId,
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStream(stream);
          setupAudioMonitor(stream, false);
        }
      };

      const currentStream = localStreamRef.current;
      if (currentStream && currentStream.getTracks().length > 0) {
        currentStream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, currentStream);
          } catch (err) {
            console.warn("Error adding local track:", err);
          }
        });
      } else {
        try {
          pc.addTransceiver("audio", { direction: "sendrecv" });
          pc.addTransceiver("video", { direction: "sendrecv" });
        } catch (e) {
          console.log(e);
        }
      }

      pcRef.current = pc;
      targetSocketRef.current = targetSocketId;
      return pc;
    },
    [setupAudioMonitor]
  );

  const processCandidateQueue = useCallback(async () => {
    const pc = pcRef.current;
    if (pc && pc.remoteDescription && candidateQueueRef.current.length > 0) {
      while (candidateQueueRef.current.length > 0) {
        const candidate = candidateQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding queued ICE candidate:", err);
        }
      }
    }
  }, []);

  const cleanupCallState = useCallback(() => {
    stopRingtones();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (globalBackgroundProcessor.isRunning) {
      globalBackgroundProcessor.stop();
    }
    rawCameraStreamRef.current = null;
    setVisualEffect("none");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    candidateQueueRef.current = [];
    targetSocketRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsPeerSpeaking(false);
    setIsLocalSpeaking(false);
    setCallDuration(0);
    setCallState("idle");
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);
  }, [stopRingtones]);

  // Start Call Duration Timer
  const startDurationTimer = useCallback(() => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const fetchCallHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setHistoryLoading(true);
      const response = await api.get(API_ENDPOINTS.CALL.HISTORY);
      if (response.data.success) {
        setCallHistory(response.data.data.calls || []);
      }
    } catch (err) {
      console.warn("Fetch call history notice:", err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  const deleteCallHistory = useCallback(async (callId) => {
    try {
      await api.delete(`${API_ENDPOINTS.CALL.DELETE}/${callId}`);
      setCallHistory((prev) => prev.filter((c) => c.id !== callId));
      toast.success("Call record deleted");
    } catch (err) {
      toast.error("Failed to delete call record");
      console.log(err);
    }
  }, []);

  const checkUser = useCallback(async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.CALL.CHECK_USER, { email });
      return response.data;
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "User check failed",
      };
    }
  }, []);

  // 1. Start Outgoing Call
  const startDirectCall = useCallback(
    async (targetEmail, callType = "video") => {
      if (!targetEmail || !targetEmail.trim()) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (callState !== "idle") {
        toast.error("You are already engaged in a call");
        return;
      }

      const socket = getSocket();
      if (!socket.connected) socket.connect();

      // Acquire Local Media Stream
      try {
        const isVideo = callType === "video";
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        setupAudioMonitor(stream, true);

        setCallState("outgoing-ringing");
        setOutgoingCall({
          targetEmail: targetEmail.trim().toLowerCase(),
          callType,
          statusText: "Calling...",
          receiver: { email: targetEmail.trim().toLowerCase(), name: targetEmail.split("@")[0] },
        });

        playOutgoingRingtone();

        socket.emit("direct-call:initiate", {
          targetEmail: targetEmail.trim().toLowerCase(),
          callType,
        });
      } catch (err) {
        console.error("Camera/Mic access error:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast.error(
            callType === "video"
              ? "Camera & Microphone permissions are required for video calls."
              : "Microphone permission is required for voice calls."
          );
        } else {
          toast.error("Unable to access audio/video devices.");
        }
        cleanupCallState();
      }
    },
    [callState, playOutgoingRingtone, setupAudioMonitor, cleanupCallState]
  );

  // 2. Accept Incoming Call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    stopRingtones();
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    try {
      const isVideo = incomingCall.callType === "video";
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setupAudioMonitor(stream, true);

      setCallState("connecting");
      setActiveCall({
        callId: incomingCall.callId,
        callType: incomingCall.callType,
        peer: incomingCall.caller,
        isIncoming: true,
      });

      socket.emit("direct-call:accept", { callId: incomingCall.callId });
      setIncomingCall(null);
    } catch (err) {
      console.error("Accept call device error:", err);
      toast.error("Failed to access media devices to accept call.");
      declineIncomingCall();
    }
  }, [incomingCall, stopRingtones, setupAudioMonitor]);

  // 3. Decline Incoming Call
  const declineIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    stopRingtones();
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("direct-call:decline", {
        callId: incomingCall.callId,
        reason: "Call declined",
      });
    }
    setIncomingCall(null);
    setCallState("idle");
    fetchCallHistory();
  }, [incomingCall, stopRingtones, fetchCallHistory]);

  // 4. Cancel Outgoing Call
  const cancelOutgoingCall = useCallback(() => {
    stopRingtones();
    const socket = getSocket();
    if (socket.connected && outgoingCall?.callId) {
      socket.emit("direct-call:cancel", { callId: outgoingCall.callId });
    }
    cleanupCallState();
    fetchCallHistory();
  }, [outgoingCall, stopRingtones, cleanupCallState, fetchCallHistory]);

  // 5. End Active Call
  const endActiveCall = useCallback(() => {
    const callId = activeCallRef.current?.callId;
    playEndCallChime();

    const socket = getSocket();
    if (socket.connected && callId) {
      socket.emit("direct-call:end", { callId });
    }

    cleanupCallState();
    toast.success("Call ended");
    fetchCallHistory();
  }, [playEndCallChime, cleanupCallState, fetchCallHistory]);

  // 6. Media Toggles
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextMuted = !isAudioMuted;
        audioTracks.forEach((t) => (t.enabled = !nextMuted));
        setIsAudioMuted(nextMuted);

        const socket = getSocket();
        if (socket.connected && targetSocketRef.current && activeCallRef.current?.callId) {
          socket.emit("direct-call:toggle-media", {
            callId: activeCallRef.current.callId,
            targetSocketId: targetSocketRef.current,
            isAudioMuted: nextMuted,
            isVideoOff,
            isScreenSharing,
          });
        }
      }
    }
  }, [isAudioMuted, isVideoOff, isScreenSharing]);

  const toggleVideo = useCallback(async () => {
    if (activeCallRef.current?.callType === "voice" && !localStreamRef.current?.getVideoTracks().length) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (videoTrack && pcRef.current) {
          localStreamRef.current.addTrack(videoTrack);
          pcRef.current.addTrack(videoTrack, localStreamRef.current);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
          setIsVideoOff(false);
          toast.success("Camera enabled 📹");
          return;
        }
      } catch (err) {
        toast.error("Could not activate camera");
        console.log(err);
        return;
      }
    }

    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextVideoOff = !isVideoOff;
        videoTracks.forEach((t) => (t.enabled = !nextVideoOff));
        setIsVideoOff(nextVideoOff);

        const socket = getSocket();
        if (socket.connected && targetSocketRef.current && activeCallRef.current?.callId) {
          socket.emit("direct-call:toggle-media", {
            callId: activeCallRef.current.callId,
            targetSocketId: targetSocketRef.current,
            isAudioMuted,
            isVideoOff: nextVideoOff,
            isScreenSharing,
          });
        }
      }
    }
  }, [isVideoOff, isAudioMuted, isScreenSharing]);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        if (pcRef.current && screenTrack) {
          const senders = pcRef.current.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          if (localStreamRef.current && pcRef.current) {
            const camTrack = localStreamRef.current.getVideoTracks()[0];
            const senders = pcRef.current.getSenders();
            const videoSender = senders.find((s) => s.track && s.track.kind === "video");
            if (videoSender && camTrack) videoSender.replaceTrack(camTrack);
          }
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };

        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (localStreamRef.current && pcRef.current) {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === "video");
        if (videoSender && camTrack) videoSender.replaceTrack(camTrack);
      }
      setIsScreenSharing(false);
      toast.success("Screen sharing stopped");
    }
  }, [isScreenSharing]);

  const applyVisualEffect = useCallback(
    async (effect) => {
      const effectId = typeof effect === "string" ? effect : effect?.id || "none";
      setVisualEffect(effectId);

      if (!localStreamRef.current) return;

      if (effectId === "none") {
        if (rawCameraStreamRef.current) {
          const rawVideoTrack = rawCameraStreamRef.current.getVideoTracks()[0];
          if (rawVideoTrack) {
            rawVideoTrack.enabled = !isVideoOff;
            if (pcRef.current) {
              const senders = pcRef.current.getSenders();
              const videoSender = senders.find(
                (s) => s.track && s.track.kind === "video"
              );
              if (videoSender) {
                videoSender.replaceTrack(rawVideoTrack).catch(() => { });
              }
            }
            const restoredStream = new MediaStream([
              rawVideoTrack,
              ...rawCameraStreamRef.current.getAudioTracks(),
            ]);
            localStreamRef.current = restoredStream;
            setLocalStream(restoredStream);
          }
          globalBackgroundProcessor.stop();
        }
        return;
      }

      try {
        if (!rawCameraStreamRef.current) {
          rawCameraStreamRef.current = localStreamRef.current;
        }

        globalBackgroundProcessor.setEffect(effect);

        if (!globalBackgroundProcessor.isRunning) {
          const processedStream = await globalBackgroundProcessor.start(
            rawCameraStreamRef.current,
            effect
          );
          const processedVideoTrack = processedStream.getVideoTracks()[0];
          if (processedVideoTrack) {
            processedVideoTrack.enabled = !isVideoOff;
            if (pcRef.current) {
              const senders = pcRef.current.getSenders();
              const videoSender = senders.find(
                (s) => s.track && s.track.kind === "video"
              );
              if (videoSender) {
                videoSender.replaceTrack(processedVideoTrack).catch(() => { });
              }
            }
            const combinedStream = new MediaStream([
              processedVideoTrack,
              ...rawCameraStreamRef.current.getAudioTracks(),
            ]);
            localStreamRef.current = combinedStream;
            setLocalStream(combinedStream);
          }
        }
      } catch (err) {
        console.warn("DirectCall applyVisualEffect error:", err);
      }
    },
    [isVideoOff]
  );

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const currentUserId = user.id || user._id;

    const handleConnect = () => {
      socket.emit("direct-call:register", { userId: currentUserId });
    };

    if (socket.connected) {
      handleConnect();
    }
    socket.on("connect", handleConnect);

    // 1. Incoming Call Alert
    const handleIncomingCall = (callData) => {
      setIncomingCall(callData);
      setCallState("incoming-ringing");
      playIncomingRingtone();
    };

    // 2. Outgoing Ringing Confirmation
    const handleOutgoingRinging = ({ callId, receiver, callType }) => {
      setOutgoingCall((prev) => ({
        ...prev,
        callId,
        callType,
        receiver,
        statusText: "Ringing...",
      }));
    };

    // 3. Call Accepted by Receiver (Caller creates WebRTC offer)
    const handleCallAccepted = async ({ callId, targetSocketId }) => {
      stopRingtones();
      setCallState("connecting");
      setActiveCall((prev) => ({
        ...prev,
        callId,
        peer: outgoingCall?.receiver,
        callType: outgoingCall?.callType || "video",
        isIncoming: false,
      }));

      const pc = createPeerConnection(targetSocketId, callId);
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: outgoingCall?.callType === "video",
        });
        await pc.setLocalDescription(offer);

        socket.emit("direct-call:offer", {
          callId,
          targetSocketId,
          sdp: offer,
        });

        setCallState("connected");
        startDurationTimer();
        setOutgoingCall(null);
      } catch (err) {
        console.error("Error creating WebRTC offer for direct call:", err);
      }
    };

    const handleCallConnected = ({ callId, targetSocketId }) => {
      stopRingtones();
      setCallState("connecting");
      targetSocketRef.current = targetSocketId;
    };

    const handleOffer = async ({ callId, callerSocketId, sdp }) => {
      targetSocketRef.current = callerSocketId;
      const pc = createPeerConnection(callerSocketId, callId);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processCandidateQueue();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("direct-call:answer", {
          callId,
          targetSocketId: callerSocketId,
          sdp: answer,
        });

        setCallState("connected");
        startDurationTimer();
      } catch (err) {
        console.error("Error answering direct call offer:", err);
      }
    };

    const handleAnswer = async ({ callId, answerSocketId, sdp }) => {
      const pc = pcRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await processCandidateQueue();
          setCallState("connected");
        } catch (err) {
          console.error("Error setting answer remote description:", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding direct call ICE candidate:", err);
        }
      } else {
        candidateQueueRef.current.push(candidate);
      }
    };

    // 8. Remote Media State Toggle (Mic, Video, Screen Share)
    const handleToggleMedia = ({ isAudioMuted: peerAudioMuted, isVideoOff: peerVideoOff }) => {
      // Peer toggled media
    };

    const handleCallDeclined = ({ reason }) => {
      stopRingtones();
      toast.error(reason || "Recipient declined the call", { icon: "🚫" });
      cleanupCallState();
      fetchCallHistory();
    };

    const handleCallCancelled = () => {
      stopRingtones();
      toast("Caller cancelled the call", { icon: "⏹️" });
      cleanupCallState();
      fetchCallHistory();
    };

    const handleUserBusy = ({ message }) => {
      stopRingtones();
      toast.error(message || "User is busy on another call", { icon: "⏳" });
      cleanupCallState();
      fetchCallHistory();
    };

    const handleUserOffline = ({ message }) => {
      stopRingtones();
      toast.error(message || "User is currently offline", { icon: "📴" });
      cleanupCallState();
      fetchCallHistory();
    };

    const handleCallError = ({ message }) => {
      stopRingtones();
      toast.error(message || "Call error occurred", { icon: "⚠️" });
      cleanupCallState();
      fetchCallHistory();
    };

    const handleCallEnded = ({ durationSeconds, reason }) => {
      playEndCallChime();
      toast(reason || "Call ended", { icon: "📞" });
      cleanupCallState();
      fetchCallHistory();
    };

    socket.on("direct-call:incoming", handleIncomingCall);
    socket.on("direct-call:outgoing-ringing", handleOutgoingRinging);
    socket.on("direct-call:accepted", handleCallAccepted);
    socket.on("direct-call:connected", handleCallConnected);
    socket.on("direct-call:offer", handleOffer);
    socket.on("direct-call:answer", handleAnswer);
    socket.on("direct-call:ice-candidate", handleIceCandidate);
    socket.on("direct-call:toggle-media", handleToggleMedia);
    socket.on("direct-call:declined", handleCallDeclined);
    socket.on("direct-call:cancelled", handleCallCancelled);
    socket.on("direct-call:user-busy", handleUserBusy);
    socket.on("direct-call:user-offline", handleUserOffline);
    socket.on("direct-call:error", handleCallError);
    socket.on("direct-call:ended", handleCallEnded);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("direct-call:incoming", handleIncomingCall);
      socket.off("direct-call:outgoing-ringing", handleOutgoingRinging);
      socket.off("direct-call:accepted", handleCallAccepted);
      socket.off("direct-call:connected", handleCallConnected);
      socket.off("direct-call:offer", handleOffer);
      socket.off("direct-call:answer", handleAnswer);
      socket.off("direct-call:ice-candidate", handleIceCandidate);
      socket.off("direct-call:toggle-media", handleToggleMedia);
      socket.off("direct-call:declined", handleCallDeclined);
      socket.off("direct-call:cancelled", handleCallCancelled);
      socket.off("direct-call:user-busy", handleUserBusy);
      socket.off("direct-call:user-offline", handleUserOffline);
      socket.off("direct-call:error", handleCallError);
      socket.off("direct-call:ended", handleCallEnded);
    };
  }, [
    isAuthenticated,
    user,
    outgoingCall,
    createPeerConnection,
    processCandidateQueue,
    startDurationTimer,
    playIncomingRingtone,
    playEndCallChime,
    stopRingtones,
    cleanupCallState,
    fetchCallHistory,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCallHistory();
    }
  }, [isAuthenticated, fetchCallHistory]);

  const value = {
    callState,
    incomingCall,
    outgoingCall,
    activeCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isPeerSpeaking,
    isLocalSpeaking,
    callDuration,
    callHistory,
    historyLoading,
    fetchCallHistory,
    deleteCallHistory,
    checkUser,
    startDirectCall,
    acceptIncomingCall,
    declineIncomingCall,
    cancelOutgoingCall,
    endActiveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    visualEffect,
    setVisualEffect,
    applyVisualEffect,
  };

  return (
    <DirectCallContext.Provider value={value}>
      {children}
    </DirectCallContext.Provider>
  );
};

export const useDirectCall = () => {
  const context = useContext(DirectCallContext);
  if (!context) {
    throw new Error("useDirectCall must be used within a DirectCallProvider");
  }
  return context;
};

export default DirectCallContext;
