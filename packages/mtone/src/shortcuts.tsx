"use client";
import * as React from "react";

export interface ShortcutOptions {
  enabled?: boolean;
  allowInInputs?: boolean;
  preventDefault?: boolean;
}

export interface ShortcutsProviderProps {
  children?: React.ReactNode;
}

export interface ShortcutScopeProps extends ShortcutsProviderProps {
  active?: boolean;
  priority?: number;
}

type Platform = "mac" | "other";
type Shortcut = string | readonly string[] | false;
type Callback = (event: KeyboardEvent) => void;
type BindingOptions = ShortcutOptions & { acceptsEvent?: (event: KeyboardEvent) => boolean };
type Chord = { key: string; modifiers: number };
type Scope = { identity: object; active: boolean; priority: number; depth: number };
type Binding = {
  scope: Scope;
  chords: Chord[];
  read: () => { callback: Callback; options: BindingOptions };
};
type Registry = { register(binding: Binding): () => void; dispatch(event: KeyboardEvent): void };

const CTRL = 1;
const ALT = 2;
const SHIFT = 4;
const META = 8;
const MOD = 16;
const modifierTokens = new Map([
  ["ctrl", CTRL], ["control", CTRL],
  ["alt", ALT], ["option", ALT],
  ["shift", SHIFT],
  ["meta", META], ["cmd", META], ["command", META],
  ["mod", MOD],
]);
const keyAliases = new Map([
  ["esc", "escape"], ["spacebar", "space"], ["plus", "+"],
  ["up", "arrowup"], ["down", "arrowdown"], ["left", "arrowleft"], ["right", "arrowright"],
]);
const displayKeys = new Map([
  ["escape", "Esc"], ["space", "Space"], ["+", "+"],
  ["arrowup", "↑"], ["arrowdown", "↓"], ["arrowleft", "←"], ["arrowright", "→"],
  ["enter", "Enter"], ["tab", "Tab"], ["backspace", "Backspace"], ["delete", "Delete"],
  ["home", "Home"], ["end", "End"], ["pageup", "PageUp"], ["pagedown", "PageDown"],
]);
function normalizeKey(key: string) {
  if (key === " ") return "space";
  const normalized = key.trim().toLowerCase();
  return keyAliases.get(normalized) ?? normalized;
}
function parseShortcut(shortcut: string): Chord | undefined {
  const pieces = shortcut.split("+").map((piece) => piece.trim().toLowerCase());
  const key = normalizeKey(pieces.pop() ?? "");
  if (!key) return undefined;
  let modifiers = 0;
  for (const piece of pieces) {
    const next = modifierTokens.get(piece);
    if (!next) return undefined;
    modifiers |= next;
  }
  return { key, modifiers };
}
function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const info = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  return /mac|ipad|iphone|ipod/i.test(info?.platform || navigator.platform || navigator.userAgent) ? "mac" : "other";
}
function resolveModifiers(modifiers: number, platform: Platform) {
  return modifiers & MOD ? (modifiers & ~MOD) | (platform === "mac" ? META : CTRL) : modifiers;
}

export function formatShortcut(shortcut: string, platform: Platform = getPlatform()): string {
  const chord = parseShortcut(shortcut);
  if (!chord) return shortcut;
  const modifiers = resolveModifiers(chord.modifiers, platform);
  const key = displayKeys.get(chord.key) ?? chord.key.toUpperCase();
  const labels = platform === "mac"
    ? [[CTRL, "⌃"], [ALT, "⌥"], [SHIFT, "⇧"], [META, "⌘"]] as const
    : [[CTRL, "Ctrl"], [ALT, "Alt"], [SHIFT, "Shift"], [META, "Meta"]] as const;
  return [...labels.filter(([bit]) => modifiers & bit).map(([, label]) => label), key]
    .join(platform === "mac" ? "" : "+");
}

export function isShortcutInEditable(event: KeyboardEvent) {
  const path = event.composedPath?.();
  let contentEditable: boolean | undefined;
  for (const target of path?.length ? path : [event.target]) {
    const element = target as Element | null;
    if (typeof element?.closest !== "function") continue;
    if (element.closest("input, textarea, select, [role=textbox], [role=searchbox], [role=spinbutton]")) return true;
    if (element.ownerDocument.designMode === "on") return true;
    if (contentEditable !== undefined) continue;
    const editor = element.closest("[contenteditable]");
    const value = editor?.getAttribute("contenteditable")?.toLowerCase();
    if (value === "" || value === "true" || value === "plaintext-only") contentEditable = true;
    else if (value === "false") contentEditable = false;
    else if ((element as HTMLElement).isContentEditable) contentEditable = true;
  }
  return contentEditable ?? false;
}

function developmentMode() {
  const vite = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;
  if (vite !== undefined) return vite;
  return typeof process !== "undefined" &&
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test");
}

