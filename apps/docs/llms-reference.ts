import type { ComponentDoc } from "./catalog";

export const globalLlmsPath = "llms.txt";
export const componentLlmsPath = (name: string) => `components/${name}/llms.txt`;

/** Used for both the packaged reference and separate documentation-site files. */
export function componentLlmsLines(doc: ComponentDoc, documentationUrl: string) {
  const lines = [
    "",
    `- [${doc.name}](${documentationUrl}): ${doc.description}`,
    `- Import: ${doc.importNames.join(", ")} from @bixlab/mtone`,
  ];
  for (const prop of doc.props) {
    lines.push(`- ${prop.name}: ${prop.type}${prop.default === undefined ? "" : ` (default: ${prop.default})`}. ${prop.description}`);
  }
  for (const note of doc.notes) lines.push(`- ${note}`);
  return [...lines, "", "```tsx", doc.code, "```", ""];
}

export function formatComponentLlms(doc: ComponentDoc, documentationUrl: string, version: string) {
  return [
    `# ${doc.name}`,
    "",
    `> @bixlab/mtone ${version} documentation preview. Check your installed package's declarations for availability.`,
    ...componentLlmsLines(doc, documentationUrl),
  ].join("\n");
}
