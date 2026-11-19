import React, { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import type { MtoneTheme } from "../../packages/mtone/src";
import "./theme-preference.css";

// The synchronous scripts in index.html and showcase.html read this same key.
const storageKey = "mtone-docs-theme";

function normalize(value: string | null | undefined): MtoneTheme {
  return value === "light" || value === "dark" ? value : "system";
}

export function useThemePreference() {
  const [theme, setTheme] = useState(() => normalize(document.documentElement.dataset.mtTheme));

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const next = normalize(event.newValue);
      document.documentElement.dataset.mtTheme = next;
      setTheme(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function setPreference(next: MtoneTheme) {
    document.documentElement.dataset.mtTheme = next;
    setTheme(next);
    try {
      if (next === "system") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, next);
    } catch {
      // Switching still works for this page when storage is unavailable.
    }
  }

  return { theme, setPreference };
}

export type ThemePreference = ReturnType<typeof useThemePreference>;

const themeModes = [
  { value: "light", label: "浅色", Icon: Sun },
  { value: "dark", label: "深色", Icon: Moon },
  { value: "system", label: "跟随系统", Icon: Monitor },
] as const;

export function ThemeSelect({ theme, setPreference }: ThemePreference) {
  return (
    <div className="docs-theme-options" role="group" aria-label="颜色主题">
      {themeModes.map(({ value, label, Icon }) => (
        <button
          type="button"
          key={value}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => setPreference(value)}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
