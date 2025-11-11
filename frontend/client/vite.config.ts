import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 3002, // đổi sang port bạn muốn
    open: true, // (tùy chọn) tự mở trình duyệt
  },
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify"
    }
  }
})
