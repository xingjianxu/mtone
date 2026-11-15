# Breaking changes in 0.2.0

## Tag consolidated into Badge

`Tag` is no longer exported. Replace `import { Tag } from "@bixlab/mtone"` with
`import { Badge } from "@bixlab/mtone"` and rename JSX `<Tag>` / `</Tag>` to
`<Badge>` / `</Badge>`.

Badge retains all previous behavior: six `tone` values, optional `onRemove`,
children, native span attributes, and localized accessible removal labels.
Applications still manage removal state themselves.

If you override the internal CSS class `.mt-tag`, update it to `.mt-badge`.
The documentation gallery now lists only Badge.
