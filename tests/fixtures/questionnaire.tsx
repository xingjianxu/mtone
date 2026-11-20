import React from "react";
import { createRoot } from "react-dom/client";
import {
  MtoneProvider,
  Questionnaire,
  type QuestionnaireItem,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const items: QuestionnaireItem[] = [
  {
    id: "tool",
    type: "single",
    title: "Choose a tool",
    required: true,
    choices: [
      { value: "docs", label: "Documentation" },
      { value: "tests", label: "Testing" },
    ],
    other: { label: "Another tool" },
  },
  {
    id: "topics",
    type: "multiple",
    title: "Choose topics",
    choices: [
      { value: "review", label: "Independent review" },
      { value: "samples", label: "Examples" },
    ],
  },
  { id: "notes", type: "text", title: "Notes", required: true },
];
function Fixture() {
  const [answer, setAnswer] = React.useState("");
  return (
    <MtoneProvider
      locale="en"
      theme={location.search.includes("dark") ? "dark" : "light"}
    >
      <main style={{ maxWidth: 520, padding: 12, margin: "0 auto" }}>
        <button type="button">Before survey</button>
        <Questionnaire
          items={items}
          onSubmit={(answers) => setAnswer(JSON.stringify(answers))}
        />
        <output data-testid="answer">{answer}</output>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
