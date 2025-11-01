import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Use relative paths for assets (works on any domain)
  build: {
    sourcemap: false,
    outDir: 'dist',
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
})
