const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    external: ['express', 'mongoose', 'dotenv'], // Do not bundle dependencies
    format: 'cjs', // CommonJS format
    logLevel: 'info',
}).catch(() => process.exit(1));
