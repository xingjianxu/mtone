import React from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <M.AvatarGroup
      items={[
        { name: "林" },
        { name: "陈" },
        { name: "王" },
        { name: "李" },
        { name: "周" },
      ]}
      max={3}
    />
  );
}
