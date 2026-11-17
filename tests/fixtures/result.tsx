import * as React from "react";
import { createRoot } from "react-dom/client";
import { Result, Button, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Fixture() {
  const [done, setDone] = React.useState(false);
  return (
    <MtoneProvider>
      <Result
        data-testid="interactive"
        status={done ? "success" : "error"}
        title={done ? "Completed" : "Submission failed"}
        subTitle="Please check the details"
        extra={
          <Button onClick={() => setDone((v) => !v)}>
            {done ? "Reset" : "Retry"}
          </Button>
        }
      >
        <a href="#details">Details</a>
      </Result>
      <Result
        status="404"
        title="404"
        subTitle={"LongDescriptionWithoutSpaces".repeat(12)}
        extra={<Button>{"LongActionLabel".repeat(6)}</Button>}
      >
        <div>{"LongDetailsWithoutSpaces".repeat(10)}</div>
      </Result>
      <Result
        icon={<span>★</span>}
        title="Custom"
        styles={{ icon: { color: "rgb(128, 80, 120)" } }}
      />
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
