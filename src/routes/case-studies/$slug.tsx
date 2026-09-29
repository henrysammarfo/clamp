import { createFileRoute } from "@tanstack/react-router";
import { CaseStudyPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/case-studies/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} · CLAMP` },
      {
        name: "description",
        content: "Reconstruct a CLAMP decision path from request to receipt.",
      },
      { property: "og:title", content: `${params.slug} · CLAMP` },
      {
        property: "og:description",
        content: "Request, rule, decision, reason, and receipt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaseStudyRoute,
});

function CaseStudyRoute() {
  const { slug } = Route.useParams();
  return <CaseStudyPage slug={slug} />;
}
