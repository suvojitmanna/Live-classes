let selfieSegmentationPromise = null;

export const loadSelfieSegmentation = () => {
  if (selfieSegmentationPromise) return selfieSegmentationPromise;

  selfieSegmentationPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.SelfieSegmentation) {
      resolve(window.SelfieSegmentation);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      if (window.SelfieSegmentation) {
        resolve(window.SelfieSegmentation);
      } else {
        reject(new Error("SelfieSegmentation not found on window"));
      }
    };

    script.onerror = (err) => {
      console.warn("Failed to load MediaPipe Selfie Segmentation script:", err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return selfieSegmentationPromise;
};

export const BACKGROUND_PRESETS = [
  {
    id: "none",
    name: "No Effect",
    category: "blur",
    type: "none",
    thumbnail: "bg-gray-200 dark:bg-gray-800",
    description: "Default camera feed",
  },
  {
    id: "slight-blur",
    name: "Slight Blur",
    category: "blur",
    type: "blur",
    blurAmount: 10,
    thumbnail: "backdrop-blur-sm bg-blue-500/20",
    description: "Subtle bokeh background blur",
  },
  {
    id: "heavy-blur",
    name: "Heavy Blur",
    category: "blur",
    type: "blur",
    blurAmount: 24,
    thumbnail: "backdrop-blur-md bg-purple-500/30",
    description: "Full privacy background blur",
  },

  {
    id: "remove-black",
    name: "Studio Dark",
    category: "remove",
    type: "color",
    color: "#121316",
    thumbnail: "bg-[#121316]",
    description: "Clean minimalist dark studio",
  },
  {
    id: "remove-navy",
    name: "Executive Navy",
    category: "remove",
    type: "color",
    color: "#0f172a",
    thumbnail: "bg-[#0f172a]",
    description: "Deep professional navy backdrop",
  },
  {
    id: "remove-white",
    name: "Pure White",
    category: "remove",
    type: "color",
    color: "#f8fafc",
    thumbnail: "bg-[#f8fafc] border border-gray-300",
    description: "Crisp white studio portrait",
  },
  {
    id: "green-screen",
    name: "Green Screen",
    category: "remove",
    type: "color",
    color: "#00ff00",
    thumbnail: "bg-[#00ff00]",
    description: "Chroma green for streaming/OBS",
  },

  {
    id: "office-modern",
    name: "Modern Office",
    category: "office",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=60",
    description: "Modern architectural glass office",
  },
  {
    id: "office-books",
    name: "Executive Study",
    category: "office",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=300&q=60",
    description: "Warm wooden bookshelf library",
  },
  {
    id: "living-room",
    name: "Luxury Interior",
    category: "office",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=60",
    description: "Elegant contemporary apartment",
  },
  {
    id: "cozy-cafe",
    name: "Cozy Cafe",
    category: "office",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=60",
    description: "Warm coffee shop atmosphere",
  },
  {
    id: "university-library",
    name: "Grand Library",
    category: "office",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=60",
    description: "Atmospheric study hall",
  },

  {
    id: "sunset-beach",
    name: "Sunset Beach",
    category: "scenery",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=60",
    description: "Peaceful tropical golden sunset",
  },
  {
    id: "nature-forest",
    name: "Pine Mountain",
    category: "scenery",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=60",
    description: "Scenic pine mountain mist",
  },
  {
    id: "neon-cyberpunk",
    name: "Cyberpunk Studio",
    category: "scenery",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=60",
    description: "Futuristic neon lights & workspace",
  },
  {
    id: "abstract-studio",
    name: "3D Pastel Studio",
    category: "scenery",
    type: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=60",
    description: "Minimalist abstract 3D artwork",
  },
];

function drawImageCover(ctx, img, targetWidth, targetHeight) {
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;
  if (!imgWidth || !imgHeight) return;

  const targetRatio = targetWidth / targetHeight;
  const imgRatio = imgWidth / imgHeight;

  let sWidth, sHeight, sx, sy;

  if (imgRatio > targetRatio) {
    sHeight = imgHeight;
    sWidth = imgHeight * targetRatio;
    sx = (imgWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = imgWidth;
    sHeight = imgWidth / targetRatio;
    sx = 0;
    sy = (imgHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
}

export class VideoBackgroundProcessor {
  constructor() {
    this.selfieSegmentation = null;
    this.isSegmenterReady = false;
    this.activeEffect = { type: "none" };
    this.cachedImages = new Map();

    this.videoElement = null;
    this.canvasElement = null;
    this.ctx = null;
    this.animationFrameId = null;
    this.rawStream = null;
    this.processedStream = null;
    this.isRunning = false;
  }

  async initSegmenter() {
    if (this.selfieSegmentation) return;

    try {
      const SelfieSegmentationClass = await loadSelfieSegmentation();
      this.selfieSegmentation = new SelfieSegmentationClass({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: false,
      });

      this.selfieSegmentation.onResults((results) => {
        this.renderFrame(results);
      });

      this.isSegmenterReady = true;
    } catch (err) {
      console.warn(
        "Could not initialize MediaPipe segmenter, using fallback:",
        err,
      );
    }
  }

  preloadImage(url) {
    if (!url || this.cachedImages.has(url)) {
      return this.cachedImages.get(url);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    this.cachedImages.set(url, img);
    return img;
  }

  async start(rawStream, initialEffectId = "none") {
    this.rawStream = rawStream;
    this.setEffect(initialEffectId);

    if (!this.canvasElement) {
      this.canvasElement = document.createElement("canvas");
      this.canvasElement.width = 1280;
      this.canvasElement.height = 720;
      this.ctx = this.canvasElement.getContext("2d", {
        willReadFrequently: false,
      });
    }

    if (!this.videoElement) {
      this.videoElement = document.createElement("video");
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
    }

    this.videoElement.srcObject = rawStream;
    await this.videoElement.play().catch(() => {});

    await this.initSegmenter();

    this.isRunning = true;
    this.loop();

    const canvasStream = this.canvasElement.captureStream(30);
    const processedVideoTrack = canvasStream.getVideoTracks()[0];

    this.processedStream = new MediaStream([
      processedVideoTrack,
      ...rawStream.getAudioTracks(),
    ]);

    return this.processedStream;
  }

  setEffect(effectIdOrObj) {
    if (typeof effectIdOrObj === "string") {
      const preset = BACKGROUND_PRESETS.find((p) => p.id === effectIdOrObj);
      if (preset) {
        if (preset.type === "image" && preset.imageUrl) {
          this.activeEffect = {
            ...preset,
            imageElement: this.preloadImage(preset.imageUrl),
          };
        } else {
          this.activeEffect = preset;
        }
      } else {
        this.activeEffect = { type: "none" };
      }
    } else if (effectIdOrObj && typeof effectIdOrObj === "object") {
      if (effectIdOrObj.type === "image" && effectIdOrObj.imageUrl) {
        this.activeEffect = {
          ...effectIdOrObj,
          imageElement: this.preloadImage(effectIdOrObj.imageUrl),
        };
      } else {
        this.activeEffect = effectIdOrObj;
      }
    }
  }

  loop = async () => {
    if (!this.isRunning) return;

    if (
      this.videoElement &&
      this.videoElement.readyState >= 2 &&
      !this.videoElement.paused
    ) {
      if (this.activeEffect.type === "none" || !this.isSegmenterReady) {
        if (this.ctx && this.canvasElement) {
          const width = this.videoElement.videoWidth || 1280;
          const height = this.videoElement.videoHeight || 720;
          if (
            this.canvasElement.width !== width ||
            this.canvasElement.height !== height
          ) {
            this.canvasElement.width = width;
            this.canvasElement.height = height;
          }
          this.ctx.drawImage(this.videoElement, 0, 0, width, height);
        }
      } else {
        try {
          await this.selfieSegmentation.send({ image: this.videoElement });
        } catch (e) {
          // Fallback draw
          if (this.ctx && this.canvasElement) {
            this.ctx.drawImage(
              this.videoElement,
              0,
              0,
              this.canvasElement.width,
              this.canvasElement.height,
            );
          }
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  renderFrame(results) {
    if (!this.ctx || !this.canvasElement) return;

    const width = results.image.width || this.canvasElement.width;
    const height = results.image.height || this.canvasElement.height;

    if (
      this.canvasElement.width !== width ||
      this.canvasElement.height !== height
    ) {
      this.canvasElement.width = width;
      this.canvasElement.height = height;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(results.segmentationMask, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(results.image, 0, 0, width, height);

    ctx.globalCompositeOperation = "destination-over";

    if (this.activeEffect.type === "blur") {
      ctx.filter = `blur(${this.activeEffect.blurAmount || 12}px)`;
      ctx.drawImage(results.image, 0, 0, width, height);
      ctx.filter = "none";
    } else if (this.activeEffect.type === "color") {
      ctx.fillStyle = this.activeEffect.color || "#121316";
      ctx.fillRect(0, 0, width, height);
    } else if (
      this.activeEffect.type === "image" &&
      this.activeEffect.imageElement
    ) {
      const img = this.activeEffect.imageElement;
      if (img.complete && img.naturalWidth > 0) {
        drawImageCover(ctx, img, width, height);
      } else {
        ctx.fillStyle = "#1e2023";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.drawImage(results.image, 0, 0, width, height);
    }

    ctx.restore();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
    }
    if (this.processedStream) {
      this.processedStream.getTracks().forEach((t) => t.stop());
      this.processedStream = null;
    }
  }
}

export const globalBackgroundProcessor = new VideoBackgroundProcessor();
