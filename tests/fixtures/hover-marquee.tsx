import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { HoverMarquee } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const text =
  "An extended project label ending in an unmistakable final word END";
function Fixture() {
  const [expanded, setExpanded] = useState(false);
  const [short, setShort] = useState(false);
  return (
    <>
      <button onClick={() => setExpanded((v) => !v)}>Resize</button>
      <button onClick={() => setShort((v) => !v)}>Change label</button>
      <div style={{ width: expanded ? 800 : 142 }}>
        <HoverMarquee data-testid="long">{short ? "Fit" : text}</HoverMarquee>
      </div>
      <button>After</button>
      <div style={{ width: 142 }}>
        <HoverMarquee data-testid="short">Short label</HoverMarquee>
      </div>
      <div style={{ width: 142 }}>
        <HoverMarquee data-testid="rich">
          <strong id="formatted-start">Formatted start</strong> followed by a
          long rich label
          <button type="button">Single interactive source</button>
        </HoverMarquee>
      </div>
      <div dir="rtl" style={{ width: 142 }}>
        <HoverMarquee data-testid="rtl">
          هذه الجملة العربية الطويلة بما يكفي لتمرير جزء من النص
        </HoverMarquee>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
