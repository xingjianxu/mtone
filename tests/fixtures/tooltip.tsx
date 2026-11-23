import React from "react";
import { createRoot } from "react-dom/client";
import { Button, MtoneProvider, Tooltip, TooltipProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const params = new URLSearchParams(location.search);
const sides = ["top", "bottom", "left", "right"] as const;
const side = sides.find((value) => value === params.get("side")) ?? "bottom";

function Geometry({ edge }: { edge: boolean }) {
  const [wide, setWide] = React.useState(false);
  const [moved, setMoved] = React.useState(false);
  const [far, setFar] = React.useState(false);
  const container = React.useRef<HTMLElement>(null);
  return (
    <main ref={container} data-testid="tooltip-portal" style={{ position: "relative", minHeight: "100vh" }}>
      {!edge && (
        <div style={{ display: "flex", gap: 8, padding: 12 }}>
          <Button onClick={() => setWide(true)}>Grow content</Button>
          <Button onClick={() => setMoved(true)}>Move anchor</Button>
          <Button onClick={() => setFar(true)}>Increase offset</Button>
        </div>
      )}
      <Tooltip
        open
        side={edge ? "top" : side}
        align={edge ? "start" : side === "left" || side === "right" ? "center" : "end"}
        offset={far ? 26 : 12}
        arrow
        arrowPadding={6}
        avoidCollisions
        shift
        zIndex={1603}
        container={container}
        classNames={{
          popup: "test-tooltip-popup",
          positioner: "test-tooltip-positioner",
          arrow: "test-tooltip-arrow",
        }}
        styles={{ popup: { fontSize: 13 } }}
        content={<div style={{ width: wide ? 207 : 146 }}>Geometry hint</div>}
      >
        <Button style={{
          position: "absolute",
          width: 100,
          top: edge ? 4 : 240,
          ...(edge ? { right: 4 } : { left: moved ? 410 : 310 }),
        }}>
          Geometry target
        </Button>
      </Tooltip>
    </main>
  );
}

function Interactions() {
  return (
    <TooltipProvider delay={0} closeDelay={0}>
      <main style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: 48, minHeight: 180 }}>
        <Tooltip content="Pointer hint">
          <Button>Hover target</Button>
        </Tooltip>
        <Tooltip trigger="focus" content="Keyboard hint">
          <Button>Focus target</Button>
        </Tooltip>
        <Tooltip trigger="click" keepMounted content={<span data-testid="click-copy">Click hint</span>}>
          <Button>Click target</Button>
        </Tooltip>
        <Tooltip trigger="contextMenu" content="Context hint">
          <Button>Context target</Button>
        </Tooltip>
        <Tooltip wrapDisabledTrigger content="Disabled reason">
          <Button disabled>Disabled feature</Button>
        </Tooltip>
        <Tooltip disabled content="Must not render">
          <Button>Suppressed target</Button>
        </Tooltip>
        <Button>Outside target</Button>
      </main>
    </TooltipProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <MtoneProvider locale="en" theme="light">
    {params.has("interactions") ? <Interactions /> : <Geometry edge={params.has("edge")} />}
  </MtoneProvider>,
);
