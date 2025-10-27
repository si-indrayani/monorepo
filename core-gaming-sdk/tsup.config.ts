import { defineConfig } from 'tsup'
import { config } from 'dotenv'

config()

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  clean: true,
  external: ['preact'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  globalName: 'CoreGamingSDK',
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'preact'
    options.define = {
      'import.meta.env.VITE_S3_BASE_URL': JSON.stringify(process.env.VITE_S3_BASE_URL || 'https://si-gaming-fantasy.s3.amazonaws.com'),
      'import.meta.env.VITE_CONNECTIVITY_TEST_URL': JSON.stringify(process.env.VITE_CONNECTIVITY_TEST_URL || 'https://httpbin.org/status/200'),
    }
  }
})
