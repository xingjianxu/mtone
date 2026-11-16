import React from 'react';
import {createRoot} from 'react-dom/client';
import {Splitter,Button,MtoneProvider} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
function Demo(){
 const [vertical,setVertical]=React.useState(false),[rtl,setRtl]=React.useState(false),[third,setThird]=React.useState(false),[disabled,setDisabled]=React.useState(false),[controlled,setControlled]=React.useState(false),[accept,setAccept]=React.useState(true);
 const [sizes,setSizes]=React.useState<number[]>([]),[starts,setStarts]=React.useState(0),[ends,setEnds]=React.useState(0);
 return <MtoneProvider locale="en"><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{[['Vertical',setVertical],['RTL',setRtl],['Third',setThird],['Disabled',setDisabled],['Controlled',setControlled],['Accept',setAccept]].map(([label,set])=><Button key={label as string} onClick={()=>{(set as React.Dispatch<React.SetStateAction<boolean>>)(x=>!x);setSizes([])}}>{label as string}</Button>)}</div><output data-testid="events" style={{display:'block',overflowWrap:'anywhere'}}>{JSON.stringify({starts,ends})}</output>
 <Splitter key={String(third)} aria-label="Workspace" orientation={vertical?'vertical':'horizontal'} dir={rtl?'rtl':'ltr'} disabled={disabled} sizes={controlled?(sizes.length?sizes:third?['30%','40%','30%']:['40%','60%']):undefined} onResize={s=>{if(controlled&&accept)setSizes(s)}} onResizeStart={()=>setStarts(x=>x+1)} onResizeEnd={()=>setEnds(x=>x+1)} style={{width:600,maxWidth:'100%',height:320,marginTop:20,border:'1px solid var(--mt-border)'}}>
 {['Left','Right',...(third?['Third']:[])].map(label=><Splitter.Panel key={label} id={label.toLowerCase()} label={label} defaultSize={third?'33.333%':label==='Left'?'40%':undefined} min="15%" collapsible><div style={{padding:12}}>{label}<Button>{label} content</Button></div></Splitter.Panel>)}
 </Splitter><Button>Outside</Button></MtoneProvider>
}createRoot(document.getElementById('root')!).render(<Demo/>);
