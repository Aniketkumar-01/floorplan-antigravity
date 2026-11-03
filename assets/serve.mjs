#!/usr/bin/env node
// floorplan/serve.mjs: serve this map locally with live reload for Antigravity IDE.
// usage: node floorplan/serve.mjs [--port 4378] [--no-open] [--idle-exit <minutes>]
//        node floorplan/serve.mjs --stop

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); return i < 0 ? dflt : argv[i + 1]; };
const has = (name) => argv.includes('--' + name);
const stateFile = path.join(here, '.cache', 'server.json');
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return null; } };

function findAgy() {
  try {
    const cmd = process.platform === 'win32' ? 'where.exe agy' : 'which agy';
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (out) return out.split(/\r?\n/)[0];
  } catch {}
  const candidates = process.platform === 'win32'
    ? [
        path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'agy', 'bin', 'agy.exe'),
        path.join(os.homedir(), '.local', 'bin', 'agy.exe'),
      ]
    : [
        path.join(os.homedir(), '.local', 'bin', 'agy'),
        '/usr/local/bin/agy',
      ];
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c; } catch {}
  }
  return null;
}

const agyBin = findAgy();
const hasCli = Boolean(agyBin);

if (has('stop')) {
  const s = readState();
  let stopped = false;
  if (s?.pid) { try { process.kill(s.pid); stopped = true; } catch {} }
  try { fs.unlinkSync(stateFile); } catch {}
  console.log(stopped ? `Stopped the map server (${s.url}).` : 'The map server was not running.');
  process.exit(0);
}

// Health issues marked "not a problem" on the map
const dismissedFile = path.join(here, 'health-dismissed.json');
const readDismissed = () => { try { const { dismissed } = JSON.parse(fs.readFileSync(dismissedFile, 'utf8')); return Array.isArray(dismissed) ? dismissed : []; } catch { return []; } };
const cleanDismissal = (d) => ({
  id: String(d.id).slice(0, 2000),
  locations: (Array.isArray(d.locations) ? d.locations : []).slice(0, 500).map((l) => String(l).slice(0, 1000)),
  ...(d.severity ? { severity: String(d.severity).slice(0, 20) } : {}),
  ...(d.reason ? { reason: String(d.reason).slice(0, 1000) } : {}),
  at: new Date().toISOString(),
});

const flowsFile = path.join(here, 'custom-flows.json');
const readFlows = () => { try { return JSON.parse(fs.readFileSync(flowsFile, 'utf8')).flows || []; } catch { return []; } };

const wantPort = Number(opt('port', 4378));
const idleExit = Number(opt('idle-exit', 0)) * 60000;
const selfHash = crypto.createHash('sha1').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex').slice(0, 12);
const token = crypto.randomBytes(16).toString('hex');
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const inject = `<script>window.FLOORPLAN_SERVER=${JSON.stringify({ token, cli: hasCli, engine: hasCli ? 'antigravity' : null, want: 'antigravity', builtBy: 'antigravity', version: null, model: 'Gemini', change: false })};</script>`;
let page;
function load() {
  const html = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
  page = html.replace('</head>', inject + '</head>');
}
load();

// ---------- live reload and tabs ----------
const tabs = new Set();
let lastTab = Date.now();
const broadcast = (event, data = {}) => { for (const t of tabs) t.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };
let reloadTimer = null;
fs.watchFile(path.join(here, 'index.html'), { interval: 1000 }, (cur, prev) => {
  if (cur.mtimeMs === prev.mtimeMs) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => { try { load(); broadcast('reload'); console.log('map rebuilt: reloaded open tabs'); } catch {} }, 800);
});
if (idleExit) setInterval(() => { if (!tabs.size && Date.now() - lastTab > idleExit) process.exit(0); }, 60000).unref();

