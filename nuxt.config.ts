import pkg from './package.json' with { type: 'json' }

// Nuxt: UI Vue (app/) e rotas de servidor (server/api) no mesmo processo.
// Nuxt UI + Tailwind dão tema claro/escuro e componentes acessíveis prontos (D11); a marca é própria.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  runtimeConfig: { public: { appVersion: pkg.version } },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Kaki · Caqui Invest',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#c4521b' },
      ],
    },
  },
})
