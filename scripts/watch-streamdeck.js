#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const pluginPath = path.resolve(__dirname, '../com.courcelle.cryptoticker-dev.sdPlugin');
const pluginId = 'com.courcelle.cryptoticker-dev';
const restartDelayMs = 500;
let timer = null;
let restartProcess = null;
let restartPending = false;
let stopping = false;

function restartPlugin() {
  if (stopping) {
    return;
  }
  if (restartProcess) {
    restartPending = true;
    return;
  }
  restartPending = false;
  restartProcess = spawn('streamdeck', ['restart', pluginId], { stdio: 'inherit' });
  restartProcess.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
    stop();
  });
  restartProcess.on('close', (code) => {
    restartProcess = null;
    if (code && !stopping) {
      console.error(`Stream Deck restart failed with code ${code}.`);
    }
    if (restartPending && !stopping) {
      scheduleRestart();
    }
  });
}

function scheduleRestart() {
  clearTimeout(timer);
  timer = setTimeout(restartPlugin, restartDelayMs);
}

const watcher = fs.watch(pluginPath, { recursive: true }, (_event, filename) => {
  const name = filename ? filename.toString() : '';
  if (name.endsWith('.ts') || name.endsWith('.map')) {
    return;
  }
  scheduleRestart();
});
watcher.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
  stop();
});

function stop() {
  stopping = true;
  clearTimeout(timer);
  watcher.close();
  if (restartProcess) {
    restartProcess.kill();
  }
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
scheduleRestart();
