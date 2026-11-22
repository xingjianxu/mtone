import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { CircleHelp } from "lucide-react";
import { Button, type ButtonProps, MtoneScope, cn, useMtone } from "./basic";
import { runConfirmTransaction } from "./confirm-transaction";

export type PopconfirmPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";
type Content = React.ReactNode | (() => React.ReactNode);
export interface PopconfirmProps {
  trigger: React.ReactElement;
  title: Content;
  description?: Content;
  icon?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  placement?: PopconfirmPlacement;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  showCancel?: boolean;
  okButtonProps?: Omit<ButtonProps, "onClick" | "children">;
  cancelButtonProps?: Omit<ButtonProps, "onClick" | "children">;
  onConfirm?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | boolean | Promise<void | boolean>;
  onCancel?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onConfirmError?: (error: unknown) => void;
  errorText?: React.ReactNode;
  onPopupClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
}
const content = (value: Content) =>
  typeof value === "function" ? value() : value;
export function Popconfirm({
  trigger,
  title,
  description,
  icon,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  placement = "top",
  arrow = true,
  autoAdjustOverflow = true,
  okText,
  cancelText,
  showCancel = true,
  okButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
  onConfirmError,
  errorText,
  onPopupClick,
  className,
  style,
}: PopconfirmProps) {
  const { locale } = useMtone();
  const [internal, setInternal] = React.useState(defaultOpen);
  const visible = !disabled && (open ?? internal);
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const session = React.useRef(0),
    busy = React.useRef(false),
    alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      session.current++;
    };
  }, []);
  React.useLayoutEffect(() => {
    session.current++;
    busy.current = false;
    setPending(false);
    setFailed(false);
  }, [visible]);
  const change = (next: boolean) => {
    if (disabled && next) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const side = placement.startsWith("top")
    ? "top"
    : placement.startsWith("bottom")
      ? "bottom"
      : placement.startsWith("left")
        ? "left"
        : "right";
  const align = /(Left|Top)$/.test(placement)
    ? "start"
    : /(Right|Bottom)$/.test(placement)
      ? "end"
      : "center";
  function confirm(event: React.MouseEvent<HTMLButtonElement>) {
    if (busy.current || disabled || !visible) return;
    busy.current = true;
    setFailed(false);
    const current = session.current;
    return runConfirmTransaction({
      invoke: () => onConfirm?.(event),
      isCurrent: () => alive.current && current === session.current,
      onPending: () => setPending(true),
      onFinish: () => {
        busy.current = false;
        setPending(false);
      },
      onResolve: (accepted, finish) => {
        finish();
        if (accepted !== false) change(false);
      },
      onReject: (error, finish) => {
        finish();
        setFailed(true);
        onConfirmError?.(error);
      },
    });
  }
  return (
    <Popover.Root
      open={visible}
      onOpenChange={(next, details) => {
        if (busy.current) {
          details.cancel();
          return;
        }
        change(next);
      }}
    >
      <Popover.Trigger render={trigger} disabled={disabled} />
      <Popover.Portal>
        <MtoneScope>
          <Popover.Positioner
            className="mt-positioner"
            side={side}
            align={align}
            sideOffset={arrow ? 10 : 6}
            collisionAvoidance={
              autoAdjustOverflow
                ? { side: "flip", align: "shift" }
                : { side: "none", align: "none" }
            }
          >
            <Popover.Popup
              className={cn("mt-popup", "mt-popconfirm", className)}
              style={style}
              onClick={onPopupClick}
              aria-busy={pending || undefined}
            >
              {arrow && (
                <Popover.Arrow className="mt-popconfirm-arrow">
                  <svg
                    width="12"
                    height="7"
                    viewBox="0 0 12 7"
                    aria-hidden="true"
                  >
                    <path d="M0 7 6 1 12 7" />
                  </svg>
                </Popover.Arrow>
              )}
              <div className="mt-popconfirm-body">
                <div className="mt-popconfirm-message">
                  {icon !== null && (
                    <span className="mt-popconfirm-icon" aria-hidden="true">
                      {icon === undefined ? <CircleHelp size={16} /> : icon}
                    </span>
                  )}
                  <div className="mt-popconfirm-copy">
                    <Popover.Title className="mt-popconfirm-title">
                      {content(title)}
                    </Popover.Title>
                    {description != null && (
                      <Popover.Description className="mt-popconfirm-description">
                        {content(description)}
                      </Popover.Description>
                    )}
                  </div>
                </div>
                {failed && (
                  <div role="alert" className="mt-popconfirm-error">
                    {errorText ??
                      (locale === "zh"
                        ? "操作未完成，请重试。"
                        : "Could not complete the action. Please try again.")}
                  </div>
                )}
                <div className="mt-popconfirm-actions">
                  {showCancel && (
                    <Button
                      size="sm"
                      {...cancelButtonProps}
                      disabled={pending || cancelButtonProps?.disabled}
                      onClick={(event) => {
                        if (busy.current) return;
                        onCancel?.(event);
                        if (!event.defaultPrevented) change(false);
                      }}
                    >
                      {cancelText ?? (locale === "zh" ? "取消" : "Cancel")}
                    </Button>
                  )}
                  <Button
                    variant="solid"
                    size="sm"
                    {...okButtonProps}
                    loading={pending || okButtonProps?.loading}
                    disabled={pending || okButtonProps?.disabled}
                    onClick={confirm}
                  >
                    {okText ?? (locale === "zh" ? "确定" : "OK")}
                  </Button>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </MtoneScope>
      </Popover.Portal>
    </Popover.Root>
  );
}
