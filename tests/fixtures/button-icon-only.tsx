import React from "react";
import { createRoot } from "react-dom/client";
import { Search } from "lucide-react";
import { Alert, Button, Tag, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const icon = <Search size={14} aria-hidden="true" />;

createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <div style={{ display: "flex", gap: 12, direction: "rtl" }}>
      <Button iconOnly aria-label="Small icon" size="small" leftSection={icon} />
      <Button iconOnly aria-label="Medium icon" icon={icon} />
      <Button iconOnly aria-label="Large icon" size="large" rightSection={icon} />
      <Button size="sm" leftSection={icon}>
        Text with start
      </Button>
      <Button size="lg" rightSection={icon}>
        Text with end
      </Button>
    </div>
    <Button size="normal">Normal text</Button>
    <Alert title="Review" onClose={() => {}}>A message</Alert>
    <Tag variant="filter" onRemove={() => {}}>Project</Tag>
    <div style={{ "--mt-height": "40px" } as React.CSSProperties}>
      <Button iconOnly aria-label="Themed icon">
        {icon}
      </Button>
    </div>
  </MtoneProvider>,
);