const ROOT_SCOPE: Scope = { identity: {}, active: true, priority: 0, depth: 0 };
const RegistryContext = React.createContext<Registry | null>(null);
const ScopeContext = React.createContext<Scope>(ROOT_SCOPE);

function createRegistry(): Registry {
  const bindings = new Set<Binding>();
  const scopeOrder = new WeakMap<object, number>();
  let nextScopeOrder = 0;

  return {
    register(binding) {
      const { scope, chords } = binding;
      if (!scope.active || !chords.length) return () => {};
      if (!scopeOrder.has(scope.identity)) scopeOrder.set(scope.identity, ++nextScopeOrder);
      if (developmentMode()) {
        const platform = getPlatform();
        for (const existing of bindings) {
          if (existing.scope.identity !== scope.identity) continue;
          const duplicate = chords.find((candidate) => existing.chords.some((old) =>
            old.key === candidate.key &&
            resolveModifiers(old.modifiers, platform) === resolveModifiers(candidate.modifiers, platform)));
          if (duplicate) {
            console.warn(`[mtone] Duplicate shortcut "${duplicate.key}" in the same ShortcutScope.`);
            break;
          }
        }
      }
      bindings.add(binding);
      return () => { bindings.delete(binding); };
    },
    dispatch(event) {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229 ||
        event.key === "AltGraph" || event.getModifierState?.("AltGraph")) return;
      const key = normalizeKey(event.key);
      if (!key || key === "unidentified" || key === "dead" || key === "process") return;
      const modifiers = (event.ctrlKey ? CTRL : 0) | (event.altKey ? ALT : 0) |
        (event.shiftKey ? SHIFT : 0) | (event.metaKey ? META : 0);
      const platform = getPlatform();
      const editable = isShortcutInEditable(event);
      let winner: { scope: Scope; callback: Callback; options: BindingOptions } | undefined;
      for (const binding of bindings) {
        if (!binding.chords.some((chord) => chord.key === key &&
          resolveModifiers(chord.modifiers, platform) === modifiers)) continue;
        const { callback, options } = binding.read();
        if (options.enabled === false || (editable && !options.allowInInputs) ||
          options.acceptsEvent?.(event) === false) continue;
        const { scope } = binding;
        const priority = winner ? scope.priority - winner.scope.priority : 0;
        const depth = winner ? scope.depth - winner.scope.depth : 0;
        const order = winner ? scopeOrder.get(scope.identity)! - scopeOrder.get(winner.scope.identity)! : 0;
        // The Set preserves first registration within an otherwise equal scope.
        if (!winner || (priority || depth || order) > 0) winner = { scope, callback, options };
      }
      if (!winner) return;
      if (winner.options.preventDefault !== false) event.preventDefault();
      winner.callback(event);
    },
  };
}

/** One document listener per root provider; nested providers reuse that root. */
export function ShortcutsProvider({ children }: ShortcutsProviderProps) {
  const parent = React.useContext(RegistryContext);
  const [local] = React.useState(createRegistry);
  React.useEffect(() => {
    if (parent || typeof document === "undefined") return;
    document.addEventListener("keydown", local.dispatch);
    return () => document.removeEventListener("keydown", local.dispatch);
  }, [parent, local]);
  return <RegistryContext.Provider value={parent ?? local}>{children}</RegistryContext.Provider>;
}

/** Activates or suspends shortcut registrations for the React subtree (including its portals). */
export function ShortcutScope({ children, active = true, priority = 0 }: ShortcutScopeProps) {
  const parent = React.useContext(ScopeContext);
  const [identity] = React.useState(() => ({}));
  const scope = React.useMemo<Scope>(() => ({
    identity, active: active && parent.active,
    priority: Number.isFinite(priority) ? priority : 0,
    depth: parent.depth + 1,
  }), [identity, active, parent, priority]);
  return <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>;
}

export function useHasShortcutsProvider() {
  return React.useContext(RegistryContext) !== null;
}

/** Internal binding entry for library controls with a more precise target policy. */
export function useShortcutBinding(shortcut: Shortcut, callback: Callback, options: BindingOptions = {}) {
  const registry = React.useContext(RegistryContext);
  const scope = React.useContext(ScopeContext);
  const latest = React.useRef({ callback, options });
  React.useLayoutEffect(() => { latest.current = { callback, options }; });
  const enabled = options.enabled !== false;
  const key = JSON.stringify(shortcut === false ? [] : typeof shortcut === "string" ? [shortcut] : shortcut);
  React.useLayoutEffect(() => {
    if (!registry || !scope.active || !enabled) return;
    const chords = (JSON.parse(key) as string[]).map(parseShortcut).filter((chord): chord is Chord => !!chord);
    return registry.register({ scope, chords, read: () => latest.current });
  }, [registry, scope, enabled, key]);
}

/** Registers one exact chord or alternatives in the nearest active shortcut scope. */
export function useShortcut(shortcut: Shortcut, callback: Callback, options?: ShortcutOptions) {
  useShortcutBinding(shortcut, callback, options);
}
