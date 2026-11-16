import React from "react";
import { createRoot } from "react-dom/client";
import { Mentions, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const options = [
  { value: "alice", label: "Alice" },
  { value: "locked", label: "Locked", disabled: true },
  { value: "bob", label: "Bob" },
];
function Fixture() {
  const [value, setValue] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const host = React.useRef<HTMLDivElement>(null);
  return (
    <MtoneProvider locale="en">
      <main style={{ maxWidth: 480 }}>
        <h1>Mentions regression</h1>
        <label>
          Basic
          <Mentions
            aria-label="Basic"
            options={options}
            value={value}
            onChange={setValue}
            allowClear
            onSelect={() => setSelected((n) => n + 1)}
          />
        </label>
        <output data-testid="selected">{selected}</output>
        <button>After basic</button>
        <label>
          Second
          <Mentions aria-label="Second" options={options} prefix={["@", "#"]} />
        </label>
        <label>
          Disabled
          <Mentions
            aria-label="Disabled"
            options={options}
            defaultValue="@alice"
            disabled
            allowClear
          />
        </label>
        <label>
          Read only
          <Mentions
            aria-label="Read only"
            options={options}
            defaultValue="@alice"
            readOnly
            allowClear
          />
        </label>
        <label>
          Loading
          <Mentions aria-label="Loading" options={options} loading={loading} />
        </label>
        <button onClick={() => setLoading(false)}>Load options</button>
        <label>
          Auto size
          <Mentions
            aria-label="Auto size"
            options={options}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        </label>
        <label>
          Top portal
          <Mentions
            aria-label="Top portal"
            options={options}
            placement="top"
            getPopupContainer={() => host.current!}
          />
        </label>
        <div ref={host} data-testid="portal" />
        <label>
          Scroll
          <Mentions
            aria-label="Scroll"
            options={options}
            rows={3}
            styles={{
              textarea: {
                fontFamily: "monospace",
                fontSize: 14,
                lineHeight: "20px",
              },
            }}
          />
        </label>
        <label>
          Horizontal
          <Mentions
            aria-label="Horizontal"
            options={options}
            rows={3}
            wrap="off"
            styles={{
              textarea: {
                fontFamily: "monospace",
                fontSize: 14,
                lineHeight: "20px",
              },
            }}
          />
        </label>
        <label>
          Narrow
          <Mentions
            aria-label="Narrow"
            options={[
              {
                value:
                  "a_very_long_username_that_should_wrap_without_horizontal_overflow",
              },
            ]}
            styles={{ textarea: { fontFamily: "monospace" } }}
          />
        </label>
        <div style={{ height: 500 }} />
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
