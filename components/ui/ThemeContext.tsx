"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ThemeColors = {
  dashBg: string;
  dashPrimary: string;
  dashTextPrimary: string;
  dashTextSecondary: string;
  dashDanger: string;
  dashSurface: string;
  dashSidebar: string;
  dashBorder: string;
};

export const defaultTheme: ThemeColors = {
  dashBg: "#fbfbfb",
  dashPrimary: "#1aaeed",
  dashTextPrimary: "#111111",
  dashTextSecondary: "#6b7280",
  dashDanger: "#ef4444",
  dashSurface: "#ffffff",
  dashSidebar: "#ffffff",
  dashBorder: "#e2e8f0",
};

interface ThemeContextType {
  colors: ThemeColors;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  resetToDefault: () => void;
  loadPreset: (preset: Partial<ThemeColors>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const savedTheme = localStorage.getItem("edunai_custom_theme");
    if (savedTheme) {
      try {
        setColors({ ...defaultTheme, ...JSON.parse(savedTheme) });
      } catch (e) {
        console.error("Failed to parse theme", e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply variables to document root
    const root = document.documentElement;
    root.style.setProperty("--dash-bg", colors.dashBg);
    root.style.setProperty("--dash-primary", colors.dashPrimary);
    root.style.setProperty("--dash-text-primary", colors.dashTextPrimary);
    root.style.setProperty("--dash-text-secondary", colors.dashTextSecondary);
    root.style.setProperty("--dash-danger", colors.dashDanger);
    root.style.setProperty("--dash-surface", colors.dashSurface);
    root.style.setProperty("--dash-sidebar", colors.dashSidebar);
    root.style.setProperty("--dash-border", colors.dashBorder);

    // Save to localStorage
    localStorage.setItem("edunai_custom_theme", JSON.stringify(colors));
  }, [colors, mounted]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefault = () => {
    setColors(defaultTheme);
  };

  const loadPreset = (preset: Partial<ThemeColors>) => {
    setColors((prev) => ({ ...prev, ...preset }));
  };

  return (
    <ThemeContext.Provider
      value={{ colors, updateColor, resetToDefault, loadPreset }}
    >
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
