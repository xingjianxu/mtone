import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { secondaryDocSections } from "../apps/docs/secondary-demo-registry";
import type { DocSection } from "../apps/docs/doc-section";

describe("standalone component demos", () => {
  test.each(Object.entries(secondaryDocSections))(
    "%s ships matching public-import examples with unique anchors",
    (_, sections) => {
      const ids = new Set<string>();
      function verify(section: DocSection) {
        expect(ids.has(section.id)).toBe(false);
        ids.add(section.id);
        expect(section.title).toBeTruthy();
        if (section.Demo) {
          expect(section.source).toContain('from "@bixlab/mtone"');
          expect(section.source).toContain("export default function Demo()");
          expect(section.source).not.toContain("packages/mtone/src");
          expect(renderToStaticMarkup(<section.Demo />)).not.toBe("");
        } else {
          expect(section.children?.length).toBeGreaterThan(0);
        }
        section.children?.forEach(verify);
      }
      sections.forEach(verify);
    },
  );
});
