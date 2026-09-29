import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · CLAMP" },
      {
        name: "description",
        content: "Team 14 at GWDC 2026 Korea. Challenge B.",
      },
      { property: "og:title", content: "Contact · CLAMP" },
      {
        property: "og:description",
        content: "Talk with the CLAMP team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});
