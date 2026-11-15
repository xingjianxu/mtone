import * as React from "react";
import { CircleCheck, CircleX, Info, LoaderCircle } from "lucide-react";
import {
  Toast as BToast,
  type ToastManagerAddOptions,
  type ToastManagerUpdateOptions,
  type ToastManagerPromiseOptions,
  type ToastObject,
} from "@base-ui/react/toast";
import { MtoneScope, useMtone } from "./basic";

export type ToastPosition =
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left"
  | "top-center"
  | "bottom-center"
  | "center"
  | "center-top";
export type ToastType = "success" | "error" | "info" | "loading";
type Presentation = { position?: ToastPosition; children?: React.ReactNode };
type InternalData<Data extends object> = Data & { __mtoneToast?: Presentation };
export type ToastOptions<Data extends object = Record<string, unknown>> =
  ToastManagerAddOptions<Data> & Presentation & { body?: React.ReactNode };
export type ToastUpdateOptions<Data extends object = Record<string, unknown>> =
  ToastManagerUpdateOptions<Data> & Presentation & { body?: React.ReactNode };
export type ToastPromiseOptions<
  Value,
  Data extends object = Record<string, unknown>,
> = {
  loading: string | ToastUpdateOptions<Data>;
  success:
    | string
    | ToastUpdateOptions<Data>
    | ((value: Value) => string | ToastUpdateOptions<Data>);
  error:
    | string
    | ToastUpdateOptions<Data>
    | ((error: unknown) => string | ToastUpdateOptions<Data>);
};
function normalize<Data extends object>(
  options: ToastOptions<Data> | ToastUpdateOptions<Data>,
  previous?: ToastObject<InternalData<Data>>,
) {
  const { body, position, children, data, ...rest } = options;
  const meta = { ...previous?.data?.__mtoneToast };
  if ("position" in options) meta.position = position;
  if ("children" in options) meta.children = children;
  return {
    ...rest,
    ...("body" in options ? { description: body } : {}),
    ...("data" in options || "position" in options || "children" in options
      ? {
          data: {
            ...previous?.data,
            ...data,
            __mtoneToast: meta,
          } as InternalData<Data>,
        }
      : {}),
  };
}
/** Compatible with the Base UI manager, with styled shortcuts and body/position options. */
export function useToast<Data extends object = any>() {
  const manager = BToast.useToastManager<InternalData<Data>>();
  const add = <T extends Data = Data>(options: ToastOptions<T>) =>
    manager.add<InternalData<T>>(
      normalize(
        options,
        manager.toasts.find((t) => t.id === options.id) as
          ToastObject<InternalData<T>> | undefined,
      ),
    );
  const update = <T extends Data = Data>(
    id: string,
    options:
      | ToastUpdateOptions<T>
      | ((previous: ToastObject<T>) => ToastUpdateOptions<T>),
  ) => {
    manager.update<InternalData<T>>(id, (previous) =>
      normalize(
        typeof options === "function" ? options(previous) : options,
        previous,
      ),
    );
  };
  const promise = <Value, T extends Data = Data>(
    value: Promise<Value>,
    options: ToastPromiseOptions<Value, T>,
  ) => {
    const loading =
      typeof options.loading === "string" ? undefined : options.loading;
    const convert = (item: string | ToastUpdateOptions<T>) =>
      typeof item === "string"
        ? item
        : normalize({
            data: loading?.data,
            position: loading?.position,
            children: loading?.children,
            ...item,
          });
    const mapped: ToastManagerPromiseOptions<Value, InternalData<T>> = {
      loading: convert(options.loading),
      success:
        typeof options.success === "function"
          ? (result) =>
              convert(
                (
                  options.success as (
                    value: Value,
                  ) => string | ToastUpdateOptions<T>
                )(result),
              )
          : convert(options.success),
      error:
        typeof options.error === "function"
          ? (error) =>
              convert(
                (
                  options.error as (
                    error: unknown,
                  ) => string | ToastUpdateOptions<T>
                )(error),
              )
          : convert(options.error),
    };
    return manager.promise(value, mapped);
  };
  return {
    ...manager,
    add,
    update,
    promise,
    success: (options: ToastOptions<Data>) =>
      add({ ...options, type: "success" }),
    error: (options: ToastOptions<Data>) => add({ ...options, type: "error" }),
    info: (options: ToastOptions<Data>) => add({ ...options, type: "info" }),
  };
}
const positions: ToastPosition[] = [
  "top-right",
  "bottom-right",
  "top-left",
  "bottom-left",
  "top-center",
  "bottom-center",
  "center",
  "center-top",
];
function ToastViewport({
  position,
  limit,
}: {
  position: ToastPosition;
  limit: number;
}) {
  const { toasts } =
    BToast.useToastManager<InternalData<Record<string, unknown>>>();
  const { locale } = useMtone();
  const placement = (t: (typeof toasts)[number]) =>
    positions.includes(t.data?.__mtoneToast?.position as ToastPosition)
      ? t.data!.__mtoneToast!.position!
      : position;
  return (
    <BToast.Portal>
      <MtoneScope>
        <BToast.Viewport
          className="mt-toast-viewport"
          aria-label={locale === "zh" ? "通知" : "Notifications"}
        >
          {toasts.map((t) => {
            const peers = toasts.filter(
              (other) => !other.limited && placement(other) === placement(t),
            );
            const index = peers.findIndex((other) => other.id === t.id);
            const offset = peers
              .slice(0, Math.max(0, index))
              .reduce((sum, item) => sum + (item.height ?? 0) + 10, 0);
            const total =
              peers.reduce((sum, item) => sum + (item.height ?? 0), 0) +
              Math.max(0, peers.length - 1) * 10;
            const type: ToastType =
              t.type === "success" || t.type === "error" || t.type === "loading"
                ? t.type
                : "info";
            const Icon =
              type === "success"
                ? CircleCheck
                : type === "error"
                  ? CircleX
                  : type === "loading"
                    ? LoaderCircle
                    : Info;
            return (
              <div
                key={t.id}
                className="mt-toast-stack"
                data-position={placement(t)}
                style={
                  {
                    "--mt-toast-offset": `${offset}px`,
                    "--mt-toast-total": `${total}px`,
                    "--mt-toast-limit": Math.max(1, limit),
                  } as React.CSSProperties
                }
              >
                <BToast.Root toast={t} className="mt-toast" data-type={type}>
                  <BToast.Content className="mt-toast-content">
                    <Icon
                      className={`mt-toast-icon${type === "loading" ? " mt-spin" : ""}`}
                      size={19}
                      aria-hidden="true"
                    />
                    <div className="mt-toast-message">
                      {t.title != null && (
                        <BToast.Title className="mt-toast-title" />
                      )}
                      {t.description != null && (
                        <BToast.Description className="mt-toast-description" />
                      )}
                      {t.data?.__mtoneToast?.children}
                      {t.actionProps && (
                        <BToast.Action className="mt-action mt-toast-action" />
                      )}
                    </div>
                    <BToast.Close
                      className="mt-dialog-close"
                      aria-label={locale === "zh" ? "关闭" : "Close"}
                    >
                      ×
                    </BToast.Close>
                  </BToast.Content>
                </BToast.Root>
              </div>
            );
          })}
        </BToast.Viewport>
      </MtoneScope>
    </BToast.Portal>
  );
}
export type ToastProviderProps = {
  children: React.ReactNode;
  timeout?: number;
  limit?: number;
  position?: ToastPosition;
};
export function ToastProvider({
  children,
  timeout = 5000,
  limit = 3,
  position = "bottom-right",
}: ToastProviderProps) {
  return (
    <BToast.Provider timeout={timeout} limit={limit}>
      {children}
      <ToastViewport position={position} limit={limit} />
    </BToast.Provider>
  );
}
export const Toast = ToastProvider;
