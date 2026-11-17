import * as React from "react";
import { createRoot } from "react-dom/client";
import { Divider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(
  <main style={{ padding: 12 }}>
    <Divider data-testid="solid" />
    <Divider data-testid="dashed" variant="dashed" />
    <Divider data-testid="dotted" variant="dotted" />
    <Divider data-testid="small" size="small" />
    <Divider data-testid="large" size="large" />
    <Divider data-testid="start" variant="dashed" titlePlacement="start">
      Start
    </Divider>
    <div dir="rtl">
      <Divider data-testid="rtl" titlePlacement="start">
        بداية
      </Divider>
    </div>
    <Divider data-testid="long">
      VeryLongUnbrokenTitleThatMustWrapWithoutMakingThePageWiderVeryLongUnbrokenTitleThatMustWrapWithoutMakingThePageWider
    </Divider>
    <p>
      编辑
      <Divider data-testid="vertical" orientation="vertical" variant="dashed" />
      归档
    </p>
  </main>,
);
