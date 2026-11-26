import * as React from "react";
import {
  Bell,
  BookmarkCheck,
  Ellipsis,
  History,
  Maximize2,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import {
  Avatar,
  Breadcrumb,
  Button,
  Divider,
  Popover,
  Tag,
  Tooltip,
  Topbar,
} from "../../../packages/mtone/src";

const commands = [
  ["history", "版本历史", History],
  ["tags", "标签", Tags],
  ["fullscreen", "全屏", Maximize2],
  ["notifications", "通知", Bell],
  ["settings", "设置", SlidersHorizontal],
] as const;

export default function Demo() {
  const [version, setVersion] = React.useState(18);
  const [message, setMessage] = React.useState("");
  return (
    <div style={{ container: "mt-note-topbar / inline-size", minWidth: 0 }}>
      <style>{`
        .mt-demo-note-topbar-wide { display: flex; align-items: center; gap: 4px; }
        .mt-demo-note-topbar-compact { display: none; }
        @container mt-note-topbar (width < 640px) {
          .mt-demo-note-topbar-wide { display: none; }
          .mt-demo-note-topbar-compact { display: inline-flex; }
        }
        @container mt-note-topbar (width < 420px) {
          .mt-demo-note-topbar-record { display: none; }
        }
      `}</style>
      <Topbar
        style={{ border: "1px solid var(--mt-border)", borderRadius: 8 }}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "笔记", onClick: () => setMessage("已选择笔记") },
              { label: "产品架构与设计规范" },
            ]}
          />
        }
        status={
          <Tag tone="green" aria-live="polite">
            已保存 · v{version}
          </Tag>
        }
        extra={
          <>
            <Button
              variant="solid"
              aria-label="记录版本"
              leftSection={<BookmarkCheck size={15} aria-hidden />}
              onClick={() => {
                setVersion((previous) => previous + 1);
                setMessage("已记录新版本");
              }}
            >
              <span className="mt-demo-note-topbar-record">记录版本</span>
            </Button>
            <div className="mt-demo-note-topbar-wide">
              {commands.map(([key, label, Icon], i) => (
                <React.Fragment key={key}>
                  {i === 3 && <Divider orientation="vertical" aria-hidden />}
                  <Tooltip content={label}>
                    <Button
                      iconOnly
                      variant="ghost"
                      aria-label={label}
                      onClick={() => setMessage(`已选择${label}`)}
                    >
                      <Icon size={16} aria-hidden />
                    </Button>
                  </Tooltip>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-demo-note-topbar-compact">
              <Popover.Menu
                trigger={
                  <Button iconOnly variant="ghost" aria-label="更多操作">
                    <Ellipsis size={16} aria-hidden />
                  </Button>
                }
                align="end"
                label="笔记操作"
                items={commands.map(([key, label, Icon]) => ({
                  key,
                  label,
                  icon: <Icon size={15} aria-hidden />,
                  onSelect: () => setMessage(`已选择${label}`),
                }))}
              />
            </div>
            <Popover.Menu
              align="end"
              label="账号操作"
              trigger={
                <Button iconOnly variant="ghost" aria-label="账号菜单">
                  <Avatar size={26}>K</Avatar>
                </Button>
              }
              items={[
                {
                  key: "profile",
                  label: "个人资料",
                  onSelect: () => setMessage("已选择个人资料"),
                },
              ]}
            />
          </>
        }
      />
      {message && (
        <p role="status" style={{ marginBlock: "8px 0" }}>
          {message}
        </p>
      )}
    </div>
  );
}
