import React, { createRef } from "react";
import { render, screen, createEvent, fireEvent, act } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { List, ListItem } from "../packages/mtone/src/basic";
const items = Array.from({ length: 1000 }, (_, id) => ({
  id,
  title: `Row ${id}`,
  group: id < 500 ? "A" : "B",
}));
const renderItem = (item: (typeof items)[number]) => item.title;
const getKey = (item: (typeof items)[number]) => item.id;
it("preserves children, ul attributes and rich ListItem", () => {
  render(
    <List aria-label="Legacy">
      <ListItem description="Details" actions={<button>Open</button>}>
        Title
      </ListItem>
    </List>,
  );
  expect(screen.getByRole("list")).toHaveAccessibleName("Legacy");
  expect(screen.getByRole("listitem")).toHaveTextContent("TitleDetailsOpen");
});
it("renders data content as semantic list items and groups non-contiguous keys", () => {
  render(
    <List
      items={[items[0], items[501], items[1]]}
      getKey={getKey}
      renderItem={renderItem}
      groupBy={(x) => x.group}
      renderGroup={(key, group) => `${key}: ${group.length}`}
    />,
  );
  expect(screen.getAllByRole("listitem").map((x) => x.textContent)).toEqual([
    "Row 0",
    "Row 1",
    "Row 501",
  ]);
  expect(screen.getByText("A: 2")).toBeInTheDocument();
});
it("windows 1000 rows and scrolls by key and group", () => {
  const ref = createRef<any>();
  const { container } = render(
    <List
      ref={ref}
      items={items}
      getKey={getKey}
      renderItem={renderItem}
      height={120}
      virtual
      estimatedItemHeight={30}
      overscan={1}
      groupBy={(x) => x.group}
      stickyGroups
    />,
  );
  expect(screen.getAllByRole("listitem").length).toBeLessThan(12);
  act(() => ref.current.scrollTo({ key: 900 }));
  expect(screen.getByText("Row 900")).toBeInTheDocument();
  act(() => ref.current.scrollTo({ group: "B" }));
  expect(screen.getByText("Row 500")).toBeInTheDocument();
  expect(container.querySelector('[data-list-group="B"]')).toBeInTheDocument();
});
it("resets an out of range viewport after shrinking data", () => {
  const ref = createRef<any>();
  const props = {
    getKey,
    renderItem,
    height: 120,
    virtual: true,
    estimatedItemHeight: 30,
  };
  const { rerender } = render(<List ref={ref} items={items} {...props} />);
  act(() => ref.current.scrollTo({ key: 900 }));
  rerender(<List ref={ref} items={items.slice(0, 2)} {...props} />);
  expect(screen.getByText("Row 0")).toBeInTheDocument();
});
it("deduplicates end notifications and waits while loading", () => {
  const onEndReached = vi.fn();
  const { rerender } = render(
    <List
      items={items.slice(0, 2)}
      getKey={getKey}
      renderItem={renderItem}
      height={120}
      onEndReached={onEndReached}
      loading
    />,
  );
  expect(onEndReached).not.toHaveBeenCalled();
  rerender(
    <List
      items={items.slice(0, 2)}
      getKey={getKey}
      renderItem={renderItem}
      height={120}
      onEndReached={onEndReached}
    />,
  );
  expect(onEndReached).toHaveBeenCalledTimes(1);
  fireEvent.scroll(screen.getByRole("list"));
  expect(onEndReached).toHaveBeenCalledTimes(1);
});
it("shows explicit empty and loading states in data mode", () => {
  const { rerender } = render(<List items={[]} emptyContent="Nothing here" />);
  expect(screen.getByText("Nothing here")).toBeInTheDocument();
  rerender(<List items={[]} loading loadingContent="Fetching" />);
  expect(screen.queryByText("Nothing here")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Fetching");
});

it("preserves original callback indices when grouping and stable numeric/string keys", () => {
  const rows = [
    { id: 1, group: "B" },
    { id: "1", group: "A" },
    { id: 3, group: "B" },
  ];
  render(
    <List
      items={rows}
      getKey={(x) => x.id}
      groupBy={(x) => x.group}
      renderItem={(x, i) => `${typeof x.id}:${x.id} index ${i}`}
    />,
  );
  expect(screen.getAllByRole("listitem").map((x) => x.textContent)).toEqual([
    "number:1 index 0",
    "number:3 index 2",
    "string:1 index 1",
  ]);
});
it("falls back to regular rendering without a virtual viewport", () => {
  render(
    <List
      virtual
      items={items.slice(0, 40)}
      getKey={getKey}
      renderItem={renderItem}
    />,
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(40);
});
it("supports horizontal pixel scrolling and ignores unknown keys", () => {
  const ref = createRef<any>();
  render(
    <List
      ref={ref}
      virtual
      height={120}
      items={items}
      getKey={getKey}
      renderItem={renderItem}
      contentWidth={900}
    />,
  );
  act(() => ref.current.scrollTo({ top: 500, left: 100 }));
  expect(ref.current.element.scrollTop).toBe(500);
  expect(ref.current.element.scrollLeft).toBe(100);
  act(() => ref.current.scrollTo({ key: "missing" }));
  expect(ref.current.element.scrollTop).toBe(500);
});
it("uses measured row heights and disconnects observers", () => {
  const previous = globalThis.ResizeObserver;
  const observers: {
    callback: () => void;
    element?: Element;
    disconnect: ReturnType<typeof vi.fn>;
  }[] = [];
  globalThis.ResizeObserver = class {
    entry: {
      callback: () => void;
      element?: Element;
      disconnect: ReturnType<typeof vi.fn>;
    };
    constructor(callback: () => void) {
      this.entry = { callback, disconnect: vi.fn() };
      observers.push(this.entry);
    }
    observe(element: Element) {
      this.entry.element = element;
    }
    unobserve() {}
    disconnect() {
      this.entry.disconnect();
    }
  } as unknown as typeof ResizeObserver;
  const bounds = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      return {
        height: this.dataset.listKey === "0" ? 80 : 30,
        width: 200,
        top: 0,
        left: 0,
        right: 200,
        bottom: 30,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect;
    });
  try {
    const ref = createRef<any>();
    const { unmount } = render(
      <List
        ref={ref}
        items={items.slice(0, 20)}
        getKey={getKey}
        renderItem={renderItem}
        virtual
        height={120}
        estimatedItemHeight={30}
      />,
    );
    act(() => ref.current.scrollTo({ key: 2 }));
    expect(ref.current.element.scrollTop).toBe(110);
    unmount();
    expect(observers.every((x) => x.disconnect.mock.calls.length > 0)).toBe(
      true,
    );
  } finally {
    bounds.mockRestore();
    globalThis.ResizeObserver = previous;
  }
});
it("reports grouped virtual positions in displayed order, not source order", () => {
  render(
    <List
      height={200}
      virtual
      items={[items[0], items[501], items[1]]}
      getKey={getKey}
      groupBy={(x) => x.group}
      renderItem={renderItem}
    />,
  );
  expect(
    screen.getAllByRole("listitem").map((x) => x.getAttribute("aria-posinset")),
  ).toEqual(["1", "2", "3"]);
});
it("keeps the visible scroll anchor when an overscan row above it grows", () => {
  const previous = globalThis.ResizeObserver;
  const entries: { callback: () => void; element?: Element }[] = [];
  let firstHeight = 30;
  globalThis.ResizeObserver = class {
    entry: { callback: () => void; element?: Element };
    constructor(callback: () => void) {
      this.entry = { callback };
      entries.push(this.entry);
    }
    observe(element: Element) {
      this.entry.element = element;
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  const bounds = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      return {
        height: this.dataset.listKey === "0" ? firstHeight : 30,
        width: 200,
        top: 0,
        left: 0,
        right: 200,
        bottom: 30,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect;
    });
  try {
    const ref = createRef<any>();
    render(
      <List
        ref={ref}
        items={items}
        getKey={getKey}
        renderItem={renderItem}
        virtual
        height={120}
        estimatedItemHeight={30}
        overscan={3}
      />,
    );
    act(() => ref.current.scrollTo({ key: 2 }));
    expect(ref.current.element.scrollTop).toBe(60);
    firstHeight = 80;
    act(() =>
      entries
        .find((x) => (x.element as HTMLElement)?.dataset.listKey === "0")!
        .callback(),
    );
    expect(ref.current.element.scrollTop).toBe(110);
  } finally {
    bounds.mockRestore();
    globalThis.ResizeObserver = previous;
  }
});
it("preserves caller aria-busy without component loading", () => {
  render(
    <List aria-busy="true">
      <ListItem>Pending</ListItem>
    </List>,
  );
  expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
});
it('anchors a batch of measurements against the original viewport',()=>{
 const previous=globalThis.ResizeObserver; const entries:{callback:()=>void,element?:Element}[]=[];let expanded=false;
 globalThis.ResizeObserver=class {entry:{callback:()=>void,element?:Element};constructor(callback:()=>void){this.entry={callback};entries.push(this.entry);}observe(element:Element){this.entry.element=element;}unobserve(){}disconnect(){}} as unknown as typeof ResizeObserver;
 const bounds=vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(this:HTMLElement){return {height:expanded&&['0','2'].includes(this.dataset.listKey||'')?80:30,width:200,top:0,left:0,right:200,bottom:30,x:0,y:0,toJSON(){}} as DOMRect;});
 try {const ref=createRef<any>();render(<List ref={ref} items={items} getKey={getKey} renderItem={renderItem} virtual height={120} estimatedItemHeight={30} overscan={3}/>);
 act(()=>ref.current.scrollTo({key:2}));expanded=true;
 act(()=>{for(const key of ['0','2']) entries.find(x=>(x.element as HTMLElement)?.dataset.listKey===key)!.callback();});
 expect(ref.current.element.scrollTop).toBe(110);
 } finally {bounds.mockRestore();globalThis.ResizeObserver=previous;}
});

it("opts into a leading grip without making the rest of the item draggable", () => {
  const onDragStart = vi.fn();
  render(<List><ListItem sortHandle={{ onDragStart }} icon={<span>Icon</span>}>Sortable</ListItem><ListItem>Plain</ListItem></List>);
  const [sortable, plain] = screen.getAllByRole("listitem");
  const handle = sortable.querySelector("[draggable=true]")!;
  expect(handle).toBe(sortable.firstElementChild);
  expect(handle.querySelector("svg.lucide-grip-vertical")).toBeInTheDocument();
  expect(sortable).not.toHaveAttribute("draggable");
  expect(plain.querySelector("[draggable]")).toBeNull();
  fireEvent.dragStart(screen.getByText("Sortable"));
  expect(onDragStart).not.toHaveBeenCalled();
  fireEvent.dragStart(handle);
  expect(onDragStart).toHaveBeenCalledOnce();
});

it("previews a children-mode row without overriding the caller's image or cancel action", () => {
  const preview = document.createElement("span");
  const setDragImage = vi.fn();
  render(
    <List>
      <ListItem sortHandle={{
        onDragStart(event) {
          event.dataTransfer.setDragImage(preview, 1, 2);
          event.preventDefault();
        },
      }}>
        Row content
      </ListItem>
    </List>,
  );
  const row = screen.getByRole("listitem");
  const handle = row.querySelector("[draggable]")!;
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue(new DOMRect(20, 30, 240, 40));
  const event = createEvent.dragStart(handle, { dataTransfer: { setDragImage } });
  // JSDOM lacks DragEvent; coordinates are populated by a real browser.
  Object.defineProperties(event, { clientX: { value: 31 }, clientY: { value: 42 } });
  fireEvent(handle, event);
  expect(setDragImage.mock.calls).toEqual([[row, 11, 12], [preview, 1, 2]]);
  expect(event.defaultPrevented).toBe(true);
});

it("uses the browser's own preview when a standalone sort grip has no List row", () => {
  const setDragImage = vi.fn();
  const onDragStart = vi.fn();
  const { container } = render(<List.SortHandle onDragStart={onDragStart} />);
  fireEvent.dragStart(container.querySelector("[draggable]")!, { dataTransfer: { setDragImage } });
  expect(setDragImage).not.toHaveBeenCalled();
  expect(onDragStart).toHaveBeenCalledOnce();
});
