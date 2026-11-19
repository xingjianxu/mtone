import React from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
const simulateUpload: M.UploadAdapter = (_file, { signal, onProgress }) =>
  new Promise<void>((resolve, reject) => {
    let progress = 0;
    const abort = () => {
      clearInterval(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setInterval(() => {
      progress += 20;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        signal.removeEventListener("abort", abort);
        resolve();
      }
    }, 220);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
export default function Demo() {
  const Upload = M.Dropzone;
  return (
    <div style={stackStyle}>
      <Upload
        upload={simulateUpload}
        accept=".pdf,.txt,image/*"
        maxSize={5 * 1024 * 1024}
      />
      <M.Text muted>
        模拟上传：文件不会发送到服务器。支持 PDF、TXT、图片，单文件最大 5 MB。
      </M.Text>
    </div>
  );
}
