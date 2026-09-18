import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/create-order")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/orders" });
  },
  component: () => null,
});
