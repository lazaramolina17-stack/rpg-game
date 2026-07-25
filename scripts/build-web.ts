// Build script - bundles TypeScript for browser
import { build } from 'esbuild'

await build({
  entryPoints: ['src/web/main.ts'],
  bundle: true,
  outfile: 'docs/bundle.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  sourcemap: false,
})

console.log('✅ Built docs/bundle.js')