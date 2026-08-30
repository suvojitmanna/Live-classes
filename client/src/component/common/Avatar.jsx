import React from "react";

const AVATAR_GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-purple-600 to-pink-600",
  "from-amber-600 to-orange-600",
  "from-rose-600 to-red-600",
  "from-cyan-600 to-blue-600",
];

const Avatar = ({ name = "User", avatar, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-16 h-16 text-xl font-bold",
    xl: "w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl font-bold",
  };

  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const colorIndex = (name || "User").charCodeAt(0) % AVATAR_GRADIENTS.length;
  const gradient = AVATAR_GRADIENTS[colorIndex];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-md select-none ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
