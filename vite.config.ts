import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    // 代码分割优化,减少单个chunk大小
    rollupOptions: {
      output: {
        manualChunks: {
          // React相关库单独打包
          'react-vendor': ['react', 'react-dom'],
          // Konva画布库单独打包
          'konva-vendor': ['konva', 'react-konva'],
          // AI相关库单独打包
          'ai-vendor': ['@google/generative-ai'],
          // 文档导出库单独打包
          'export-vendor': ['jspdf', 'docx', 'html2canvas'],
          // 拖拽库单独打包
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        }
      }
    },
    // 提高chunk大小警告阈值到1000kb
    chunkSizeWarningLimit: 1000,
  },
})
