import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { checkAdminAuthFn } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNotificationPrompt from "@/components/admin/AdminNotificationPrompt";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Petpedia Admin — Merchant Portal" },
      { name: "apple-mobile-web-app-title", content: "Petpedia Admin" },
      { name: "theme-color", content: "#0f172a" },
    ],
    links: [
      { rel: "manifest", href: "/manifest-admin.json" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const p = (location.pathname || "").replace(/\/+$/, "");
    if (p === "/admin/login") {
      return;
    }
    const auth = await checkAdminAuthFn();
    if (!auth.authenticated) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const routerState = useRouterState();
  const currentPath = (routerState.location.pathname || "").replace(/\/+$/, "");
  const isLoginPage = currentPath === "/admin/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen h-[100dvh] w-full min-h-screen overflow-hidden flex-col md:flex-row bg-slate-50 text-slate-900 antialiased">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-7">
        <div className="mx-auto max-w-7xl space-y-6">
          <AdminNotificationPrompt />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
