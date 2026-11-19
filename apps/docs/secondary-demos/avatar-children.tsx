import { Avatar } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Avatar.Group shape="square" size={36}>
        <Avatar name="甲" />
        <Avatar name="乙" />
        <Avatar name="丙" shape="circle" size={28} />
      </Avatar.Group>
    </div>
  );
}
