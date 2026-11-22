import * as React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import * as mtone from "../packages/mtone/src";

afterEach(cleanup);

test("exports Upload without the removed Dropzone alias", () => {
  expect(mtone).toHaveProperty("Upload", mtone.Upload);
  expect(mtone).not.toHaveProperty("Dropzone");
});

test("routes dropped files through Upload's single-file adapter", async () => {
  const first = new File(["one"], "first.txt", { type: "text/plain" });
  const second = new File(["two"], "second.txt", { type: "text/plain" });
  const received: File[] = [];
  render(
    <mtone.MtoneProvider locale="en">
      <mtone.Upload
        multiple={false}
        accept=".txt"
        upload={async (file) => {
          received.push(file);
        }}
      >
        <span>Drop a text file here</span>
      </mtone.Upload>
    </mtone.MtoneProvider>,
  );
  fireEvent.drop(screen.getByText("Drop a text file here"), {
    dataTransfer: { files: [first, second] },
  });

  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Uploaded"));
  expect(received).toEqual([first]);
  expect(screen.getByText("first.txt")).toBeTruthy();
  expect(screen.queryByText("second.txt")).toBeNull();
});
