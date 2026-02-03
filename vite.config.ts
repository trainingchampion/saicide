
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
    },
    build: {
    outDir: 'dist',
    rollupOptions: {
      // Use index.dev.html as the entry point for builds
      input: resolve(__dirname, 'index.dev.html'),
      output: {
        manualChunks(id) {
          // Separate node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // Terminal (xterm) - often large
            if (id.includes('@xterm')) {
              return 'vendor-terminal';
            }
            // UI icons - can be large
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Socket & networking
            if (id.includes('socket.io')) {
              return 'vendor-network';
            }
            // Animation
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // AI SDK
            if (id.includes('@google/genai')) {
              return 'vendor-ai';
            }
            // MCP SDK
            if (id.includes('@modelcontextprotocol')) {
              return 'vendor-mcp';
            }
            // HTTP client
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            // All other vendor modules
            return 'vendor-misc';
          }
        },
      },
    },
  },
  server: {
    // Use index.dev.html for development since index.html is the compiled version
    open: '/index.dev.html',
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://localhost:4000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  }
})
