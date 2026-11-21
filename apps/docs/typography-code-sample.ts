import type { CodeToken } from "../../packages/mtone/src/typography-code-tokens";

export const source = `type User = { name: string };

function Greeting({ name }: User) {
  return <strong>{name}</strong>;
}`;

// The docs Vite plugin supplies the precomputed data. Bare source tooling can
// still render this example as readable plain text with no configuration.
export const tokens: CodeToken[] | null = null;
