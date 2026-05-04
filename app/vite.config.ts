import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ui({
      dts: false,
      ui: {
        colors: { primary: "terra", neutral: "neutral" },
        tabs: {
          compoundVariants: [
            {
              color: "neutral",
              variant: "pill",
              class: {
                list: "bg-neutral-900/60",
                indicator: "bg-transparent",
                trigger:
                  "data-[state=active]:text-default data-[state=inactive]:text-dimmed",
              },
            },
            {
              color: "neutral",
              variant: "link",
              class: {
                indicator: "bg-neutral-400",
                trigger:
                  "data-[state=active]:text-toned data-[state=inactive]:text-muted",
              },
            },
          ],
        },
      },
    }),
  ],
  server: {
    port: 8010,
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      process.env.VITE_API_URL || "http://localhost:8000",
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "../api/src"),
    },
  },
});
