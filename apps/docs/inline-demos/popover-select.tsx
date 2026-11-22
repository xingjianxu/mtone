import { useState } from "react";
import { Book, LockKeyhole } from "lucide-react";
import { Popover } from "../../../packages/mtone/src";

const repositories = [
  { value: "mtone", label: "mtone", icon: <Book size={16} /> },
  { value: "vaultsyncd", label: "vaultsyncd", icon: <Book size={16} /> },
  { value: "noted", label: "noted", icon: <Book size={16} /> },
  { value: "flowkeyd", label: "flowkeyd", icon: <Book size={16} /> },
  { value: "receiptd", label: "receiptd", icon: <LockKeyhole size={16} /> },
  { value: "exdir", label: "exdir", icon: <Book size={16} /> },
  { value: "nixos", label: "nixos", icon: <LockKeyhole size={16} /> },
  { value: "archived", label: "archived", icon: <Book size={16} />, disabled: true },
];

export default function Demo() {
  const [repository, setRepository] = useState("mtone");
  return (
    <Popover.Select
      trigger={repository}
      title="切换仓库"
      searchPlaceholder="搜索仓库"
      items={repositories}
      value={repository}
      onValueChange={setRepository}
    />
  );
}
