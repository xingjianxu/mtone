import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Form, Input, Select, MultiSelect, Button, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function Demo() { const [form]=Form.useForm();const [status,setStatus]=useState("Idle");return <MtoneProvider locale="en"><div style={{maxWidth:400,padding:20}}>
<Form form={form} initialValues={{email:"",team:null,roles:[]}} onFinish={()=>setStatus("Saved")} onFinishFailed={()=>setStatus("Invalid")}>
<Form.Item name="email" label="Email" rules={[{required:true,message:"Email required"},{type:"email",message:"Invalid email"}]}><Input /></Form.Item>
<Form.Item name="team" label="Team" rules={[{required:true,message:"Team required"}]}><Select options={[{value:"design",label:"Design"}]} /></Form.Item>
<Form.Item name="roles" label="Roles" rules={[{required:true,message:"Role required"}]}><MultiSelect options={[{value:"read",label:"Read"},{value:"write",label:"Write"}]} /></Form.Item>
<Button type="submit">Save</Button><Button type="reset">Reset</Button>
<Button onClick={()=>{void form.validateFields().then(()=>setStatus("Validated"),()=>setStatus("Invalid"));}}>Validate</Button>
<output>{status}</output></Form></div></MtoneProvider>; }
createRoot(document.getElementById("root")!).render(<Demo />);
