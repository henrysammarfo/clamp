import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs · CLAMP" },
      {
        name: "description",
        content: "Mandate rules, code gate, human review, and on chain receipts.",
      },
      { property: "og:title", content: "Docs · CLAMP" },
      {
        property: "og:description",
        content: "Before the tool call: how CLAMP decides.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});
