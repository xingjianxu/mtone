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

## Modal renamed to Dialog

Use `Dialog` and `DialogProps` in new code. `Modal` and `ModalProps` remain
deprecated aliases for compatibility. The old documentation URL also resolves to Dialog.

`closeOnOutsideClick` defaults to `true`, preserving existing behavior. Set it
to `false` to ignore outside presses without disabling Escape or the close button.
The styling classes and existing layout remain unchanged. Drawer and ConfirmDialog
do not receive this new option.
