import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['packages/*/src/**', 'apps/api/src/**'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        'apps/mobile/**',
        'apps/api/src/index.ts',
        'apps/api/prisma/**',
      ],
    },
  },
})
