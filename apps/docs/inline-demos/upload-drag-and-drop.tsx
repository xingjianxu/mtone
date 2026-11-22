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
  return (
    <div style={stackStyle}>
      <M.Upload
        upload={simulateUpload}
        accept=".txt"
        maxSize={1024 * 1024}
        multiple={false}
      >
        <span>拖拽一个 TXT 文件到这里，或点击选择文件</span>
      </M.Upload>
      <M.Text muted>
        单次最多添加一个文件，单文件上限 1 MB。可在模拟上传过程中取消，或取消后重试；文件不会发送到服务器。
      </M.Text>
    </div>
  );
}
