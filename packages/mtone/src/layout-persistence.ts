import * as React from "react";

export const SidebarResizeCollapseContext = React.createContext<((collapsed: boolean) => void) | null>(null);
export const SplitterStorageScopeContext = React.createContext("splitter");

const storageId = (scope: string, key: string) =>
  `mtone:layout:v1:${scope}:${key}`;

export function readLayout(scope: string, key: string): unknown {
  try {
    const raw = window.localStorage.getItem(storageId(scope, key));
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function saveLayout(scope: string, key: string, value: unknown) {
  try {
    window.localStorage.setItem(storageId(scope, key), JSON.stringify(value));
  } catch {
    // Layout still works when storage is unavailable or full.
  }
}

export function useLayoutPreference<T>(
  scope: string,
  key: string | undefined,
  fallback: T,
  decode: (saved: unknown) => T | undefined,
) {
  const config = React.useRef({ fallback, decode });
  config.current = { fallback, decode };
  const [snapshot, setSnapshot] = React.useState(() => ({ key, value: fallback }));

  React.useLayoutEffect(() => {
    if (!key) {
      setSnapshot((prior) => prior.key === key ? prior : { key, value: config.current.fallback });
      return;
    }
    const { decode, fallback } = config.current;
    setSnapshot({ key, value: decode(readLayout(scope, key)) ?? fallback });
  }, [scope, key]);

  const set = (value: T, persist = true) => {
    setSnapshot({ key, value });
    if (key && persist) saveLayout(scope, key, value);
  };
  return [snapshot.key === key ? snapshot.value : fallback, set] as const;
}

export const readBoolean = (value: unknown) => typeof value === "boolean" ? value : undefined;
