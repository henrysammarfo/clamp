import { createFileRoute } from "@tanstack/react-router";
import { MandateDetailPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/mandates/$id")({
  head: ({ params }) => ({ meta: [{ title: `Mandate ${params.id} · CLAMP` }] }),
  component: MandateDetailRoute,
});

function MandateDetailRoute() {
  const { id } = Route.useParams();
  return <MandateDetailPage id={id} />;
}
