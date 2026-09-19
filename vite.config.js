import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for React Router — serve index.html for all routes
  server: {
    historyApiFallback: true,
  },
})
