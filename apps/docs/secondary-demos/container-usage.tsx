import { Container } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ width: "100%", border: "1px dashed var(--mt-border)", paddingBlock: 16 }}>
      <Container maxWidth={420} paddingInline={24} style={{ background: "var(--mt-subtle)" }}>
        <p style={{ margin: 0, paddingBlock: 12 }}>
          内容区最多 420px。父容器更窄时，内容区随之收缩。
        </p>
      </Container>
    </div>
  );
}
