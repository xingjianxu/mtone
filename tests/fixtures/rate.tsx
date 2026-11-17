import React from "react";
import { createRoot } from "react-dom/client";
import { Rate, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Fixture() {
  const [value, setValue] = React.useState(2.5);
  return (
    <MtoneProvider locale="en">
      <main style={{ display: "grid", gap: 40, paddingTop: 0 }}>
        <section style={{ overflow: "hidden", height: 32 }}>
          <Rate
            data-testid="basic"
            aria-label="Quality"
            value={value}
            onChange={setValue}
            allowHalf
            tooltips={["Poor", "Fair", "Good", "Great", "Excellent"]}
          />
          <output data-testid="value">{value}</output>
        </section>
        <section>
          <Rate data-testid="fixed" aria-label="Fixed" value={2} />
        </section>
        <section>
          <Rate
            data-testid="no-clear"
            aria-label="No clear"
            defaultValue={2}
            allowClear={false}
          />
        </section>
        <section>
          <Rate
            data-testid="disabled"
            aria-label="Read only"
            defaultValue={2.5}
            allowHalf
            disabled
          />
        </section>
        <section dir="rtl">
          <Rate data-testid="rtl" aria-label="RTL" defaultValue={2} allowHalf />
        </section>
        <section>
          <Rate
            data-testid="custom"
            aria-label="Custom"
            character={({ index }) => index + 1}
            count={3}
            defaultValue={1.5}
            allowHalf
          />
        </section>
        <section>
          <Rate data-testid="no-keys" aria-label="No keys" keyboard={false} />
        </section>
        <section>
          <Rate
            data-testid="long-hint"
            aria-label="Long hint"
            tooltips={[
              "AnExtremelyLongUnbrokenTooltipThatMustNotOverflowTheMobileViewport",
            ]}
          />
        </section>
        <section>
          <Rate size="small" aria-label="Small" defaultValue={2} />
          <Rate size="large" aria-label="Large" defaultValue={3} />
        </section>
        <section style={{ width: 80 }}>
          <Rate data-testid="narrow" aria-label="Narrow" count={10} allowHalf />
        </section>
        <button>After ratings</button>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
