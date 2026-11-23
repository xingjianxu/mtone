import React from "react";
import { createRoot } from "react-dom/client";
import { Button, ButtonGroup, Input, MtoneProvider, Select, Toolbar } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
import NarrowDemo from "../../apps/docs/inline-demos/toolbar-narrow";
import WideDemo from "../../apps/docs/inline-demos/toolbar-table";

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

function ControlStyleExamples() {
  const [choice, setChoice] = React.useState("all");
  const examples = [
    { name: "implicit defaults" },
    { name: "explicit gray", background: "gray" },
    { name: "gray standard", controlStyle: "default" },
    { name: "white standard", background: "white" },
    { name: "white borderless requested", background: "white", controlStyle: "borderless" },
  ] as const;
  return <MtoneProvider theme="system" locale="en">
    {examples.map(({ name, ...appearance }) => (
      <Toolbar
        key={name}
        aria-label={name}
        {...appearance}
        start={<><Button>Filter</Button>
          <Select label="Status" options={[{value:"all",label:"All records"},{value:"open",label:"Open records"}]} value={choice} onValueChange={value => setChoice(value ?? "all")} />
        </>}
        end={<ButtonGroup aria-label="View options" connected><Button>Grid</Button><Button>List</Button></ButtonGroup>}
      />
    ))}
  </MtoneProvider>;
}

createRoot(document.getElementById("root")!).render(
  new URLSearchParams(location.search).has("control-style") ? <ControlStyleExamples /> :
  new URLSearchParams(location.search).has("framed") ? (
    <MtoneProvider>
      <div data-testid="wide-frame-demo" style={{ width: 720, maxWidth: "100%" }}><WideDemo /></div>
      <div data-testid="narrow-frame-demo" style={{ width: 320, maxWidth: "100%" }}><NarrowDemo /></div>
    </MtoneProvider>
  ) : (
    <>
      <Example name="Wide light" width={680} theme="light" dir="ltr" background="white" />
      <Example name="Narrow light" width={320} theme="light" dir="ltr" background="gray" />
      <Example name="Wide dark RTL" width={680} theme="dark" dir="rtl" background="gray" />
      <Example name="Narrow dark RTL" width={320} theme="dark" dir="rtl" background="white" />
      <Example name="Auto-width flex row" width={680} theme="light" dir="ltr" background="white" flexRow />
    </>
  ),
);
