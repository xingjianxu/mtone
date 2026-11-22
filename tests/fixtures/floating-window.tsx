import React from "react";
import { createRoot } from "react-dom/client";
import { Button, FloatingWindow, Input, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Demo() {
  const [clicks, setClicks] = React.useState(0);
  return <MtoneProvider locale="en" theme="dark">
    <main style={{ minHeight: "110vh", padding: 8 }}>
      <FloatingWindow title="Notes" trigger="Open notes"
        initialPosition={{ left: 120, top: 100 }} initialSize={{ width: 380, height: 260 }}
        minWidth={220} minHeight={140} maxWidth={500} maxHeight={360}>
        <Input.TextArea aria-label="Draft" rows={3} />
        <p style={{ minHeight: 420 }}>Additional scrollable window content</p>
      </FloatingWindow>
      <Button onClick={() => setClicks((current) => current + 1)}>Background action</Button>
      <p role="status">Background clicks: {clicks}</p>
    </main>
  </MtoneProvider>;
}
createRoot(document.getElementById("root")!).render(<Demo />);
