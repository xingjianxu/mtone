import React from 'react';import{createRoot}from'react-dom/client';import{Input,MtoneProvider,Fieldset}from'../../packages/mtone/src';import'../../packages/mtone/dist/styles.css';
function App(){const[result,setResult]=React.useState('');return <MtoneProvider><main style={{display:'grid',gap:12,width:360,padding:20}}>
<button>Start</button><Input aria-label="Basic" placeholder="Basic"/><Input aria-label="Decorated" prefix="@" suffix=".com" defaultValue="demo" allowClear showCount/>
<Input.Search aria-label="Search" searchButton="Find" onSearch={setResult}/><output aria-label="Result">{result}</output>
<Input.Password aria-label="Password" defaultValue="secret"/><Input.TextArea aria-label="Notes" autoSize={{minRows:2,maxRows:4}} showCount/>
<Input.OTP aria-label="Code" length={4}/><Fieldset disabled><Input.Search aria-label="Disabled search" searchButton="Disabled find"/></Fieldset>
<Input aria-label="Underlined" variant="underlined"/><Input aria-label="Borderless" variant="borderless"/><Input aria-label="Plain warning" status="warning"/><Input aria-label="Warning" status="warning" prefix="!"/><Input aria-label="Error" status="error" prefix="!"/>
</main></MtoneProvider>};createRoot(document.getElementById('root')!).render(<App/>);
