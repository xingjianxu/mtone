import React from "react";
import { createRoot } from "react-dom/client";
import { Select, Checkbox } from "../../packages/mtone/src/interactive";
import { DatePicker } from "../../packages/mtone/src/data";
import { MtoneProvider } from "../../packages/mtone/src/basic";
import "../../packages/mtone/dist/styles.css";
import ToolbarDemo from "../../apps/docs/inline-demos/toolbar-borderless";
const text =
  "A very long selected option that must not push the dropdown arrow outside the trigger";
const pickerOptions = [
  { value: "", label: <strong>Default project</strong>, searchText: "fallback" },
  { label: "Repository", options: [
    { value: "locked", label: "Locked repository", disabled: true },
    ...Array.from({ length: 20 }, (_, i) => ({ value: `repo-${i}`, label: `Repository ${i}` })),
  ] },
];
function UnifiedFixture() {
  return (
    <MtoneProvider locale="en">
      <form aria-label="Select example" style={{ display: "grid", justifyItems: "start", gap: 12, padding: 12 }}>
        <Select label="Project" searchable clearable required name="project" options={pickerOptions} defaultValue="repo-0"
          placeholder="Choose project" searchPlaceholder="Search projects" />
        <Select mode="multiple" label="Projects" clearable name="projects" options={pickerOptions} defaultValue={["", "locked"]} />
        <button type="reset">Reset selection</button>
        <button type="button">Outside select</button>
        <button type="submit">Submit selection</button>
      </form>
    </MtoneProvider>
  );
}
function TagsFixture() {
  return (
    <MtoneProvider locale="en">
      <form aria-label="Tags example" style={{ display: "grid", justifyItems: "start", gap: 12, padding: 12 }}>
        <Select mode="tags" label="Topics" name="topic" clearable options={pickerOptions} />
        <button type="reset">Reset tags</button>
        <button type="button">Outside tags</button>
      </form>
    </MtoneProvider>
  );
}
function ClearSlotFixture() {
  const options = [
    { value: "alpha", label: "Alpha" },
    { value: "beta", label: "Beta" },
    { value: "locked", label: "Locked", disabled: true },
  ];
  return (
    <MtoneProvider locale="en">
      <div className="clear-slots" style={{ display: "grid", gap: 12, padding: 12 }}>
        <style>{".clear-slots .mt-select, .clear-slots .mt-select-multiple { width: 220px; min-width: 0; }"}</style>
        <div data-testid="plain"><Select label="Plain" clearable options={options} defaultValue="alpha" /></div>
        <div data-testid="searchable"><Select label="Searchable" searchable clearable options={options} defaultValue="alpha" /></div>
        <div data-testid="multiple"><Select mode="multiple" label="Multiple" clearable options={options} defaultValue={["alpha", "locked"]} /></div>
        <div data-testid="empty"><Select label="Empty" clearable options={options} /></div>
        <div data-testid="disabled"><Select label="Disabled" clearable disabled options={options} defaultValue="alpha" /></div>
        <div data-testid="non-clearable"><Select label="Not clearable" options={options} defaultValue="alpha" /></div>
        <div data-testid="locked"><Select mode="multiple" label="Locked only" clearable options={options} defaultValue={["locked"]} /></div>
      </div>
    </MtoneProvider>
  );
}
function IntrinsicFixture() {
  const concise = [
    { value: "all", label: "All" },
    { label: "Groups", options: [{ value: "short", label: "Open" }, { value: "long", label: "Documentation" }] },
  ];
  return (
    <MtoneProvider locale="en">
      <style>{`
        .fixture-fixed { width: 142px; }
        .fixture-full, .mt-select-clearable:has(> .fixture-full) { width: 100%; }
      `}</style>
      <div style={{ display: "grid", gap: 10, justifyItems: "start", margin: 16 }}>
        <Select label="Intrinsic" clearable placeholder="Pick" defaultValue="all" options={concise} />
        <Select label="Longest placeholder" placeholder="Pick one project" options={[{ value: "one", label: "One" }]} />
        <Select label="Short labels only" placeholder="Pick" options={[{ value: "one", label: "One" }]} />
        <Select label="Fixed width" className="fixture-fixed" placeholder="Pick" options={concise} />
        <div style={{ width: 270 }}><Select label="Full width" className="fixture-full" options={concise} /></div>
        <div style={{ width: 270 }}><Select label="Full width clearable" clearable className="fixture-full" options={concise} /></div>
        <div data-testid="narrow-intrinsic" style={{ width: 112 }}>
          <Select label="Narrow" clearable defaultValue="long" options={[{ value: "long", label: text }]} />
        </div>
        <Select label="Unaffected inline search" searchable placeholder="Pick" options={concise} />
        <Select label="Unaffected popup search" searchable="popup" placeholder="Pick" options={concise} />
        <Select label="Unaffected multiple" mode="multiple" options={concise} />
        <Select label="Unaffected tags" mode="tags" options={concise} />
        <ToolbarDemo />
      </div>
    </MtoneProvider>
  );
}
const query = new URLSearchParams(location.search);
createRoot(document.getElementById("root")!).render(
  query.has("intrinsic") ? <IntrinsicFixture /> : query.has("tags") ? <TagsFixture /> : query.has("clearSlot") ? <ClearSlotFixture /> : query.has("unified") ? <UnifiedFixture /> : <>
    <style>{`.case .mt-select { width: var(--width); min-width: 0; box-sizing: border-box; } .case { margin: 12px; } .case .tall { width: 200px; height: 48px; font-size: 24px; }`}</style>
    {(["light", "dark"] as const).map((theme) => (
      <MtoneProvider key={theme} theme={theme}>
        {[100, 160, 320, 640].map((width) => (
          <div
            className="case"
            key={width}
            style={{ "--width": `${width}px` } as React.CSSProperties}
          >
            <Select
              className="sample"
              label={`${theme}-${width}`}
              defaultValue="long"
              options={[
                { value: "long", label: text },
                { value: "short", label: "Short" },
              ]}
            />
          </div>
        ))}
        <div className="case">
          <Select
            className="tall"
            label={`${theme}-tall`}
            options={[
              {
                value: "zh",
                label: "较长的中文选项内容用于验证箭头不会被挤压",
              },
            ]}
            defaultValue="zh"
          />
        </div>
        <div className="case">
          <Select
            label={`${theme}-disabled`}
            disabled
            options={[]}
            placeholder="Choose"
          />
        </div>
        <div className="case">
          <Select
            label={`${theme}-placeholder`}
            options={[{ value: "a", label: "Alpha" }]}
            placeholder={text}
          />
        </div>
        <div className={`case multi-${theme}`} style={{ width: 250 }}>
          <Select mode="multiple" label={`${theme}-multi`} options={[{value:"a",label:"Alpha"},{value:"b",label:"Beta"},{value:"c",label:"Disabled",disabled:true}]} defaultValue={["a"]} />
          <Checkbox label={`${theme}-check`} defaultChecked />
          <Checkbox label={`${theme}-mixed`} indeterminate />
        </div>
        <div className="case"><Select mode="multiple" label={`${theme}-multi-disabled`} options={[]} disabled /></div>
        <div className={`case date-${theme}`} style={{ width: 250 }}><DatePicker label={`${theme}-date`} min="2026-01-01" max="2026-12-31" defaultValue="2026-02-01" /></div>
        <div className={`case date-disabled-${theme}`} style={{ width: 180 }}><DatePicker label={`${theme}-date-disabled`} disabled /></div>
      </MtoneProvider>
    ))}
  </>,
);
