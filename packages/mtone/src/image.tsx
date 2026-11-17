import * as React from "react";
import { Dialog as BDialog } from "@base-ui/react/dialog";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageOff,
  LoaderCircle,
} from "lucide-react";
import { cn, MtoneScope, useMtone } from "./basic";

export interface ImageItem {
  src: string;
  alt?: string;
  previewSrc?: string;
  fallback?: string;
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
}
export interface ImagePreviewProps {
  items: readonly ImageItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: number;
  defaultCurrent?: number;
  onCurrentChange?: (index: number) => void;
  /** Focus target after dismissal. Otherwise Base UI returns to the active opener. */
  returnFocus?: React.RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  className?: string;
}
export interface ImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "placeholder"
> {
  src: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  errorContent?: React.ReactNode;
  preview?: boolean;
  previewSrc?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  fit?: React.CSSProperties["objectFit"];
  wrapperClassName?: string;
}

/** Keyed state prevents an old image event resetting a new source's loading state. */
function ImageContent({
  fallback,
  placeholder,
  errorContent,
  ...props
}: Omit<
  ImageProps,
  | "preview"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "previewSrc"
  | "wrapperClassName"
  | "fit"
>) {
  const { locale } = useMtone();
  const [failed, setFailed] = React.useState(false);
  const [state, setState] = React.useState(
    props.src || props.srcSet ? "loading" : "error",
  );
  const effective = failed && fallback ? fallback : props.src;
  const img = React.useRef<HTMLImageElement>(null);
  React.useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth > 0)
      setState("loaded");
  }, [effective]);
  return (
    <span className="mt-image-content" data-state={state}>
      <img
        {...props}
        ref={img}
        src={effective || undefined}
        srcSet={failed ? undefined : props.srcSet}
        sizes={failed ? undefined : props.sizes}
        onLoad={(event) => {
          setState("loaded");
          props.onLoad?.(event);
        }}
        onError={(event) => {
          props.onError?.(event);
          if (!failed && fallback && fallback !== props.src) {
            setFailed(true);
            setState("loading");
          } else setState("error");
        }}
      />
      {state === "loading" && (
        <span className="mt-image-placeholder" aria-hidden="true">
          {placeholder ?? (
            <LoaderCircle size={20} className="mt-image-spinner" />
          )}
        </span>
      )}
      {state === "error" && (
        <span className="mt-image-error" role="status">
          {errorContent ?? (
            <>
              <ImageOff size={22} />
              <span>
                {locale === "zh" ? "图片加载失败" : "Image failed to load"}
              </span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
function clampIndex(n: number, length: number) {
  return Math.max(
    0,
    Math.min(length - 1, Number.isFinite(n) ? Math.trunc(n) : 0),
  );
}
const initialTransform = {
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0,
  flipX: false,
  flipY: false,
};

function PreviewContent({
  item,
  index,
  total,
  navigate,
  close,
}: {
  item: ImageItem;
  index: number;
  total: number;
  navigate: (index: number) => void;
  close: () => void;
}) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const [transform, setTransform] = React.useState(initialTransform);
  const identity = `${index}:${item.previewSrc || item.src}`;
  const [previous, setPrevious] = React.useState(identity);
  if (previous !== identity) {
    setPrevious(identity);
    setTransform(initialTransform);
  }
  const drag = React.useRef<{
    id: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);
  const canvas = React.useRef<HTMLDivElement>(null);
  const suppressClick = React.useRef(false);
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const update = () => {
      const rect = canvas.current?.getBoundingClientRect();
      if (rect) setBounds({ width: rect.width, height: rect.height });
    };
    update();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (canvas.current) observer?.observe(canvas.current);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  const sideways = transform.rotate % 180 !== 0;
  const zoom = (delta: number) =>
    setTransform((t) => {
      const scale = Math.max(1, Math.min(5, t.scale + delta));
      return { ...t, scale, ...(scale === 1 ? { x: 0, y: 0 } : {}) };
    });
  const tool = (
    name: string,
    english: string,
    icon: React.ReactNode,
    action: () => void,
    disabled = false,
    keepFocus = false,
  ) => (
    <button
      type="button"
      aria-label={zh ? name : english}
      title={zh ? name : english}
      onClick={() => {
        if (!disabled) action();
      }}
      disabled={disabled && !keepFocus}
      aria-disabled={keepFocus ? disabled : undefined}
    >
      {icon}
    </button>
  );
  return (
    <>
      <div className="mt-image-preview-header">
        <BDialog.Title>
          {item.alt || (zh ? "图片预览" : "Image preview")}
        </BDialog.Title>
        <span aria-live="polite">
          {index + 1} / {total}
        </span>
        <BDialog.Close aria-label={zh ? "关闭预览" : "Close preview"}>
          <X size={20} />
        </BDialog.Close>
      </div>
      <div
        className="mt-image-canvas"
        ref={canvas}
        data-zoomed={transform.scale > 1 || undefined}
        onClick={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          if (
            event.target === event.currentTarget ||
            (event.target as HTMLElement).classList.contains("mt-image-content")
          )
            close();
        }}
        onWheel={(event) => {
          event.preventDefault();
          zoom(event.deltaY < 0 ? 0.5 : -0.5);
        }}
        onPointerDown={(event) => {
          suppressClick.current = false;
          if (
            event.button !== 0 ||
            transform.scale <= 1 ||
            (event.target as HTMLElement).tagName !== "IMG"
          )
            return;
          suppressClick.current = true;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            originX: transform.x,
            originY: transform.y,
          };
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (!d || d.id !== event.pointerId) return;
          setTransform((t) => ({
            ...t,
            x: d.originX + event.clientX - d.x,
            y: d.originY + event.clientY - d.y,
          }));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <ImageContent
          key={item.previewSrc || item.src}
          src={item.previewSrc || item.src}
          alt={item.alt ?? ""}
          fallback={item.fallback}
          crossOrigin={item.crossOrigin}
          referrerPolicy={item.referrerPolicy}
          draggable={false}
          style={{
            maxWidth: sideways && bounds.height ? bounds.height : "100%",
            maxHeight: sideways && bounds.width ? bounds.width : "100%",
            transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale * (transform.flipY ? -1 : 1)})`,
          }}
        />
      </div>
      <div
        className="mt-image-toolbar"
        role="toolbar"
        aria-label={zh ? "图片操作" : "Image controls"}
      >
        {total > 1 &&
          tool(
            "上一张",
            "Previous image",
            <ChevronLeft size={18} />,
            () => navigate(index - 1),
            index === 0,
            true,
          )}
        {tool(
          "缩小",
          "Zoom out",
          <ZoomOut size={18} />,
          () => zoom(-0.5),
          transform.scale === 1,
        )}
        <span aria-live="polite">{Math.round(transform.scale * 100)}%</span>
        {tool(
          "放大",
          "Zoom in",
          <ZoomIn size={18} />,
          () => zoom(0.5),
          transform.scale === 5,
        )}
        {tool("旋转", "Rotate", <RotateCw size={18} />, () =>
          setTransform((t) => ({ ...t, rotate: (t.rotate + 90) % 360 })),
        )}
        {tool(
          "水平翻转",
          "Flip horizontally",
          <FlipHorizontal2 size={18} />,
          () => setTransform((t) => ({ ...t, flipX: !t.flipX })),
        )}
        {tool("垂直翻转", "Flip vertically", <FlipVertical2 size={18} />, () =>
          setTransform((t) => ({ ...t, flipY: !t.flipY })),
        )}
        {tool("重置", "Reset", <RotateCcw size={18} />, () =>
          setTransform(initialTransform),
        )}
        {total > 1 &&
          tool(
            "下一张",
            "Next image",
            <ChevronRight size={18} />,
            () => navigate(index + 1),
            index === total - 1,
            true,
          )}
      </div>
    </>
  );
}
export function ImagePreview({
  items,
  open,
  onOpenChange,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  returnFocus,
  closeOnBackdrop = true,
  className,
}: ImagePreviewProps) {
  const [internal, setInternal] = React.useState(defaultCurrent);
  const index = clampIndex(current ?? internal, items.length);
  const item = items[index];
  const navigate = (next: number) => {
    const value = clampIndex(next, items.length);
    if (value === index) return;
    if (current === undefined) setInternal(value);
    onCurrentChange?.(value);
  };
  return (
    <BDialog.Root
      open={open && !!item}
      onOpenChange={onOpenChange}
      modal
      disablePointerDismissal={!closeOnBackdrop}
    >
      <BDialog.Portal>
        <MtoneScope>
          <BDialog.Backdrop className="mt-image-backdrop" />
          <BDialog.Popup
            className={cn("mt-image-preview", className)}
            finalFocus={returnFocus}
            onKeyDown={(event) => {
              if (event.altKey || event.ctrlKey || event.metaKey) return;
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                navigate(index + (event.key === "ArrowRight" ? 1 : -1));
              }
            }}
          >
            {item && (
              <PreviewContent
                key={String(open)}
                item={item}
                index={index}
                total={items.length}
                navigate={navigate}
                close={() => {
                  if (closeOnBackdrop) onOpenChange(false);
                }}
              />
            )}
          </BDialog.Popup>
        </MtoneScope>
      </BDialog.Portal>
    </BDialog.Root>
  );
}
export function Image({
  src,
  fallback,
  placeholder,
  errorContent,
  preview = true,
  previewSrc,
  open,
  defaultOpen = false,
  onOpenChange,
  fit = "cover",
  wrapperClassName,
  width,
  height,
  style,
  ...props
}: ImageProps) {
  const { locale } = useMtone();
  const [internal, setInternal] = React.useState(defaultOpen);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const change = (value: boolean) => {
    if (open === undefined) setInternal(value);
    onOpenChange?.(value);
  };
  const content = (
    <ImageContent
      key={`${src}:${props.srcSet ?? ""}:${fallback ?? ""}`}
      {...props}
      src={src}
      fallback={fallback}
      placeholder={placeholder}
      errorContent={errorContent}
      width={width}
      height={height}
      style={{ ...style, objectFit: fit }}
    />
  );
  return (
    <span
      className={cn("mt-image", wrapperClassName)}
      style={{ width, height }}
    >
      {preview ? (
        <button
          type="button"
          className="mt-image-trigger"
          ref={trigger}
          aria-label={`${locale === "zh" ? "预览" : "Preview"}${props.alt ? ` ${props.alt}` : ""}`}
          onClick={() => change(true)}
        >
          {content}
          <span className="mt-image-cover" aria-hidden="true">
            <Expand size={18} />
          </span>
        </button>
      ) : (
        content
      )}
      {preview && (
        <ImagePreview
          items={[
            {
              src,
              alt: props.alt,
              previewSrc,
              fallback,
              crossOrigin: props.crossOrigin,
              referrerPolicy: props.referrerPolicy,
            },
          ]}
          open={open ?? internal}
          onOpenChange={change}
          returnFocus={trigger}
        />
      )}
    </span>
  );
}
export interface ImageGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: readonly ImageItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  current?: number;
  defaultCurrent?: number;
  onCurrentChange?: (index: number) => void;
  thumbnailWidth?: number | string;
  thumbnailHeight?: number | string;
}
export function ImageGroup({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  thumbnailWidth = 120,
  thumbnailHeight = 90,
  className,
  ...props
}: ImageGroupProps) {
  const { locale } = useMtone();
  const [visible, setVisible] = React.useState(defaultOpen);
  const [internal, setInternal] = React.useState(defaultCurrent);
  const opener = React.useRef<HTMLElement | null>(null);
  const change = (value: boolean) => {
    if (open === undefined) setVisible(value);
    onOpenChange?.(value);
  };
  const select = (index: number) => {
    if (current === undefined) setInternal(index);
    onCurrentChange?.(index);
  };
  return (
    <div {...props} className={cn("mt-image-group", className)}>
      {items.map((item, index) => (
        <button
          type="button"
          className="mt-image-group-trigger"
          key={`${index}:${item.src}`}
          aria-label={`${locale === "zh" ? "预览" : "Preview"} ${item.alt || index + 1}`}
          onClick={(event) => {
            opener.current = event.currentTarget;
            select(index);
            change(true);
          }}
        >
          <Image
            {...item}
            preview={false}
            width={thumbnailWidth}
            height={thumbnailHeight}
          />
        </button>
      ))}
      <ImagePreview
        items={items}
        open={open ?? visible}
        onOpenChange={change}
        current={current ?? internal}
        onCurrentChange={select}
        returnFocus={opener}
      />
    </div>
  );
}
