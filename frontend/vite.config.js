import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Use absolute paths for Vercel/Render
  build: {
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
})
