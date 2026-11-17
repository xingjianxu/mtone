import React from 'react';
import {createRoot} from 'react-dom/client';
import {DirectionProvider} from '@base-ui/react/direction-provider';
import {Dropdown,Menu,ContextMenu,Button,MtoneProvider,type DropdownAlign} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const params=new URLSearchParams(window.location.search);
const align=(params.get('align')||'start') as DropdownAlign;
const direction=params.has('rtl')?'rtl':'ltr';
document.documentElement.dir=direction;
const width=params.has('width')?Number(params.get('width')):undefined;
const shortcut=params.has('long')?'ExtremelyLongShortcut'.repeat(8):undefined;
const label=params.has('long')?'LongUnbrokenContent'.repeat(50):'Option';
function Demo(){const [selection,setSelection]=React.useState('');const trigger=<Button style={{width:'min(400px, calc(100vw - 40px))'}}>Open</Button>;
return <DirectionProvider direction={direction}><MtoneProvider><main style={{padding:20}}>
{params.get('kind')==='context'?<ContextMenu width={width} items={[{key:'context',label,shortcut,icon:<span>◇</span>}]}><div style={{height:320}}>Open context</div></ContextMenu>:params.get('kind')==='menu'?<Menu trigger={trigger} align={align} width={width} onSelect={setSelection} items={[{key:'option',label,shortcut,icon:params.has('long')?<span>◇</span>:undefined},{key:'parent',label:'Parent',children:[{key:'child',label:'Child'}]}]}/>:<Dropdown trigger={trigger} align={align} width={width} label="Custom content" content={<div style={{padding:8}}><p>{label}</p><input aria-label="Name" style={{width:'100%',minWidth:0,boxSizing:'border-box'}}/><button>Done</button></div>}/>}
<p role="status">{selection}</p></main></MtoneProvider></DirectionProvider>;}
createRoot(document.getElementById('root')!).render(<Demo/>);
