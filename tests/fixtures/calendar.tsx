import React from "react";
import { createRoot } from "react-dom/client";
import { Calendar, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Fixture() {
  const [value, setValue] = React.useState("2024-02-15");
  return (
    <MtoneProvider locale="en">
      <main style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1>Calendar regression</h1>
        <section data-testid="basic">
          <Calendar
            value={value}
            onChange={setValue}
            showWeek
            cellRender={(date, info) =>
              info.type === "date" && date === "2024-02-15" ? (
                <span>
                  Team meeting{" "}
                  <span style={{ display: "block" }}>
                    UnbrokenLongEventContentWithoutSpacesMustNotExpandTheGrid
                  </span>
                </span>
              ) : null
            }
          />
          <output data-testid="value">{value}</output>
        </section>
        <section data-testid="card" style={{ maxWidth: 320 }}>
          <Calendar
            fullscreen={false}
            defaultValue="2024-02-15"
            validRange={["2024-02-10", "2024-03-20"]}
            disabledDate={(date) => date === "2024-02-16"}
          />
        </section>
        <section data-testid="controlled">
          <Calendar fullscreen={false} value="2024-02-15" />
        </section>
        <section data-testid="custom">
          <Calendar
            fullscreen={false}
            defaultValue="2024-02-15"
            headerRender={({ onChange }) => (
              <button onClick={() => onChange("2024-03-12")}>
                Custom March
              </button>
            )}
            fullCellRender={(date) => <span>{date}</span>}
          />
        </section>
        <section data-testid="chinese">
          <Calendar fullscreen={false} locale="zh" defaultValue="2024-02-15" />
        </section>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
