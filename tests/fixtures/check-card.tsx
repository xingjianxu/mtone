import * as React from "react";
import { createRoot } from "react-dom/client";
import { CardGroup, CheckCard, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Demo() {
  const [submitted, setSubmitted] = React.useState("");
  const [actions, setActions] = React.useState(0);
  const [cancelReset, setCancelReset] = React.useState(false);
  const [controlled, setControlled] = React.useState("first");
  return (
    <MtoneProvider locale="en">
      <main style={{ padding: 16, maxWidth: 820, marginInline: "auto" }}>
        <form onReset={(event) => { if (cancelReset) event.preventDefault(); }} onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(Array.from(new FormData(event.currentTarget)).filter(([name]) => name === "plan" || name === "extra")));
        }}>
          <CheckCard.Group legend="Plan" name="plan" defaultValue="starter">
            <CardGroup columns={{ xs: 1, md: 2 }} data-testid="layout">
              <CheckCard value="starter" title="Starter" description="For personal use" />
              <CheckCard value="unavailable" title="Unavailable" disabled />
              <CheckCard value="team" title="Team" extra={
                <button type="button" onClick={() => setActions((n) => n + 1)}>Details {actions}</button>
              } />
              <CheckCard value="pending" title="Pending" loading />
            </CardGroup>
          </CheckCard.Group>
          <CheckCard.Group legend="Extras" multiple name="extra" defaultValue={["backup"]}>
            <CheckCard value="backup" title="Backups" />
            <CheckCard value="reports" title="Reports" />
          </CheckCard.Group>
          <CheckCard.Group legend="Controlled" value={controlled} onChange={setControlled}>
            <CheckCard value="first" title="First" />
            <CheckCard value="second" title="Second" />
          </CheckCard.Group>
          <CheckCard.Group legend="Independent" defaultValue="third">
            <CheckCard value="third" title="Third" />
            <CheckCard value="fourth" title="Fourth" />
          </CheckCard.Group>
          <button type="button" onClick={() => setCancelReset((x) => !x)}>
            {cancelReset ? "Allow reset" : "Cancel reset"}
          </button>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
          <output aria-label="Submitted values">{submitted}</output>
        </form>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
