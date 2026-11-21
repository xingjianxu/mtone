import { useEffect, useRef, useState } from "react";
import {
  AdminLayout,
  Button,
  GlobalNotice,
  NavItem,
} from "../../../packages/mtone/src";

type Destination = "成员" | "日志";

export default function Demo() {
  const [route, setRoute] = useState<Destination>("成员");
  const [admin, setAdmin] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const headerRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const attempt = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    // Do not interrupt someone who moved focus elsewhere during the request.
    if (
      document.activeElement !== document.body &&
      document.activeElement !== actionRef.current
    )
      return;
    if (!admin) headerRef.current?.focus();
    else if (error) actionRef.current?.focus();
  }, [admin, error]);

  function exitAdminMode() {
    if (!admin || inFlight.current) return;
    // Lock immediately as well as disabling the button on the next render.
    inFlight.current = true;
    setPending(true);
    setError(undefined);
    const currentAttempt = ++attempt.current;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      inFlight.current = false;
      setPending(false);
      if (currentAttempt === 1) {
        setError("退出失败，请重试");
        return;
      }
      setAdmin(false);
    }, 600);
  }

  return (
    <div
      style={{
        width: "100%",
        height: 360,
        overflow: "hidden",
        border: "1px solid var(--mt-border)",
        borderRadius: 8,
      }}
    >
      <AdminLayout
        hasSider
        aria-label="管理模式示例"
        notice={
          admin ? (
            <GlobalNotice
              title="管理员模式"
              actionLabel={error ? "重试退出管理模式" : "退出管理模式"}
              actionRef={actionRef}
              loading={pending}
              error={error}
              onAction={exitAdminMode}
            >
              当前操作使用管理员权限。完成操作后请退出管理模式。
            </GlobalNotice>
          ) : null
        }
        style={{ height: "100%" }}
      >
        <AdminLayout.Sider width={96} aria-label="管理导航">
          {(["成员", "日志"] as const).map((label) => (
            <NavItem
              key={label}
              active={route === label}
              onClick={() => setRoute(label)}
            >
              {label}
            </NavItem>
          ))}
        </AdminLayout.Sider>
        <AdminLayout>
          <AdminLayout.Header
            extra={
              <Button
                ref={headerRef}
                disabled={admin}
                onClick={() => {
                  if (admin) return;
                  attempt.current = 0;
                  setAdmin(true);
                }}
              >
                管理模式设置
              </Button>
            }
          >
            <span role="status">
              {admin ? "管理员身份（演示）" : "普通用户身份（演示）"}
            </span>
          </AdminLayout.Header>
          <AdminLayout.Content as="section">
            <h3>{route}</h3>
            <p>
              {route === "成员"
                ? "查看项目成员和权限。"
                : "查看最近的管理操作。"}
            </p>
            <p>首次模拟退出会失败，重试才会成功。不调用任何真实权限接口。</p>
          </AdminLayout.Content>
        </AdminLayout>
      </AdminLayout>
    </div>
  );
}
