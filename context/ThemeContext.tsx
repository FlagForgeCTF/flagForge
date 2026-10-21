"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  // Stays false until the real theme is read, so the first effect run doesn't
  // strip the "dark" class the inline script in app/layout.tsx already applied
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // The inline head script already resolved stored/system preference
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("flagforge-theme", theme);
    } catch {
      // Storage unavailable (private mode / blocked); theme still applies
    }
  }, [theme, initialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
