import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'cursor/canvas': path.resolve(__dirname, 'src/cursor-canvas-stub.tsx'),
    },
  },
})
