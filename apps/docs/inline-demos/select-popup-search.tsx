import { useState } from "react";
import { Book, LockKeyhole } from "lucide-react";
import { Select } from "../../../packages/mtone/src";

const repositories = [
  { value: "design-system", label: "design-system" },
  { value: "web-console", label: "web-console" },
  { value: "api-reference", label: "api-reference" },
  { value: "workflow-kit", label: "workflow-kit" },
  { value: "data-lab", label: "data-lab" },
  { value: "starter-kit", label: "starter-kit" },
  { value: "release-tools", label: "release-tools" },
  { value: "archived", label: "archived", disabled: true },
];
const privateRepositories = new Set(["data-lab", "release-tools"]);

export default function Demo() {
  const [repository, setRepository] = useState<string | null>("design-system");
  return (
    <Select
      searchable="popup"
      label="切换仓库"
      trigger={repository ?? "选择仓库"}
      popupTitle="切换仓库"
      popupWidth={320}
      searchPlaceholder="搜索仓库"
      options={repositories}
      value={repository}
      onValueChange={setRepository}
      renderOption={(option) => {
        const Icon = privateRepositories.has(option.value) ? LockKeyhole : Book;
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon size={16} aria-hidden="true" />
            {option.label}
          </span>
        );
      }}
    />
  );
}
