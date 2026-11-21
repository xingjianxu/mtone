/** Typography has one documentation page; standalone exports remain searchable. */
export const typographySections = [
  { name: "Title", label: "Title 标题" },
  { name: "Text", label: "Text 文本" },
  { name: "Paragraph", label: "Paragraph 段落" },
  { name: "Link", label: "Link 链接" },
  { name: "Blockquote", label: "Blockquote 引用" },
  { name: "Code", label: "Code 代码", namespaceOnly: true },
] as const;

export const standaloneTypographySections = typographySections.filter((section) => !("namespaceOnly" in section));

export function isTypographySection(name: string) {
  return typographySections.some((section) => section.name === name);
}

export function typographySectionId(name: string) {
  return `typography-${name.toLowerCase()}`;
}

export function componentDocHref(name: string) {
  return isTypographySection(name)
    ? `#/components/Typography?section=${name}`
    : `#/components/${name}`;
}

export function focusTypographySection(name: string) {
  const section = document.getElementById(typographySectionId(name));
  section?.scrollIntoView?.({ behavior: "instant", block: "start" });
  section?.focus({ preventScroll: true });
}

/** Preserve browser open-in-new-tab behavior on modified link clicks. */
export function handleTypographyNavigation(
  event: {
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
  },
  name: string,
) {
  if (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    focusTypographySection(name);
  }
}
