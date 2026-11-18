import React from "react";
import {createRoot} from "react-dom/client";
import {TreeSelect,MtoneProvider,Fieldset} from "../../packages/mtone/src";
import "../../packages/mtone/src/styles.css";
const items=[{id:"p",label:"Team",children:[{id:"a",label:"Alice"},{id:"b",label:"Bob"},{id:"x",label:"Disabled",disabled:true}]}];
function App(){const [value,setValue]=React.useState<string|number|null>(null);return <MtoneProvider locale="en"><main style={{padding:30,width:320,display:"grid",gap:24}}>
<TreeSelect aria-label="Single" items={items} defaultExpandAll value={value} onValueChange={setValue} allowClear/>
<TreeSelect aria-label="Multiple" items={items} multiple searchable defaultExpandAll showCheckedStrategy="parent" allowClear/>
<TreeSelect aria-label="Strict" items={items} multiple checkStrictly defaultExpandAll/>
<Fieldset disabled legend="Disabled group"><TreeSelect aria-label="Disabled" items={items}/></Fieldset>
<button>After</button>
</main></MtoneProvider>};createRoot(document.getElementById("root")!).render(<App/>);
