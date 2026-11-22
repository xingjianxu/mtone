import React from "react";
import { createRoot } from "react-dom/client";
import {
  Fieldset,
  Input,
  Select,
  Rate,
  Button,
  MtoneProvider,
} from "../../packages/mtone/src";
import "../../packages/mtone/src/styles.css";
function Demo() {
  const [disabled, setDisabled] = React.useState(false);
  return (
    <MtoneProvider>
      <div style={{ padding: 24, width: 360 }}>
        <button onClick={() => setDisabled((v) => !v)}>Toggle disabled</button>
        <Fieldset disabled={disabled} legend={<Button>Legend action</Button>}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input aria-label="Name" name="name" defaultValue="Ada" />
            <Select
              label="Choice"
              options={[
                { value: "a", label: "Alpha" },
                { value: "b", label: "Beta" },
              ]}
            />
            <Select mode="multiple"
              label="Tags"
              defaultValue={["a"]}
              options={[
                { value: "a", label: "Alpha" },
                { value: "b", label: "Beta" },
              ]}
            />
            <Rate aria-label="Rating" />
            <Button>Save</Button>
          </div>
        </Fieldset>
        <Fieldset legend="Filled" variant="filled">
          Example content
        </Fieldset>
        <Fieldset legend="Unstyled" variant="unstyled">
          Example content
        </Fieldset>
      </div>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
