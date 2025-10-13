import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 5173,
      host: 'localhost',
      proxy: {
        // Auth service endpoints
        '/api/login': 'http://localhost:8000',
        '/api/logout': 'http://localhost:8000',
        '/api/user': 'http://localhost:8000',
        '/api/gsm': 'http://localhost:8000',
        '/api/users': 'http://localhost:8000',
        // Scholarship service endpoints
        '/api/stats': 'http://localhost:8001',
        '/api/students': 'http://localhost:8001',
        '/api/applications': 'http://localhost:8001',
        '/api/schools': 'http://localhost:8001',
        '/api/scholarship-categories': 'http://localhost:8001',
        '/api/documents': 'http://localhost:8001',
        '/api/interview-schedules': 'http://localhost:8001',
        '/api/forms': 'http://localhost:8001',
        '/api/public': 'http://localhost:8001',
        '/api/partner-school': 'http://localhost:8001',
        // Default to scholarship service for other API calls
        '/api': 'http://localhost:8001',
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
  }
})
