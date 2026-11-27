import * as React from "react";
import { Avatar, Button, Switch } from "@bixlab/mtone";
import { BlockEditor, type BlockEditorRef } from "@bixlab/mtone-blockeditor";
import {
  createReactInlineContentSpec,
  SuggestionMenuController,
  type SuggestionMenuProps,
} from "@blocknote/react";
import "@bixlab/mtone-blockeditor/styles.css";

// Persist the ID and a display label, not the React component or search response.
const mention = createReactInlineContentSpec(
  {
    type: "mention",
    content: "none",
    propSchema: { id: { default: "" }, label: { default: "" } },
  },
  {
    render: ({ inlineContent: { props } }) => (
      <span
        data-mention-id={props.id}
        style={{
          paddingInline: 4,
          borderRadius: 4,
          color: "var(--mt-accent-blue)",
          background: "var(--mt-select-surface)",
          whiteSpace: "nowrap",
        }}
      >
        @{props.label}
      </span>
    ),
  },
);
const inlineContentSpecs = { mention };
type Person = { id: string; label: string; team: string };
const directory: Person[] = [
  { id: "lin-xiao", label: "林晓", team: "产品设计" },
  { id: "zhou-ran", label: "周然", team: "工程" },
  { id: "chen-yu", label: "陈宇", team: "项目运营" },
];

async function searchPeople(query: string): Promise<Person[]> {
  // Simulate an asynchronous directory. Replace with your app's search service.
  await new Promise((resolve) => setTimeout(resolve, 180));
  const needle = query.trim().toLowerCase();
  return directory.filter((person) =>
    `${person.label} ${person.id}`.includes(needle),
  );
}

function PeopleList({
  items,
  loadingState,
  selectedIndex,
  onItemClick,
}: SuggestionMenuProps<Person>) {
  return (
    <div
      id="bn-suggestion-menu"
      role="listbox"
      aria-label="提及对象"
      aria-busy={loadingState !== "loaded"}
      className="mt-block-editor-suggestions"
    >
      {items.length === 0 && (
        <div
          role="option"
          aria-disabled="true"
          aria-selected="false"
          className="mt-block-editor-empty"
        >
          {loadingState === "loaded" ? "没有匹配的人" : "正在查找…"}
        </div>
      )}
      {items.map((person, index) => (
        <div
          key={person.id}
          id={`bn-suggestion-menu-item-${index}`}
          role="option"
          aria-selected={selectedIndex === index}
          className="mt-block-editor-option"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onItemClick?.(person)}
        >
          <Avatar name={person.label} size="sm" aria-hidden="true" />
          <span>{person.label}</span>
          <small
            style={{ marginInlineStart: "auto", color: "var(--mt-muted)" }}
          >
            {person.team}
          </small>
        </div>
      ))}
    </div>
  );
}

export default function BlockEditorMentionsExample() {
  const ref = React.useRef<BlockEditorRef<typeof inlineContentSpecs>>(null);
  const [readOnly, setReadOnly] = React.useState(false);
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: 10 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Button
          disabled={readOnly}
          onClick={() => {
            const editor = ref.current?.getEditor();
            if (!editor) return;
            const last = editor.document.at(-1);
            if (last) editor.setTextCursorPosition(last, "end");
            editor.focus();
          }}
        >
          定位到正文末尾
        </Button>
        <Switch
          label="只读提及预览"
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
      </div>
      <BlockEditor
        ref={ref}
        label="原生提及示例正文"
        inlineContentSpecs={inlineContentSpecs}
        initialContent={[{ type: "paragraph", content: "试试提及一位项目成员：" }]}
        readOnly={readOnly}
        renderExtensions={(editor) => (
          <SuggestionMenuController
            triggerCharacter="@"
            getItems={searchPeople}
            suggestionMenuComponent={PeopleList}
            onItemClick={({ id, label }) => {
              editor.insertInlineContent([
                { type: "mention", props: { id, label } },
                " ",
              ]);
            }}
          />
        )}
      />
    </div>
  );
}
