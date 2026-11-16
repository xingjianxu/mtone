import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(cleanup);
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
HTMLElement.prototype.scrollIntoView = () => {};

HTMLElement.prototype.scrollTo = () => {};

// jsdom has no pseudo-element layout; rc-table only uses this to measure scrollbars.
const nativeGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element) => nativeGetComputedStyle(element);
