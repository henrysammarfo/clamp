import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Product · CLAMP" },
      {
        name: "description",
        content:
          "CLAMP sets a temporary spending mandate for AI agents, then allows, blocks, or asks a person.",
      },
      { property: "og:title", content: "Product · CLAMP" },
      {
        property: "og:description",
        content: "Control before action for AI agents that spend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});
