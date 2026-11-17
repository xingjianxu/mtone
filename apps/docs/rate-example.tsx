import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Rate, Text } from "../../packages/mtone/src";

const hints = ["不满意", "一般", "还不错", "满意", "非常满意"];
export function RateExample({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState(3.5);
  const [hover, setHover] = useState<number>();
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <section>
        {!compact && <h3>半星与评价文字</h3>}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Rate
            aria-label="体验评分"
            value={value}
            onChange={setValue}
            allowHalf
            tooltips={hints}
            onHoverChange={setHover}
          />
          <Text data-testid="rate-value">{value} / 5</Text>
          <Text muted>
            {(hover ?? value) > 0
              ? hints[Math.ceil(hover ?? value) - 1]
              : "尚未评分"}
          </Text>
        </div>
        <p>
          点击选择；再次点击同一分数清除。方向键按半星调整，Home / End
          跳到边界。
        </p>
      </section>
      {!compact && (
        <>
          <section>
            <h3>只读与不可清除</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 20,
              }}
            >
              <Rate
                aria-label="只读评分"
                disabled
                defaultValue={4.5}
                allowHalf
              />
              <Rate
                aria-label="不可清除评分"
                defaultValue={3}
                allowClear={false}
                tooltips={hints}
              />
            </div>
            <p>
              disabled 保留显示但禁止操作；allowClear=false
              仅禁止通过交互清零，不强制初始值非零。
            </p>
          </section>
          <section>
            <h3>三种尺寸</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <Rate aria-label="小号评分" size="small" defaultValue={3} />
              <Rate aria-label="中号评分" size="medium" defaultValue={3} />
              <Rate aria-label="大号评分" size="large" defaultValue={3} />
            </div>
          </section>
          <section>
            <h3>自定义符号、数量与颜色</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <Rate
                aria-label="喜爱程度"
                character={<Heart fill="currentColor" strokeWidth={0} />}
                allowHalf
                defaultValue={2.5}
                style={{ "--mt-rate-color": "#a65e62" } as React.CSSProperties}
              />
              <Rate
                aria-label="推荐程度"
                character="好"
                count={3}
                defaultValue={2}
              />
              <Rate
                aria-label="自定义数字评分"
                character={({ index }) => index + 1}
                count={5}
                defaultValue={3}
              />
            </div>
            <p>
              字符是固定方形区域内的纯展示内容，请勿放入链接、按钮或输入框。
            </p>
          </section>
          <section>
            <h3>从右向左</h3>
            <Rate
              aria-label="从右向左评分"
              dir="rtl"
              allowHalf
              defaultValue={2.5}
            />
            <p>
              半星命中区域与左右方向键跟随阅读方向；上下方向键始终增减分数。
            </p>
          </section>
        </>
      )}
    </div>
  );
}
