import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Form, FormField, Input, Select, MultiSelect, Button, type FormInstance } from "../packages/mtone/src";
let instance: FormInstance;
function Demo({ finish = vi.fn(), failed = vi.fn() }) {
 const [form] = Form.useForm(); instance = form;
 return <Form form={form} initialValues={{name:"",roles:[]}} onFinish={finish} onFinishFailed={failed}>
 <Form.Item name="name" label="Name" rules={[{required:true,message:"Name required"}]}><Input /></Form.Item>
 <FormField name="team" label="Team" rules={[{required:true,message:"Team required"}]}><Select options={[{value:"design",label:"Design"}]} /></FormField>
 <FormField name="roles" label="Roles" rules={[{type:"array",min:1,required:true,message:"Role required"}]}><MultiSelect options={[{value:"read",label:"Read"}]} /></FormField>
 <Button type="submit">Save</Button><Button type="reset">Reset</Button>
 </Form>;
}
test("validates on submit with accessible compound control errors", async () => {
 const finish=vi.fn(),failed=vi.fn();
 render(<Demo finish={finish} failed={failed} />);
 fireEvent.click(screen.getByRole("button",{name:"Save"}));
 await waitFor(()=>expect(failed).toHaveBeenCalledOnce());
 expect(finish).not.toHaveBeenCalled();
 for(const [label,error] of [["Name","Name required"],["Team","Team required"],["Roles","Role required"]]) {
  expect(screen.getByRole(label === "Name" ? "textbox" : "combobox", {name:label})).toHaveAttribute("aria-invalid","true");
  expect(screen.getByRole(label === "Name" ? "textbox" : "combobox", {name:label})).toHaveAccessibleDescription(error);
 }
});
test("updates values, preserves callbacks, validates and resets", async () => {
 const finish=vi.fn();render(<Demo finish={finish} />);
 fireEvent.change(screen.getByRole("textbox",{name:"Name"}),{target:{value:"Alice"}});
 expect(instance.getFieldValue("name")).toBe("Alice");
 const {act}=await import("@testing-library/react");
 await act(async()=>instance.setFieldsValue({team:"design",roles:["read"]}));
 fireEvent.click(screen.getByRole("button",{name:"Save"}));
 await waitFor(()=>expect(finish).toHaveBeenCalledWith({name:"Alice",team:"design",roles:["read"]}));
 fireEvent.click(screen.getByRole("button",{name:"Reset"}));
 expect(screen.getByRole("textbox",{name:"Name"})).toHaveValue("");
 expect(instance.getFieldValue("roles")).toEqual([]);
 expect(instance.getFieldError("name")).toEqual([]);
});
test("manual error remains compatible and describedby is merged", () => {
 render(<><span id="external">Extra</span><FormField label="Manual" error="Server error"><Input aria-describedby="external" /></FormField></>);
 expect(screen.getByLabelText("Manual")).toHaveAccessibleDescription("Extra Server error");
});
test("blur validation and explicit onSubmit cancellation", async () => {
 const finish=vi.fn();render(<Form onFinish={finish} onSubmit={event=>event.preventDefault()}>
 <FormField name="x" label="X" validateTrigger="onBlur" rules={[{required:true,message:"Missing"}]}><Input /></FormField><Button type="submit">Go</Button></Form>);
 fireEvent.change(screen.getByRole("textbox",{name:"X"}),{target:{value:""}});
 expect(screen.queryByText("Missing")).not.toBeInTheDocument();
 fireEvent.blur(screen.getByRole("textbox",{name:"X"}));
 await screen.findByText("Missing");
 fireEvent.click(screen.getByRole("button",{name:"Go"}));expect(finish).not.toHaveBeenCalled();
});
test("unnamed legacy form retains native semantics", () => {
 const submit=vi.fn(event=>event.preventDefault());const {container}=render(<Form onSubmit={submit}><FormField label="Legacy" required><Input /></FormField></Form>);
 expect(container.querySelector("form")).not.toHaveAttribute("novalidate");
 fireEvent.submit(container.querySelector("form")!);expect(submit).toHaveBeenCalledOnce();
});

test("stale async submit and reset cannot call onFinish", async () => {
 const finish=vi.fn();const resolvers: (()=>void)[]=[];
 function AsyncForm() { const [form]=Form.useForm();instance=form;return <Form form={form} initialValues={{x:"old"}} onFinish={finish}>
 <Form.Item name="x" label="Async" validateTrigger={false} rules={[{validator:()=>new Promise<void>(resolve=>resolvers.push(resolve))}]}><Input /></Form.Item>
 <Button type="submit">Submit async</Button><Button type="reset">Reset async</Button></Form>; }
 render(<AsyncForm />);
 fireEvent.click(screen.getByRole("button",{name:"Submit async"}));
 await waitFor(()=>expect(resolvers.length).toBe(1));
 expect(screen.getByRole("textbox",{name:"Async"})).toHaveAttribute("aria-busy","true");
 fireEvent.change(screen.getByRole("textbox",{name:"Async"}),{target:{value:"new"}});
 const {act}=await import("@testing-library/react");await act(async()=>resolvers[0]());
 expect(finish).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole("button",{name:"Submit async"}));await waitFor(()=>expect(resolvers.length).toBe(2));
 fireEvent.click(screen.getByRole("button",{name:"Reset async"}));await act(async()=>resolvers[1]());
 expect(finish).not.toHaveBeenCalled();expect(screen.getByRole("textbox",{name:"Async"})).toHaveValue("old");
});

test("custom blur collection trigger composes value update and validation", async () => {
 function BlurForm() {const [form]=Form.useForm();instance=form;return <Form form={form}><FormField name="blur" label="Blur" trigger="onBlur" validateTrigger="onBlur" rules={[{min:3,message:"Too short"}]}><Input /></FormField></Form>;}
 render(<BlurForm />);fireEvent.blur(screen.getByRole("textbox",{name:"Blur"}),{target:{value:"ab"}});
 await screen.findByText("Too short");expect(instance.getFieldValue("blur")).toBe("ab");
});

test("collects actual Select and MultiSelect option clicks", async () => {
 const user=(await import("@testing-library/user-event")).default.setup();const finish=vi.fn();render(<Demo finish={finish} />);
 await user.type(screen.getByRole("textbox",{name:"Name"}),"Alice");
 await user.click(screen.getByRole("combobox",{name:"Team"}));await user.click(await screen.findByRole("option",{name:"Design"}));
 await user.type(screen.getByRole("combobox",{name:"Roles"}),"Read");await user.click(await screen.findByRole("option",{name:"Read"}));
 expect(instance.getFieldsValue()).toEqual({name:"Alice",team:"design",roles:["read"]});
 await user.click(screen.getByRole("button",{name:"Save"}));await waitFor(()=>expect(finish).toHaveBeenCalledOnce());
});
