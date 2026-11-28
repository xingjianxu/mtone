import React from 'react';
import { createRoot } from 'react-dom/client';
import { Input, Select, MtoneProvider } from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const theme = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
const options = [{value:'one',label:'One'}, {value:'two',label:'Two'}, {value:'disabled',label:'Disabled',disabled:true}];
createRoot(document.getElementById('root')!).render(<>
<style>{`body {margin:32px} section {margin:24px 0} body:has([data-mt-theme="dark"]) {background:#20201f}`}</style>
<MtoneProvider locale="en" theme={theme}>
<Input aria-label="Reference input" />
<section><Select label="Select" options={options} defaultValue="one" /></section>
<section><Select mode="multiple" label="Multiple Select" options={options} defaultValue={['one']} /></section>
</MtoneProvider></>);
