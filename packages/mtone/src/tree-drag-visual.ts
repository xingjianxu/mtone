const SETTLE = { duration: 160, easing: "cubic-bezier(.2,.75,.3,1)" };
const reduceMotion = (view: Window | null) =>
  view?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

/** A native drag handles capture and cancellation. The overlay paints a stable,
 * themed row without relying on the browser's translucent drag bitmap. */
export function startTreeDragVisual(row: HTMLElement, event: DragEvent) {
  const doc = row.ownerDocument;
  const view = doc.defaultView;
  if (!view || typeof event.dataTransfer?.setDragImage !== "function") return;
  const box = row.getBoundingClientRect();
  const preview = row.cloneNode(true) as HTMLElement;
  preview.className = "mt-tree-item mt-tree-drag-preview";
  preview.inert = true;
  preview.setAttribute("aria-hidden", "true");
  for (const node of [preview, ...preview.querySelectorAll("*")]) {
    for (const name of [
      "id",
      "role",
      "aria-label",
      "aria-labelledby",
      "aria-controls",
      "autofocus",
      "name",
      "draggable",
    ]) {
      node.removeAttribute(name);
    }
  }
  const badge = doc.createElement("span");
  badge.className = "mt-tree-drag-invalid";
  badge.textContent = "⊘";
  badge.hidden = true;
  preview.append(badge);
  const setValid = (valid: boolean) => {
    badge.hidden = valid;
  };
  const rowStyle = view.getComputedStyle(row);
  for (const name of rowStyle) {
    if (name.startsWith("--mt-"))
      preview.style.setProperty(name, rowStyle.getPropertyValue(name));
  }
  Object.assign(preview.style, {
    width: `${box.width}px`,
    height: `${box.height}px`,
    direction: rowStyle.direction,
    font: rowStyle.font,
    colorScheme: rowStyle.colorScheme,
  });
  const image = doc.createElement("canvas");
  image.width = image.height = 1;
  image.style.cssText = "position:fixed;left:0;top:0;pointer-events:none";
  doc.body.append(image, preview);
  event.dataTransfer.setDragImage(image, 0, 0);
  const offsetX = event.clientX - box.left;
  const place = (left: number, top: number) => {
    preview.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  };
  place(box.left, box.top);
  if (!reduceMotion(view))
    preview.animate?.(
      [
        { boxShadow: "none" },
        { boxShadow: view.getComputedStyle(preview).boxShadow },
      ],
      { duration: 100, easing: "ease-out" },
    );
  row.setAttribute("data-tree-drag-source", "");
  const follow = (e: DragEvent) => {
    if (!e.clientX && !e.clientY) return;
    // Slight offset leaves the actual insertion mark visible under the pointer.
    place(
      Math.max(
        0,
        Math.min(view.innerWidth - box.width, e.clientX - offsetX + 10),
      ),
      Math.max(0, Math.min(view.innerHeight - box.height, e.clientY + 9)),
    );
  };
  doc.addEventListener("dragover", follow, true);
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    doc.removeEventListener("dragover", follow, true);
    row.removeAttribute("data-tree-drag-source");
    image.remove();
    preview.remove();
  };
  const settle = (target?: HTMLElement) => {
    doc.removeEventListener("dragover", follow, true);
    image.remove();
    if (
      disposed ||
      reduceMotion(view) ||
      !target?.isConnected ||
      !preview.animate
    ) {
      dispose();
      return;
    }
    const destination = target.getBoundingClientRect();
    preview
      .animate(
        [
          { transform: preview.style.transform, opacity: 1 },
          {
            transform: `translate3d(${destination.left}px, ${destination.top}px, 0)`,
            opacity: 0,
          },
        ],
        SETTLE,
      )
      .finished.then(dispose, dispose);
  };
  return { dispose, settle, setValid };
}

export function animateTreeDrop(
  rows: Map<string | number, HTMLDivElement>,
  before: Map<string | number, DOMRect>,
  source: string | number,
) {
  const animations: Animation[] = [];
  for (const [key, row] of rows) {
    const old = before.get(key);
    if (!old || key === source || reduceMotion(row.ownerDocument.defaultView))
      continue;
    const next = row.getBoundingClientRect();
    const dx = old.left - next.left,
      dy = old.top - next.top;
    if ((dx || dy) && row.animate)
      animations.push(
        row.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
          SETTLE,
        ),
      );
  }
  return animations;
}
