import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  server: {
    allowedHosts: ['be-curious.fr'],

    proxy: {
      '/api': 'http://backend:3000'
    },

    watch: {
      usePolling: true
    }
  }
})