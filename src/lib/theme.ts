import { useCallback, useEffect, useState } from "react";

<<<<<<< HEAD
const KEY = "worth.theme";
const LEGACY_KEY = "tallyo.theme";
=======
const KEY = "tallyo.theme";
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
<<<<<<< HEAD
    const stored = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(LEGACY_KEY);
=======
    const stored = window.localStorage.getItem(KEY);
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
