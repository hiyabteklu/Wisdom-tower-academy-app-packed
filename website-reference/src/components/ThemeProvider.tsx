"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

export type ThemeMode = "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolved: "dark";
  setTheme: (t: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "wt-theme";

function forceDark() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-light", "light");
  root.classList.add("theme-dark", "dark");
  root.style.colorScheme = "dark";
  root.setAttribute("data-theme", "dark");
  try {
    localStorage.setItem(STORAGE_KEY, "dark");
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    forceDark();
  }, []);

  const setTheme = useCallback((_t: ThemeMode) => {
    forceDark();
  }, []);

  const value = useMemo(
    () => ({ theme: "dark" as const, resolved: "dark" as const, setTheme }),
    [setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark" as ThemeMode,
      resolved: "dark" as const,
      setTheme: (_: ThemeMode) => {},
    };
  }
  return ctx;
}
