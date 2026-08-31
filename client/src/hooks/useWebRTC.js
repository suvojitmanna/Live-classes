import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "../service/socket";
import { getIceServers } from "../utils/constants";
import toast from "react-hot-toast";

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [peers, setPeers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [knockStatus, setKnockStatus] = useState("idle");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [pendingKnocks, setPendingKnocks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [roomPermissions, setRoomPermissions] = useState({
    allowMic: true,
    allowCamera: true,
    allowScreenShare: true,
    allowChat: true,
  });
  const [polls, setPolls] = useState([]);

  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: "",
    videoInput: "",
    audioOutput: "",
  });

  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const candidateQueuesRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const analysersRef = useRef(new Map());
  const animationFrameRef = useRef(null);
  const userRef = useRef(null);
  const roomIdRef = useRef(null);
  const roomPermissionsRef = useRef({
    allowMic: true,
    allowCamera: true,
    allowScreenShare: true,
    allowChat: true,
  });
  const isHostRef = useRef(false);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    roomPermissionsRef.current = roomPermissions;
  }, [roomPermissions]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    if (reactions.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.timestamp < 3500));
    }, 500);
    return () => clearInterval(interval);
  }, [reactions]);

  // 1. Device Enumeration
  const loadDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = deviceList.filter((d) => d.kind === "audioinput");
      const videoInputs = deviceList.filter((d) => d.kind === "videoinput");
      const audioOutputs = deviceList.filter((d) => d.kind === "audiooutput");

      setDevices({ audioInputs, videoInputs, audioOutputs });

      if (audioInputs.length && !selectedDevices.audioInput) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioInput: audioInputs[0].deviceId,
        }));
      }
      if (videoInputs.length && !selectedDevices.videoInput) {
        setSelectedDevices((prev) => ({
          ...prev,
          videoInput: videoInputs[0].deviceId,
        }));
      }
      if (audioOutputs.length && !selectedDevices.audioOutput) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioOutput: audioOutputs[0].deviceId,
        }));
      }
    } catch (err) {
      console.warn("Could not enumerate devices:", err.message);
    }
  }, [selectedDevices]);

  // 2. Initialize Local Stream
  const startPreview = useCallback(
    async (audioDeviceId, videoDeviceId) => {
      try {
        setError(null);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        let stream = null;
        try {
          const constraints = {
            audio: audioDeviceId
              ? { deviceId: { exact: audioDeviceId } }
              : true,
            video: videoDeviceId
              ? {
                  deviceId: { exact: videoDeviceId },
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "user",
                }
              : {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "user",
                },
          };

          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr) {
          console.warn(
            "Camera+Mic request failed, trying audio-only fallback:",
            mediaErr.message,
          );
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            setIsVideoOff(true);
          } catch (audioErr) {
            console.warn(
              "Audio-only request failed, creating dummy stream:",
              audioErr.message,
            );
            const ctx = new (
              window.AudioContext || window.webkitAudioContext
            )();
            const osc = ctx.createOscillator();
            const dst = osc.connect(ctx.createMediaStreamDestination());
            osc.start();
            stream = dst.stream;
            setIsVideoOff(true);
            setIsAudioMuted(true);
          }
        }

        setLocalStream(stream);
        localStreamRef.current = stream;
        if (peersRef.current.size > 0 && stream) {
          stream.getTracks().forEach((track) => {
            peersRef.current.forEach(({ pc }) => {
              const senders = pc.getSenders();
              const existingSender = senders.find(
                (s) => s.track?.kind === track.kind,
              );
              if (existingSender) {
                existingSender.replaceTrack(track).catch(() => {});
              } else {
                try {
                  pc.addTrack(track, stream);
                } catch (e) {
                  console.log(e);
                }
              }
            });
          });
        }

        await loadDevices();
        return stream;
      } catch (err) {
        console.error("Failed to start media preview:", err);
        return null;
      }
    },
    [loadDevices],
  );

  // 3. Audio Activity / Active Speaker Detection
  const setupAudioAnalyser = useCallback((stream, id) => {
    try {
      if (!stream || stream.getAudioTracks().length === 0) return;

      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      analysersRef.current.set(id, analyser);
    } catch (err) {
      console.warn("Audio analyser setup error:", err);
    }
  }, []);

  const monitorAudioLevels = useCallback(() => {
    let highestLevel = 0;
    let loudestId = null;

    analysersRef.current.forEach((analyser, id) => {
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buffer);

      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i];
      }
      const average = sum / buffer.length;

      if (average > 15 && average > highestLevel) {
        highestLevel = average;
        loudestId = id;
      }
    });

    setActiveSpeakerId(loudestId);
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevels);
  }, []);

  useEffect(() => {
    if (isJoined) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevels);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isJoined, monitorAudioLevels]);

  const upsertPeer = useCallback((peerData) => {
    setPeers((prevPeers) => {
      const existingIndex = prevPeers.findIndex(
        (p) => p.socketId === peerData.socketId,
      );
      if (existingIndex >= 0) {
        const updated = [...prevPeers];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...peerData,
          isHost:
            peerData.isHost !== undefined
              ? !!peerData.isHost
              : updated[existingIndex].isHost,
          stream:
            peerData.stream !== undefined
              ? peerData.stream
              : updated[existingIndex].stream,
        };
        return updated;
      } else {
        return [
          ...prevPeers,
          {
            socketId: peerData.socketId,
            userId: peerData.userId || peerData.socketId,
            userName: peerData.userName || "Participant",
            avatar: peerData.avatar || "",
            isHost: !!peerData.isHost,
            isMuted: !!peerData.isMuted,
            isVideoOff: !!peerData.isVideoOff,
            isScreenSharing: !!peerData.isScreenSharing,
            isHandRaised: !!peerData.isHandRaised,
            stream: peerData.stream || null,
          },
        ];
      }
    });
  }, []);

  const removePeer = useCallback((socketId) => {
    const peerData = peersRef.current.get(socketId);
    if (peerData?.pc) {
      peerData.pc.close();
    }
    peersRef.current.delete(socketId);
    candidateQueuesRef.current.delete(socketId);
    analysersRef.current.delete(socketId);

    setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
  }, []);

  const processCandidateQueue = useCallback(async (socketId) => {
    const pc = peersRef.current.get(socketId)?.pc;
    const queue = candidateQueuesRef.current.get(socketId) || [];

    if (pc && pc.remoteDescription) {
      while (queue.length > 0) {
        const candidate = queue.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding queued ICE candidate:", err);
        }
      }
    }
  }, []);

  // 4. Create Peer Connection Helper
  const createPeerConnection = useCallback(
    (targetSocketId, targetUser) => {
      if (peersRef.current.has(targetSocketId)) {
        return peersRef.current.get(targetSocketId).pc;
      }

      const socket = getSocket();
      const pc = new RTCPeerConnection({
        iceServers: getIceServers(),
        iceCandidatePoolSize: 10,
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) {
          upsertPeer({
            socketId: targetSocketId,
            userId: targetUser?.userId || targetSocketId,
            userName: targetUser?.userName || "Participant",
            avatar: targetUser?.avatar || "",
            isHost: !!targetUser?.isHost,
            stream: remoteStream,
          });
          setupAudioAnalyser(remoteStream, targetSocketId);
        }
      };

      const activeStream = localStreamRef.current;
      if (activeStream && activeStream.getTracks().length > 0) {
        activeStream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, activeStream);
          } catch (err) {
            console.warn("Error adding track to peer:", err);
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

      peersRef.current.set(targetSocketId, { pc, ...targetUser });
      return pc;
    },
    [setupAudioAnalyser, upsertPeer],
  );

  // 5. Knock-to-Join & Host Admission Logic
  const askToJoin = useCallback((targetRoomId, currentUser) => {
    if (!targetRoomId || !currentUser) return;
    setLoading(true);
    setKnockStatus("waiting");
    setError(null);

    const socket = getSocket();
    userRef.current = currentUser;
    const cleanRoomId = targetRoomId.toLowerCase().trim().replace(/[\s_]+/g, "-");

    const doEmit = () => {
      socket.emit("knock-to-join", {
        roomId: cleanRoomId,
        user: currentUser,
      });
    };

    if (socket.connected) {
      doEmit();
    } else {
      socket.connect();
      const timer = setTimeout(() => {
        if (!socket.connected) {
          setLoading(false);
          setKnockStatus("idle");
          toast.error("Real-time server connection timed out. Please check backend on Render.");
        }
      }, 7000);

      socket.once("connect", () => {
        clearTimeout(timer);
        doEmit();
      });
    }
  }, []);

  const cancelKnock = useCallback((targetRoomId) => {
    const socket = getSocket();
    if (socket.connected && targetRoomId) {
      socket.emit("cancel-knock", {
        roomId: targetRoomId.toLowerCase().trim(),
      });
    }
    setKnockStatus("idle");
    setLoading(false);
  }, []);

  const admitUser = useCallback(
    (targetSocketId) => {
      const socket = getSocket();
      if (socket.connected && roomId) {
        socket.emit("host-decision", {
          roomId,
          targetSocketId,
          decision: "admit",
        });
        setPendingKnocks((prev) =>
          prev.filter((k) => k.socketId !== targetSocketId),
        );
        toast.success("Participant admitted to call");
      }
    },
    [roomId],
  );

  const denyUser = useCallback(
    (targetSocketId) => {
      const socket = getSocket();
      if (socket.connected && roomId) {
        socket.emit("host-decision", {
          roomId,
          targetSocketId,
          decision: "deny",
        });
        setPendingKnocks((prev) =>
          prev.filter((k) => k.socketId !== targetSocketId),
        );
        toast("Participant request denied", { icon: "🚫" });
      }
    },
    [roomId],
  );

  const setLinkExpiration = useCallback((targetRoomId, minutes) => {
    const socket = getSocket();
    if (socket.connected && targetRoomId) {
      socket.emit("set-link-expiration", {
        roomId: targetRoomId.toLowerCase().trim(),
        minutes,
      });
      toast.success(
        minutes === 0
          ? "Meeting link disabled immediately"
          : `Meeting link will expire in ${minutes} minutes`,
      );
    }
  }, []);

  // 6. Join Active Meeting Room
  const joinMeetingRoom = useCallback(
    async (targetRoomId, currentUser, asHost = false) => {
      try {
        setLoading(true);
        setError(null);
        userRef.current = currentUser;
        const normalizedRoomId = targetRoomId.toLowerCase().trim();
        setRoomId(normalizedRoomId);
        setIsHost(asHost);

        let stream = localStreamRef.current;
        if (!stream) {
          stream = await startPreview(
            selectedDevices.audioInput,
            selectedDevices.videoInput,
          );
        }

        if (stream) {
          setupAudioAnalyser(stream, "local");
        }

        const socket = getSocket();
        if (!socket.connected) socket.connect();

        // Emit Join Room
        socket.emit("join-room", {
          roomId: normalizedRoomId,
          userId: currentUser.id || currentUser._id,
          userName: currentUser.name,
          avatar: currentUser.avatar || "",
          isHost: asHost,
          isMuted: isAudioMuted,
          isVideoOff,
        });

        setIsJoined(true);
        setKnockStatus("admitted");
      } catch (err) {
        console.error("Failed to join meeting room:", err);
        setError("Failed to connect to the meeting room.");
      } finally {
        setLoading(false);
      }
    },
    [
      isAudioMuted,
      isVideoOff,
      selectedDevices,
      setupAudioAnalyser,
      startPreview,
    ],
  );

  // 7. Socket.IO Event Subscriptions
  useEffect(() => {
    const socket = getSocket();

    setIsSocketConnected(socket.connected);

    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);
    const handleConnectError = () => setIsSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("meeting-deleted", ({ message }) => {
      toast.error(message || "This meeting link was deleted by the host.", {
        duration: 6000,
      });
      leaveMeetingRoom();
      setKnockStatus("expired");
      setError(message || "This meeting link was deleted by the host.");
    });
    socket.on("link-expired-error", ({ message }) => {
      setError(message || "This meeting link has expired and is disabled.");
      setKnockStatus("expired");
      setLoading(false);
      toast.error(message || "Meeting link expired and disabled", {
        duration: 6000,
      });
    });
    
    socket.on(
      "knock-response",
      async ({ status, roomId: admittedRoomId, isHost: hostFlag, message }) => {
        setLoading(false);
        if (status === "admitted") {
          setKnockStatus("admitted");
          const targetRoom = admittedRoomId || roomId;
          const currentUser = userRef.current || {
            id: socket.id,
            name: "Participant",
          };
          if (targetRoom) {
            await joinMeetingRoom(targetRoom, currentUser, !!hostFlag);
          }
        } else if (status === "denied") {
          setKnockStatus("denied");
          setError(message || "The host denied your request to join.");
          toast.error(message || "The host denied your request to join.");
        } else if (status === "expired") {
          setKnockStatus("expired");
          setError(message || "This meeting link has expired and is disabled.");
        }
      },
    );

    socket.on("user-knocking", (knockData) => {
      setPendingKnocks((prev) => {
        if (prev.some((k) => k.socketId === knockData.socketId)) return prev;
        return [...prev, knockData];
      });
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        [587.33, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.05);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + idx * 0.15 + 0.35,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.36);
        });
      } catch (e) {
        console.log(e);
      }

      toast(`${knockData.userName || "Participant"} wants to join this call`, {
        icon: "🔔",
        duration: 8000,
      });
    });

    socket.on("pending-knocks-sync", ({ knocks }) => {
      setPendingKnocks(knocks || []);
    });

    socket.on("all-users", async ({ users, isHost: hostStatus }) => {
      if (hostStatus !== undefined) setIsHost(hostStatus);

      for (const user of users) {
        upsertPeer(user);

        const pc = createPeerConnection(user.socketId, user);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);

          socket.emit("offer", {
            target: user.socketId,
            caller: socket.id,
            sdp: offer,
            callerInfo: {
              userId: userRef.current?.id || userRef.current?._id,
              userName: userRef.current?.name,
              avatar: userRef.current?.avatar,
              isHost: !!hostStatus,
            },
          });
        } catch (err) {
          console.error("Error creating WebRTC offer:", err);
        }
      }
    });

    socket.on("user-joined", (newUser) => {
      upsertPeer(newUser);
      toast(`${newUser.userName || "Participant"} joined the call`, {
        icon: "👋",
        duration: 3000,
      });
    });

    socket.on("offer", async ({ caller, sdp, callerInfo }) => {
      upsertPeer({ socketId: caller, ...callerInfo });
      const pc = createPeerConnection(caller, callerInfo);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processCandidateQueue(caller);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          target: caller,
          caller: socket.id,
          sdp: answer,
        });
      } catch (err) {
        console.error("Error handling incoming offer:", err);
      }
    });

    socket.on("answer", async ({ caller, sdp }) => {
      const pc = peersRef.current.get(caller)?.pc;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await processCandidateQueue(caller);
        } catch (err) {
          console.error("Error setting remote description from answer:", err);
        }
      }
    });

    socket.on("ice-candidate", async ({ caller, candidate }) => {
      const pc = peersRef.current.get(caller)?.pc;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Error adding received ICE candidate:", err);
        }
      } else {
        const queue = candidateQueuesRef.current.get(caller) || [];
        queue.push(candidate);
        candidateQueuesRef.current.set(caller, queue);
      }
    });

    socket.on("user-toggle-audio", ({ socketId, isMuted }) => {
      upsertPeer({ socketId, isMuted });
    });

    socket.on("user-toggle-video", ({ socketId, isVideoOff }) => {
      upsertPeer({ socketId, isVideoOff });
    });

    socket.on("user-screen-share", ({ socketId, isScreenSharing }) => {
      upsertPeer({ socketId, isScreenSharing });
    });

    socket.on("user-raise-hand", ({ socketId, userName, isHandRaised }) => {
      upsertPeer({ socketId, isHandRaised });
      if (isHandRaised) {
        toast(`${userName || "Participant"} raised hand ✋`, {
          duration: 3000,
        });
      }
    });

    socket.on("user-reaction", (reaction) => {
      setReactions((prev) => [...prev, reaction]);
    });

    socket.on("chat-message", (msg) => {
      if (!msg) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id && m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      const myId = userRef.current?.id || userRef.current?._id;
      const isMyMessage =
        (myId &&
          msg.sender?.id &&
          msg.sender.id.toString() === myId.toString()) ||
        msg.sender?.id === socket.id;

      if (!isMyMessage) {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    socket.on("room-participants-update", ({ participants }) => {
      if (Array.isArray(participants)) {
        const mySocketId = socket.id;
        const myInfo = participants.find((p) => p.socketId === mySocketId);
        if (myInfo) {
          setIsHost(!!myInfo.isHost);
        }

        participants.forEach((p) => {
          if (p.socketId !== mySocketId) {
            upsertPeer({
              socketId: p.socketId,
              userId: p.userId,
              userName: p.userName,
              avatar: p.avatar,
              isHost: !!p.isHost,
              isMuted: p.isMuted,
              isVideoOff: p.isVideoOff,
              isHandRaised: p.isHandRaised,
            });
          }
        });
      }
    });

    // Room Permissions Updated by Host
    socket.on("room-permissions-updated", (perms) => {
      if (!perms) return;
      setRoomPermissions(perms);

      const amHost = isHostRef.current;
      if (!amHost) {
        if (perms.allowMic === false && localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          audioTracks.forEach((t) => {
            t.enabled = false;
          });
          setIsAudioMuted(true);
        }
        if (perms.allowCamera === false && localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach((t) => {
            t.enabled = false;
          });
          setIsVideoOff(true);
        }
        if (perms.allowScreenShare === false && screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
          setScreenStream(null);
          setIsScreenSharing(false);
        }
      }
    });

    // Forced Remote Actions from Host
    socket.on("force-mute", () => {
      if (!isHostRef.current && localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        audioTracks.forEach((t) => {
          t.enabled = false;
        });
        setIsAudioMuted(true);
        toast.error("The host muted your microphone 🔇", { duration: 4000 });
        if (roomIdRef.current) {
          socket.emit("toggle-audio", {
            roomId: roomIdRef.current,
            isMuted: true,
          });
        }
      }
    });

    socket.on("force-stop-video", () => {
      if (!isHostRef.current && localStreamRef.current) {
        const videoTracks = localStreamRef.current.getVideoTracks();
        videoTracks.forEach((t) => {
          t.enabled = false;
        });
        setIsVideoOff(true);
        toast.error("The host turned off your camera 📷", { duration: 4000 });
        if (roomIdRef.current) {
          socket.emit("toggle-video", {
            roomId: roomIdRef.current,
            isVideoOff: true,
          });
        }
      }
    });

    socket.on("force-stop-screen", () => {
      if (!isHostRef.current) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
          setScreenStream(null);
        }
        setIsScreenSharing(false);
        toast.error("The host stopped your screen share 🖥️", { duration: 4000 });
        if (roomIdRef.current) {
          socket.emit("screen-share", {
            roomId: roomIdRef.current,
            isScreenSharing: false,
          });
        }
      }
    });

    socket.on("force-kick", ({ message }) => {
      toast.error(message || "You were removed from the meeting by the host.", {
        duration: 5000,
      });
      window.location.href = "/dashboard";
    });

    // Live Polls / Voting
    socket.on("polls-sync", ({ polls: syncedPolls }) => {
      if (Array.isArray(syncedPolls)) {
        setPolls(syncedPolls);
      }
    });

    socket.on("new-poll-created", (newPoll) => {
      if (newPoll && newPoll.question) {
        toast(`📊 New Poll: "${newPoll.question}"`, {
          duration: 5000,
          icon: "📊",
        });
      }
    });

    // User Left
    socket.on("user-left", ({ socketId, userName }) => {
      removePeer(socketId);
      if (userName) {
        toast(`${userName} left the meeting`, { icon: "🚪", duration: 3000 });
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("polls-sync");
      socket.off("new-poll-created");
      socket.off("room-permissions-updated");
      socket.off("force-mute");
      socket.off("force-stop-video");
      socket.off("force-stop-screen");
      socket.off("force-kick");
      socket.off("room-participants-update");
      socket.off("meeting-deleted");
      socket.off("link-expired-error");
      socket.off("knock-response");
      socket.off("user-knocking");
      socket.off("pending-knocks-sync");
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-toggle-audio");
      socket.off("user-toggle-video");
      socket.off("user-screen-share");
      socket.off("user-raise-hand");
      socket.off("user-reaction");
      socket.off("chat-message");
      socket.off("user-left");
    };
  }, [
    createPeerConnection,
    joinMeetingRoom,
    processCandidateQueue,
    removePeer,
    upsertPeer,
  ]);

  const toggleAudio = useCallback(() => {
    if (!isHostRef.current && roomPermissionsRef.current.allowMic === false && isAudioMuted) {
      toast.error("The host has disabled microphones for participants 🔇");
      return;
    }

    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !isAudioMuted;
        audioTracks.forEach((track) => {
          track.enabled = !nextState;
        });
        setIsAudioMuted(nextState);

        const socket = getSocket();
        if (socket.connected && roomId) {
          socket.emit("toggle-audio", { roomId, isMuted: nextState });
        }
      }
    }
  }, [isAudioMuted, roomId]);

  const toggleVideo = useCallback(() => {
    if (!isHostRef.current && roomPermissionsRef.current.allowCamera === false && isVideoOff) {
      toast.error("The host has disabled cameras for participants 📷");
      return;
    }

    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !isVideoOff;
        videoTracks.forEach((track) => {
          track.enabled = !nextState;
        });
        setIsVideoOff(nextState);

        const socket = getSocket();
        if (socket.connected && roomId) {
          socket.emit("toggle-video", { roomId, isVideoOff: nextState });
        }
      }
    }
  }, [isVideoOff, roomId]);

  const toggleScreenShare = useCallback(async () => {
    if (!isHostRef.current && roomPermissionsRef.current.allowScreenShare === false && !isScreenSharing) {
      toast.error("The host has disabled screen sharing for participants 🖥️");
      return;
    }

    const socket = getSocket();

    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
        setScreenStream(null);
      }

      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peersRef.current.forEach(({ pc }) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(cameraTrack).catch(() => {});
          }
        });
      }

      setIsScreenSharing(false);
      if (socket.connected && roomId) {
        socket.emit("screen-share", { roomId, isScreenSharing: false });
      }
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: true,
        });

        const screenTrack = screen.getVideoTracks()[0];
        screenStreamRef.current = screen;
        setScreenStream(screen);
        setIsScreenSharing(true);

        peersRef.current.forEach(({ pc }) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack).catch(() => {});
          }
        });

        if (socket.connected && roomId) {
          socket.emit("screen-share", { roomId, isScreenSharing: true });
        }

        screenTrack.onended = () => {
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            peersRef.current.forEach(({ pc }) => {
              const sender = pc
                .getSenders()
                .find((s) => s.track && s.track.kind === "video");
              if (sender) {
                sender.replaceTrack(camTrack).catch(() => {});
              }
            });
          }
          screenStreamRef.current = null;
          setScreenStream(null);
          setIsScreenSharing(false);
          if (socket.connected && roomId) {
            socket.emit("screen-share", { roomId, isScreenSharing: false });
          }
        };
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    }
  }, [isScreenSharing, roomId]);

  const toggleRaiseHand = useCallback(() => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    const socket = getSocket();
    if (socket.connected && roomId) {
      socket.emit("raise-hand", { roomId, isHandRaised: nextState });
    }
  }, [isHandRaised, roomId]);

  const sendReaction = useCallback(
    (emoji) => {
      const socket = getSocket();
      if (socket.connected && roomId) {
        socket.emit("send-reaction", { roomId, emoji });
      }
    },
    [roomId],
  );

  const sendChatMessage = useCallback(
    (text) => {
      if (!text || !text.trim() || !roomId) return;

      if (!isHostRef.current && roomPermissionsRef.current.allowChat === false) {
        toast.error("The host has disabled in-call chat 💬");
        return;
      }

      const socket = getSocket();

      socket.emit("send-chat-message", {
        roomId,
        text,
        sender: {
          id: userRef.current?.id || userRef.current?._id || socket.id,
          name: userRef.current?.name || "Participant",
          avatar: userRef.current?.avatar || "",
        },
      });
    },
    [roomId],
  );

  // Host Action Methods
  const updateRoomPermissions = useCallback(
    (newPerms) => {
      const socket = getSocket();
      if (socket.connected && roomId) {
        socket.emit("host-update-permissions", { roomId, permissions: newPerms });
      }
    },
    [roomId]
  );

  const muteAllParticipants = useCallback(() => {
    const socket = getSocket();
    if (socket.connected && roomId) {
      socket.emit("host-mute-all", { roomId });
      toast.success("Muted all participants 🔇");
    }
  }, [roomId]);

  const stopAllVideo = useCallback(() => {
    const socket = getSocket();
    if (socket.connected && roomId) {
      socket.emit("host-stop-all-video", { roomId });
      toast.success("Turned off camera for all participants 📷");
    }
  }, [roomId]);

  const controlParticipant = useCallback(
    (targetSocketId, action) => {
      const socket = getSocket();
      if (socket.connected && roomId && targetSocketId && action) {
        socket.emit("host-control-user", { roomId, targetSocketId, action });
        if (action === "mute") toast.success("Muted participant 🔇");
        if (action === "stop-video") toast.success("Turned off participant's camera 📷");
        if (action === "stop-screen") toast.success("Stopped participant's screen share 🖥️");
        if (action === "kick") toast.success("Removed participant from meeting 🚪");
      }
    },
    [roomId]
  );

  // Poll Methods
  const createPoll = useCallback(
    (question, options) => {
      const socket = getSocket();
      if (socket.connected && roomId && question && options?.length >= 2) {
        socket.emit("create-poll", { roomId, question, options });
        toast.success("Poll launched to meeting! 📊");
      }
    },
    [roomId]
  );

  const votePoll = useCallback(
    (pollId, optionIndex) => {
      const socket = getSocket();
      if (socket.connected && roomId && pollId && optionIndex !== undefined) {
        socket.emit("vote-poll", {
          roomId,
          pollId,
          optionIndex,
          voterId: userRef.current?.id || userRef.current?._id || socket.id,
          voterName: userRef.current?.name || "Participant",
        });
        toast.success("Vote submitted! 🗳️");
      }
    },
    [roomId]
  );

  const closePoll = useCallback(
    (pollId) => {
      const socket = getSocket();
      if (socket.connected && roomId && pollId) {
        socket.emit("close-poll", { roomId, pollId });
        toast.success("Poll ended 🛑");
      }
    },
    [roomId]
  );

  const deletePoll = useCallback(
    (pollId) => {
      const socket = getSocket();
      if (socket.connected && roomId && pollId) {
        socket.emit("delete-poll", { roomId, pollId });
        toast.success("Poll removed 🗑️");
      }
    },
    [roomId]
  );

  const resetUnreadChatCount = useCallback(() => {
    setUnreadChatCount(0);
  }, []);

  const leaveMeetingRoom = useCallback(() => {
    const socket = getSocket();
    if (socket.connected && roomId) {
      socket.emit("leave-room", { roomId });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
    }

    peersRef.current.forEach(({ pc }) => {
      try {
        pc.close();
      } catch (err) {
        console.log(err);
      }
    });

    peersRef.current.clear();
    candidateQueuesRef.current.clear();
    analysersRef.current.clear();

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setPeers([]);
    setPendingKnocks([]);
    setMessages([]);
    setIsJoined(false);
    setKnockStatus("idle");
    setIsScreenSharing(false);
    setIsHandRaised(false);
    setIsHost(false);
    setRoomId(null);
  }, [roomId]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peersRef.current.forEach(({ pc }) => pc.close());
      peersRef.current.clear();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isHandRaised,
    activeSpeakerId,
    isHost,
    isJoined,
    roomId,
    peers,
    error,
    loading,
    knockStatus,
    setKnockStatus,
    pendingKnocks,
    askToJoin,
    cancelKnock,
    admitUser,
    denyUser,
    setLinkExpiration,
    messages,
    unreadChatCount,
    sendChatMessage,
    resetUnreadChatCount,
    reactions,
    sendReaction,
    devices,
    selectedDevices,
    setSelectedDevices,
    loadDevices,
    startPreview,
    joinMeetingRoom,
    leaveMeetingRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRaiseHand,
    roomPermissions,
    updateRoomPermissions,
    muteAllParticipants,
    stopAllVideo,
    controlParticipant,
    isSocketConnected,
    polls,
    createPoll,
    votePoll,
    closePoll,
    deletePoll,
  };
};
