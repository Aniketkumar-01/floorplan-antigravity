#!/usr/bin/env node
// Open the floorplan map. On Windows (where the AGY sandbox kills background processes),
// opens floorplan/index.html directly as a file — it is fully self-contained.
// On other platforms, starts the serve.mjs background server for live-reload.
// usage: node open.mjs [root] [--no-open] [--port N] [--serve]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { parseArgs, mapDir } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const dir = mapDir(root);
const indexFile = path.join(dir, 'index.html');
const serveFile = path.join(dir, 'serve.mjs');
const stateFile = path.join(dir, '.cache', 'server.json');
const rel = path.relative(process.cwd(), dir).replace(/\\/g, '/') || '.';
const IDLE_MINUTES = 120;

if (!fs.existsSync(indexFile)) {
  console.error('✗ No built map here yet. Run build.mjs first.');
  process.exit(1);
}

function openBrowser(u) {
  const [cmd, a] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', u]] : process.platform === 'darwin' ? ['open', [u]] : ['xdg-open', [u]];
  try { spawn(cmd, a, { stdio: 'ignore', detached: true, windowsHide: true }).unref(); return true; } catch { return false; }
}

// On Windows: open the HTML file directly (sandbox kills background node processes).
// Use --serve flag to force server mode if running outside the sandbox.
const useFile = process.platform === 'win32' && !args.serve;

if (useFile) {
  if (args['no-open']) {
    console.log(`FLOORPLAN  file://${indexFile.replace(/\\/g, '/')}`);
  } else {
    const opened = openBrowser(indexFile);
    console.log(`FLOORPLAN  ${rel}/index.html  (${opened ? 'opened in browser' : 'could not open browser — open the file yourself'})`);
  }
  console.log('ASK  ask questions directly in your Antigravity chat');
  console.log(`FILE  ${indexFile}`);
  process.exit(0);
}

// Non-Windows (or --serve): start background server
if (!fs.existsSync(serveFile)) {
  console.error(`✗ serve.mjs not found in ${rel}. Run build.mjs first.`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return null; } };
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
async function api(s, p) {
  try {
    const r = await fetch(s.url + p, { headers: { 'x-floorplan-token': s.token }, signal: AbortSignal.timeout(3000) });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

const hash = crypto.createHash('sha1').update(fs.readFileSync(serveFile)).digest('hex').slice(0, 12);
let s = readState();
let status = s?.pid && alive(s.pid) ? await api(s, '/api/status') : null;
let restarted = false;
const hadTabs = status?.tabs > 0;

if (status && status.hash !== hash) {
  try { process.kill(s.pid); } catch {}
  for (let i = 0; i < 20 && alive(s.pid); i++) await sleep(150);
  status = null;
  restarted = true;
}

if (!status) {
  const pass = ['port'].flatMap((k) => (args[k] ? ['--' + k, String(args[k])] : []));
  if (!args.port && s?.port) pass.push('--port', String(s.port));
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const prev = s?.pid;
  const log = fs.openSync(path.join(dir, '.cache', 'server.log'), 'w');
  spawn(process.execPath, [serveFile, '--no-open', '--idle-exit', String(IDLE_MINUTES), ...pass], {
    cwd: root, detached: true, stdio: ['ignore', log, log], windowsHide: true,
  }).unref();
  for (let i = 0; i < 100; i++) {
    await sleep(200);
    const n = readState();
    if (n?.pid && n.pid !== prev && alive(n.pid)) { s = n; status = await api(s, '/api/status'); if (status) break; }
  }
  if (!status) {
    console.error(`✗ Server didn't start. Log: ${rel}/.cache/server.log\nFallback: open ${rel}/index.html directly.`);
    process.exit(1);
  }
  if (restarted && hadTabs) for (let i = 0; i < 50 && !(status?.tabs > 0); i++) { await sleep(200); status = await api(s, '/api/status'); }
}

const health = await api(s, '/api/health');
let shown;
if (status.tabs > 0) shown = `already open in ${status.tabs === 1 ? 'a browser tab' : status.tabs + ' browser tabs'}`;
else if (args['no-open']) shown = 'not opened (--no-open)';
else shown = openBrowser(s.url) ? 'opened in browser' : 'could not open browser — open the URL yourself';

console.log(`FLOORPLAN  ${s.url}  (${shown})`);
console.log(health?.cli
  ? `ASK  works via ${health.engine}${health.version ? ' (' + health.version + ')' : ''}`
  : 'ASK  ask questions in your Antigravity chat; the map itself works');
console.log(`SERVER  background, idle-exits after ${IDLE_MINUTES / 60}h. Stop: node ${rel}/serve.mjs --stop`);
