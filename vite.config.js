import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'guide-line.html',
        'sing_list.html',
      ]
    },
  },
});