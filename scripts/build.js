#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const devPluginDir = path.join(repoRoot, 'com.courcelle.cryptoticker-dev.sdPlugin');
const stagingRoot = path.join(repoRoot, 'dist');
const releasePluginFolder = 'com.courcelle.cryptoticker.sdPlugin';
const releasePackageName = 'com.courcelle.cryptoticker.streamDeckPlugin';

const fsp = fs.promises;

function logStep(message) {
  console.log(`\n➜ ${message}`);
}

function fail(message, error) {
  console.error(`\n✖ ${message}`);
  if (error) {
    console.error(error.message || error);
  }
  process.exit(1);
}

function runCommand(command, args = [], options = {}) {
  const cwd = options.cwd ?? repoRoot;
  const fullCommand = [command, ...args].join(' ');
  const spawnOptions = {
    cwd,
    stdio: 'inherit',
    ...options,
    cwd,
  };

  const result = spawnSync(command, args, spawnOptions);

  if (result.error) {
    fail(`Failed to run command: ${fullCommand}\nWorking directory: ${cwd}`, result.error);
  }

  if (result.status !== 0) {
    fail(`Command failed: ${fullCommand}\nWorking directory: ${cwd}\nExited with code ${result.status}`);
  }
}

function resolveBin(binary) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  return path.join(repoRoot, 'node_modules', '.bin', `${binary}${suffix}`);
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function copyDevPluginToStaging(stagingDir) {
  await fsp.rm(stagingDir, { recursive: true, force: true });
  await ensureDir(path.dirname(stagingDir));
  await fsp.cp(devPluginDir, stagingDir, { recursive: true });

  const pubManifest = path.join(devPluginDir, 'manifest.pub.json');
  const stagingManifest = path.join(stagingDir, 'manifest.json');

  await fsp.copyFile(pubManifest, stagingManifest);

  for (const extra of ['manifest.pub.json', 'manifest.dev.json']) {
    const extraPath = path.join(stagingDir, extra);
    await fsp.rm(extraPath, { force: true });
  }
}

function ensureStreamDeckCliAvailable() {
  const result = spawnSync('streamdeck', ['--version'], { stdio: 'ignore' });

  if (result.error && result.error.code === 'ENOENT') {
    fail('The "streamdeck" CLI was not found in PATH. Install Elgato\'s Stream Deck CLI to continue.');
  }
}

async function packagePlugin(stagingDir) {
  ensureStreamDeckCliAvailable();

  const releasePath = path.join(stagingDir, releasePluginFolder);
  const stagedPackagePath = path.join(stagingDir, releasePackageName);
  const finalPackagePath = path.join(repoRoot, releasePackageName);

  await fsp.rm(stagedPackagePath, { force: true });
  await fsp.rm(finalPackagePath, { force: true });

  const result = spawnSync('streamdeck', ['pack', releasePluginFolder], {
    cwd: stagingDir,
    stdio: 'inherit',
  });

  if (result.error) {
    fail('streamdeck pack failed to execute', result.error);
  }

  if (result.status !== 0) {
    fail(`streamdeck pack exited with code ${result.status}`);
  }

  if (!fs.existsSync(stagedPackagePath)) {
    fail(`Expected ${releasePackageName} to be created in ${stagingDir}`);
  }

  await fsp.rename(stagedPackagePath, finalPackagePath);

  await fsp.rm(releasePath, { recursive: true, force: true });

  // Clean up staging directory if empty
  try {
    const remaining = await fsp.readdir(stagingDir);
    if (remaining.length === 0) {
      await fsp.rmdir(stagingDir);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return finalPackagePath;
}

async function buildPlugin(options = {}) {
  const { skipPackage = true, stageRelease = false } = options;
  const shouldStage = stageRelease || !skipPackage;

  logStep('Compiling TypeScript');
  runCommand(resolveBin('tsc'), ['-p', 'tsconfig.json']);

  logStep('Bundling runtime assets');
  runCommand(process.execPath, [path.join(repoRoot, 'esbuild.config.mjs'), '--mode=production']);

  if (!shouldStage) {
    console.log('\n✔ Build artifacts updated (staging skipped)');
    return {};
  }

  const stagingDir = path.join(stagingRoot, 'release');
  const releaseFolderPath = path.join(stagingDir, releasePluginFolder);

  logStep('Preparing release payload');
  await copyDevPluginToStaging(releaseFolderPath);

  if (skipPackage) {
    console.log(`\n✔ Prepared release folder at ${releaseFolderPath}`);
    return { releaseFolderPath };
  }

  logStep('Packing Stream Deck plugin');
  const packagePath = await packagePlugin(stagingDir);
  console.log(`\n✔ Stream Deck plugin ready at ${packagePath}`);
  return { packagePath };
}

module.exports = { buildPlugin };

if (require.main === module) {
  const args = process.argv.slice(2);
  let skipPackage = true;
  let stageRelease = false;

  if (args.includes('--package') || args.includes('--pack')) {
    skipPackage = false;
    stageRelease = true;
  }

  if (args.includes('--skip-package')) {
    skipPackage = true;
  }

  if (args.includes('--stage')) {
    stageRelease = true;
  }

  buildPlugin({ skipPackage, stageRelease }).catch((error) => fail('Build failed', error));
}
