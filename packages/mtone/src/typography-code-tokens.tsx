import * as React from "react";

export type CodeToken = {
  text: string;
  light?: string;
  dark?: string;
};

export function CodeTokens({ tokens }: { tokens: readonly CodeToken[] }) {
  return tokens.map(({ text, light, dark }, index) =>
    light || dark ? (
      <span
        key={index}
        className="mt-code-token"
        style={
          {
            "--mt-code-token-light": light,
            "--mt-code-token-dark": dark,
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    ) : (
      text
    ),
  );
}
