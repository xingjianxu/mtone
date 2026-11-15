import React from "react";
import { createRoot } from "react-dom/client";
import { DatePicker } from "../../packages/mtone/src/data";
import { MtoneProvider } from "../../packages/mtone/src/basic";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(<MtoneProvider><div id="capture" style={{width:280,padding:8,background:"white"}}><DatePicker label="Native date" defaultValue="2026-02-01" clearable={false} /></div></MtoneProvider>);
