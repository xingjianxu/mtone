import React from 'react';
import {createRoot} from 'react-dom/client';
import {HoverCard, MtoneProvider, Button} from '../../packages/mtone/src';
import '../../packages/mtone/dist/styles.css';
createRoot(document.getElementById('root')!).render(<MtoneProvider><main style={{padding:24}}>
<HoverCard trigger={<Button>Preview</Button>} openDelay={150} closeDelay={150} withArrow width={280} content={<><p>Rich preview</p><a href="#details">Details</a></>} />
<button style={{display:'block',marginTop:300}}>Outside</button>
</main></MtoneProvider>);
