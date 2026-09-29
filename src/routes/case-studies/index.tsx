import { createFileRoute } from "@tanstack/react-router";
import { CaseStudiesPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/case-studies/")({
  head: () => ({
    meta: [
      { title: "Case studies · CLAMP" },
      {
        name: "description",
        content: "Allow, Block, and Needs human reconstructions for the same mandate.",
      },
      { property: "og:title", content: "Case studies · CLAMP" },
      {
        property: "og:description",
        content: "See how CLAMP handles the three demo outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseStudiesPage,
});
