import { defineConfig, loadEnv } from 'vite'
import dns from 'node:dns'
import react from '@vitejs/plugin-react'
import path from 'path';

dns.setDefaultResultOrder('verbatim')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000';
  
return {
    plugins: [react()],
    
    server: {
      allowedHosts: [
        'ventu-website.onrender.com', 
        'localhost',
      ],
      host: '0.0.0.0', 
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      base: '/', 
    }
  }
})