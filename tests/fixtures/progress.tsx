import React from "react";
import { createRoot } from "react-dom/client";
import { Progress, MtoneProvider, Button } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Fixture() {
  const [value, setValue] = React.useState(40);
  return (
    <MtoneProvider>
      <div style={{ maxWidth: 500, padding: 16, display: "grid", gap: 20 }}>
        <Progress value={value} label="legacy" />
        <Progress value={value} label="active" status="active" showInfo />
        <Progress value={value} label="segments" steps={8} showInfo />
        <Progress
          value={value}
          label="gradient"
          color={{ from: "#7d9c84", to: "#5378aa" }}
          success={{ value: 20 }}
          showInfo
        />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Progress type="circle" value={value} label="circle" showInfo />
          <Progress type="dashboard" value={value} label="dashboard" showInfo />
          <Progress
            type="circle"
            value={value}
            label="ring steps"
            steps={12}
            showInfo
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => setValue((v) => Math.min(100, v + 20))}>
            Increase
          </Button>
          <Button onClick={() => setValue(0)}>Reset</Button>
        </div>
      </div>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
