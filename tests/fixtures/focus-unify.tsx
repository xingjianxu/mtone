import React from 'react';
import { createRoot } from 'react-dom/client';
import { MtoneProvider, Button, Input, Checkbox, Rate, Select, Cascader } from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
import '../../apps/docs/site.css';
createRoot(document.getElementById('root')!).render(<MtoneProvider><main style={{padding:24,display:'grid',gap:16,maxWidth:360}}>
<Button>Button</Button><Input aria-label="Input"/><Checkbox label="Check"/><Rate aria-label="Rating"/>
<Select label="Select" options={[{label:'One',value:'one'},{label:'Two',value:'two'}]}/>
<Cascader aria-label="Cascader" options={[{label:'One',value:'one'}]}/>
<a className="mt-link" href="#target">Link</a><Input aria-label="Error" aria-invalid/><Button disabled>Disabled</Button>
</main></MtoneProvider>);
