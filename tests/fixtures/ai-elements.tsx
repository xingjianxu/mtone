import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AiChat, AiConfirmation, AiInlineCitation, AiMessage, AiModelSelector,
  AiPlan, AiPromptInput, AiTerminal, Button, MtoneProvider,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Demo() {
  const [dark, setDark] = React.useState(false);
  const [messages, setMessages] = React.useState(
    Array.from({ length: 12 }, (_, i) => `Message ${i + 1}`),
  );
  const [approved, setApproved] = React.useState(false);
  const [value, setValue] = React.useState("");
  const append = (text: string) => setMessages(rows => [...rows, text]);
  return <MtoneProvider locale="en" theme={dark ? "dark" : "light"}>
    <main style={{ maxWidth: 700, padding: 12, background: "var(--mt-bg)", color: "var(--mt-fg)" }}>
      <Button type="button" onClick={() => setDark(!dark)}>Toggle theme</Button>
      <Button type="button" onClick={() => append("Stream update")}>Append</Button>
      <AiChat aria-label="Agent conversation" style={{ height: 360 }} footer={
        <AiPromptInput value={value} onValueChange={setValue} onSubmit={({ text }) => {
          append(text); setValue("");
        }} toolbar={
          <AiModelSelector models={[{ value: "fast", label: "Fast model" }]}
            value="fast" onValueChange={() => {}} />
        } />
      }>
        {messages.map((text, i) => <AiMessage key={i} from={i % 2 ? "assistant" : "user"}>{text}</AiMessage>)}
      </AiChat>
      <AiPlan items={[{ id: "one", title: "Summarize files", status: "completed" }]} />
      <AiConfirmation title="Confirm summary" state={approved ? "approved" : "pending"}
        onConfirm={() => setApproved(true)} onReject={() => {}} />
      <AiInlineCitation source={{ id: "safe", title: "Reference", url: "https://example.test" }} />
      <AiTerminal output={"x".repeat(180)} />
    </main>
  </MtoneProvider>;
}
createRoot(document.getElementById("root")!).render(<Demo />);
