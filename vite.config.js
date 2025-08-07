import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import tailwindcss from '@tailwindcss/vite'



export default defineConfig({
<<<<<<< HEAD
  base: process.env.NODE_ENV === 'production' ? '/IM-CONNECTED/' : '/',
=======
  server: {
    host: '0.0.0.0'   // listen on all IPv4 addresses (and often IPv6 too)
  },
>>>>>>> 95166c395284cf65c27473509a28b4f2aeea5fe0
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