import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  outDir: 'dist',
  external: [
    '@cubejs-client/core',
    '@cubejs-client/react',
    'react',
    'react-dom',
  ],
});
