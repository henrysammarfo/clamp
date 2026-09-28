import { createFileRoute } from "@tanstack/react-router";
import { DecisionDetailPage } from "@/components/clamp/app-pages";

export const Route = createFileRoute("/decisions/$id")({
  head: ({ params }) => ({ meta: [{ title: `Decision ${params.id} · CLAMP` }] }),
  component: DecisionDetailRoute,
});

function DecisionDetailRoute() {
  const { id } = Route.useParams();
  return <DecisionDetailPage id={id} />;
}
