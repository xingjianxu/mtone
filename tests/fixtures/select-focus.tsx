import React from 'react';
import { createRoot } from 'react-dom/client';
import { Input, Select, MultiSelect, MtoneProvider } from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const options = [{value:'one',label:'One'}, {value:'two',label:'Two'}, {value:'disabled',label:'Disabled',disabled:true}];
createRoot(document.getElementById('root')!).render(<>
<style>{`body {margin:32px} section {margin:24px 0} body.dark .mt-scope {--mt-bg:#222;--mt-fg:#eee;--mt-hover:#383838;--mt-border:#555} body.dark {background:#222}`}</style>
<MtoneProvider locale="en">
<Input aria-label="Reference input" />
<section><Select label="Select" options={options} defaultValue="one" /></section>
<section><MultiSelect label="MultiSelect" options={options} defaultValue={['one']} /></section>
</MtoneProvider></>);
