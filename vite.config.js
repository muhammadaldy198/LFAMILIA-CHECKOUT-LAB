import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: { alias: { '@inertiajs/vue3': fileURLToPath(new URL('./src/inertia-mock.js', import.meta.url)) } },
  server: { host: '0.0.0.0' },
});
