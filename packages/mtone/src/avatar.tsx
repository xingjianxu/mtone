import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { cn, MtoneScope, useMtone } from "./basic";

export type AvatarBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type AvatarSize =
  | number
  | "sm"
  | "md"
  | "lg"
  | "small"
  | "medium"
  | "large"
  | Partial<Record<AvatarBreakpoint, number>>;
export interface AvatarProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onError" | "children"
> {
  name?: string;
  src?: string | React.ReactElement;
  srcSet?: string;
  alt?: string;
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  draggable?: React.ImgHTMLAttributes<HTMLImageElement>["draggable"];
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => boolean | void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  size?: AvatarSize;
  shape?: "circle" | "square";
  gap?: number;
}
const sizes = { sm: 24, small: 24, md: 32, medium: 32, lg: 40, large: 40 };
const breakpoints: AvatarBreakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];
function validSize(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
function sizeStyles(size: AvatarSize): React.CSSProperties {
  if (typeof size !== "object")
    return {
      "--mt-avatar-size": `${typeof size === "number" ? validSize(size, 24) : sizes[size]}px`,
    } as React.CSSProperties;
  let last = 24;
  return Object.fromEntries(
    breakpoints.map((key) => {
      last = validSize(size[key], last);
      return [`--mt-avatar-size-${key}`, `${last}px`];
    }),
  ) as React.CSSProperties;
}
const AvatarContext = React.createContext<{
  size?: AvatarSize;
  shape?: "circle" | "square";
}>({});
const AvatarBase = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(
    {
      name = "",
      src,
      srcSet,
      alt,
      crossOrigin,
      draggable,
      onError,
      icon,
      children,
      size: ownSize,
      shape: ownShape,
      gap = 4,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const group = React.useContext(AvatarContext);
    const size = ownSize ?? group.size ?? 24;
    const shape = ownShape ?? group.shape ?? "circle";
    const root = React.useRef<HTMLSpanElement>(null);
    const text = React.useRef<HTMLSpanElement>(null);
    const [sourceState, setSourceState] = React.useState({
      src,
      srcSet,
      failed: false,
    });
    // Reset during render, not in a passive effect: cached/broken images can
    // dispatch error during commit before passive effects run. A later reset
    // would erase that failure. Recording every source transition also permits
    // A -> B -> A to retry A rather than retaining A's earlier failure.
    const sourceChanged =
      sourceState.src !== src || sourceState.srcSet !== srcSet;
    if (sourceChanged) setSourceState({ src, srcSet, failed: false });
    const failed = !sourceChanged && sourceState.failed;
    const [scale, setScale] = React.useState(1);
    const content =
      icon ?? children ?? Array.from(name).slice(0, 2).join("").toUpperCase();
    const image = src && !failed;
    const textContent =
      typeof content === "string" || typeof content === "number";
    React.useEffect(() => {
      if (image || !textContent) return;
      const measure = () => {
        const container = root.current;
        const node = text.current;
        if (!container || !node) return;
        // offsetWidth is unaffected by the transform; rect is a fallback for test/non-layout environments.
        const width =
          node.offsetWidth ||
          node.getBoundingClientRect().width /
            (Number(node.dataset.scale) || 1);
        const available = Math.max(
          0,
          container.getBoundingClientRect().width -
            2 * (Number.isFinite(gap) ? Math.max(0, gap) : 4),
        );
        setScale(width > 0 ? Math.min(1, available / width) : 1);
      };
      measure();
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(measure)
          : null;
      if (root.current) observer?.observe(root.current);
      if (text.current) observer?.observe(text.current);
      window.addEventListener("resize", measure);
      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", measure);
      };
    }, [content, image, textContent, gap, size]);
    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (onError?.(event) !== false) {
        setSourceState((current) =>
          current.src === src && current.srcSet === srcSet
            ? { ...current, failed: true }
            : current,
        );
      }
    };
    let imageNode: React.ReactNode = null;
    if (image) {
      if (typeof src === "string")
        imageNode = (
          <img
            src={src}
            srcSet={srcSet}
            alt={alt ?? name}
            crossOrigin={crossOrigin}
            draggable={draggable}
            onError={handleError}
          />
        );
      else if (
        React.isValidElement<React.ImgHTMLAttributes<HTMLImageElement>>(src) &&
        src.type === "img"
      )
        imageNode = React.cloneElement(src, {
          alt: src.props.alt ?? alt ?? name,
          onError(event) {
            src.props.onError?.(event);
            handleError(event);
          },
        });
      else imageNode = src;
    }
    return (
      <span
        {...props}
        ref={(node) => {
          root.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        aria-label={props["aria-label"] ?? (name || undefined)}
        className={cn(
          "mt-avatar",
          shape === "square" && "mt-avatar-square",
          typeof size === "object" && "mt-avatar-responsive",
          className,
        )}
        style={{ ...sizeStyles(size), ...style }}
      >
        {image ? (
          imageNode
        ) : textContent ? (
          <span
            className="mt-avatar-text"
            ref={text}
            data-scale={scale}
            style={{ transform: `scale(${scale})` }}
          >
            {content}
          </span>
        ) : (
          <span className="mt-avatar-icon">{content}</span>
        )}
      </span>
    );
  },
);
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  items?: AvatarProps[];
  max?: number | { count?: number; style?: React.CSSProperties };
  size?: AvatarSize;
  shape?: "circle" | "square";
  side?: "top" | "bottom" | "left" | "right";
}
export function AvatarGroup({
  items,
  children,
  max = 4,
  size,
  shape,
  side = "top",
  className,
  ...props
}: AvatarGroupProps) {
  const { locale } = useMtone();
  const members = items
    ? items.map((item, index) => <AvatarBase key={index} {...item} />)
    : React.Children.toArray(children);
  const rawMax = typeof max === "number" ? max : (max.count ?? 4);
  const limit = Number.isFinite(rawMax) ? Math.max(0, Math.floor(rawMax)) : 4;
  const hidden = members.slice(limit);
  return (
    <AvatarContext.Provider value={{ size, shape }}>
      <span {...props} className={cn("mt-avatar-group", className)}>
        {members.slice(0, limit)}
        {hidden.length > 0 && (
          <Popover.Root>
            <Popover.Trigger
              className="mt-avatar-overflow"
              aria-label={
                locale === "zh"
                  ? `显示另外 ${hidden.length} 位成员`
                  : `Show ${hidden.length} more members`
              }
            >
              <AvatarBase
                style={typeof max === "object" ? max.style : undefined}
              >{`+${hidden.length}`}</AvatarBase>
            </Popover.Trigger>
            <Popover.Portal>
              <MtoneScope>
                <Popover.Positioner
                  className="mt-positioner"
                  side={side}
                  sideOffset={6}
                >
                  <Popover.Popup className="mt-popup mt-avatar-popup">
                    <Popover.Title className="mt-popup-title">
                      {locale === "zh" ? "更多成员" : "More members"}
                    </Popover.Title>
                    <div className="mt-avatar-overflow-list">
                      {hidden.map((member, index) => (
                        <div className="mt-avatar-overflow-member" key={index}>
                          {member}
                          {React.isValidElement<AvatarProps>(member) &&
                            member.props.name && (
                              <span>{member.props.name}</span>
                            )}
                        </div>
                      ))}
                    </div>
                  </Popover.Popup>
                </Popover.Positioner>
              </MtoneScope>
            </Popover.Portal>
          </Popover.Root>
        )}
      </span>
    </AvatarContext.Provider>
  );
}
export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup });
