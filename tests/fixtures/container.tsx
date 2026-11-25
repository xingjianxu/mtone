import React from "react";
import { createRoot } from "react-dom/client";
import { Container } from "../../packages/mtone/src";
import "../../packages/mtone/src/styles.css";

createRoot(document.getElementById("root")!).render(
  <div style={{ paddingInline: 20 }}>
    <Container data-testid="default">Default</Container>
    <Container maxWidth="sm" data-testid="small">Small</Container>
    <Container maxWidth="lg" data-testid="large">Large</Container>
    <Container maxWidth="xl" data-testid="wide">Extra large</Container>
    <Container maxWidth={840} paddingInline={24} data-testid="custom">Custom</Container>
    <Container maxWidth="none" paddingInline={0} data-testid="fluid">Full width</Container>
  </div>,
);
