import React from "react";
import {createRoot} from "react-dom/client";
import {FileText} from "lucide-react";
import {Tabs, MtoneProvider, Input, Select} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(<MtoneProvider locale="en"><main style={{maxWidth:700,margin:"auto"}}>
{(["line","card","editable-card"] as const).flatMap(variant => (["small","medium","large"] as const).flatMap(size => (["top","bottom","start","end"] as const).map(placement =>
<section key={variant+size+placement} data-testid={variant+"-"+size+"-"+placement} style={{marginBottom:16}}>
<Tabs label={variant+" "+size+" "+placement} variant={variant} size={size} placement={placement} onEdit={()=>{}} items={[
{value:"icon",label:"Icon tab",icon:<FileText/>,content:"Content"},
{value:"plain",label:"Plain tab",content:"Other"},
{value:"disabled",label:"Disabled",disabled:true,content:"Disabled"}
]}/></section>
)))}
<Tabs variant="card" size="small" label="Outer small card" items={[{value:"outer",label:"Outer",content:
<Tabs variant="card" label="Nested medium card" items={[{value:"inner",label:"Nested medium",content:"Nested"}]}/>
}]}/>
<Input aria-label="Unchanged input"/><Select label="Unchanged select" options={[{value:"one",label:"One"}]}/>
<Tabs label="Unchanged line" items={[{value:"line",label:"Line tab",content:"Line content"}]}/>
{(["top","start"] as const).map(placement => <Tabs key={placement} label={`Custom gap ${placement}`} gap={9} placement={placement} items={[{value:"one",label:"One",content:"One"},{value:"two",label:"Two",content:"Two"}]}/>)}
</main></MtoneProvider>);
