import React from 'react';
import {createRoot} from 'react-dom/client';
import {Input,Select,NumberInput,DatePicker,Tag,DataTable,Button,MtoneProvider,AutoComplete,TreeSelect,Cascader,TagSelect} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const options=Array.from({length:8},(_,i)=>({value:String(i),label:'Label '+i}));
createRoot(document.getElementById('root')!).render(<><MtoneProvider locale="en"><main style={{width:'min(300px,100%)',display:'grid',gap:12}}>
<Button>Before fields</Button>
<Input aria-label="Input" placeholder="Input"/><Input.Search aria-label="SearchInput"/>
<Select label="Select" options={options}/><Select mode="multiple" label="Multiple Select" options={options} defaultValue={['0']}/>
<NumberInput label="NumberInput" defaultValue={2}/><DatePicker label="DatePicker"/>
<Tag variant="filter" onRemove={()=>{}}>Filter</Tag>
<DataTable columns={[{key:'title',title:'Title',filterable:true}]} data={[{id:'1',title:'One'}]} rowKey="id"/>
<section data-case="error"><Input aria-label="Error" aria-invalid/><Select label="Error select" aria-invalid options={options}/><Select mode="multiple" label="Error multi" aria-invalid options={options}/></section>
<section data-case="disabled"><Input disabled/><Select disabled options={options}/><Select mode="multiple" disabled options={options}/><NumberInput disabled/></section>
<section data-case="wrap" style={{width:180}}><Select mode="multiple" label="Many labels" options={options} defaultValue={options.map(o=>o.value)}/><Tag variant="filter" onRemove={()=>{}}>A very long filter label that should not grow outside its row</Tag></section>
<AutoComplete options={options}/><TreeSelect items={[]}/><Cascader options={[]}/><TagSelect options={options}/>
<Input aria-label="Small input" controlSize="sm"/><Input aria-label="Large input" controlSize="lg"/>
<Input.TextArea aria-label="Textarea"/>
</main></MtoneProvider><section data-case="unscoped"><Button>Unscoped</Button><Input/><Select options={options}/><NumberInput/></section></>);
