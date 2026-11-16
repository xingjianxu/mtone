import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  FormField,
  Mentions,
  Text,
  getMentions,
  type MentionOption,
} from "../../packages/mtone/src";
const people: MentionOption[] = [
  { value: "alice", label: "Alice · 产品设计" },
  { value: "bob", label: "Bob · 工程" },
  { value: "carol", label: "Carol · 内容" },
  { value: "archived", label: "已停用成员", disabled: true },
];
const topics: MentionOption[] = [
  { value: "design", label: "设计" },
  { value: "engineering", label: "工程" },
  { value: "release", label: "版本发布" },
];
const section: React.CSSProperties = { display: "grid", gap: 8 };

/** Simulates an endpoint locally; no request or message leaves this page. */
function AsyncMentionsExample() {
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = () => {
    generation.current += 1;
    clearTimeout(timer.current);
    setLoading(false);
  };
  useEffect(
    () => () => {
      generation.current += 1;
      clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Mentions
      aria-label="异步搜索"
      value={value}
      options={options}
      loading={loading}
      filterOption={false}
      prefix={["@", "#"]}
      placeholder="输入 @al 或 #de，本地模拟延迟 400ms"
      onChange={(next) => {
        cancel();
        setValue(next);
        setOptions([]);
      }}
      onBlur={cancel}
      onSearch={(query, prefix) => {
        cancel();
        const current = generation.current;
        setLoading(true);
        timer.current = setTimeout(() => {
          if (current !== generation.current) return;
          setOptions(
            (prefix === "@" ? people : topics).filter((option) =>
              option.value.includes(query.toLowerCase()),
            ),
          );
          setLoading(false);
        }, 400);
      }}
    />
  );
}

export function MentionsExample({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("");
  const [activePrefix, setActivePrefix] = useState("@");
  const [formResult, setFormResult] =
    useState("尚未提交；数据只保存在此页面。");
  const [form] = Form.useForm();
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 640 }}>
      <section style={section}>
        {!compact && <strong>基础与多触发前缀</strong>}
        <Mentions
          aria-label="评论"
          value={value}
          onChange={setValue}
          prefix={["@", "#"]}
          options={activePrefix === "@" ? people : topics}
          onSearch={(_, prefix) => setActivePrefix(prefix)}
          allowClear
          autoSize={{ minRows: 2, maxRows: 5 }}
          placeholder="输入 @ 提及成员，输入 # 关联主题"
        />
        <Text muted>
          ↑ ↓ 切换，Enter 选择，Esc 关闭；Tab
          正常移动焦点。选项仅以灰色背景高亮。
        </Text>
        {!compact && (
          <Text data-testid="mentions-value">
            当前纯文本：{value || "（空）"} · 检测到{" "}
            {getMentions(value, { prefix: ["@", "#"] }).length} 个提及
          </Text>
        )}
      </section>
      {!compact && (
        <>
          <section style={section}>
            <strong>异步候选</strong>
            <AsyncMentionsExample />
            <Text muted>
              此处只模拟查询，不访问网络。每次编辑、失焦或卸载都会取消旧结果；真实接口也需使用
              AbortController 或请求序号防止过期响应覆盖。
            </Text>
          </section>
          <section style={section}>
            <strong>尺寸、状态与自动高度</strong>
            <Mentions
              aria-label="小尺寸"
              size="sm"
              rows={2}
              options={people}
              placeholder="小尺寸：输入 @"
            />
            <Mentions
              aria-label="错误状态"
              status="error"
              rows={2}
              options={people}
              placeholder="错误状态"
            />
            <Mentions
              aria-label="大尺寸警告状态"
              size="lg"
              status="warning"
              autoSize={{ minRows: 2, maxRows: 4 }}
              options={people}
              placeholder="大尺寸警告状态；随输入增长至四行后滚动"
            />
          </section>
          <section style={section}>
            <strong>禁用、只读与上方弹层</strong>
            <Mentions
              aria-label="禁用提及"
              disabled
              defaultValue="@alice 当前不可编辑"
            />
            <Mentions
              aria-label="只读提及"
              readOnly
              defaultValue="请 @bob 审阅文档"
            />
            <Mentions
              aria-label="上方候选"
              placement="top"
              options={people}
              allowClear={{ label: "清空上方候选示例" }}
              placeholder="输入 @，优先从光标上方展示候选"
            />
          </section>
          <section style={section}>
            <strong>表单与校验</strong>
            <Form
              form={form}
              initialValues={{ message: "" }}
              onFinish={(values) => setFormResult(String(values.message))}
            >
              <FormField
                name="message"
                label="协作说明"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "请输入协作说明",
                  },
                ]}
              >
                <Mentions
                  options={people}
                  allowClear
                  placeholder="例如：请 @alice 审阅"
                />
              </FormField>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button type="submit">提交提及示例</Button>
                <Button
                  type="button"
                  onClick={() => {
                    form.resetFields();
                    setFormResult("表单已重置。");
                  }}
                >
                  重置
                </Button>
              </div>
            </Form>
            <Text data-testid="mentions-form-result">{formResult}</Text>
            <Text muted>
              onChange 返回字符串，可直接绑定 FormField。getMentions
              只解析文本，不确认成员是否存在，也不代替服务端权限校验。
            </Text>
          </section>
        </>
      )}
    </div>
  );
}
