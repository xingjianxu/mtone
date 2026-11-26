import React from "react";
import { Folder } from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  AppLayout,
  MtoneProvider,
  NavGroup,
  NavItem,
  PageLayout,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Fixture() {
  const resize = new URLSearchParams(location.search).get("resize");
  const [feedback, setFeedback] = React.useState("");
  return (
    <MtoneProvider locale="en">
      <AppLayout
        fullHeight={resize !== "natural"}
        sidebarResize={resize ? { minWidth: 170, maxWidth: 310 } : false}
        sidebarCollapsible={resize !== null}
        brand={<strong>Workspace</strong>}
        navigationLabel="Team navigation"
        navigation={
          <NavGroup label="Pages">
            {Array.from({ length: resize === "natural" ? 2 : 50 }, (_, i) => (
              <NavItem
                key={i}
                active={i === 0}
                icon={<Folder size={16} aria-hidden />}
              >
                {"Workspace navigation page " + (i + 1)}
              </NavItem>
            ))}
          </NavGroup>
        }
        account={{
          name: "Team member",
          description: "Personal workspace",
          items: [
            {
              key: "profile",
              label: "Profile",
              onSelect: () => setFeedback("Profile opened"),
            },
            { key: "settings", label: "Account settings" },
          ],
        }}
      >
        <PageLayout title="Projects">
          <output>{feedback}</output>
          <p style={{ minBlockSize: resize === "natural" ? 0 : 1100 }}>
            Projects workspace
          </p>
          <p>End of projects</p>
        </PageLayout>
      </AppLayout>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
