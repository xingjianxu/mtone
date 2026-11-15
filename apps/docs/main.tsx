import React from "react";
import { createRoot } from "react-dom/client";
import { DocsApp } from "./docs-app";
import "../../packages/mtone/dist/styles.css";
import "./site.css";
createRoot(document.getElementById("root")!).render(<DocsApp />);
