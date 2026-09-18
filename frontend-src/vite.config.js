import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Build into ../frontend/ so Flask's static_folder picks it up
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../frontend',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
