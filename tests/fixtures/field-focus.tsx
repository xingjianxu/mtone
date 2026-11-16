import React from "react";
import { createRoot } from "react-dom/client";
import { Input, SearchInput, Textarea, Select, MultiSelect, NumberInput, DatePicker, Table, Checkbox, Button, MtoneProvider } from "../../packages/mtone/src";
const options=[{value:"one",label:"One"},{value:"two",label:"Two"}];
const fields=[
 ["Input",<Input aria-label="Input" />],
 ["SearchInput",<SearchInput aria-label="SearchInput" />],
 ["Textarea",<Textarea aria-label="Textarea" />],
 ["Select",<Select label="Select" options={options} />],
 ["MultiSelect",<MultiSelect label="MultiSelect" options={options} defaultValue={["one"]} />],
 ["NumberInput",<NumberInput label="NumberInput" defaultValue={2} />],
 ["DatePicker",<DatePicker label="DatePicker" />],
 ["Table",<Table columns={[{key:"title",title:"Title",filterable:true}]} data={[{id:"one",title:"One"}]} rowKey="id" />],
] as const;
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(<MtoneProvider locale="en"><div style={{width:300,padding:20,display:"grid",gap:20}}>
{fields.map(([name,field])=><section key={name} data-test-field={name}><Button>Before {name}</Button>{field}</section>)}
<section data-test-field="errors"><Input aria-label="Input error" aria-invalid /><Select label="Select error" aria-invalid options={options} /><MultiSelect label="MultiSelect error" aria-invalid options={options} /></section>
<section data-test-field="disabled"><Input aria-label="Input disabled" disabled /><Select label="Select disabled" disabled options={options} /><MultiSelect label="MultiSelect disabled" disabled options={options} /><NumberInput label="NumberInput disabled" disabled /></section>
<Checkbox label="Checkbox" /><Button>Regular button</Button></div></MtoneProvider>);
