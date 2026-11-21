import React from 'react';
import {createRoot} from 'react-dom/client';
import {FileText} from 'lucide-react';
import {Menu, Button, MtoneProvider} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
function Demo(){
  const [selected,setSelected]=React.useState('');
  return <MtoneProvider><main style={{padding:32}}><Menu trigger={<Button>Actions</Button>} onSelect={setSelected} items={[
    {type:'group',key:'files',label:'Files',children:[{key:'open',label:'Open',icon:<FileText/>},{key:'export',label:'Export',children:[{key:'pdf',label:'PDF'},{key:'doc',label:'DOC',disabled:true}]}]},
    {type:'divider',key:'separator'},
    {type:'group',key:'other',label:'Other',children:[{key:'copy',label:'Copy'},{key:'locked',label:'Locked',disabled:true,children:[{key:'secret',label:'Secret'}]}]},
  ]}/>
  <section style={{marginTop:24}}>
    <label>Retained focus <input /></label>
    <div style={{marginTop:8}}>
      <Menu triggerMode="hover" trigger={<Button>Hover actions</Button>} items={[
        {key:'hover-open',label:'Hover open'},
        {key:'hover-export',label:'Hover export',children:[{key:'hover-pdf',label:'Hover PDF'}]},
      ]} onSelect={setSelected} />
      <Menu triggerMode="hover" trigger={<Button disabled>Disabled hover</Button>} items={[
        {key:'disabled',label:'Disabled item'},
      ]} />
    </div>
  </section>
  <p role="status">{selected}</p></main></MtoneProvider>;
}
createRoot(document.getElementById('root')!).render(<Demo/>);
