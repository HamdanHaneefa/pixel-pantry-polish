import { createFileRoute, redirect } from "@tanstack/react-router";

// Brands & Sponsors now live as a tab inside Storefront Design.
export const Route = createFileRoute("/admin/sponsors")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/homepage", search: { tab: "brands" } });
  },
  component: () => null,
});
