import { useState } from "react";
import { Book, LockKeyhole } from "lucide-react";
import { Popover } from "../../../packages/mtone/src";

const repositories = [
  { value: "design-system", label: "design-system", icon: <Book size={16} /> },
  { value: "web-console", label: "web-console", icon: <Book size={16} /> },
  { value: "api-reference", label: "api-reference", icon: <Book size={16} /> },
  { value: "workflow-kit", label: "workflow-kit", icon: <Book size={16} /> },
  { value: "data-lab", label: "data-lab", icon: <LockKeyhole size={16} /> },
  { value: "starter-kit", label: "starter-kit", icon: <Book size={16} /> },
  { value: "release-tools", label: "release-tools", icon: <LockKeyhole size={16} /> },
  { value: "archived", label: "archived", icon: <Book size={16} />, disabled: true },
];

export default function Demo() {
  const [repository, setRepository] = useState("design-system");
  return (
    <Popover.SearchableSelect
      trigger={repository}
      title="切换仓库"
      searchPlaceholder="搜索仓库"
      items={repositories}
      value={repository}
      onValueChange={setRepository}
    />
  );
}
