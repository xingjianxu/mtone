import { expect, test } from "vitest";
import * as mtone from "../packages/mtone/src";
import { parseRoute, searchDocs } from "../apps/docs/docs-app";

test("only exposes the AdminLayout component and canonical docs route", () => {
  expect(mtone).toHaveProperty("AdminLayout.Sider");
  expect(mtone).not.toHaveProperty("Layout");
  expect(parseRoute("#/components/AdminLayout")).toEqual({kind: "component", name: "AdminLayout"});
  expect(parseRoute("#/components/Layout")).toEqual({kind: "not-found"});
  expect(searchDocs("AdminLayout").some((doc) => doc.name === "AdminLayout")).toBe(true);
});
