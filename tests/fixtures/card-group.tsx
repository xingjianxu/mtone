import React from "react";
import { createRoot } from "react-dom/client";
import {
  Card,
  CardGroup,
  MtoneProvider,
  Button,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Demo() {
  const [count, setCount] = React.useState(0);
  return (
    <MtoneProvider locale="en">
      <main style={{ maxWidth: 900, margin: "auto", padding: 16 }}>
        <CardGroup
          data-testid="group"
          columns={{ xs: 1, md: 3 }}
          gap={{ xs: 16, md: 24 }}
          divided
        >
          <CardGroup.Item span={2}>
            <Card
              data-testid="fold"
              title="Project"
              collapsible
              extra={
                <Button onClick={() => setCount((x) => x + 1)}>
                  Action {count}
                </Button>
              }
            >
              <input aria-label="Draft" defaultValue="Keep me" />
              <p>Project description</p>
            </Card>
          </CardGroup.Item>
          <Card title="Other">Other content</Card>
          <CardGroup.Item span={2}>
            <Card title="Second row">Second row content</Card>
          </CardGroup.Item>
        </CardGroup>
        <CardGroup
          data-testid="vertical"
          direction="vertical"
          divided
          style={{ marginTop: 40 }}
        >
          <Card>A</Card>
          <Card>B</Card>
        </CardGroup>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
