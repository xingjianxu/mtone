import React from 'react';import {createRoot} from 'react-dom/client';
import {Menu,ContextMenu,Button,MtoneProvider} from '../../packages/mtone/src';import {FileText} from 'lucide-react';
import '../../packages/mtone/dist/styles.css';
function EmptyIcon(){return null;}
function Demo(){const [mode,setMode]=React.useState('mixed');const [selection,setSelection]=React.useState('');
 React.useEffect(()=>{const handle=(e:KeyboardEvent)=>{if(e.key==='1')setMode('none');if(e.key==='2')setMode('mixed');if(e.key==='3')setMode('all');if(e.key==='4')setMode('empty');if(e.key==='r')document.documentElement.dir=document.documentElement.dir==='rtl'?'ltr':'rtl';};document.addEventListener('keydown',handle,true);return()=>document.removeEventListener('keydown',handle,true);},[]);
 const items=['Alpha','Beta','Gamma'].map((label,i)=>({key:label,label,shortcut:i===1?'⌘B':undefined,disabled:i===2,icon:mode==='all'||mode==='mixed'&&i===0?<FileText/>:mode==='empty'?<EmptyIcon/>:null}));
 return <MtoneProvider locale="en"><main data-mode={mode} style={{padding:40}}><Menu trigger={<Button>Dropdown</Button>} items={items} onSelect={setSelection}/><ContextMenu items={items} onSelect={setSelection}><div style={{padding:30}}>Context target</div></ContextMenu><p role="status">{selection}</p></main></MtoneProvider>;
}createRoot(document.getElementById('root')!).render(<Demo/>);
