import React, { useId, useState } from "react";
import { Button, Progress } from "../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };
const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 20,
};
function Demo({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} style={{ minWidth: 0 }}>
      <h3 id={id} style={{ margin: "0 0 12px", fontSize: 16 }}>
        {title}
      </h3>
      {children}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontSize: 12 }}>查看用法</summary>
        <pre style={{ overflowX: "auto", fontSize: 12 }}>
          <code>{code}</code>
        </pre>
      </details>
    </section>
  );
}
export function ProgressExamples({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState(60);
  if (compact) return <Progress value={68} label="上传进度" showInfo />;
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <Demo
        title="基础线性进度"
        code={
          '<Progress value={68} label="上传进度" />\n<Progress value={68} label="上传进度" showInfo />'
        }
      >
        <div style={stack}>
          <Progress value={68} label="上传进度（无文字）" />
          <Progress value={68} label="上传进度" showInfo />
        </div>
        <p>
          默认保留 mtone 的 5px 细进度条，不显示文字。showInfo
          开启百分比或状态图标。
        </p>
      </Demo>
      <Demo
        title="状态"
        code={
          '<Progress value={60} status="active" showInfo />\n<Progress value={100} status="success" showInfo />\n<Progress value={45} status="exception" showInfo />'
        }
      >
        <div style={stack}>
          <Progress value={60} label="处理中" status="active" showInfo />
          <Progress value={100} label="已完成" status="success" showInfo />
          <Progress value={45} label="上传失败" status="exception" showInfo />
        </div>
        <p>
          active
          为连续线性条增加轻量动画；减少动态效果偏好会关闭动画。状态不改变
          value，100% 也不会自动切换状态。
        </p>
      </Demo>
      <Demo
        title="圆形进度"
        code={
          '<Progress type="circle" value={68} showInfo />\n<Progress type="circle" value={100} status="success" showInfo />'
        }
      >
        <div style={row}>
          <Progress type="circle" value={68} label="项目完成度" showInfo />
          <Progress
            type="circle"
            value={100}
            label="任务完成"
            status="success"
            showInfo
          />
          <Progress
            type="circle"
            value={45}
            label="任务失败"
            status="exception"
            showInfo
          />
        </div>
      </Demo>
      <Demo
        title="仪表盘与缺口方向"
        code={
          '<Progress type="dashboard" value={75} showInfo />\n<Progress type="dashboard" value={75} gapDegree={120} gapPosition="right" showInfo />'
        }
      >
        <div style={row}>
          <Progress type="dashboard" value={75} label="容量" showInfo />
          <Progress
            type="dashboard"
            value={75}
            label="右侧缺口"
            gapDegree={120}
            gapPosition="right"
            showInfo
          />
          <Progress
            type="dashboard"
            value={75}
            label="顶部缺口"
            gapDegree={90}
            gapPosition="top"
            showInfo
          />
        </div>
        <p>
          默认底部保留 75° 缺口，可设为 top、bottom、left 或 right。gapDegree=0
          显示完整圆环。
        </p>
      </Demo>
      <Demo
        title="尺寸、线宽与端点"
        code={
          '<Progress value={60} size="small" />\n<Progress value={60} size={10} strokeLinecap="butt" />\n<Progress type="circle" value={60} size={80} strokeWidth={10} showInfo />'
        }
      >
        <div style={stack}>
          <Progress value={60} size="small" label="细线进度" />
          <Progress
            value={60}
            size={10}
            strokeLinecap="butt"
            label="平直端点"
          />
          <div style={row}>
            <Progress
              type="circle"
              value={60}
              size="small"
              label="小圆环"
              showInfo
            />
            <Progress
              type="circle"
              value={60}
              size={80}
              strokeWidth={10}
              label="自定义圆环"
              showInfo
            />
            <Progress
              type="dashboard"
              value={60}
              size={80}
              strokeLinecap="square"
              label="方形端点"
              showInfo
            />
          </div>
        </div>
        <p>
          数字 size
          在线性条中表示高度（px），在圆形和仪表盘中表示直径（px）。圆环的
          strokeWidth 以 100×100 画布为单位，与直径成比例。
        </p>
      </Demo>
      <Demo
        title="颜色与渐变"
        code={
          '<Progress value={70} color="#5378aa" trackColor="#eef2f7" showInfo />\n<Progress value={70} color={{ from: "#7d9c84", to: "#5378aa" }} showInfo />\n<Progress type="circle" value={70} color={{ from: "#7d9c84", to: "#5378aa" }} showInfo />'
        }
      >
        <div style={stack}>
          <Progress
            value={70}
            color="#5378aa"
            trackColor="#eef2f7"
            label="自定义颜色"
            showInfo
          />
          <Progress
            value={70}
            color={{ from: "#7d9c84", to: "#5378aa" }}
            label="渐变线条"
            showInfo
          />
          <Progress
            type="circle"
            value={70}
            color={{ from: "#7d9c84", to: "#5378aa" }}
            label="渐变圆环"
            showInfo
          />
        </div>
        <p>渐变从左到右；圆环使用画布方向的线性渐变，不是沿圆周的锥形渐变。</p>
      </Demo>
      <Demo
        title="成功分段"
        code={
          '<Progress value={80} success={{ value: 35 }} showInfo />\n<Progress type="circle" value={80} success={{ value: 35, color: "#548164" }} showInfo />'
        }
      >
        <div style={stack}>
          <Progress
            value={80}
            success={{ value: 35 }}
            label="已处理 80%，已验证 35%"
            showInfo
          />
          <Progress
            type="circle"
            value={80}
            success={{ value: 35 }}
            label="已处理 80%，已验证 35%"
            showInfo
          />
        </div>
        <p>
          success.value
          表示总量中的已成功百分比，不是当前进度的百分比；显示值不会超过 value。
        </p>
      </Demo>
      <Demo
        title="步骤进度"
        code={
          '<Progress value={60} steps={10} size={8} showInfo />\n<Progress type="circle" value={60} steps={{ count: 10, gap: 3 }} strokeLinecap="butt" showInfo />'
        }
      >
        <div style={stack}>
          <Progress
            value={60}
            steps={10}
            size={8}
            label="六步已完成"
            showInfo
          />
          <div style={row}>
            <Progress
              type="circle"
              value={60}
              steps={{ count: 10, gap: 3 }}
              strokeLinecap="butt"
              label="圆环步骤"
              showInfo
            />
            <Progress
              type="dashboard"
              value={60}
              steps={10}
              success={{ value: 30 }}
              strokeLinecap="butt"
              label="仪表盘步骤"
              showInfo
            />
          </div>
        </div>
        <p>
          按最接近的完整步骤显示。gap 单位为 px，默认
          2；圆环会按直径换算。圆环步骤过密时自动使用 butt 端点，避免端帽重叠。
        </p>
      </Demo>
      <Demo
        title="自定义信息"
        code={
          '<Progress value={80} success={{ value: 35 }} showInfo\n  format={(value, successValue) => `${value}% / 已验证 ${successValue}%`} />\n<Progress type="circle" value={75} showInfo format={value => `${value / 10} GB`}\n  aria-valuetext="已使用 7.5 GB，共 10 GB" />'
        }
      >
        <div style={stack}>
          <Progress
            value={80}
            success={{ value: 35 }}
            label="处理进度"
            showInfo
            format={(n, successValue) => `${n}% / 已验证 ${successValue}%`}
          />
          <Progress
            type="circle"
            value={75}
            label="存储使用量"
            showInfo
            format={(n) => `${n / 10} GB`}
            aria-valuetext="已使用 7.5 GB，共 10 GB"
          />
        </div>
        <p>
          format
          优先于默认百分比和状态图标。自定义文字只用于视觉显示；含单位或业务含义时，请同时提供
          aria-valuetext。
        </p>
      </Demo>
      <Demo
        title="动态更新"
        code={
          "const [value, setValue] = useState(60);\n<Progress value={value} showInfo />\n<Button onClick={() => setValue(n => Math.min(100, n + 10))}>增加</Button>"
        }
      >
        <div style={stack}>
          <Progress value={value} label="动态线性进度" showInfo />
          <div style={row}>
            <Progress
              type="circle"
              value={value}
              label="动态圆环进度"
              size="small"
              showInfo
            />
            <Button
              disabled={value === 0}
              onClick={() => setValue((n) => Math.max(0, n - 10))}
            >
              减少
            </Button>
            <Button
              disabled={value === 100}
              onClick={() => setValue((n) => Math.min(100, n + 10))}
            >
              增加
            </Button>
            <Button onClick={() => setValue(0)}>重置</Button>
          </div>
        </div>
      </Demo>
    </div>
  );
}
