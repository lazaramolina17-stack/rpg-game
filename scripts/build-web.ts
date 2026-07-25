import * as esbuild from 'esbuild'
await esbuild.build({
  entryPoints: ['src/web/main.ts'],
  bundle: true,
  minify: true,
  outfile: 'docs/bundle.js',
  format: 'esm',
  platform: 'browser',
  external: ['three'],
})
console.log('✅ Built docs/bundle.js')