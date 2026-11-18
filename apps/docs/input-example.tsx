import React from "react";
import { Input, Text, Button, Form } from "../../packages/mtone/src";
import { Mail, UserRound } from "lucide-react";
export function InputExample({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState("");
  const [code, setCode] = React.useState("");
  if (compact)
    return (
      <Input
        aria-label="文档标题"
        placeholder="文档标题"
        prefix={<Mail size={14} />}
        allowClear
      />
    );
  return (
    <div className="input-examples">
      <nav aria-label="Input 子组件导航" className="input-example-nav">
        {["基础输入", "搜索", "密码", "多行文本", "验证码"].map((label, i) => (
          <button
            type="button"
            key={label}
            onClick={(e) => {
              const target = e.currentTarget
                .closest(".input-examples")
                ?.querySelector<HTMLElement>(`[data-input-section="${i}"]`);
              target?.scrollIntoView({ block: "start", behavior: "smooth" });
              target?.focus({ preventScroll: true });
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <section tabIndex={-1} data-input-section="0">
        <h3>Input · 基础输入</h3>
        <p>保持紧凑尺寸，可组合前后缀、清除按钮、计数和校验状态。</p>
        <Input
          aria-label="文档标题"
          placeholder="输入文档标题"
          prefix={<Mail size={14} />}
          suffix=".md"
          allowClear
          showCount
          maxLength={40}
        />
        <div className="input-example-row">
          {(["sm", "md", "lg"] as const).map((controlSize) => (
            <Input
              key={controlSize}
              controlSize={controlSize}
              aria-label={`${controlSize}尺寸`}
              placeholder={`${controlSize} 尺寸`}
            />
          ))}
        </div>
        <div className="input-example-row">
          {(["outlined", "filled", "borderless", "underlined"] as const).map(
            (variant) => (
              <Input
                key={variant}
                variant={variant}
                aria-label={variant}
                placeholder={variant}
              />
            ),
          )}
        </div>
        <div className="input-example-row">
          <Input
            status="error"
            aria-label="错误状态"
            placeholder="请填写标题"
          />
          <Input
            status="warning"
            aria-label="警告状态"
            placeholder="检查输入内容"
          />
          <Input disabled defaultValue="禁用输入" aria-label="禁用输入" />
        </div>
      </section>
      <section tabIndex={-1} data-input-section="1">
        <h3>Input.Search · 搜索</h3>
        <p>
          输入变化与执行搜索分离，Enter 或按钮触发搜索；组合输入期间不提交。
        </p>
        <Input.Search
          aria-label="搜索文档"
          placeholder="搜索文档…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          searchButton="搜索"
          onSearch={setResult}
        />
        <Text muted>最近搜索：{result || "尚未搜索"}（仅本地演示）</Text>
        <Input.Search
          aria-label="加载中的搜索"
          placeholder="正在搜索"
          loading
          searchButton="搜索"
        />
      </section>
      <section tabIndex={-1} data-input-section="2">
        <h3>Input.Password · 密码</h3>
        <p>显示切换不会改变值，按钮有独立可访问名称。</p>
        <Input.Password
          aria-label="密码"
          placeholder="输入密码"
          autoComplete="new-password"
          prefix={<UserRound size={14} />}
          allowClear
        />
      </section>
      <section tabIndex={-1} data-input-section="3">
        <h3>Input.TextArea · 多行文本</h3>
        <p>按内容自动调整高度，可设置最少和最多行数。</p>
        <Input.TextArea
          aria-label="备注"
          placeholder="输入多行备注"
          autoSize={{ minRows: 2, maxRows: 5 }}
          showCount
          maxLength={200}
        />
      </section>
      <section tabIndex={-1} data-input-section="4">
        <h3>Input.OTP · 验证码</h3>
        <p>支持连续输入、粘贴和方向键；此示例不会发送或验证真实验证码。</p>
        <Input.OTP
          aria-label="演示验证码"
          value={code}
          onValueChange={setCode}
          length={6}
        />
        <Text muted>已输入 {Array.from(code).length} / 6 位</Text>
        <Button onClick={() => setCode("")}>清空验证码</Button>
      </section>
      <section>
        <h3>表单集成</h3>
        <Form initialValues={{ name: "" }}>
          <Form.Item name="name" label="名称" required>
            <Input placeholder="必填名称" allowClear />
          </Form.Item>
        </Form>
      </section>
    </div>
  );
}
