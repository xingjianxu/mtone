import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LoadingOverlay, Button, MtoneProvider} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
function Demo() {
 const [visible,setVisible]=useState(false);
 const [clicks,setClicks]=useState(0);
 return <MtoneProvider><main style={{padding:20}}>
  <Button onClick={()=>setVisible(v=>!v)}>Toggle</Button>
  <div data-testid="region" style={{position:'relative',width:'min(320px, 100%)',height:160,borderRadius:8,marginTop:16,background:'#eee'}}>
   <button style={{position:'absolute',left:16,top:16}} onClick={()=>setClicks(v=>v+1)}>Underlying</button>
   <LoadingOverlay visible={visible} label="Saving" blur={2}/>
  </div>
  <output aria-label="Clicks">{clicks}</output>
  <button onClick={()=>setClicks(v=>v+1)}>Outside</button>
 </main></MtoneProvider>;
}
createRoot(document.getElementById('root')!).render(<Demo/>);
