import React from 'react';
import {createRoot} from 'react-dom/client';
import {DirectionProvider} from '@base-ui/react/direction-provider';
import {Popover,ContextMenu,Button,Card,Input,MtoneProvider,Select,type PopoverMenuProps} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const params=new URLSearchParams(window.location.search);
const align=(params.get('align')||undefined) as PopoverMenuProps["align"];
const side=params.get('side')==='top'?'top':undefined;
const direction=params.has('rtl')?'rtl':'ltr';
document.documentElement.dir=direction;
const width=params.has('width')?Number(params.get('width')):undefined;
const shortcut=params.has('long')?'ExtremelyLongShortcut'.repeat(8):undefined;
const label=params.has('long')?'LongUnbrokenContent'.repeat(50):'Option';
function Demo(){const [selection,setSelection]=React.useState('');const trigger=<Button style={{width:'min(400px, calc(100vw - 40px))'}}>Open</Button>;
return <DirectionProvider direction={direction}><MtoneProvider><main style={{padding:20,paddingTop:side?160:20}}>
{params.has('select') ? <SelectDemo /> : params.has('card') ? <Popover trigger="Open card" unstyled width={width} align="start" label="Card dialog" content={<Card title="Settings"><Input aria-label="Project title" style={{width:'100%'}} /></Card>} /> : params.get('kind')==='context'?<ContextMenu width={width} items={[{key:'context',label,shortcut,icon:<span>◇</span>}]}><div style={{height:320}}>Open context</div></ContextMenu>:params.get('kind')==='menu'?<Popover.Menu trigger={trigger} align={align} width={width} onSelect={setSelection} items={[{key:'option',label,shortcut,icon:params.has('long')?<span>◇</span>:undefined},{key:'parent',label:'Parent',children:[{key:'child',label:'Child'}]}]}/>:<Popover trigger={trigger} align={align} width={width} side={side} label="Custom content" content={<div style={{padding:8}}><p>{label}</p><input aria-label="Name" style={{width:'100%',minWidth:0,boxSizing:'border-box'}}/><button>Done</button></div>}/>}
<p role="status">{selection}</p></main></MtoneProvider></DirectionProvider>;}
const repos = Array.from({length: 20}, (_, index) => ({
  value: String(index), label: `Repository ${index}`, disabled: index === 1,
  icon: index === 0 ? <span>◇</span> : undefined,
}));
function SelectDemo() {
  const [value, setValue] = React.useState("0");
  return <>
    <Select searchable="popup" trigger="Repository" popupTitle="Switch repository" popupWidth={320}
      options={repos} value={value} onValueChange={(next) => setValue(next ?? "")}
      renderOption={(option) => <>{option.value === "0" && <span aria-hidden="true">◇ </span>}{option.label}</>} />
    <Select searchable="popup" trigger={<Button>Another picker</Button>} popupTitle="Other options"
      options={repos} defaultValue="5" />
    <output aria-label="Selected repository">{value}</output>
  </>;
}
createRoot(document.getElementById('root')!).render(<Demo/>);
