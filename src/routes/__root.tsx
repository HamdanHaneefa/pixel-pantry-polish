import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import CartModal from "@/components/home/CartModal";
import { GA_MEASUREMENT_ID, trackPageView } from "@/lib/analytics";

import appCss from "../styles.css?url";
import PwaInstallPrompt from "@/components/common/PwaInstallPrompt";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function isRouteAdmin(ctx?: any): boolean {
  if (!ctx) return false;
  const matches = ctx.matches || (ctx.match ? [ctx.match] : []);
  return matches.some((m: any) => {
    const routeId = m?.routeId || m?.id || "";
    const pathname = m?.pathname || m?.fullPath || "";
    return (
      routeId === "/admin" ||
      routeId.startsWith("/admin/") ||
      pathname === "/admin" ||
      pathname.startsWith("/admin/")
    );
  });
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: (ctx) => {
    const isAdmin = isRouteAdmin(ctx);

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title: isAdmin
            ? "Petpedia Admin — Merchant Portal"
            : "Petpedia — Everything for Your Pet",
        },
        {
          name: "description",
          content: isAdmin
            ? "Merchant portal for Petpedia — Real-time store management, inventory, orders & Shopify sync."
            : "Premium pet food, toys, grooming and care essentials for dogs, cats and small pets. Trusted brands, fast delivery across India.",
        },
        { name: "author", content: "Petpedia" },
        { name: "theme-color", content: isAdmin ? "#0f172a" : "#FF5B00" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: isAdmin ? "black" : "black-translucent",
        },
        {
          name: "apple-mobile-web-app-title",
          content: isAdmin ? "Petpedia Admin" : "Petpedia",
        },
        { name: "mobile-web-app-capable", content: "yes" },
        {
          property: "og:title",
          content: isAdmin
            ? "Petpedia Admin — Merchant Portal"
            : "Petpedia — Everything for Your Pet",
        },
        {
          property: "og:description",
          content: isAdmin
            ? "Petpedia Merchant Management Portal"
            : "Premium pet food, toys, grooming and care essentials. Quality products. Better care.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: isAdmin ? "/manifest-admin.json" : "/manifest.json",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
      scripts: [
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
          async: true,
        },
        {
          children: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });`,
        },
        {
          src: "https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js",
          defer: true,
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <InnerRootComponent />
      </CartProvider>
    </QueryClientProvider>
  );
}

function InnerRootComponent() {
  const { isCartOpen, closeCart } = useCart();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const searchStr = routerState.location.searchStr;

  useEffect(() => {
    const fullPath = pathname + (searchStr ? `?${searchStr}` : "");
    trackPageView(fullPath);
  }, [pathname, searchStr]);

  // Dynamic Manifest & Theme Color switcher between Storefront & Merchant Admin Portal
  useEffect(() => {
    if (typeof document === "undefined") return;
    const isAdmin = pathname.startsWith("/admin");
    const targetManifest = isAdmin ? "/manifest-admin.json" : "/manifest.json";

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (manifestLink) {
      if (manifestLink.getAttribute("href") !== targetManifest) {
        manifestLink.setAttribute("href", targetManifest);
      }
    } else {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = targetManifest;
      document.head.appendChild(manifestLink);
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", isAdmin ? "#0f172a" : "#FF5B00");
    }

    const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitleMeta) {
      appleTitleMeta.setAttribute("content", isAdmin ? "Petpedia Admin" : "Petpedia");
    }
  }, [pathname]);

  // Register PWA Service Worker (handles both pre-load and post-load hydration)
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return (
    <div className="font-sans antialiased min-h-screen">
      <input
        type="hidden"
        id="sellerDomain"
        value="petpedia.in"
      />
      <Outlet />
      <CartModal isOpen={isCartOpen} onClose={closeCart} />
      <PwaInstallPrompt />
    </div>
  );
}
