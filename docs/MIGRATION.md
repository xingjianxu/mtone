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

The short-lived `closeOnOutsideClick` option has been replaced by `modal` with
inverted semantics: use `modal={!oldCloseOnOutsideClick}` for an explicit old value.
The new default is `true`, so outside clicks **do not close** the dialog by default.
Set `modal={false}` to retain the earlier outside-dismissal behavior.

This option only controls outside dismissal. Focus trapping, the backdrop,
scroll locking, Escape, and the close button remain unchanged. Existing styling
classes remain unchanged. Drawer and ConfirmDialog do not receive this option.
