import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pmn-framework/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        agent: 'pmn-agent-guide.html',
      }
    }
  }
})
