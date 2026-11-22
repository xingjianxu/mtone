import React from "react";
import { createRoot } from "react-dom/client";
import { Input, DatePicker, Button, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(<MtoneProvider><div style={{width:280,display:"grid",gap:16,padding:20}}><Button>Start</Button><Input aria-label="Input" placeholder="Title" /><Input aria-label="Invalid" aria-invalid /><Input aria-label="Disabled" disabled /><Input.Search aria-label="Search" /><Input.TextArea aria-label="Textarea" /><DatePicker label="Date" /></div></MtoneProvider>);
