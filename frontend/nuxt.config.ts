export default defineNuxtConfig({
  compatibilityDate: "2025-07-01",
  devtools: { enabled: true },
  ssr: true,

  css: [
    "~/assets/css/styles.css",
    "~/assets/css/admin.css",
  ],

  app: {
    head: {
      htmlAttrs: { lang: "fr" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#0F0F0F" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Inter:wght@300;400;500;600;700&family=Caveat:wght@500;700&family=Special+Elite&display=swap",
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001/api",
    },
  },

  routeRules: {
    // Vitrine SSR (défaut)
    "/": { ssr: true },
    // Admin uniquement côté client (dépend de sessionStorage)
    "/admin": { ssr: false },
    "/admin/**": { ssr: false },
  },
});
