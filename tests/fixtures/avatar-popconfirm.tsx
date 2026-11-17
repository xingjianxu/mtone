import React from "react";
import { createRoot } from "react-dom/client";
import {
  Avatar,
  AvatarGroup,
  Button,
  Popconfirm,
  MtoneProvider,
  type PopconfirmPlacement,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Fixture() {
  const [calls, setCalls] = React.useState(0);
  const [failed, setFailed] = React.useState(false);
  return (
    <MtoneProvider locale="en">
      <main style={{ display: "grid", gap: 24 }}>
        <Avatar data-testid="long" size={32}>
          EXTRAORDINARILYLONG
        </Avatar>
        <Avatar
          data-testid="responsive"
          size={{ xs: 24, md: 48 }}
          name="Responsive"
        />
        <Avatar
          data-testid="bad-image"
          name="Fallback"
          src="data:image/png;base64,invalid"
        />
        <AvatarGroup
          items={[{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }]}
          max={1}
        />
        <div style={{ overflow: "hidden", height: 32 }}>
          <Popconfirm
            trigger={<Button>Delete</Button>}
            title="Delete record?"
            description="This cannot be undone."
            onConfirm={() => setCalls((n) => n + 1)}
          />
        </div>
        <Popconfirm
          trigger={<Button style={{ width: "100%" }}>Wide trigger</Button>}
          title="Short confirmation"
        />
        <output data-testid="calls">{calls}</output>
        <Popconfirm
          trigger={<Button>Save asynchronously</Button>}
          title="Save record?"
          onConfirm={() => {
            setCalls((n) => n + 1);
            return new Promise<void>((resolve, reject) =>
              setTimeout(
                () => (failed ? reject(Error("failed")) : resolve()),
                350,
              ),
            );
          }}
        />
        <label>
          <input
            type="checkbox"
            checked={failed}
            onChange={(e) => setFailed(e.target.checked)}
          />
          Fail save
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(
            [
              "topLeft",
              "top",
              "topRight",
              "leftTop",
              "left",
              "leftBottom",
              "rightTop",
              "right",
              "rightBottom",
              "bottomLeft",
              "bottom",
              "bottomRight",
            ] as PopconfirmPlacement[]
          ).map((placement) => (
            <Popconfirm
              key={placement}
              placement={placement}
              trigger={<Button>{placement}</Button>}
              title="LongTitleThatMustWrapRatherThanOverflowTheNarrowViewport"
              description="Please check carefully before confirming this demonstration action."
            />
          ))}
        </div>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
