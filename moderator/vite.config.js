import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets'
  },
  publicDir: 'public',
  define: {
    // Make sure environment variables are available
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
});
