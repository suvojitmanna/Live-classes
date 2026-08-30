import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(() => {
    const saved = localStorage.getItem("app_theme_mode");
    if (saved === "system" || saved === "dark" || saved === "light") {
      return saved;
    }
    return "system";
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const effectiveTheme =
    themeMode === "system" ? (systemIsDark ? "dark" : "light") : themeMode;

  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [isDark]);

  const setThemeMode = (mode) => {
    if (mode === "system" || mode === "dark" || mode === "light") {
      localStorage.setItem("app_theme_mode", mode);
      setThemeModeState(mode);
    }
  };

  const toggleTheme = () => {
    if (themeMode === "system") {
      setThemeMode(isDark ? "light" : "dark");
    } else if (themeMode === "dark") {
      setThemeMode("light");
    } else {
      setThemeMode("dark");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        theme: effectiveTheme,
        effectiveTheme,
        isDark,
        setThemeMode,
        setTheme: setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
