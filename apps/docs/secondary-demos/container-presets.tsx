import { Container } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ width: "100%", display: "grid", gap: 8 }}>
      <Container maxWidth="sm" style={{ border: "1px solid var(--mt-border)", paddingBlock: 8 }}>sm · 720px</Container>
      <Container style={{ border: "1px solid var(--mt-border)", paddingBlock: 8 }}>md · 960px（默认）</Container>
      <Container maxWidth="lg" style={{ border: "1px solid var(--mt-border)", paddingBlock: 8 }}>lg · 1200px</Container>
      <Container maxWidth="xl" style={{ border: "1px solid var(--mt-border)", paddingBlock: 8 }}>xl · 1440px</Container>
      <Container maxWidth="none" style={{ border: "1px solid var(--mt-border)", paddingBlock: 8 }}>none · 不限宽</Container>
    </div>
  );
}
