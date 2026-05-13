import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/.git/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/.kiro/**',
      '**/.kilo/**',
      '**/src/__tests__/Hero.test.ts',
      '**/src/__tests__/Navigation.test.tsx',
      '**/src/__tests__/Pricing.test.ts',
      '**/src/__tests__/Process.test.ts',
      '**/src/__tests__/Checkpoint.test.ts',
      '**/src/__tests__/task-1-setup.test.ts',
    ],
  },
});
