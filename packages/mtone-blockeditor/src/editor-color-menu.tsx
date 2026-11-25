import * as React from "react";
import type { MenuEntry } from "@bixlab/mtone";
import type { Editor } from "./block-editor";
import { EditorToolbarMenu } from "./editor-toolbar-menu";

const colors = [
  ["default", "默认", "Auto"],
  ["neutral", "中性", "Neutral"],
  ["red", "红色", "Red"],
  ["orange", "橙色", "Orange"],
  ["green", "绿色", "Green"],
  ["teal", "青色", "Teal"],
  ["blue", "蓝色", "Blue"],
  ["purple", "紫色", "Purple"],
  ["coral", "珊瑚色", "Coral"],
] as const;
type ColorStyles = ReturnType<Editor["getActiveStyles"]>;

export function EditorColorMenu({
  editor,
  styles,
  zh,
  surface,
  open,
  setOpen,
}: {
  editor: Editor;
  styles: ColorStyles;
  zh: boolean;
  surface: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const items: MenuEntry[] = (["textColor", "backgroundColor"] as const).map(
    (style) => {
      const isBackground = style === "backgroundColor";
      return {
        type: "radio-group",
        key: style,
        label: isBackground
          ? zh
            ? "背景色"
            : "Background"
          : zh
            ? "文字色"
            : "Text",
        value: styles[style] || "default",
        onValueChange: (value) => {
          if (value === "default") editor.removeStyles({ [style]: "default" });
          else editor.addStyles({ [style]: value });
          editor.focus();
          setOpen(false);
        },
        children: colors.map(([value, chinese, english]) => ({
          key: value,
          label: zh ? chinese : english,
          icon: (
            <span
              className="mt-block-editor-color-chip"
              data-background={
                isBackground && value !== "default" ? "" : undefined
              }
              style={
                {
                  "--mt-swatch":
                    value === "default"
                      ? "var(--mt-fg)"
                      : `var(--mt-accent-${value})`,
                  "--mt-swatch-ink":
                    !isBackground && value !== "default"
                      ? `var(--mt-accent-${value})`
                      : "var(--mt-fg)",
                } as React.CSSProperties
              }
            >
              A
            </span>
          ),
        })),
      };
    },
  );
  return (
    <EditorToolbarMenu
      colorMenu
      surface={surface}
      label={zh ? "文字色和背景色" : "Text and background color"}
      open={open}
      setOpen={setOpen}
      onEscape={() => editor.focus()}
      trigger={{
        "aria-label": zh ? "颜色" : "Color",
        iconOnly: true,
        children: (
          <span className="mt-block-editor-color-icon" aria-hidden>
            A
          </span>
        ),
      }}
      items={items}
    />
  );
}
