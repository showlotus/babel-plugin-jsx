import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@showlotus/babel-plugin-jsx': '@showlotus/babel-plugin-jsx/src/index.ts',
    },
  },
  build: {
    minify: false,
    outDir: '../../website',
  },
  plugins: [
    nodePolyfills({
      globals: {
        process: true,
      },
    }),
  ],
});
