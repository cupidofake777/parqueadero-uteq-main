import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // El endpoint OCR del docente solo permite peticiones (CORS) desde
  // http://localhost:3000 en desarrollo, así que el servidor de Vite debe
  // correr exactamente en ese puerto (strictPort evita que Vite cambie de
  // puerto en silencio si el 3000 ya está ocupado).
  server: {
    port: 3000,
    strictPort: true,
  },
})
