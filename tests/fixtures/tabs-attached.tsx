import React from "react";
import { createRoot } from "react-dom/client";
import { Code, CircleDot, GitPullRequest } from "lucide-react";
import { MtoneProvider, Tabs } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const params = new URL(location.href).searchParams;
const theme = params.get("theme") === "dark" ? "dark" : "light";
const items = [
  { value: "code", label: "Code", icon: <Code />, content: "Code contents" },
  { value: "issues", label: "Issues", icon: <CircleDot />, content: "Issue contents" },
  { value: "locked", label: "Disabled", disabled: true, content: "Disabled contents" },
  { value: "requests", label: "Pull requests", icon: <GitPullRequest />, content: "Request contents" },
  ...["Milestones", "Discussions", "Security", "Insights"].map((label) => ({
    value: label, label, content: `${label} contents`,
  })),
];

createRoot(document.getElementById("root")!).render(
  <MtoneProvider locale="en" theme={theme}>
    <Tabs
      variant="attached"
      label="Repository"
      items={items}
      moreLabel="All views"
      extraStart={params.has("tall") ? <button style={{ height: 61 }}>Extra start</button> : undefined}
      extraEnd={params.has("tall") ? <button style={{ height: 47 }}>Extra end</button> : undefined}
    />
  </MtoneProvider>,
);
