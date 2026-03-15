import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/march-madness-brackets/', // Change this to your GitHub repo name
})
