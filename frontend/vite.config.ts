import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Approved Phase 1 Config prioritizing fast HMR and low build sizes
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  }
});