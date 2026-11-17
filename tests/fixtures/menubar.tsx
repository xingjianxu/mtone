import React from 'react';
import {createRoot} from 'react-dom/client';
import {DirectionProvider} from '@base-ui/react/direction-provider';
import {Menubar,MtoneProvider} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const rtl=new URLSearchParams(location.search).has('rtl');
document.documentElement.dir=rtl?'rtl':'ltr';
function Demo(){const [result,setResult]=React.useState('');return <DirectionProvider direction={rtl?'rtl':'ltr'}><MtoneProvider><main style={{padding:20}}><Menubar trigger={new URLSearchParams(location.search).has("hover")?"hover":"click"} aria-label="Editor" onSelect={setResult} menus={[
{key:'file',label:'File',items:[{key:'new',label:'New'},{key:'recent',label:'Recent',children:[{key:'project',label:'Project'}]}]},
{key:'edit',label:'Edit',items:[{key:'copy',label:'Copy'}]},
{key:'view',label:'View',items:[{type:'checkbox',key:'sidebar',label:'Sidebar'}]},
{key:'locked',label:'Locked',disabled:true,items:[]},
]}/><button style={{display:"block",marginTop:220}}>Outside</button><p role="status">{result}</p></main></MtoneProvider></DirectionProvider>}
createRoot(document.getElementById('root')!).render(<Demo/>);
