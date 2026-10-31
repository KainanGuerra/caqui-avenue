import { defineConfig } from 'vitest/config'

// Os testes do domínio e da aplicação são TypeScript puro: não precisam do Nuxt.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/**/*.spec.ts', 'app/**/*.spec.ts', 'scripts/**/*.spec.ts'],
  },
})
