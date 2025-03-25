import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: ['eld-frontd.onrender.com', 'localhost']
  }
})
