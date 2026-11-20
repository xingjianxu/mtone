import { useEffect, useState } from "react";
import { DataList, Text } from "../../../packages/mtone/src";

type DocumentRecord = { id: string; title: string };
type Query = { page: number; keyword: string };
type Page = { items: DocumentRecord[]; total: number };
const pageSize = 3;
const documents: DocumentRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: `doc-${index + 1}`,
  title: index % 2 === 0 ? `设计文档 ${index + 1}` : `工程笔记 ${index + 1}`,
}));

// Simulates a server endpoint. A real app can pass signal to fetch instead.
function loadPage({ page, keyword }: Query, signal: AbortSignal) {
  return new Promise<Page>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      const matched = documents.filter((item) =>
        item.title.includes(keyword.trim()),
      );
      const start = (page - 1) * pageSize;
      resolve({
        items: matched.slice(start, start + pageSize),
        total: matched.length,
      });
    }, 480);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export default function RemoteDataListDemo() {
  const [query, setQuery] = useState<Query>({ page: 1, keyword: "" });
  const [result, setResult] = useState<{ query: Query; data: Page }>();
  const [failure, setFailure] = useState<Query>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void loadPage(query, signal)
      .then((data) => {
        if (!signal.aborted) setResult({ query, data });
      })
      .catch(() => {
        if (!signal.aborted) setFailure(query);
      });
    return () => controller.abort();
  }, [query]);

  const current = result?.query === query ? result.data : undefined;
  const failed = failure === query;
  // Keep the last known count during page navigation, but never show stale rows.
  const total = result?.query.keyword === query.keyword ? result.data.total : 0;

  return (
    <div style={{ width: "100%", maxWidth: 680, display: "grid", gap: 8 }}>
      <DataList
        aria-label="远程文档分页演示"
        items={current?.items ?? []}
        getKey={(item) => item.id}
        renderItem={(item) => <Text>{item.title}</Text>}
        search={{
          value: query.keyword,
          placeholder: "输入“设计”或“工程”",
          onChange: (keyword) =>
            setQuery((previous) =>
              previous.keyword === keyword ? previous : { page: 1, keyword },
            ),
        }}
        pagination={{
          mode: "remote",
          page: query.page,
          pageSize,
          total,
          onPageChange: (page) =>
            setQuery((previous) =>
              previous.page === page ? previous : { ...previous, page },
            ),
        }}
        loading={!current && !failed}
        empty={
          failed ? (
            <Text role="alert">读取文档失败。</Text>
          ) : (
            "没有符合条件的文档"
          )
        }
      />
    </div>
  );
}
