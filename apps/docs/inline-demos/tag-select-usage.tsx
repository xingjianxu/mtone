import * as M from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <M.TagSelect
      aria-label="主题"
      defaultValue={["design"]}
      options={[
        { value: "design", label: "产品设计" },
        { value: "research", label: "用户研究" },
        { value: "docs", label: "技术文档", disabled: true },
      ]}
    />
  );
}
