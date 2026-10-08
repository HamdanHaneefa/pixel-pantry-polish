import * as dns from "node:dns";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite"; 

try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Ignore in environments where dns is not available
}


export default defineConfig(({ command }) => ({ 
  plugins: [
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }), 
    react(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    command === "build" && nitro({
      defaultPreset: "cloudflare-module",
    }),
  ].filter(Boolean),
  envPrefix: ["VITE_", "GOOGLE_"],
  define: {
    "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(
      process.env.GOOGLE_CLIENT_ID || ""
    ),
  },
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": `${process.cwd()}/src` },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/shopify-admin": {
        target: "https://1fcjnw-tz.myshopify.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/shopify-admin/, ""),
      },
      "/api/fastrr": {
        target: "https://fastrr-api-dev.pickrr.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/fastrr/, ""),
      },
    },
  },
}));
