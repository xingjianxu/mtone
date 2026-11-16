import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { FileText } from "lucide-react";
import { Button, Input, Spotlight, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Demo() {
 const [result, setResult] = useState("None");
 return <MtoneProvider locale="en"><Input aria-label="Outside editor" /><Spotlight
 trigger={<Button>Open spotlight</Button>} limit={50} onActionSelect={action => setResult(action.id)}
 actions={Array.from({ length: 30 }, (_, i) => ({ id: String(i), label: `Document ${i}`, description: `Useful document description ${i}`, group: i < 10 ? "Recent" : "All documents", keywords: `keyword${i}`, disabled: i === 1, icon: <FileText size={16} /> }))} />
 <output>{result}</output></MtoneProvider>;
}
createRoot(document.getElementById("root")!).render(<Demo />);
