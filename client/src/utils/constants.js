export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_OTP: "/auth/resend-otp",
    LOGIN: "/auth/login",
    GOOGLE: "/auth/google",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_OTP: "/auth/verify-reset-otp",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
  },
  SESSION: {
    CREATE: "/session/create",
    JOIN: "/session/join",
    END: "/session/end",
    LEAVE: "/session/leave",
    GET: "/session",
    LIST: "/session/list",
    DELETE: "/session/delete",
  },
  CALL: {
    HISTORY: "/call/history",
    CHECK_USER: "/call/check-user",
    DELETE: "/call",
  },
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  MEETING: "/meeting",
  HOST: "/host",
  JOIN: "/join",
};

export const getIceServers = () => {
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ];
};

export const APP_CONFIG = {
  APP_NAME: "Live Classes",
  APP_DESCRIPTION:
    "Connect, learn, and collaborate in real time with high-quality native WebRTC video conferencing, screen sharing, and interactive chat inspired by Google Meet.",
  APP_TAGLINE: "Connect, Learn, Grow Together",

  // Social Media Links
  SOCIAL_LINKS: {
    GITHUB: "https://github.com",
    TWITTER: "https://twitter.com",
    LINKEDIN: "https://linkedin.com",
    EMAIL: "mailto:support@liveclasses.com",
  },

  // Footer Links
  FOOTER_LINKS: {
    QUICK_LINKS: [
      { label: "Home", route: "/", isExternal: false },
      { label: "Dashboard", route: "/dashboard", isExternal: false },
      { label: "Sign In", route: "/login", isExternal: false },
      { label: "Sign Up", route: "/register", isExternal: false },
    ],
    SUPPORT_LINKS: [
      { label: "Help Center", url: "#", isExternal: true },
      { label: "Documentation", url: "#", isExternal: true },
      { label: "Privacy Policy", url: "#", isExternal: true },
      { label: "Terms of Service", url: "#", isExternal: true },
    ],
  },

  // Copyright
  COPYRIGHT_TEXT: "All rights reserved.",

  // Features Data (for Home and Dashboard)
  FEATURES: [
    {
      icon: "FaVideo",
      title: "HD WebRTC Video",
      description:
        "Peer-to-peer crystal clear video and spatial audio powered by native WebRTC",
      shortDescription: "Crystal clear peer-to-peer video streaming",
      color: "blue",
    },
    {
      icon: "FaDesktop",
      title: "Screen Sharing",
      description:
        "Share your entire screen, application window, or browser tab with full audio",
      shortDescription: "High-framerate screen and application sharing",
      color: "teal",
    },
    {
      icon: "FaComments",
      title: "Real-Time Chat",
      description:
        "Instant meeting chat and participant interactions powered by Socket.IO",
      shortDescription: "Real-time room messaging during live sessions",
      color: "green",
    },
    {
      icon: "FaShieldAlt",
      title: "Secure & Verified",
      description:
        "End-to-end media encryption, OTP email verification, and Google OAuth login",
      shortDescription: "Protected rooms with Google OAuth & OTP",
      color: "purple",
    },
  ],

  // Benefits Data
  BENEFITS: [
    "Native WebRTC peer-to-peer performance",
    "Full HD screen sharing capabilities",
    "Pre-join meeting lobby with camera/mic check",
    "Google Meet-style responsive video layout",
    "Google OAuth & 6-digit OTP verification",
    "No third-party SDK dependencies",
  ],

  // Trust Indicators
  TRUST_INDICATORS: [
    "No plugins required",
    "Native WebRTC HD",
    "Setup in seconds",
  ],

  // Home Page Content
  HOME_CONTENT: {
    HERO: {
      BADGE_TEXT: "Start Your Video Meeting Instantly",
      HEADING: "Connect, Collaborate,",
      HEADING_HIGHLIGHT: "Learn Together",
      SUBHEADING:
        "Host and join real-time interactive video classes with ultra-low latency WebRTC streaming, screen sharing, and Google Meet-style collaboration.",
      CTA_AUTHENTICATED: "Go to Dashboard",
      CTA_PRIMARY: "Get Started Free",
      CTA_SECONDARY: "Sign In",
    },
    FEATURES: {
      HEADING: "Next-Gen Real-Time Video Platform",
      DESCRIPTION:
        "Engineered for smooth classes, lectures, and team collaboration with low latency",
    },
    BENEFITS: {
      HEADING: "Why Choose {APP_NAME}?",
      DESCRIPTION:
        "Experience lightning-fast video meetings with zero external video SDK locks.",
    },
    CTA: {
      HEADING: "Ready to Host Your Next Live Session?",
      DESCRIPTION:
        "Join instructors and students collaborating smoothly every day.",
      BUTTON_AUTHENTICATED: "Go to Dashboard",
      BUTTON_GUEST: "Get Started Free",
    },
  },

  // Dashboard Content
  DASHBOARD_CONTENT: {
    WELCOME: {
      GREETING: "Welcome back, {userName}! 👋",
      DESCRIPTION: "Start a new meeting or join an active live session",
    },
    ACTION_CARDS: {
      HOST: {
        TITLE: "New Meeting",
        DESCRIPTION:
          "Start an instant Google Meet-style video room and share the invite code",
        BUTTON: "Start Meeting",
        BUTTON_LOADING: "Creating Meeting...",
      },
      JOIN: {
        TITLE: "Join Meeting",
        DESCRIPTION:
          "Enter a meeting room code or link to join an existing session",
        BUTTON: "Join Meeting",
      },
    },
    SESSIONS_LIST: {
      HEADING: "Your Meetings & Classes",
      DESCRIPTION: "Active and past video sessions you hosted or attended",
      LOADING: "Loading meetings...",
      EMPTY: "No meetings yet. Start your first session above!",
      FILTER_ALL: "All",
      FILTER_ACTIVE: "Active",
      FILTER_ENDED: "Ended",
      REJOIN_BUTTON: "Rejoin",
      ENDED_BUTTON: "Ended",
    },
  },

  // Session Content
  SESSION_CONTENT: {
    JOIN_FORM: {
      HEADING: "Join a Meeting",
      DESCRIPTION:
        "Enter the meeting code (e.g., abc-defg-hij) to enter the lobby",
      ROOM_ID_LABEL: "Meeting Code",
      ROOM_ID_PLACEHOLDER: "abc-defg-hij",
      ROOM_ID_HELP: "Enter the 10-character code from your invitation",
      BUTTON: "Enter Lobby",
      BUTTON_LOADING: "Checking Room...",
    },
    INFO_CARD: {
      HEADING: "Meeting Details",
      ROOM_ID_LABEL: "Meeting Code",
      SHAREABLE_LINK_LABEL: "Meeting Link",
      COPY_BUTTON: "Copy",
      COPIED_BUTTON: "Copied!",
      STATUS_LABEL: "Status",
      PARTICIPANTS_LABEL: "In Call",
    },
    HEADER: {
      HOSTING_TITLE: "Live Meeting",
      JOINING_TITLE: "Join Meeting",
      END_SESSION_BUTTON: "End Call for All",
    },
    VIDEO: {
      TITLE: "Live Video Stream",
      CONNECTED: "Connected",
      FULLSCREEN: "Fullscreen",
      CONNECTING: "Connecting to peers...",
      LEAVE_BUTTON: "Leave Meeting",
      END_BUTTON: "End Meeting",
    },
    PARTICIPANTS: {
      HEADING: "People",
      HOST_LABEL: "Host",
      PARTICIPANT_LABEL: "Participant",
      JOINED_USERS_LABEL: "In Meeting",
      EMPTY_MESSAGE: "Waiting for others to join...",
    },
  },

  // Auth Content
  AUTH_CONTENT: {
    LOGIN: {
      HEADING: "Welcome Back",
      DESCRIPTION: "Sign in to access your classes and meetings",
    },
    REGISTER: {
      HEADING: "Create Your Account",
      DESCRIPTION: "Sign up to host and attend real-time video sessions",
    },
  },

  // Loading Messages
  LOADING_MESSAGES: {
    SESSION: "Preparing meeting room...",
    SESSIONS: "Loading meetings...",
    GENERAL: "Loading...",
  },
};
