import * as React from "react";
import { ChevronUp } from "lucide-react";
import { Avatar, Button, cn, useMtone } from "./basic";
import { Popover, type MenuEntry } from "./interactive";
import { Sidebar } from "./navigation";

export interface AppLayoutAccount {
  name: string;
  description?: React.ReactNode;
  /** Decorative avatar content. Defaults to initials from name. */
  avatar?: React.ReactNode;
  /** Omit or leave empty to display a static profile instead of a trigger. */
  items?: MenuEntry[];
  menuLabel?: string;
}

export interface AppLayoutProps extends React.ComponentPropsWithRef<"div"> {
  brand?: React.ReactNode;
  navigation: React.ReactNode;
  navigationLabel?: string;
  sidebarWidth?: number;
  sidebarFooter?: React.ReactNode;
  account?: AppLayoutAccount;
  /** Fill the viewport; alternatively set a height on the layout. */
  fullHeight?: boolean;
  contentAs?: "main" | "section" | "div";
  contentLabel?: string;
}

/** Application shell with navigation and account actions on the left and no global top bar. */
export function AppLayout({
  brand,
  navigation,
  navigationLabel,
  sidebarWidth = 240,
  sidebarFooter,
  account,
  fullHeight = false,
  contentAs: Content = "main",
  contentLabel,
  children,
  className,
  style,
  ...props
}: AppLayoutProps) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const width =
    Number.isFinite(sidebarWidth) && sidebarWidth > 0 ? sidebarWidth : 240;
  const profile = account && (
    <>
      <span className="mt-app-layout-avatar" aria-hidden="true">
        {account.avatar ?? <Avatar name={account.name} size={30} />}
      </span>
      <span className="mt-app-layout-account-copy">
        <span className="mt-app-layout-account-name">{account.name}</span>
        {account.description != null && (
          <span className="mt-app-layout-account-description">
            {account.description}
          </span>
        )}
      </span>
    </>
  );
  const footer =
    sidebarFooter != null || account ? (
      <>
        {sidebarFooter}
        {account &&
          (account.items?.length ? (
            <Popover.Menu
              side="top"
              align="start"
              label={account.menuLabel ?? (zh ? "账户操作" : "Account actions")}
              items={account.items}
              trigger={
                <Button
                  className="mt-app-layout-account"
                  variant="ghost"
                  aria-label={account.name}
                >
                  {profile}
                  <ChevronUp
                    className="mt-app-layout-account-chevron"
                    size={14}
                    aria-hidden="true"
                  />
                </Button>
              }
            />
          ) : (
            <div className="mt-app-layout-account">{profile}</div>
          ))}
      </>
    ) : undefined;
  return (
    <div
      {...props}
      className={cn(
        "mt-app-layout",
        fullHeight && "mt-app-layout-full-height",
        className,
      )}
      style={
        {
          "--mt-app-layout-sidebar-width": `${width}px`,
          ...style,
        } as React.CSSProperties
      }
    >
      <Sidebar
        className="mt-app-layout-sidebar"
        header={brand ?? undefined}
        footer={footer}
      >
        <nav
          className="mt-app-layout-navigation"
          aria-label={navigationLabel ?? (zh ? "主导航" : "Main navigation")}
        >
          {navigation}
        </nav>
      </Sidebar>
      <Content className="mt-app-layout-content" aria-label={contentLabel}>
        {children}
      </Content>
    </div>
  );
}
