import React from "react";
import {
  Button,
  Popconfirm,
  type PopconfirmPlacement,
} from "../../packages/mtone/src";
export function PopconfirmExample({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = React.useState("尚未执行操作");
  const [fail, setFail] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Popconfirm
        trigger={<Button danger>移除记录</Button>}
        title="移除这条记录？"
        description="此示例只更改本地提示，不会删除真实数据。"
        onConfirm={() => setStatus("已确认移除（本地示例）")}
        onCancel={() => setStatus("已取消")}
      />
      <output aria-live="polite">{status}</output>
      {!compact && (
        <>
          <section>
            <h4>异步确认与失败重试</h4>
            <label>
              <input
                type="checkbox"
                checked={fail}
                onChange={(e) => setFail(e.target.checked)}
              />{" "}
              模拟失败
            </label>
            <Popconfirm
              trigger={<Button>异步保存</Button>}
              title="保存更改？"
              description="等待约 800ms；执行期间禁止重复提交与关闭。"
              onConfirm={() =>
                new Promise<void>((resolve, reject) =>
                  setTimeout(
                    () => (fail ? reject(new Error("demo")) : resolve()),
                    800,
                  ),
                )
              }
              errorText="模拟保存失败，请关闭后取消勾选，再次重试。"
            />
          </section>
          <section>
            <h4>受控模式与自定义按钮</h4>
            <Popconfirm
              open={open}
              onOpenChange={setOpen}
              trigger={<Button>受控确认</Button>}
              title="确认归档？"
              icon={null}
              okText="归档"
              cancelText="保留"
              okButtonProps={{ variant: "blue" }}
              onConfirm={() => setStatus("已归档（本地示例）")}
            />
          </section>
          <section>
            <h4>十二个方向与自动避让</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(
                [
                  "topLeft",
                  "top",
                  "topRight",
                  "leftTop",
                  "left",
                  "leftBottom",
                  "rightTop",
                  "right",
                  "rightBottom",
                  "bottomLeft",
                  "bottom",
                  "bottomRight",
                ] as PopconfirmPlacement[]
              ).map((placement) => (
                <Popconfirm
                  key={placement}
                  placement={placement}
                  trigger={<Button size="sm">{placement}</Button>}
                  title="确认操作？"
                  description="浮层会在接近屏幕边缘时自动避让。"
                />
              ))}
            </div>
          </section>
          <section>
            <h4>禁用确认浮层</h4>
            <Popconfirm
              disabled
              trigger={<Button>不可操作</Button>}
              title="不会显示"
            />
          </section>
        </>
      )}
    </div>
  );
}
