import React, { useEffect, useRef, useState } from "react";
import type { OutlineEntry } from "./doc-section";

export function sectionHref(name: string, id: string) {
  const legacyTypography = name === "Typography" ? /^typography-([a-z]+)$/.exec(id)?.[1] : undefined;
  return `#/components/${name}?section=${legacyTypography ? legacyTypography[0].toUpperCase() + legacyTypography.slice(1) : id}`;
}

export function focusDocSection(id: string) {
  const section = document.getElementById(id);
  section?.scrollIntoView?.({ block: "start" });
  section?.focus({ preventScroll: true });
}

function flatten(entries: readonly OutlineEntry[]): string[] {
  return entries.flatMap((entry) => [entry.id, ...flatten(entry.children ?? [])]);
}

export function ComponentOutline({ name, entries, section }: {
  name: string;
  entries: readonly OutlineEntry[];
  section?: string;
}) {
  const currentSection = name === "Typography" && /^[A-Z]/.test(section ?? "") ? `typography-${section!.toLowerCase()}` : section;
  const [active, setActive] = useState<string | undefined>(currentSection ?? entries[0]?.id);
  const mobile = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const ids = flatten(entries);
    const update = () => {
      const positions = ids.map((id) => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top }));
      const cutoff = (document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 68) + 32;
      const seen = positions.filter(({ top }) => top !== undefined && top <= cutoff);
      const root = document.documentElement;
      const isAtBottom = root.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= root.scrollHeight - 2;
      setActive(isAtBottom ? ids.at(-1) : seen.at(-1)?.id ?? currentSection ?? ids[0]);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [entries, currentSection]);
  function links(items: readonly OutlineEntry[]) {
    return <ul>{items.map((item) => <li key={item.id}>
      <a href={sectionHref(name, item.id)} aria-current={active === item.id ? "location" : undefined}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if (mobile.current) mobile.current.open = false;
          if (window.location.hash === sectionHref(name, item.id)) focusDocSection(item.id);
        }}>{item.title}</a>
      {item.children?.length ? links(item.children) : null}
    </li>)}</ul>;
  }
  return <>
    <aside className="component-outline-desktop">
      <nav aria-label="本页目录">{links(entries)}</nav>
    </aside>
    <details className="component-outline-mobile" ref={mobile}>
      <summary>本页目录</summary>
      <nav aria-label="本页目录">{links(entries)}</nav>
    </details>
  </>;
}
