import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti 'pmn-framework' dengan nama repo GitHub kamu
export default defineConfig({
  plugins: [react()],
  base: '/pmn-framework/',
})
