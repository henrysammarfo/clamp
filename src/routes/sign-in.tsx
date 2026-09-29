import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/components/clamp/public-pages";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in · CLAMP" },
      {
        name: "description",
        content: "Open a signed server session for your CLAMP tenant.",
      },
      { property: "og:title", content: "Sign in · CLAMP" },
      {
        property: "og:description",
        content: "Signed httpOnly session. No browser storage for product state.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});
