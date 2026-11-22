import React from "react";
import { createRoot } from "react-dom/client";
import { Button, Input, MtoneProvider, Toolbar } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Example({ name, width, theme, dir, background, flexRow }: {
  name: string;
  width: number;
  theme: "light" | "dark";
  dir: "ltr" | "rtl";
  background: "white" | "gray";
  flexRow?: boolean;
}) {
  const [lastAction, setLastAction] = React.useState("");
  return (
    <MtoneProvider theme={theme}>
      <div style={{ width, maxWidth: "100%", marginBlock: 16 }}>
        <div style={flexRow ? { display: "flex" } : undefined}>
          {flexRow && <div aria-hidden="true" style={{ flex: "0 0 72px" }}>Sibling</div>}
          <Toolbar
            aria-label={name}
            dir={dir}
            background={background}
            search={<Input.Search aria-label="Search" />}
            start={<Button onClick={() => setLastAction("Filter")}>Filter</Button>}
            end={<>
              <Button onClick={() => setLastAction("Export")}>Export</Button>
              <Button variant="solid" onClick={() => setLastAction("Create")}>Create</Button>
            </>}
          />
        </div>
        <output aria-label={`${name} result`}>{lastAction}</output>
      </div>
    </MtoneProvider>
  );
}

createRoot(document.getElementById("root")!).render(<>
  <Example name="Wide light" width={680} theme="light" dir="ltr" background="white" />
  <Example name="Narrow light" width={320} theme="light" dir="ltr" background="gray" />
  <Example name="Wide dark RTL" width={680} theme="dark" dir="rtl" background="gray" />
  <Example name="Narrow dark RTL" width={320} theme="dark" dir="rtl" background="white" />
  <Example name="Auto-width flex row" width={680} theme="light" dir="ltr" background="white" flexRow />
</>);
