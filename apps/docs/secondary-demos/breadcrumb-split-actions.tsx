import { Breadcrumb, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Breadcrumb
        items={[
          {
            label: "组件",
            href: "#/components",
            menu: {
              align: "right",
              width: 180,
              items: [
                {
                  key: "menu",
                  label: "Menu",
                  onSelect: () => {
                    window.location.hash = "/components/Menu";
                  },
                },
                {
                  key: "dropdown",
                  label: "Popover",
                  onSelect: () => {
                    window.location.hash = "/components/Popover";
                  },
                },
              ],
            },
          },
          { label: "Breadcrumb" },
        ]}
      />
      <Text muted>文字用于导航，右侧箭头用于展开菜单，互不抢占点击事件。</Text>
    </div>
  );
}
