import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
