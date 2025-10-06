import { build, context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const argMap = new Map();
for (const arg of args) {
  if (arg.startsWith('--')) {
    const [flag, value] = arg.includes('=') ? arg.split('=', 2) : [arg, true];
    argMap.set(flag, value);
  }
}

const mode = (argMap.get('--mode') || (argMap.has('--watch') ? 'development' : 'production')).toString();
const isWatch = argMap.has('--watch');
const isProd = mode === 'production';
const sourcemap = isProd ? 'external' : 'linked';

const outdir = path.resolve(__dirname, 'com.courcelle.cryptoticker-dev.sdPlugin/js');

const entryPoints = {
  plugin: path.resolve(outdir, 'entries/plugin-entry.ts'),
  pi: path.resolve(outdir, 'entries/pi-entry.ts'),
  preview: path.resolve(outdir, 'entries/preview-entry.ts')
};
const bundleNames = Object.keys(entryPoints);

const baseConfig = {
  entryPoints,
  outdir,
  bundle: true,
  platform: 'browser',
  target: ['es2019'],
  format: 'iife',
  entryNames: '[name].bundle',
  sourcemap,
  minify: isProd,
  legalComments: 'none',
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
  }
};

async function stripSourceMaps() {
  await Promise.all(
    bundleNames.map(async (name) => {
      const mapPath = path.join(outdir, `${name}.bundle.js.map`);
      await fs.rm(mapPath, { force: true }).catch(() => {});

      const bundlePath = path.join(outdir, `${name}.bundle.js`);
      try {
        const contents = await fs.readFile(bundlePath, 'utf8');
        const cleaned = contents.replace(/\n\/\/#[ \t]*sourceMappingURL=.*$/u, '\n');
        if (cleaned !== contents) {
          await fs.writeFile(bundlePath, cleaned, 'utf8');
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    })
  );
}

async function run() {
  if (isWatch) {
    const ctx = await context({
      ...baseConfig,
      logLevel: 'info'
    });
    await ctx.watch();
    console.log('esbuild is watching for changes...');
    await new Promise(() => {});
  } else {
    await build({
      ...baseConfig,
      logLevel: 'info'
    });
    if (isProd) {
      await stripSourceMaps();
    }
    console.log('Bundles built successfully.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
