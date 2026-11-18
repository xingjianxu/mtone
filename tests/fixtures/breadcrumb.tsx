import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from 'lucide-react';
import { Breadcrumb, MtoneProvider } from '../../packages/mtone/src';
import '../../packages/mtone/src/styles.css';
function App() {
 const [selected,setSelected]=useState('none');
 return <MtoneProvider><main style={{padding:16,maxWidth:500}}>
 <Breadcrumb aria-label="Demo" items={[
  {label:null,icon:<Home/>,href:'#home','aria-label':'Home'},
  {label:'Projects',href:'#projects',menu:{onSelect:setSelected,items:[{key:'one',label:'One'},{key:'disabled',label:'Disabled',disabled:true},{key:'nested',label:'Nested',children:[{key:'child',label:'Child'}]}]}},
  {label:'Current'}
 ]}/>
 <p role="status">{selected}</p><button>Outside</button>
 <Breadcrumb aria-label="Long" items={[{label:'VeryLongProjectNameWithoutSpacesThatMustWrapInsideTheNarrowViewport',menu:{items:[{key:'x',label:'Option'}]}},{label:'Last'}]}/>
 </main></MtoneProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
