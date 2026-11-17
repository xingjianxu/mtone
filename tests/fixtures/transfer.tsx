import React from 'react';
import {createRoot} from 'react-dom/client';
import {MtoneProvider,Transfer} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
const items=[{key:'a',label:'Alpha'},{key:'b',label:'Beta'},{key:'c',label:'Locked',disabled:true},...Array.from({length:12},(_,i)=>({key:'long'+i,label:'Long unbroken title '.repeat(8)}))];
createRoot(document.getElementById('root')!).render(<MtoneProvider><main style={{maxWidth:640,padding:12}}><Transfer items={items} showSearch pagination={{pageSize:4}}/><h3>One way</h3><Transfer items={items.slice(0,3)} defaultTargetKeys={['a','c']} oneWay/></main></MtoneProvider>);
