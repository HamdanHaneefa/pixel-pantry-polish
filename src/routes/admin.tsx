import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { checkAdminAuthFn } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") {
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
  const isLoginPage = routerState.location.pathname === "/admin/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen h-[100dvh] w-full min-h-screen overflow-hidden flex-col md:flex-row bg-slate-50 text-slate-900 antialiased">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-7">
        <div className="mx-auto max-w-7xl space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
