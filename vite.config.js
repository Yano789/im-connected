import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import tailwindcss from '@tailwindcss/vite'



export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/IM-CONNECTED/' : '/',
  plugins: [
    // other Vite plugins
    react(),
    //tailwindcss(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    include: ['src/__test__/**/*.test.{js,jsx,ts,tsx}'],  // ONLY frontend tests here
    setupFiles: "./src/__test__/setupTests.js", // optional for jest-dom or other setup
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});