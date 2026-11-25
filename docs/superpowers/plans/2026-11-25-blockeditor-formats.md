# BlockEditor formats and content blocks (#105)

1. Add tests for expanded block insertion, selected-table operations, safe image
   creation, and read-only code preview. Keep existing composition/link tests.
2. Extend the existing schema with BlockNote table, toggle and divider blocks.
   Keep the native code behavior and wrap its display using Typography.Code.
   Add React image and semantic callout blocks. Validate image URLs on rendering
   as well as when accepting them. Keep the JSON as the source of truth.
3. Use mtone controls for insert, text formatting, table and image actions.
   Keep controls bilingual, distinguish edit and read-only, and keep the
   caret/selection when applying formatting.
4. Extend the existing lazy docs example, reference, README and browser
   fixture. Verify targeted tests, build, reference and package on the exact
   candidate; use the guarded master and Pages workflow. No npm publication.
