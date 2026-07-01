export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/styles.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Le Bistrot de Tatina — Bar associatif, containers & chaudronnerie · Annecy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: "Bar associatif d'Annecy installé dans d'anciens containers. Concerts, DJ sets, food trucks. Les bénéfices vont à la lutte contre le cancer." },
        { name: 'theme-color', content: '#0F0F0F' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Inter:wght@300;400;500;600;700&family=Caveat:wght@500;700&family=Special+Elite&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001/api'
    }
  }
})
