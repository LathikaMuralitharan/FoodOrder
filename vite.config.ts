/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { bedrockVitePlugin } from './server/viteBedrockPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bedrockVitePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    rollupOptions: {
      // Hard boundary: server/ modules must never enter the client bundle.
      // Any accidental import from src/ → server/ will throw at build time.
      external: (id) => id.includes('/server/') && !id.includes('vite.config'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
