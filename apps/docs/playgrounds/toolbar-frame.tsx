import { useState, type ReactNode } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button, Popover, Toolbar } from "../../../packages/mtone/src";

export function PlaygroundFrame({
  name,
  start,
  advanced,
  onReset,
  children,
}: {
  name: string;
  start: ReactNode;
  advanced?: ReactNode;
  onReset: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="docs-playground" data-playground={name}>
      <Toolbar
        className="docs-playground-toolbar"
        aria-label={`${name} 示例设置`}
        controlStyle="default"
        start={start}
        end={
          <>
            <Button
              variant="outline"
              leftSection={<RotateCcw size={14} />}
              onClick={() => {
                setOpen(false);
                onReset();
              }}
            >
              重置
            </Button>
            {advanced && (
              <Popover
                open={open}
                onOpenChange={setOpen}
                align="end"
                label={`${name} 更多设置`}
                trigger={
                  <Button
                    variant="outline"
                    rightSection={<ChevronDown size={14} />}
                  >
                    更多设置
                  </Button>
                }
                content={
                  <div className="docs-playground-advanced">{advanced}</div>
                }
              />
            )}
          </>
        }
      />
      <div className="docs-playground-preview">{children}</div>
    </div>
  );
}
