import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Reviews · CLAMP" }] }),
  component: ReviewsPage,
});
