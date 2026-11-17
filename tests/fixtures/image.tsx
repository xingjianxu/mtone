import React from "react";
import { createRoot } from "react-dom/client";
import { Image, ImageGroup, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const src = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="${color}" width="600" height="400"/></svg>`)}`;
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <Image src={src("#688b7a")} alt="Single" width={200} height={140} />
    <Image
      src="/missing-image"
      fallback={src("#6a82a8")}
      alt="Fallback"
      width={120}
      height={90}
      preview={false}
    />
    <ImageGroup
      items={[
        { src: src("#6a82a8"), alt: "First" },
        { src: src("#9c8272"), alt: "Second" },
        {
          src: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="900"><rect fill="#7d799a" width="400" height="900"/></svg>`)}`,
          alt: "Third",
        },
      ]}
    />
  </MtoneProvider>,
);
