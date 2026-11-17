import React from "react";
import { createRoot } from "react-dom/client";
import { Breadcrumb, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(<MtoneProvider><style>{"a:hover { color: #537260; text-decoration: underline; }"}</style><Breadcrumb items={[{label:"Home",href:"#home"},{label:"Library",href:"#library"},{label:"Current"}]} /></MtoneProvider>);