process.stdout?.on?.('error', () => {});
process.stderr?.on?.('error', () => {});

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  if (!/^127\.0\.0\.1(:[0-9]+)?$|^\[::1\](:[0-9]+)?$|^localhost(:[0-9]+)?$/.test(host)) {
    res.writeHead(403); return res.end('Floorplan serves only locally.');
  }

  const url = new URL(req.url, `http://${host || '127.0.0.1'}`);

  if (url.pathname.startsWith('/api/')) {
    const origin = req.headers.origin;
    const sameOrigin = !origin || origin === `http://${host}` || origin === `http://127.0.0.1:${port}` || origin === `http://localhost:${port}`;
    const given = req.headers['x-floorplan-token'] || (url.pathname === '/api/events' ? url.searchParams.get('token') : null);
    if (!sameOrigin || given !== token) { res.writeHead(403); return res.end(); }

    if (req.method === 'GET' && url.pathname === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      tabs.add(res);
      req.on('close', () => { tabs.delete(res); lastTab = Date.now(); });
      return;
    }
    if (req.method === 'GET' && url.pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ tabs: tabs.size, pid: process.pid, hash: selfHash, root }));
    }
    if (req.method === 'GET' && url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ cli: hasCli, engine: hasCli ? 'antigravity' : null, want: 'antigravity', builtBy: 'antigravity', version: null, path: agyBin }));
    }
    if (req.method === 'POST' && url.pathname === '/api/ask') {
      let raw = '';
      req.on('data', (d) => { raw += d; if (raw.length > 50000) req.destroy(); });
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(raw); } catch {}
        const question = body.question;
        if (!question || !hasCli) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: hasCli ? 'No question provided' : 'CLI unavailable' }));
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-store',
          Connection: 'keep-alive',
        });
        res.write('event: progress\ndata: {"text":"Consulting Antigravity…"}\n\n');

        let graphContext = '';
        try {
          const G = JSON.parse(fs.readFileSync(path.join(here, 'graph.json'), 'utf8'));
          const nodes = (G.nodes || []).map((n) => `- ${n.id} (${n.label || n.name || ''}): ${n.desc || n.description || ''}`).slice(0, 50).join('\n');
          graphContext = `Architecture map context:\n${nodes}\n\n`;
        } catch {}

        const prompt = `${graphContext}User question about codebase architecture: ${question}\n\nAnswer clearly and concisely based on the map. Output ONLY valid JSON matching this schema:\n{"title":"Short Summary Title","answer":"Markdown explanation with [[node_id]] mentions where relevant","items":[{"id":"node_id","note":"one line note"}],"steps":[],"followups":["Relevant follow-up question"]}`;

        const agyArgs = ['--print', prompt, '--output-format', 'json', '--effort', 'low'];
        if (body.session) agyArgs.push('--conversation', body.session);

        const child = spawn(agyBin, agyArgs, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => { stdout += d; });
        child.stderr.on('data', (d) => { stderr += d; });

        child.on('close', (code) => {
          if (code !== 0) {
            res.write(`event: failure\ndata: ${JSON.stringify({ code: 'cli_error', message: stderr || `Process exited with code ${code}` })}\n\n`);
            return res.end();
          }
          let parsed;
          try {
            const agyResp = JSON.parse(stdout);
            const text = agyResp.response || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            if (!parsed) {
              parsed = { title: 'Antigravity Answer', answer: text, items: [], steps: [], followups: [] };
            }
            parsed.session = agyResp.conversation_id || body.session;
          } catch {
            parsed = { title: 'Antigravity Answer', answer: stdout, items: [], steps: [], followups: [] };
          }
          res.write(`event: answer\ndata: ${JSON.stringify(parsed)}\n\n`);
          res.end();
        });

        req.on('close', () => {
          try { child.kill(); } catch {}
        });
      });
      return;
    }
    if (url.pathname === '/api/flows') {
      if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ flows: readFlows() })); }
      if (req.method === 'POST' || req.method === 'DELETE') {
        let raw = '';
        req.on('data', (d) => { raw += d; if (raw.length > 50000) req.destroy(); });
        req.on('end', () => {
          let body = {}; try { body = JSON.parse(raw); } catch {}
          let flows = readFlows().filter((x) => x.id !== body.id && x.id !== body.flow?.id);
          if (req.method === 'POST' && body.flow?.id && Array.isArray(body.flow.steps)) flows.push({ ...body.flow, createdAt: new Date().toISOString() });
          fs.writeFileSync(flowsFile, JSON.stringify({ flows }, null, 2) + '\n');
          res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ flows }));
        });
        return;
      }
    }
    if (url.pathname === '/api/health/dismissed') {
      if (req.method === 'GET') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ dismissed: readDismissed() })); }
      if (req.method === 'POST' || req.method === 'DELETE') {
        let raw = '';
        req.on('data', (d) => { raw += d; if (raw.length > 100000) req.destroy(); });
        req.on('end', () => {
          let body = {}; try { body = JSON.parse(raw); } catch {}
          if (typeof body.id !== 'string') { res.writeHead(400); return res.end(); }
          const dismissed = readDismissed().filter((x) => x.id !== body.id);
          if (req.method === 'POST') dismissed.push(cleanDismissal(body));
          fs.writeFileSync(dismissedFile, JSON.stringify({ dismissed }, null, 2) + '\n');
          res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ dismissed }));
        });
        return;
      }
    }
    if (req.method === 'POST' && url.pathname === '/api/cancel') { res.writeHead(204); return res.end(); }
    res.writeHead(404); return res.end();
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
    return res.end(page);
  }

  let file;
  try { file = path.join(here, decodeURIComponent(url.pathname)); } catch { res.writeHead(400); return res.end('bad address'); }
  if (!file.startsWith(here + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

let port = wantPort;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < wantPort + 20) { port++; server.listen(port); return; }
  console.error(`✗ Couldn't start the map server: ${e.message}`);
  process.exit(1);
});
server.listen(port);
server.on('listening', () => {
  const u = `http://127.0.0.1:${port}`;
  try {
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify({ pid: process.pid, port, url: u, token, hash: selfHash, startedAt: new Date().toISOString() }, null, 2));
  } catch {}
  const forget = () => { try { if (readState()?.pid === process.pid) fs.unlinkSync(stateFile); } catch {} };
  process.on('exit', forget);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => process.exit(0));
  console.log(`Floorplan: ${u}`);
  if (!has('no-open')) {
    const opener = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', u]] : process.platform === 'darwin' ? ['open', [u]] : ['xdg-open', [u]];
    try { spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref(); } catch {}
  }
});
