import { useCallback, useEffect, useState } from "react";

const KEY = "worth.theme";
const LEGACY_KEY = "tallyo.theme";
export type Theme = "dark" | "light";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** Global light/dark theme. Dark is the default. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(LEGACY_KEY);
    const next: Theme = stored === "light" ? "light" : "dark";
    setTheme(next);
    apply(next);
  }, []);

  const set = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    window.localStorage.setItem(KEY, next);
  }, []);

  return { theme, isDark: theme === "dark", setTheme: set };
}
