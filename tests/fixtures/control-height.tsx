import React from 'react';
import {createRoot} from 'react-dom/client';
import {Input,SearchInput,Select,MultiSelect,NumberInput,DatePicker,FilterChip,Table,Textarea,Button,MtoneProvider} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const options=Array.from({length:8},(_,i)=>({value:String(i),label:'Label '+i}));
createRoot(document.getElementById('root')!).render(<MtoneProvider locale="en"><main style={{width:'min(300px,100%)',display:'grid',gap:12}}>
<Button>Before fields</Button>
<Input aria-label="Input" placeholder="Input"/><SearchInput aria-label="SearchInput"/>
<Select label="Select" options={options}/><MultiSelect label="MultiSelect" options={options} defaultValue={['0']}/>
<NumberInput label="NumberInput" defaultValue={2}/><DatePicker label="DatePicker"/>
<FilterChip onRemove={()=>{}}>Filter</FilterChip>
<Table columns={[{key:'title',title:'Title',filterable:true}]} data={[{id:'1',title:'One'}]} rowKey="id"/>
<section data-case="error"><Input aria-label="Error" aria-invalid/><Select label="Error select" aria-invalid options={options}/><MultiSelect label="Error multi" aria-invalid options={options}/></section>
<section data-case="disabled"><Input disabled/><Select disabled options={options}/><MultiSelect disabled options={options}/><NumberInput disabled/></section>
<section data-case="wrap" style={{width:180}}><MultiSelect label="Many labels" options={options} defaultValue={options.map(o=>o.value)}/><FilterChip onRemove={()=>{}}>A very long filter label that should not grow outside its row</FilterChip></section>
<section data-case="comfortable"><MtoneProvider density="comfortable"><Input/><Select options={options}/><NumberInput/></MtoneProvider></section>
<Textarea aria-label="Textarea"/>
</main></MtoneProvider>);
