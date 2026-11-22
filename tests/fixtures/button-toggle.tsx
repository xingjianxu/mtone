import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Image } from "lucide-react";
import {
  Button,
  ButtonGroup,
  MtoneProvider,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

createRoot(document.getElementById("root")!).render(
  <>
    {(["light", "dark"] as const).map((theme) => (
      <MtoneProvider key={theme} theme={theme}>
        <ButtonGroup aria-label={theme} connected>
          <Button toggle>Filter</Button>
          <Button
            variant="soft"
            leftSection={<Image size={14} aria-hidden="true" />}
            rightSection={<ArrowRight size={14} aria-hidden="true" />}
          >
            View gallery
          </Button>
          <Button variant="soft" disabled>
            Disabled gallery
          </Button>
          <Button variant="soft" loading>
            Loading gallery
          </Button>
          <Button variant="soft" disabled focusableWhenDisabled>
            Focusable gallery
          </Button>
          <Button
            variant="soft"
            disabled
            nativeButton={false}
            render={<span />}
          >
            Composed gallery
          </Button>
          <Button variant="soft" toggle defaultPressed>
            Pressed gallery
          </Button>
          <Button variant="solid" toggle>
            Solid filter
          </Button>
          <Button variant="blue" danger toggle>
            Danger filter
          </Button>
          <Button iconOnly
            aria-label="Star"
            toggle={{ mode: "icon", preset: "star" }}
          />
          <Button toggle={{ mode: "icon", preset: "pin" }}>Pin</Button>
        </ButtonGroup>
      </MtoneProvider>
    ))}
  </>,
);
