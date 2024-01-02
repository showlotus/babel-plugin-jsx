import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@vue/babel-plugin-jsx': '@vue/babel-plugin-jsx/src/index.ts',
    },
  },
  build: {
    minify: false,
  },
  plugins: [
    nodePolyfills({
      globals: {
        process: true,
      },
    }),
  ],
});
