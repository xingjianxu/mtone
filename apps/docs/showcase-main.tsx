import React from "react";
import { createRoot } from "react-dom/client";
import { ShowcasePage } from "./showcase-page";
import { useThemePreference } from "./theme-preference";
import "../../packages/mtone/dist/styles.css";
function StandaloneShowcase() {
  const preference = useThemePreference();
  return <ShowcasePage preference={preference} />;
}

createRoot(document.getElementById("root")!).render(<StandaloneShowcase />);
