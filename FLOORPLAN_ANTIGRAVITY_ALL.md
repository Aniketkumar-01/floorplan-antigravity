# Floorplan for Antigravity (floorplan-antigravity) - Complete Codebase & Skill Bundle

This document aggregates the complete source code, scripts, references, and viewer assets of Floorplan for Antigravity into a single file.

## Table of Contents

- [SKILL.md](#skillmd)
- [scripts/install.mjs](#scriptsinstallmjs)
- [scripts/serve.mjs](#scriptsservemjs)
- [scripts/build.mjs](#scriptsbuildmjs)
- [scripts/describe.mjs](#scriptsdescribemjs)
- [scripts/open.mjs](#scriptsopenmjs)
- [scripts/plan.mjs](#scriptsplanmjs)
- [scripts/recent.mjs](#scriptsrecentmjs)
- [scripts/refresh.mjs](#scriptsrefreshmjs)
- [scripts/scan.mjs](#scriptsscanmjs)
- [scripts/status.mjs](#scriptsstatusmjs)
- [scripts/lib/agent.mjs](#scriptslibagentmjs)
- [scripts/lib/blueprint.mjs](#scriptslibblueprintmjs)
- [scripts/lib/common.mjs](#scriptslibcommonmjs)
- [scripts/lib/extract.mjs](#scriptslibextractmjs)
- [scripts/lib/health.mjs](#scriptslibhealthmjs)
- [scripts/lib/names.mjs](#scriptslibnamesmjs)
- [scripts/lib/resolve.mjs](#scriptslibresolvemjs)
- [scripts/lib/routes.mjs](#scriptslibroutesmjs)
- [scripts/lib/screens.mjs](#scriptslibscreensmjs)
- [references/schema.md](#referencesschemamd)
- [references/blueprint.md](#referencesblueprintmd)
- [references/choosing-boundaries.md](#referenceschoosingboundariesmd)
- [references/writing-descriptions.md](#referenceswritingdescriptionsmd)
- [assets/serve.mjs](#assetsservemjs)
- [assets/graph-query.js](#assetsgraphqueryjs)
- [assets/query-cli.mjs](#assetsqueryclimjs)
- [assets/ui/05-theme.js](#assetsui05themejs)
- [assets/ui/06-blueprint.js](#assetsui06blueprintjs)
- [assets/ui/10-glossary.js](#assetsui10glossaryjs)
- [assets/ui/20-health.js](#assetsui20healthjs)
- [assets/ui/25-recent.js](#assetsui25recentjs)
- [assets/ui/30-screens.js](#assetsui30screensjs)
- [assets/ui/40-tour.js](#assetsui40tourjs)
- [assets/viewer.html](#assetsviewerhtml)

---


# SKILL.md

`markdown
---
name: floorplan-antigravity
description: "Draw a floorplan of an app's codebase (one repo or several side by side), an interactive node-graph map where every subsystem, module, file and HTTP route has a human-readable name and a one-line description, connected by the imports and HTTP calls between them, at several zoom levels. It is saved as a self-contained floorplan/index.html in the codebase. Use whenever the user wants to visualize, map, diagram, document or get an architectural overview of a codebase, repo or monorepo, understand how their app works or is connected under the hood, onboard onto unfamiliar code, see how the frontend talks to the backend, or update an existing floorplan. Also use before code exists: when the user shares a PRD or spec, it draws a blueprint planned from the document."
---

# Floorplan for Antigravity (floorplan-antigravity)

You produce `floorplan/` at the codebase root: an interactive floorplan of the app that anyone can read like a system diagram. Every card shows a human-readable name and a one-line description, with the real file path underneath.

- **You write:** `floorplan/architecture.json` (subsystems, modules, flows) and `floorplan/descriptions/*.json` (names and descriptions for files and routes).
- **Generated:** `floorplan/graph.json` and `floorplan/index.html`.

Scripts handle the mechanical work: finding repos, parsing imports and routes, matching HTTP calls to endpoints, and rendering the offline map. Your job as the agent is deciding what things *are* and summarizing them plainly.

All scripts live in this skill's `scripts/` directory. When running them, use `node <path-to-skill>/scripts/<script>.mjs`.

---

## Nothing built yet? Draw a blueprint

If the user wants to plan an unbuilt system from a PRD, spec, or description:
1. **Read the input document.** Ask 2–3 questions only if fundamental requirements are open; otherwise decide and record assumptions.
2. **Read references:** [references/blueprint.md](references/blueprint.md) and [references/schema.md](references/schema.md).
3. **Write `floorplan/plan.json`:** all planned files, routes, external services, and user assumptions.
4. **Write `floorplan/architecture.json`:** top-level nodes, external services, 1–3 user story flows, and a tour.
5. **Run the plan validator and build:**
   ```bash
   node <skill_dir>/scripts/plan.mjs <root>
   node <skill_dir>/scripts/build.mjs <root>
   ```
6. **Open the map:** `node <skill_dir>/scripts/open.mjs <root>`
7. **Report:** Provide the URL, the system shape in 3–5 lines, chosen stack, key assumptions, and open questions from the design review. Each card provides a **Build this with Antigravity** prompt.

---

## A map already exists? Refresh it instead

Check if `floorplan/graph.json` exists. If so, run:

```bash
node <skill_dir>/scripts/refresh.mjs <root>
```

It re-scans, compares content fingerprints, carries over descriptions for renamed files, drops deleted ones, and prints a short `NEXT` action list:
- Assign any new directories flagged in `unassigned`.
- Run `describe.mjs` for newly added or changed files.
- Mark recent work with `recent.mjs`, rebuild, and open the updated map.

---

## Workflow (First Run)

### 1. Scan
```bash
node <skill_dir>/scripts/scan.mjs <root>
```
Writes `floorplan/.cache/scan.json` and prints a summary: repositories, code tree with LOC, entrypoints, heaviest import edges, and route matches.

### 2. Read References
Read [references/schema.md](references/schema.md) and [references/choosing-boundaries.md](references/choosing-boundaries.md).

### 3. Explore
Skim entrypoints, manifests (`package.json`, `pyproject.toml`, `go.mod`), and 1–2 files per candidate subsystem to understand the system shape.

### 4. Write `floorplan/architecture.json`
- **Structure:** 3–9 top-level subsystems with 3–12 child modules each.
- **Coverage:** Globs covering >90% of code files.
- **Externals:** Nodes for databases, queues, and third-party services.
- **Flows:** 1–3 end-to-end guided flows tracing core user stories.
- **Tour:** 3–8 narrated stops explaining the app from entry to data.
- **Plain language:** Use clear functional names ("Main server", "Checkout service") rather than raw filenames.

### 5. Build and Validate
```bash
node <skill_dir>/scripts/build.mjs <root>
```
Validates the architecture against the scan. Fix any unassigned directories or syntax errors until clean. The map ignores itself in git automatically.

### 6. Describe Files and Routes
```bash
node <skill_dir>/scripts/describe.mjs <root>
```
Generates worksheets in `floorplan/.cache/worksheets/` and description skeletons in `floorplan/descriptions/`. Fill in human-readable names and one-line summaries for files and routes (see [references/writing-descriptions.md](references/writing-descriptions.md)). Run `build.mjs` again to compile them into the graph.

### 7. Highlight Recent Work
```bash
node <skill_dir>/scripts/recent.mjs <root>
```
Shows files and routes changed in recent commits or currently uncommitted. Write `floorplan/recent-work.json` explaining *why* those changes were made. Run `build.mjs` to highlight them on the map.

### 8. Open Map & Report
```bash
node <skill_dir>/scripts/open.mjs <root>
```
Starts the local server in the background and opens `floorplan/index.html` in the user's browser.

**Report to the user:**
- Provide the map URL (e.g. `http://127.0.0.1:4378`).
- Summarize the architecture in 3–5 lines.
- Highlight any **high-severity Health issues** (exposed secrets, unauthenticated endpoints).
- Remind the user that cards have copyable **Fix with Antigravity** prompts and that asking questions can be done directly in their Antigravity chat.

`


# scripts/install.mjs

`javascript
#!/usr/bin/env node
// Install Floorplan as an Antigravity skill (globally or per-workspace)
// usage:
//   npx floorplan-antigravity install [--workspace]
//   npx floorplan-antigravity uninstall [--workspace]

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const args = process.argv.slice(2);
const isWorkspace = args.includes('--workspace') || args.includes('-w') || args.includes('--local');
const isUninstall = args.includes('--uninstall') || args.includes('uninstall');

const targetDir = isWorkspace
  ? path.resolve(process.cwd(), '.agent', 'skills', 'floorplan-antigravity')
  : path.join(os.homedir(), '.gemini', 'config', 'skills', 'floorplan-antigravity');

if (isUninstall) {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`✓ Uninstalled Floorplan for Antigravity from:\n  ${targetDir}\n`);
  } else {
    console.log(`ℹ Floorplan is not installed at:\n  ${targetDir}\n`);
  }
  process.exit(0);
}

try {
  let version = '';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    version = pkg.version ? `v${pkg.version}` : '';
  } catch {}

  const isUpdate = fs.existsSync(path.join(targetDir, 'SKILL.md'));
  fs.mkdirSync(targetDir, { recursive: true });

  const items = ['SKILL.md', 'package.json', 'scripts', 'assets', 'references'];
  for (const item of items) {
    const src = path.join(ROOT, item);
    const dest = path.join(targetDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
    }
  }

  console.log(`\n✓ Successfully ${isUpdate ? 'updated' : 'installed'} Floorplan for Antigravity ${version}!`.trim());
  console.log(`  Location: ${targetDir}`);
  console.log(`  Scope:    ${isWorkspace ? 'Current Workspace (.agent/skills)' : 'Global (~/.gemini/config/skills)'}`);
  console.log(`\nYou can now ask Antigravity in chat:`);
  console.log(`  • "Make me a floorplan of this codebase"`);
  console.log(`  • "Refresh the floorplan with recent git changes"`);
  console.log(`  • "Draw a blueprint floorplan from this PRD"\n`);
} catch (err) {
  console.error(`✗ Installation failed: ${err.message}`);
  process.exit(1);
}


`


# scripts/serve.mjs

`javascript
#!/usr/bin/env node
// Run the floorplan server in the foreground for CLI / webviews
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { parseArgs, mapDir } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const dir = mapDir(root);
const serveFile = path.join(dir, 'serve.mjs');

if (!fs.existsSync(serveFile) || !fs.existsSync(path.join(dir, 'index.html'))) {
  console.error('✗ No built map found. Run "npx floorplan-antigravity build" first.');
  process.exit(1);
}

const pass = ['port'].flatMap((k) => (args[k] ? ['--' + k, String(args[k])] : []));
if (args['no-open']) pass.push('--no-open');

console.log('Starting Floorplan server in foreground (Ctrl+C to stop)...');
const child = spawn(process.execPath, [serveFile, ...pass], {
  cwd: root,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 0));

`


# scripts/build.mjs

`javascript
#!/usr/bin/env node
// floorplan builder: validate floorplan/architecture.json against the scan, assign every file to a
// node, attach import/HTTP/external edges, and write floorplan/graph.json + floorplan/index.html.
//
// usage: node build.mjs [root] [--arch <file>] [--scan <file>] [--out <dir>] [--check]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileGlob, parseArgs, fmtNum, mapDir, keepOutOfGit } from './lib/common.mjs';
import { fallbackFileName, fallbackRouteName, routeKey } from './lib/names.mjs';
import { buildHealth, withDismissed, dismissalFor } from './lib/health.mjs';
import { buildPlanHealth } from './lib/blueprint.mjs';
import { buildScreens } from './lib/screens.mjs';
import { detectAgent } from './lib/agent.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(HERE, '..');
const args = parseArgs(process.argv.slice(2));
const agent = detectAgent(args);
const root = path.resolve(args._[0] || '.');
const outDir = path.resolve(args.out || mapDir(root));
const archFile = path.resolve(args.arch || path.join(outDir, 'architecture.json'));
const scanFile = path.resolve(args.scan || path.join(outDir, '.cache', 'scan.json'));

export const NODE_KINDS = ['ui', 'service', 'worker', 'library', 'feature', 'data', 'config', 'test', 'script', 'infra', 'external'];
export const EDGE_KINDS = ['import', 'call', 'http', 'rpc', 'event', 'queue', 'data', 'config'];

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
if (!fs.existsSync(scanFile)) fail(`No scan at ${scanFile}. Run: node ${path.join(SKILL_DIR, 'scripts', 'scan.mjs')} "${root}"`);
if (!fs.existsSync(archFile)) fail(`No architecture file at ${archFile}. Write it first (see references/schema.md).`);
const scan = JSON.parse(fs.readFileSync(scanFile, 'utf8'));
let arch;
try { arch = JSON.parse(fs.readFileSync(archFile, 'utf8')); } catch (e) { fail(`architecture.json is not valid JSON: ${e.message}`); }

// ---------- validate shape ----------
const isStr = (v) => typeof v === 'string' && v.length > 0;
const isStrArr = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');
function closest(word, options) {
  let best = null, bestD = Infinity;
  for (const o of options) {
    const d = lev(word, o);
    if (d < bestD) { bestD = d; best = o; }
  }
  return bestD <= Math.max(2, word.length / 3) ? best : null;
}
function lev(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= b.length; j++) { const tmp = dp[j]; dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; }
  }
  return dp[b.length];
}
const didYouMean = (w, opts) => { const c = closest(w, opts); return c ? ` — did you mean "${c}"?` : ''; };

if (!arch || typeof arch !== 'object') fail('architecture.json must be an object');
if (!arch.project || !isStr(arch.project.name)) err('project.name is required');
if (!Array.isArray(arch.nodes) || !arch.nodes.length) err('nodes must be a non-empty array');
const nodes = Array.isArray(arch.nodes) ? arch.nodes : [];
const archEdges = Array.isArray(arch.edges) ? arch.edges : [];
const flows = Array.isArray(arch.flows) ? arch.flows : [];
const annotations = Array.isArray(arch.annotations) ? arch.annotations : [];
const include = isStrArr(arch.include) ? arch.include : ['code'];
const ignoreGlobs = (isStrArr(arch.ignore) ? arch.ignore : []).map(compileGlob);
// who the descriptions are written for: "everyone" (plain language, default) or "developers"
const AUDIENCES = ['everyone', 'developers'];
if (arch.audience !== undefined && !AUDIENCES.includes(arch.audience)) err(`audience "${arch.audience}" must be one of ${AUDIENCES.join(', ')}${didYouMean(String(arch.audience), AUDIENCES)}`);
const audience = AUDIENCES.includes(arch.audience) ? arch.audience : 'everyone';

const byId = new Map();
nodes.forEach((n, i) => {
  const where = `nodes[${i}]${n?.id ? ` ("${n.id}")` : ''}`;
  if (!n || typeof n !== 'object') return err(`${where} must be an object`);
  if (!isStr(n.id)) return err(`${where}.id is required`);
  if (!/^[A-Za-z0-9_.\-]+$/.test(n.id)) err(`${where}.id may only use letters, digits, "_", "-" and "."`);
  if (n.id === 'unassigned') err(`${where}.id "unassigned" is reserved`);
  if (byId.has(n.id)) err(`${where}.id duplicates an earlier node`);
  byId.set(n.id, n);
  if (!isStr(n.label)) err(`${where}.label is required`);
  if (!NODE_KINDS.includes(n.kind)) err(`${where}.kind "${n.kind}" must be one of ${NODE_KINDS.join(', ')}${didYouMean(String(n.kind), NODE_KINDS)}`);
  for (const k of ['paths', 'exclude', 'packages', 'hosts', 'tags']) if (n[k] !== undefined && !isStrArr(n[k])) err(`${where}.${k} must be an array of strings`);
  if (n.kind === 'external' && n.paths?.length) warn(`${where} is external but has paths; external nodes normally own no files`);
});
const ids = [...byId.keys()];
for (const n of nodes) {
  if (n?.parent === undefined) continue;
  if (!byId.has(n.parent)) err(`node "${n.id}".parent "${n.parent}" does not exist${didYouMean(n.parent, ids)}`);
}
// cycles + depth
const depthOf = new Map();
const depth = (id, seen = new Set()) => {
  if (depthOf.has(id)) return depthOf.get(id);
  if (seen.has(id)) { err(`node "${id}" is part of a parent cycle`); return 0; }
  seen.add(id);
  const n = byId.get(id);
  const d = n?.parent && byId.has(n.parent) ? depth(n.parent, seen) + 1 : 0;
  depthOf.set(id, d);
  return d;
};
ids.forEach((id) => depth(id));

// ---------- files ----------
const filesAll = scan.files;
const fileByPath = new Map(filesAll.map((f) => [f.path, f]));
const included = filesAll.filter((f) => include.includes(f.category) && !ignoreGlobs.some((g) => g.test(f.path)));
const includedSet = new Set(included.map((f) => f.path));

// ---------- assign files to nodes ----------
// A node's `exclude` also applies to its descendants, so "web excludes tests" holds all the way down.
const inheritedExcludes = (n, seen = new Set()) => {
  if (!n || seen.has(n.id)) return [];
  seen.add(n.id);
  return [...(isStrArr(n.exclude) ? n.exclude : []), ...(n.parent ? inheritedExcludes(byId.get(n.parent), seen) : [])];
};
const matchers = nodes.filter((n) => n?.id && isStrArr(n.paths ?? [])).map((n, order) => ({
  id: n.id, order, depth: depthOf.get(n.id) || 0,
  paths: (n.paths || []).map(compileGlob), exclude: inheritedExcludes(n).map(compileGlob), hits: new Array((n.paths || []).length).fill(0),
}));
const owner = new Map();
let ambiguous = 0;
const ambiguousEx = [];
for (const f of included) {
  let best = null, bestKey = null, tie = null;
  for (const m of matchers) {
    if (m.exclude.some((g) => g.test(f.path))) continue;
    let spec = -1;
    m.paths.forEach((g, i) => { if (g.test(f.path)) { m.hits[i]++; spec = Math.max(spec, g.specificity); } });
    if (spec < 0) continue;
    const key = [m.depth, spec];
    if (!best || key[0] > bestKey[0] || (key[0] === bestKey[0] && key[1] > bestKey[1])) { best = m; bestKey = key; tie = null; }
    else if (key[0] === bestKey[0] && key[1] === bestKey[1]) tie = m.id;
  }
  if (tie) { ambiguous++; if (ambiguousEx.length < 3) ambiguousEx.push(`${f.path} (${best.id} vs ${tie})`); }
  owner.set(f.path, best ? best.id : 'unassigned');
}
for (const m of matchers) m.hits.forEach((h, i) => { if (!h) warn(`node "${m.id}" path "${m.paths[i].glob}" matches no included file`); });
if (ambiguous) warn(`${ambiguous} file(s) matched two sibling nodes equally; the first declared won. Make globs more specific or add an exclude. e.g. ${ambiguousEx.join('; ')}`);

// ---------- endpoints ----------
const resolveEndpoint = (ref, where) => {
  if (!isStr(ref)) { err(`${where} must be a node id or file path`); return null; }
  if (byId.has(ref)) return `n:${ref}`;
  const p = ref.replace(/^file:/, '');
  if (includedSet.has(p)) return `f:${p}`;
  if (fileByPath.has(p)) { err(`${where} "${ref}" is a file that is not included (category ${fileByPath.get(p).category}); point at its node instead`); return null; }
  err(`${where} "${ref}" is neither a node id nor a scanned file${didYouMean(ref, ids)}`);
  return null;
};

// ---------- links ----------
const links = new Map(); // key -> link
const addLink = (a, b, k, extra = {}) => {
  if (!a || !b || a === b) return;
  const key = `${a}|${b}|${k}`;
  let l = links.get(key);
  if (!l) { l = { a, b, k, w: 0 }; links.set(key, l); }
  l.w += extra.w || 1;
  if (extra.names?.length) l.names = [...new Set([...(l.names || []), ...extra.names])].slice(0, 40);
  if (extra.label) { l.labels = l.labels || []; if (!l.labels.includes(extra.label) && l.labels.length < 40) l.labels.push(extra.label); }
  if (extra.inferred) l.inferred = true;
  if (extra.desc) l.desc = extra.desc;
  if (extra.route !== undefined) { l.calls = l.calls || []; if (l.calls.length < 80) l.calls.push([extra.route, extra.callLine || 0]); }
};

// ---------- routes ----------
const routeIdx = new Map();
const routesIn = scan.routes.filter((r) => includedSet.has(r.file));
routesIn.forEach((r, i) => routeIdx.set(`${r.file}|${r.method}|${r.path}`, i));

for (const e of scan.edges) if (includedSet.has(e.from) && includedSet.has(e.to)) addLink(`f:${e.from}`, `f:${e.to}`, 'import', { w: e.count || 1, names: e.names });
for (const h of scan.http) if (includedSet.has(h.from) && includedSet.has(h.to)) addLink(`f:${h.from}`, `f:${h.to}`, 'http', { label: `${h.method} ${h.path}`, inferred: true, route: routeIdx.get(`${h.to}|${h.method}|${h.path}`), callLine: h.line });

// externals: packages / hosts claimed by nodes
const extIds = scan.externals.map((e) => e.id);
const pkgMatchers = nodes.filter((n) => n?.packages?.length).map((n) => ({ id: n.id, globs: n.packages.map((p) => compileGlob(p.includes(':') ? p : `*:${p}`)), hits: 0 }));
const hostMatchers = nodes.filter((n) => n?.hosts?.length).map((n) => ({ id: n.id, globs: n.hosts.map((h) => compileGlob(h.toLowerCase())), hits: 0 }));
for (const e of scan.extEdges) {
  if (!includedSet.has(e.from)) continue;
  const m = pkgMatchers.find((pm) => pm.globs.some((g) => g.test(e.pkg)));
  if (m) { m.hits++; addLink(`f:${e.from}`, `n:${m.id}`, 'import', { w: e.count, names: [e.pkg.split(':')[1]] }); }
}
for (const h of scan.hosts) {
  if (!includedSet.has(h.from)) continue;
  const m = hostMatchers.find((hm) => hm.globs.some((g) => g.test(h.host)));
  if (m) { m.hits++; addLink(`f:${h.from}`, `n:${m.id}`, 'http', { label: h.host, inferred: true }); }
}
for (const pm of pkgMatchers) if (!pm.hits) warn(`node "${pm.id}" packages match nothing imported. Known: ${extIds.slice(0, 8).join(', ')}…`);
for (const hm of hostMatchers) if (!hm.hits) warn(`node "${hm.id}" hosts match no host called from code`);

// a blueprint's planned links from files to outside services and data stores (plan.json "services"/"data")
for (const e of scan.nodeLinks || []) {
  if (!includedSet.has(e.from)) continue;
  if (!byId.has(e.to)) { err(`plan.json: "${e.from}" names "${e.to}" in its ${e.kind === 'data' ? 'data' : 'services'}, which is not a node id in architecture.json${didYouMean(e.to, ids)}`); continue; }
  addLink(`f:${e.from}`, `n:${e.to}`, EDGE_KINDS.includes(e.kind) ? e.kind : 'call', { label: e.label });
}

archEdges.forEach((e, i) => {
  const where = `edges[${i}]`;
  if (!EDGE_KINDS.includes(e?.kind)) err(`${where}.kind "${e?.kind}" must be one of ${EDGE_KINDS.join(', ')}${didYouMean(String(e?.kind), EDGE_KINDS)}`);
  const a = resolveEndpoint(e?.from, `${where}.from`);
  const b = resolveEndpoint(e?.to, `${where}.to`);
  if (a && b && EDGE_KINDS.includes(e.kind)) addLink(a, b, e.kind, { label: e.label, desc: e.description, w: 1 });
});

// ---------- flows + annotations ----------
const outFlows = [];
flows.forEach((fl, i) => {
  const where = `flows[${i}]`;
  if (!isStr(fl?.id) || !isStr(fl?.title)) err(`${where} needs id and title`);
  if (!Array.isArray(fl?.steps) || fl.steps.length < 2) { err(`${where}.steps needs at least 2 steps`); return; }
  const steps = fl.steps.map((s, j) => ({ ref: resolveEndpoint(s?.node, `${where}.steps[${j}].node`), note: s?.note || '' }));
  outFlows.push({ id: fl.id, title: fl.title, description: fl.description || '', steps });
});
// Flows people requested from the map (saved by serve.mjs). Steps use stable refs —
// "route:METHOD /path" and "sym:<file>#<name>" — so they survive rebuilds; stale steps are dropped.
const customFile = path.join(outDir, 'custom-flows.json');
if (fs.existsSync(customFile)) {
  let custom = [];
  try { custom = JSON.parse(fs.readFileSync(customFile, 'utf8')).flows || []; } catch (e) { warn(`custom-flows.json is not valid JSON: ${e.message}`); }
  const routeAt = new Map(routesIn.map((r, i) => [routeKey(r), i]));
  const resolveStep = (ref) => {
    if (typeof ref !== 'string') return null;
    if (ref.startsWith('route:')) { const i = routeAt.get(ref.slice(6)); return i == null ? null : `r:${i}`; }
    if (ref.startsWith('sym:')) {
      const [p, name] = [ref.slice(4, ref.lastIndexOf('#')), ref.slice(ref.lastIndexOf('#') + 1)];
      const i = (fileByPath.get(p)?.symbols || []).findIndex((s) => s.name === name);
      return includedSet.has(p) && i >= 0 ? `s:${p}#${i}` : null;
    }
    if (ref.startsWith('n:')) return byId.has(ref.slice(2)) ? ref : null;
    if (ref.startsWith('f:')) return includedSet.has(ref.slice(2)) ? ref : null;
    return null;
  };
  let dropped = 0;
  for (const fl of custom) {
    const steps = (fl.steps || []).map((s) => ({ ref: resolveStep(s.ref), note: s.note || '' })).filter((s) => s.ref);
    dropped += (fl.steps || []).length - steps.length;
    if (steps.length >= 2 && isStr(fl.id) && !outFlows.some((x) => x.id === fl.id)) outFlows.push({ id: fl.id, title: fl.title || 'Flow', description: fl.description || '', steps, custom: true });
  }
  if (dropped) warn(`${dropped} step(s) in custom-flows.json point at code that no longer exists and were left out.`);
}
// "Start here" tour: 3-8 narrated stops (node id or file path), written in architecture.json
const outTour = [];
if (arch.tour !== undefined) {
  if (!Array.isArray(arch.tour)) err('tour must be an array of { node, title, note }');
  else arch.tour.forEach((s, i) => {
    const ref = resolveEndpoint(s?.node, `tour[${i}].node`);
    if (ref) outTour.push({ ref, title: isStr(s.title) ? s.title : '', note: isStr(s.note) ? s.note : '' });
  });
}
// "Recent work": what was just changed, per task, framed against what the user asked for
// (floorplan/recent-work.json, rewritten on every make/update). Stale refs are warnings, never errors.
let outRecent = null;
const recentFile = path.join(outDir, 'recent-work.json');
if (fs.existsSync(recentFile)) {
  let rw = null;
  try { rw = JSON.parse(fs.readFileSync(recentFile, 'utf8')); } catch (e) { warn(`recent-work.json is not valid JSON: ${e.message}`); }
  const routeIdx = new Map(routesIn.map((r, i) => [routeKey(r), i]));
  const resolveRecent = (ref) => {
    if (!isStr(ref)) return null;
    const s = ref.trim().replace(/^\.\//, '').replace(/^(route:|file:)/, '');
    if (/^n:/.test(s)) return byId.has(s.slice(2)) ? s : null;
    if (/^f:/.test(s)) return includedSet.has(s.slice(2)) ? s : null;
    if (byId.has(s)) return 'n:' + s;
    if (includedSet.has(s)) return 'f:' + s;
    const m = /^([A-Za-z]+)\s+(\/\S*)$/.exec(s);
    if (m && routeIdx.has(`${m[1].toUpperCase()} ${m[2]}`)) return `r:${routeIdx.get(`${m[1].toUpperCase()} ${m[2]}`)}`;
    return null;
  };
  if (rw && !Array.isArray(rw.tasks)) warn('recent-work.json needs a "tasks" array (an empty one clears the highlights)');
  else if (rw) {
    const tasks = [], items = [], missing = [];
    rw.tasks.forEach((t, ti) => {
      if (!isStr(t?.title)) return warn(`recent-work.json tasks[${ti}] needs a title`);
      tasks.push({ title: t.title, request: isStr(t.request) ? t.request : '', summary: isStr(t.summary) ? t.summary : '', ...(isStr(t.status) ? { status: t.status } : {}) });
      for (const it of Array.isArray(t.items) ? t.items : []) {
        const id = resolveRecent(it?.ref);
        if (!id) { missing.push(it?.ref); continue; }
        items.push({ id, task: tasks.length - 1, change: it.change === 'new' ? 'new' : 'changed', note: isStr(it.note) ? it.note : '' });
      }
    });
    if (missing.length) warn(`recent-work.json: ${missing.length} ref(s) aren't on the map and were left out (use a file path, a node id or "METHOD /path"): ${missing.slice(0, 5).map(String).join(', ')}${missing.length > 5 ? '…' : ''}`);
    outRecent = { updatedAt: isStr(rw.updatedAt) ? rw.updatedAt : fs.statSync(recentFile).mtime.toISOString(), tasks, items };
  }
}
const notes = new Map();
annotations.forEach((a, i) => {
  if (!isStr(a?.path) || !isStr(a?.note)) return err(`annotations[${i}] needs path and note`);
  if (!includedSet.has(a.path)) return err(`annotations[${i}].path "${a.path}" is not an included file`);
  notes.set(a.path, { note: a.note, tags: isStrArr(a.tags) ? a.tags : undefined });
});
for (const ep of arch.project?.entrypoints || []) if (!includedSet.has(ep)) warn(`project.entrypoints "${ep}" is not an included file`);

// ---------- names + descriptions (floorplan/descriptions/*.json) ----------
const descDir = path.join(outDir, 'descriptions');
const fileDesc = new Map(), routeDesc = new Map();
const routeKeys = new Set(routesIn.map(routeKey));
let staleFiles = 0, staleRoutes = 0;
const staleEx = [];
if (fs.existsSync(descDir)) {
  for (const name of fs.readdirSync(descDir).filter((n) => n.endsWith('.json')).sort()) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(descDir, name), 'utf8')); } catch (e) { err(`descriptions/${name} is not valid JSON: ${e.message}`); continue; }
    for (const [p, v] of Object.entries(d.files || {})) {
      if (!v || typeof v !== 'object') { err(`descriptions/${name}: files["${p}"] must be { name, description }`); continue; }
      if (!includedSet.has(p)) { staleFiles++; if (staleEx.length < 3) staleEx.push(p); continue; }
      fileDesc.set(p, { name: isStr(v.name) ? v.name.trim() : null, d: isStr(v.description) ? v.description.trim() : null, review: isStr(v.review) ? v.review : null });
    }
    for (const [k, v] of Object.entries(d.routes || {})) {
      if (!v || typeof v !== 'object') { err(`descriptions/${name}: routes["${k}"] must be { name, description }`); continue; }
      if (!routeKeys.has(k)) { staleRoutes++; continue; }
      routeDesc.set(k, { name: isStr(v.name) ? v.name.trim() : null, d: isStr(v.description) ? v.description.trim() : null, review: isStr(v.review) ? v.review : null });
    }
  }
}
if (staleFiles) warn(`${staleFiles} described file(s) no longer exist or aren't included (e.g. ${staleEx.join(', ')}). Remove them from descriptions/.`);
if (staleRoutes) warn(`${staleRoutes} described route(s) no longer match a route in the scan; remove or re-key them.`);

// ---------- stats ----------
const unassigned = included.filter((f) => owner.get(f.path) === 'unassigned');
const stats = new Map([...ids, 'unassigned'].map((id) => [id, { files: 0, loc: 0, langs: {}, repos: new Set() }]));
for (const f of included) {
  let id = owner.get(f.path);
  while (id) {
    const s = stats.get(id);
    s.files++; s.loc += f.loc; s.langs[f.lang || f.category] = (s.langs[f.lang || f.category] || 0) + f.loc;
    if (f.repo !== null) s.repos.add(f.repo);
    id = id === 'unassigned' ? null : byId.get(id)?.parent;
  }
}

// ---------- report ----------
const pct = included.length ? (unassigned.length / included.length) * 100 : 0;
const report = [];
if (errors.length) {
  report.push(`✗ ${errors.length} error(s) in ${path.relative(root, archFile)}${scan.blueprint ? ' or plan.json' : ''}:`);
  for (const e of errors) report.push(`  - ${e}`);
}
if (warnings.length) {
  report.push(`! ${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 40)) report.push(`  - ${w}`);
}
report.push('');
report.push(`ASSIGNMENT  ${included.length} files (${include.join('+')}), ${unassigned.length} unassigned (${pct.toFixed(1)}%)`);
for (const n of nodes.filter((n) => n?.id && !n.parent)) {
  const s = stats.get(n.id);
  report.push(`  ${n.id.padEnd(28)} ${String(s.files).padStart(5)} files ${scan.blueprint ? '' : `${fmtNum(s.loc).padStart(6)} loc  `}[${n.kind}]`);
}
if (unassigned.length) {
  const byDir = new Map();
  for (const f of unassigned) { const d = f.path.split('/').slice(0, -1).join('/') || '.'; byDir.set(d, (byDir.get(d) || 0) + 1); }
  report.push(`  unassigned, by directory:`);
  for (const [d, c] of [...byDir.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) report.push(`    ${String(c).padStart(4)}  ${d}/`);
}
const byKind = {};
for (const l of links.values()) byKind[l.k] = (byKind[l.k] || 0) + 1;
report.push(`LINKS  ${[...links.values()].length} (${Object.entries(byKind).map(([k, v]) => `${k} ${v}`).join(', ')})`);
const describedFiles = included.filter((f) => fileDesc.get(f.path)?.d || f.desc).length;
const describedRoutes = routesIn.filter((r) => routeDesc.get(routeKey(r))?.d || r.desc).length;
const noSummary = nodes.filter((n) => n?.id && !isStr(n.summary)).map((n) => n.id);
const reviewCount = [...fileDesc.values(), ...routeDesc.values()].filter((d) => d.review).length;
report.push(`DESCRIPTIONS  files ${describedFiles}/${included.length} · routes ${describedRoutes}/${routesIn.length} · modules ${nodes.length - noSummary.length}/${nodes.length}${reviewCount ? ` · ${reviewCount} need review (code changed)` : ''}`);
if (noSummary.length) report.push(`  modules without a summary: ${noSummary.slice(0, 12).join(', ')}${noSummary.length > 12 ? '…' : ''}`);
if (describedFiles < included.length || describedRoutes < routesIn.length || reviewCount) report.push(`  Run describe.mjs to get worksheets for the ${included.length - describedFiles} file(s) and ${routesIn.length - describedRoutes} route(s) still missing descriptions.`);

if (errors.length) { console.log(report.join('\n')); console.log('\nFix the errors above and run build again.'); process.exit(1); }
if (args.check) { console.log(report.join('\n')); process.exit(0); }

// ---------- write graph.json + index.html ----------
const graph = {
  schema: 'floorplan/graph@1',
  meta: {
    generatedAt: new Date().toISOString(), scanAt: scan.generatedAt, rootName: scan.rootName, root: scan.root,
    audience, agent,
    ...(scan.blueprint ? { blueprint: { source: scan.blueprint.source, stack: scan.blueprint.stack, assumptions: scan.blueprint.assumptions } } : {}),
    repos: scan.repos.map(({ path: p, name, branch, head, remote }) => ({ path: p, name, branch, head, remote })),
    counts: { files: included.length, loc: included.reduce((s, f) => s + f.loc, 0), unassigned: unassigned.length },
  },
  project: arch.project,
  nodes: [
    ...nodes.map((n) => ({
      id: n.id, parent: n.parent || null, label: n.label, kind: n.kind, summary: n.summary || '', details: n.details || '',
      tags: n.tags || [], paths: n.paths || [], packages: n.packages || [], hosts: n.hosts || [],
      stats: { ...stats.get(n.id), repos: [...stats.get(n.id).repos] },
    })),
    ...(unassigned.length ? [{ id: 'unassigned', parent: null, label: 'Unassigned', kind: 'misc', summary: 'Files no node claims. Add globs in architecture.json to place them.', details: '', tags: [], paths: [], packages: [], hosts: [], stats: { ...stats.get('unassigned'), repos: [...stats.get('unassigned').repos] } }] : []),
  ],
  files: included.map((f) => {
    const d = fileDesc.get(f.path);
    return {
      p: f.path, n: owner.get(f.path), r: f.repo, l: f.lang || f.category, loc: f.loc,
      name: d?.name || f.name || fallbackFileName(f.path), d: d?.d || f.desc || f.doc || '', ...(d?.d || f.desc ? {} : { auto: true }),
      ...(f.doc ? { doc: f.doc } : {}),
      ...(f.tooLarge ? { tooLarge: true } : {}),
      ...(d?.review ? { review: d.review } : {}),
      ...(f.h ? { h: f.h, sig: f.sig } : {}),
      ...(f.symbols ? { s: f.symbols.map((s) => [s.name, s.kind, s.line, s.default ? 1 : 0, s.doc || '']) } : {}),
      ...(notes.has(f.path) ? notes.get(f.path) : {}),
    };
  }),
  routes: routesIn.map((r) => {
    const d = routeDesc.get(routeKey(r));
    return { f: r.file, m: r.method, p: r.path, l: r.line, h: r.handler || null, name: d?.name || r.name || fallbackRouteName(r), d: d?.d || r.desc || r.doc || '', ...(d?.d || r.desc ? {} : { auto: true }), ...(d?.review ? { review: d.review } : {}), ...(r.doc ? { doc: r.doc } : {}), ...(r.access ? { access: r.access } : {}), ...(r.who ? { who: r.who } : {}), ...(r.publicBecause ? { publicBecause: r.publicBecause } : {}) };
  }),
  links: [...links.values()],
  flows: outFlows,
  tour: outTour,
  ...(outRecent?.items.length ? { recent: outRecent } : {}),
};
// extension hooks, computed from the finished graph plus the raw scan
// a blueprint has no code to check, so its Health is a design review of the plan (computed after screens)
if (!scan.blueprint) try { graph.health = buildHealth({ graph, scan, arch, root }); } catch (e) { warn(`health check failed: ${e.message}`); graph.health = { issues: [] }; }
try { graph.screens = buildScreens({ graph, scan, arch, root }); } catch (e) { warn(`screen detection failed: ${e.message}`); graph.screens = []; }
if (scan.blueprint) try { graph.health = buildPlanHealth({ graph, scan }); } catch (e) { warn(`design review failed: ${e.message}`); graph.health = { issues: [] }; }
// issues people marked "not a problem" on the map (saved by serve.mjs) stay listed, set apart, and leave the counts
const dismissedFile = path.join(outDir, 'health-dismissed.json');
if (graph.health?.issues && fs.existsSync(dismissedFile)) {
  try { graph.health = withDismissed(graph.health, JSON.parse(fs.readFileSync(dismissedFile, 'utf8')).dismissed); } catch (e) { warn(`health-dismissed.json is not valid JSON: ${e.message}`); }
}
fs.mkdirSync(outDir, { recursive: true });
const trackedWarning = keepOutOfGit(outDir);
fs.writeFileSync(path.join(outDir, 'graph.json'), JSON.stringify(graph, null, 0));

const template = fs.readFileSync(path.join(SKILL_DIR, 'assets', 'viewer.html'), 'utf8');
// The layout engine (elkjs 0.9.3) and fonts (Inter, JetBrains Mono) are bundled in assets/vendor/ and
// inlined, so the map makes no outside requests and works offline.
const vendor = path.join(SKILL_DIR, 'assets', 'vendor');
const elkTag = `<script>${fs.readFileSync(path.join(vendor, 'elk.bundled.js'), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`;
const FONT_RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
};
const fontCss = [['Inter', 'inter'], ['JetBrains Mono', 'jetbrains-mono']].flatMap(([family, file]) => Object.entries(FONT_RANGES).map(([subset, range]) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:100 900;unicode-range:${range};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(vendor, 'fonts', `${file}-${subset}-wght-normal.woff2`)).toString('base64')}) format("woff2")}`)).join('\n');
const graphQuery = fs.readFileSync(path.join(SKILL_DIR, 'assets', 'graph-query.js'), 'utf8');
const page = (g) => template
  .replace('/*__GRAPH_QUERY__*/', () => graphQuery.replace(/<\/script/gi, '<\\/script'))
  .replace('<!--__ELK_SCRIPT__-->', () => elkTag)
  .replace('/*__FONTS__*/', () => fontCss)
  .replace('/*__FLOORPLAN_DATA__*/null', () => JSON.stringify(g).replace(/<\/(script)/gi, '<\\/$1').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'))
  .replace(/__FLOORPLAN_TITLE__/g, () => escapeHtml(`${arch.project.name} map`))
  .replace(/__FLOORPLAN_LOGO__/g, () => dataUri('logo.png'))
  .replace(/__FLOORPLAN_FAVICON__/g, () => dataUri('favicon.png'))
  .replace('<!--__UI_EXTENSIONS__-->', () => uiScripts);
const uiDir = path.join(SKILL_DIR, 'assets', 'ui');
const uiScripts = fs.existsSync(uiDir) ? fs.readdirSync(uiDir).filter((n) => n.endsWith('.js')).sort().map((n) => `<script>/* ui/${n} */\n${fs.readFileSync(path.join(uiDir, n), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`).join('\n') : '';
const html = page(graph);
fs.writeFileSync(path.join(outDir, 'index.html'), html);
// Self-contained helpers next to the map: live-reloading (serve.mjs)
// and graph lookups (query.mjs). They need only Node, not this skill.
fs.writeFileSync(path.join(outDir, 'query.mjs'), `${graphQuery}
// ---- cli ----
${fs.readFileSync(path.join(SKILL_DIR, 'assets', 'query-cli.mjs'), 'utf8')}`);
fs.copyFileSync(path.join(SKILL_DIR, 'assets', 'serve.mjs'), path.join(outDir, 'serve.mjs'));
// a blueprint can be changed from the map: serve.mjs redraws it with this skill's plan.mjs and build.mjs
if (scan.blueprint) { fs.mkdirSync(path.join(outDir, '.cache'), { recursive: true }); fs.writeFileSync(path.join(outDir, '.cache', 'skill.json'), JSON.stringify({ dir: SKILL_DIR })); }
// the logo and tab icon are inlined so the map stays one self-contained file
function dataUri(name) { return 'data:image/png;base64,' + fs.readFileSync(path.join(SKILL_DIR, 'assets', name)).toString('base64'); }
function escapeHtml(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

const hs = graph.health?.summary;
if (hs && (hs.high || hs.medium || hs.low)) {
  report.push(`${scan.blueprint ? 'DESIGN REVIEW' : 'HEALTH'}  ${hs.high} important · ${hs.medium} worth fixing · ${hs.low} minor`);
  for (const i of graph.health.issues.filter((x) => x.severity !== 'low' && !dismissalFor(x, graph.health.dismissed)).slice(0, 8)) report.push(`  [${i.severity}] ${i.title}`);
}
if (graph.screens?.length) report.push(`SCREENS  ${graph.screens.length} detected`);
report.push(graph.recent
  ? `RECENT WORK  ${graph.recent.items.length} card(s) highlighted across ${graph.recent.tasks.length} task(s)`
  : `RECENT WORK  none highlighted${fs.existsSync(recentFile) ? '' : ' (no recent-work.json)'}`);
report.push(`AGENT  ${agent}`);
if (scan.blueprint) report.push('BLUEPRINT  planned, not built yet: drawn from floorplan/plan.json');
console.log(report.join('\n'));

`


# scripts/describe.mjs

`javascript
#!/usr/bin/env node
// floorplan describer: turn the built graph into per-module worksheets that Antigravity (or parallel
// subagents) uses to write a human-readable name + one-line description for every file and route.
//
// usage: node describe.mjs [root]                  write worksheets + description skeletons, print an index
//        node describe.mjs [root] --all            include entries that already have descriptions
//        node describe.mjs [root] --max-files 40   files per worksheet before splitting into parts
//
// Run build.mjs first: worksheets are generated from floorplan/graph.json.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, fmtNum, mapDir } from './lib/common.mjs';
import { fallbackFileName, fallbackRouteName, routeKey } from './lib/names.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const outDir = mapDir(root);
const graphFile = path.join(outDir, 'graph.json');
if (!fs.existsSync(graphFile)) { console.error('✗ No floorplan/graph.json. Run build.mjs first.'); process.exit(1); }
const g = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
const maxFiles = Number(args['max-files']) || 40;
const wsDir = path.join(outDir, '.cache', 'worksheets');
const descDir = path.join(outDir, 'descriptions');
fs.mkdirSync(wsDir, { recursive: true });
fs.mkdirSync(descDir, { recursive: true });
for (const f of fs.readdirSync(wsDir)) fs.unlinkSync(path.join(wsDir, f));

const nodes = new Map(g.nodes.map((n) => [n.id, n]));
const fileByPath = new Map(g.files.map((f) => [f.p, f]));
const label = (id) => nodes.get(id)?.label || id;
// Who the map is written for (architecture.json "audience", copied into graph.meta by build.mjs).
const audience = g.meta?.audience === 'developers' ? 'developers' : 'everyone';
const STYLE = audience === 'developers'
  ? 'technical style for engineers: name the frameworks, patterns and mechanics where they help.'
  : 'plain language for a non-technical owner: what it does for the business or its users, in everyday words, still specific. No jargon (endpoint, ORM, blueprint, webhook, worker…): the path and method/URL are already shown next to it. See "Plain language" in references/writing-descriptions.md.';

// file -> neighbours, summarised by owning node
const usesOf = new Map(), usedBy = new Map();
const bump = (m, k, v) => { if (!m.has(k)) m.set(k, new Map()); m.get(k).set(v, (m.get(k).get(v) || 0) + 1); };
for (const l of g.links) {
  if (!l.a.startsWith('f:')) continue;
  const a = l.a.slice(2);
  const bNode = l.b.startsWith('f:') ? fileByPath.get(l.b.slice(2))?.n : l.b.slice(2);
  if (bNode) bump(usesOf, a, label(bNode));
  if (l.b.startsWith('f:')) { const aNode = fileByPath.get(a)?.n; if (aNode) bump(usedBy, l.b.slice(2), label(aNode)); }
}
const top = (m, n = 5) => m ? [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, n).map(([k, v]) => `${k}${v > 1 ? ` ×${v}` : ''}`).join(', ') : '';

const routesByFile = new Map();
for (const r of g.routes || []) { if (!routesByFile.has(r.f)) routesByFile.set(r.f, []); routesByFile.get(r.f).push(r); }

const needs = (f) => args.all || f.auto || f.review;
const byNode = new Map();
for (const f of g.files) {
  const rs = routesByFile.get(f.p) || [];
  if (!needs(f) && !rs.some((r) => args.all || r.auto || r.review)) continue;
  if (!byNode.has(f.n)) byNode.set(f.n, []);
  byNode.get(f.n).push(f);
}

const index = [];
for (const [nid, list] of byNode) {
  list.sort((a, b) => a.p.localeCompare(b.p));
  // Split into parts of at most maxFiles files or ~100 routes, whichever comes first.
  const chunks = [[]];
  let routesInChunk = 0;
  for (const f of list) {
    const nr = (routesByFile.get(f.p) || []).length;
    const cur = chunks[chunks.length - 1];
    if (cur.length && (cur.length >= maxFiles || routesInChunk + nr > 100)) { chunks.push([]); routesInChunk = 0; }
    chunks[chunks.length - 1].push(f);
    routesInChunk += nr;
  }
  const parts = chunks.length;
  for (let i = 0; i < parts; i++) {
    const chunk = chunks[i];
    const key = parts > 1 ? `${nid}--${i + 1}` : nid;
    const descFile = path.join(descDir, `${key}.json`);
    const n = nodes.get(nid);
    const out = [];
    out.push(`# Worksheet ${key}: ${n?.label || nid}${parts > 1 ? ` (part ${i + 1}/${parts})` : ''}`);
    out.push(`Audience: ${audience}. Write in ${STYLE}`);
    if (n?.summary) out.push(`Module: ${n.summary}`);
    out.push(`Write to: floorplan/descriptions/${key}.json (a skeleton is already there; fill in every "description", improve every "name").`);
    out.push('Entries marked REVIEW already have a description but their code changed: update name/description if the change matters, then delete the "review" field. Entries not listed here are fine; leave them alone.');
    out.push('');
    let routeCount = 0;
    for (const f of chunk) {
      out.push(`## ${f.p}  (${fmtNum(f.loc)} loc, ${f.l})${f.review ? '  REVIEW' : !needs(f) ? '  (already described; only its routes need work)' : ''}`);
      if (f.review) out.push(`current: ${f.name} — ${f.d}
changed: ${f.review}`);
      if (f.doc) out.push(`doc: ${f.doc}`);
      if (f.s?.length) {
        const syms = f.s.slice(0, 12).map((s) => `${s[0]}${s[1] === 'function' ? '()' : ''}${s[4] ? ` (${s[4]})` : ''}`);
        out.push(`defines: ${syms.join('; ')}${f.s.length > 12 ? `; … +${f.s.length - 12}` : ''}`);
      }
      const u = top(usesOf.get(f.p)), b = top(usedBy.get(f.p));
      if (u) out.push(`uses: ${u}`);
      if (b) out.push(`used by: ${b}`);
      for (const r of routesByFile.get(f.p) || []) {
        routeCount++;
        const mark = r.review ? `  REVIEW (${r.review}); current: ${r.name} — ${r.d}` : r.auto ? '  NEW' : '  (described)';
        out.push(`route: ${routeKey({ method: r.m, path: r.p })}  handler ${r.h || '?'}${r.doc ? ` (${r.doc})` : ''}${mark}`);
      }
      out.push('');
    }
    fs.writeFileSync(path.join(wsDir, `${key}.md`), out.join('\n'));

    // skeleton: keep anything already written, add missing keys
    let existing = {};
    try { existing = JSON.parse(fs.readFileSync(descFile, 'utf8')); } catch {}
    const skel = { files: { ...(existing.files || {}) }, routes: { ...(existing.routes || {}) } };
    for (const f of chunk) {
      if (!skel.files[f.p]) skel.files[f.p] = { name: f.auto ? fallbackFileName(f.p) : f.name, description: f.auto ? '' : f.d };
      for (const r of routesByFile.get(f.p) || []) {
        const k = routeKey({ method: r.m, path: r.p });
        if (!skel.routes[k]) skel.routes[k] = { name: r.auto ? fallbackRouteName({ handler: r.h, method: r.m, path: r.p }) : r.name, description: r.auto ? '' : r.d };
      }
    }
    if (!Object.keys(skel.routes).length) delete skel.routes;
    fs.writeFileSync(descFile, JSON.stringify(skel, null, 2) + '\n');
    index.push({ key, node: n?.label || nid, files: chunk.length, routes: routeCount, loc: chunk.reduce((s, f) => s + f.loc, 0) });
  }
}

if (!index.length) { console.log('✓ Every file and route already has a description. Use --all to regenerate worksheets for everything.'); process.exit(0); }
const totals = index.reduce((s, w) => ({ files: s.files + w.files, routes: s.routes + w.routes }), { files: 0, routes: 0 });
console.log(`${index.length} worksheet(s) in floorplan/.cache/worksheets/ covering ${totals.files} files and ${totals.routes} routes still to describe.`);
console.log('Each has a matching skeleton in floorplan/descriptions/<key>.json. Fill those in, then run build.mjs.');
console.log(`Audience: ${audience}. Write in ${STYLE}\n`);
console.log('key'.padEnd(34) + 'files'.padStart(6) + 'routes'.padStart(8) + 'loc'.padStart(8) + '  module');
for (const w of index.sort((a, b) => b.files - a.files)) console.log(w.key.padEnd(34) + String(w.files).padStart(6) + String(w.routes).padStart(8) + fmtNum(w.loc).padStart(8) + '  ' + w.node);

`


# scripts/open.mjs

`javascript
#!/usr/bin/env node
// Show the map to the user after a build or refresh. Reuses this map's server if it's running (open tabs
// have already reloaded themselves), restarts it if serve.mjs changed, otherwise starts it in the
// background and opens a browser tab. Prints the URL and how to stop it.
// usage: node open.mjs [root] [--no-open] [--port N]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { parseArgs, mapDir } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const dir = mapDir(root);
const serveFile = path.join(dir, 'serve.mjs');
const stateFile = path.join(dir, '.cache', 'server.json');
const rel = path.relative(process.cwd(), dir).replace(/\\/g, '/') || '.';
const IDLE_MINUTES = 120;

if (!fs.existsSync(path.join(dir, 'index.html')) || !fs.existsSync(serveFile)) {
  console.error('✗ No built map here yet. Run build.mjs first.');
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
function openBrowser(u) {
  const [cmd, a] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', u]] : process.platform === 'darwin' ? ['open', [u]] : ['xdg-open', [u]];
  try { spawn(cmd, a, { stdio: 'ignore', detached: true, windowsHide: true }).unref(); return true; } catch { return false; }
}
const hash = crypto.createHash('sha1').update(fs.readFileSync(serveFile)).digest('hex').slice(0, 12);

let s = readState();
let status = s?.pid && alive(s.pid) ? await api(s, '/api/status') : null;
let restarted = false;
const hadTabs = status?.tabs > 0;

if (status && status.hash !== hash) {
  // a newer serve.mjs came with this build: restart so the map gets it; open tabs reconnect and reload
  try { process.kill(s.pid); } catch {}
  for (let i = 0; i < 20 && alive(s.pid); i++) await sleep(150);
  status = null;
  restarted = true;
}

if (!status) {
  const pass = ['port'].flatMap((k) => (args[k] ? ['--' + k, String(args[k])] : []));
  if (!args.port && s?.port) pass.push('--port', String(s.port)); // keep the address people have open
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  const prev = s?.pid;
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '""', '/b', process.execPath, serveFile, '--no-open', '--idle-exit', String(IDLE_MINUTES), ...pass], {
      cwd: root, detached: true, stdio: 'ignore'
    }).unref();
  } else {
    const log = fs.openSync(path.join(dir, '.cache', 'server.log'), 'w');
    spawn(process.execPath, [serveFile, '--no-open', '--idle-exit', String(IDLE_MINUTES), ...pass], {
      cwd: root, detached: true, stdio: ['ignore', log, log], windowsHide: true,
    }).unref();
  }
  // wait for the server to listen
  for (let i = 0; i < 100; i++) {
    await sleep(200);
    const n = readState();
    if (n?.pid && n.pid !== prev && alive(n.pid)) { s = n; status = await api(s, '/api/status'); if (status) break; }
  }
  if (!status) {
    console.error(`✗ The map server didn't start. Its log is in ${rel}/.cache/server.log. The map still opens as a file: ${rel}/index.html`);
    process.exit(1);
  }
  // tabs from before a restart come back on their own within a few seconds
  if (restarted && hadTabs) for (let i = 0; i < 50 && !(status?.tabs > 0); i++) { await sleep(200); status = await api(s, '/api/status'); }
}

const health = await api(s, '/api/health');
let shown;
if (status.tabs > 0) shown = `already open in ${status.tabs === 1 ? 'a browser tab' : status.tabs + ' browser tabs'}, which reloaded with the latest map`;
else if (args['no-open']) shown = 'not opened in a browser (--no-open): open the URL yourself';
else shown = openBrowser(s.url) ? 'opened in the browser' : 'could not open a browser: open the URL yourself';

console.log(`FLOORPLAN  ${s.url}  (${shown})`);
console.log(health?.cli
  ? `ASK  works: questions run through ${health.engine}${health.version ? ' (' + health.version + ')' : ''}`
  : 'ASK  ask questions directly in your Antigravity chat; the map itself works');
console.log(`SERVER  runs in the background, updates open tabs when the map is rebuilt, and stops ${IDLE_MINUTES / 60} hours after the last tab closes. Stop it now: node ${rel}/serve.mjs --stop`);

`


# scripts/plan.mjs

`javascript
#!/usr/bin/env node
// floorplan blueprint: turn floorplan/plan.json (the files, endpoints and connections a system would
// have, planned from a PRD or a description) into floorplan/.cache/scan.json, the same shape scan.mjs
// writes for real code. build.mjs then draws it as a blueprint: the same map, marked as planned.
//
// usage: node plan.mjs [root] [--plan <file>]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, toPosix, mapDir, keepOutOfGit } from './lib/common.mjs';
import { planToScan } from './lib/blueprint.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const outDir = mapDir(root);
const planFile = path.resolve(args.plan || path.join(outDir, 'plan.json'));
const outFile = path.join(outDir, '.cache', 'scan.json');

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
if (!fs.existsSync(planFile)) fail(`No plan at ${planFile}. Write it first (see references/blueprint.md).`);
let plan;
try { plan = JSON.parse(fs.readFileSync(planFile, 'utf8')); } catch (e) { fail(`plan.json is not valid JSON: ${e.message}`); }

const { scan, errors, warnings } = planToScan(plan, root);
// "services" and "data" name nodes in architecture.json: check them now if it's written
const archFile = path.join(outDir, 'architecture.json');
if (scan && fs.existsSync(archFile)) {
  let ids = null;
  try { ids = (JSON.parse(fs.readFileSync(archFile, 'utf8')).nodes || []).map((n) => n?.id).filter(Boolean); } catch {}
  if (ids) for (const l of scan.nodeLinks) if (!ids.includes(l.to)) {
    const near = ids.find((id) => id.toLowerCase().startsWith(l.to.toLowerCase().slice(0, 3)));
    errors.push(`files "${l.from}".${l.kind === 'data' ? 'data' : 'services'} "${l.to}" is not a node id in architecture.json${near ? ` (did you mean "${near}"?)` : ''}`);
  }
}
const out = [];
if (errors.length) { out.push(`✗ ${errors.length} error(s) in ${toPosix(path.relative(root, planFile))}:`); for (const e of errors) out.push(`  - ${e}`); }
if (warnings.length) { out.push(`! ${warnings.length} warning(s):`); for (const w of warnings.slice(0, 40)) out.push(`  - ${w}`); }
if (errors.length) { console.log(out.join('\n')); console.log('\nFix the errors above and run plan.mjs again.'); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(scan));
keepOutOfGit(outDir);

const bp = scan.blueprint;
const byDir = new Map();
for (const f of scan.files) { const d = f.path.split('/').slice(0, -1).slice(0, 2).join('/') || '.'; byDir.set(d, (byDir.get(d) || 0) + 1); }
if (out.length) out.push('');
out.push(`BLUEPRINT  ${scan.files.length} planned files · ${scan.routes.length} endpoints · ${scan.http.length} calls to planned endpoints · ${scan.nodeLinks.length} links to services and data`);
for (const [d, n] of [...byDir].sort((a, b) => b[1] - a[1]).slice(0, 15)) out.push(`  ${String(n).padStart(4)}  ${d}/`);
const screens = scan.files.filter((f) => f.screens).length;
if (screens) out.push(`SCREENS  ${screens} planned`);
if (bp.questions.length) out.push(`OPEN QUESTIONS  ${bp.questions.length} (shown in Health until answered)`);
out.push('');
out.push(`✓ wrote ${toPosix(path.relative(root, outFile))}. Next: run build.mjs${fs.existsSync(archFile) ? '' : ' once floorplan/architecture.json is written'}.`);
console.log(out.join('\n'));

`


# scripts/recent.mjs

`javascript
#!/usr/bin/env node
// Facts for marking "recent work" on the map: what changed since the last map (from refresh.mjs),
// uncommitted changes, and recent commits, each tied to the card it shows up as. Antigravity adds the why
// (what the user asked for) and writes floorplan/recent-work.json. Read-only.
// usage: node recent.mjs [root] [--days 7]
import fs from 'node:fs';
import path from 'node:path';
import { git, parseArgs, mapDir } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const dir = mapDir(root);
const graphFile = path.join(dir, 'graph.json');
if (!fs.existsSync(graphFile)) { console.error('✗ No floorplan/graph.json. Run build.mjs first.'); process.exit(1); }
const G = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const changes = readJson(path.join(dir, '.cache', 'changes.json'));
const current = readJson(path.join(dir, 'recent-work.json'));

const files = new Map(G.files.map((f) => [f.p, f]));
const labels = new Map(G.nodes.map((n) => [n.id, n.label]));
const routesOf = new Map();
for (const r of G.routes) { if (!routesOf.has(r.f)) routesOf.set(r.f, []); routesOf.get(r.f).push(`${r.m} ${r.p}`); }
const card = (p) => {
  const f = files.get(p);
  if (!f) return '(not on the map)';
  const rs = routesOf.get(p) || [];
  return `"${f.name}" in ${labels.get(f.n) || f.n}${rs.length ? ` · ${rs.length} endpoint(s)` : ''}`;
};
const L = [];
const MAX = 40;
const list = (rows) => { rows.slice(0, MAX).forEach((r) => L.push('  ' + r)); if (rows.length > MAX) L.push(`  … +${rows.length - MAX} more`); };

L.push(`RECENT WORK FACTS for ${G.project.name}  (map built ${G.meta.generatedAt})`);
L.push(current?.tasks
  ? `Current recent-work.json: ${current.tasks.length} task(s), updated ${current.updatedAt || 'unknown'}. Rewrite it: it replaces the previous highlights.`
  : 'No recent-work.json yet.');

if (changes) {
  L.push('', `CHANGED SINCE THE PREVIOUS MAP (${changes.since} → ${changes.at})`);
  const rows = [
    ...changes.files.new.map((p) => `new      ${p}  → ${card(p)}`),
    ...changes.files.edited.map((p) => `edited   ${p}  → ${card(p)}`),
    ...changes.files.moved.map((m) => `moved    ${m.from} → ${m.to}  → ${card(m.to)}`),
    ...changes.files.deleted.map((p) => `deleted  ${p}  (gone from the map; mention it in the task summary)`),
    ...changes.routes.new.map((k) => `new endpoint      ${k}`),
    ...changes.routes.moved.map((m) => `re-pathed endpoint ${m.from} → ${m.to}`),
    ...changes.routes.removed.map((k) => `removed endpoint  ${k}`),
  ];
  if (rows.length) list(rows); else L.push('  nothing');
}

const since = changes?.since || current?.updatedAt || new Date(Date.now() - (Number(args.days) || 7) * 86400000).toISOString();
for (const r of G.meta.repos || []) {
  const abs = path.join(root, r.path);
  const prefix = r.path === '.' ? '' : r.path + '/';
  const status = (git(abs, ['status', '--porcelain=v1', '-uall']) || '').split('\n').filter(Boolean);
  const log = (git(abs, ['log', `--since=${since}`, '--max-count=20', '--no-merges', '--name-only', '--date=short', '--format=@@%h %ad %s']) || '').trim();
  if (!status.length && !log) continue;
  L.push('', `REPO ${r.path === '.' ? G.meta.rootName : r.path}`);
  if (status.length) {
    L.push('  uncommitted:');
    list(status.map((s) => { const p = prefix + s.slice(3).replace(/^.* -> /, '').replace(/"/g, ''); return `  ${s.slice(0, 2).trim().padEnd(2)} ${p}  → ${card(p)}`; }));
  }
  if (log) {
    L.push(`  commits since ${since.slice(0, 10)}:`);
    for (const block of log.split('@@').filter(Boolean)) {
      const [head, ...paths] = block.trim().split('\n').filter(Boolean);
      L.push(`    ${head}`);
      paths.slice(0, 8).forEach((p) => L.push(`        ${prefix + p}  → ${card(prefix + p)}`));
      if (paths.length > 8) L.push(`        … +${paths.length - 8} more files`);
    }
  }
}

L.push('', 'Write floorplan/recent-work.json (refs: a file path, a node id, or "METHOD /path"; see references/schema.md#recent-work):',
  '  { "tasks": [ { "title": "…", "request": "what the user asked for", "summary": "what was done toward it, and where it stands",',
  '      "items": [ { "ref": "<file path>", "change": "changed|new", "note": "what changed here, and how it serves the request" } ] } ] }',
  'Then run build.mjs. Use { "tasks": [] } when nothing was worked on.');
console.log(L.join('\n'));

`


# scripts/refresh.mjs

`javascript
#!/usr/bin/env node
// floorplan refresh: bring an existing map up to date without redoing the whole thing.
// Re-scans, compares against the last build (graph.json), reconciles descriptions/*.json
// (renames carried over, deleted entries removed, entries whose exports/routes changed flagged
// with "review"), rebuilds, and reports exactly what is left for Antigravity to look at.
//
// usage: node refresh.mjs [root]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compileGlob, parseArgs, mapDir } from './lib/common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const outDir = mapDir(root);
const graphFile = path.join(outDir, 'graph.json');
const archFile = path.join(outDir, 'architecture.json');
if (!fs.existsSync(graphFile) || !fs.existsSync(archFile)) {
  console.log('No existing map here (floorplan/graph.json + architecture.json). Do a full run instead.');
  process.exit(0);
}
const old = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
const arch = JSON.parse(fs.readFileSync(archFile, 'utf8'));

// A blueprint is redrawn from plan.json, not from code. --from-code maps the real code instead
// (plan.json is kept, so the blueprint can be drawn again with plan.mjs + build.mjs).
if (old.meta?.blueprint && !args['from-code']) {
  const run = (script, ...rest) => execFileSync(process.execPath, [path.join(HERE, script), root, ...rest], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  try {
    process.stdout.write(run('plan.mjs') + '\n' + run('build.mjs', ...process.argv.slice(2).filter((a) => a.startsWith('--'))));
  } catch (e) { process.stdout.write(String(e.stdout || '')); process.exit(1); }
  console.log('\nNEXT  This map is a blueprint, redrawn from floorplan/plan.json. Edit plan.json and architecture.json to change the plan. Once the code exists, run refresh.mjs --from-code for a map of the real code; plan.json stays.');
  process.exit(0);
}

// ---------- 1. re-scan (no tokens) ----------
const node = process.execPath;
execFileSync(node, [path.join(HERE, 'scan.mjs'), root], { stdio: ['ignore', 'ignore', 'inherit'] });
const scan = JSON.parse(fs.readFileSync(path.join(outDir, '.cache', 'scan.json'), 'utf8'));

const include = Array.isArray(arch.include) ? arch.include : ['code'];
const ignore = (arch.ignore || []).map(compileGlob);
const now = new Map(scan.files.filter((f) => include.includes(f.category) && !ignore.some((g) => g.test(f.path))).map((f) => [f.path, f]));
const before = new Map(old.files.map((f) => [f.p, f]));

// ---------- 2. diff files ----------
const added = [...now.keys()].filter((p) => !before.has(p));
const removed = [...before.keys()].filter((p) => !now.has(p));
const edited = [...now.keys()].filter((p) => before.has(p) && before.get(p).h && now.get(p).h !== before.get(p).h);
const digestChanged = edited.filter((p) => before.get(p).sig && now.get(p).sig !== before.get(p).sig);

// renames: same content, or same file name + same digest
const renames = new Map();
const addedLeft = new Set(added);
for (const r of removed) {
  const o = before.get(r);
  let match = o.h ? [...addedLeft].find((a) => now.get(a).h === o.h) : null;
  if (!match) {
    const cands = [...addedLeft].filter((a) => path.posix.basename(a) === path.posix.basename(r) && (!o.sig || now.get(a).sig === o.sig));
    if (cands.length === 1) match = cands[0];
  }
  if (match) { renames.set(r, match); addedLeft.delete(match); }
}
const deleted = removed.filter((r) => !renames.has(r));
const created = [...addedLeft];

// what changed in a file's exports/routes, for the review note
const oldRoutesByFile = new Map();
for (const r of old.routes || []) { if (!oldRoutesByFile.has(r.f)) oldRoutesByFile.set(r.f, []); oldRoutesByFile.get(r.f).push(`${r.m} ${r.p}`); }
const newRoutesByFile = new Map();
for (const r of scan.routes) { if (!newRoutesByFile.has(r.file)) newRoutesByFile.set(r.file, []); newRoutesByFile.get(r.file).push(`${r.method} ${r.path}`); }
function changeNote(p, prevPath = p) {
  const o = before.get(prevPath), n = now.get(p);
  const os = new Set((o.s || []).map((s) => s[0])), ns = new Set((n.symbols || []).map((s) => s.name));
  const plus = [...ns].filter((x) => !os.has(x)), minus = [...os].filter((x) => !ns.has(x));
  const orr = new Set(oldRoutesByFile.get(prevPath) || []), nr = new Set(newRoutesByFile.get(p) || []);
  const rPlus = [...nr].filter((x) => !orr.has(x)).length, rMinus = [...orr].filter((x) => !nr.has(x)).length;
  const parts = [];
  if (plus.length) parts.push(`new exports: ${plus.slice(0, 6).join(', ')}${plus.length > 6 ? '…' : ''}`);
  if (minus.length) parts.push(`removed exports: ${minus.slice(0, 6).join(', ')}${minus.length > 6 ? '…' : ''}`);
  if (rPlus) parts.push(`${rPlus} new route(s)`);
  if (rMinus) parts.push(`${rMinus} removed route(s)`);
  if (!parts.length) parts.push('docstring or structure changed');
  return parts.join('; ');
}

// ---------- 3. diff routes ----------
const oldRouteKeys = new Map((old.routes || []).map((r) => [`${r.m} ${r.p}`, r]));
const newRouteKeys = new Map(scan.routes.map((r) => [`${r.method} ${r.path}`, r]));
const routeMoves = new Map(); // old key -> new key (same handler in the same / renamed file)
const goneRoutes = [...oldRouteKeys.keys()].filter((k) => !newRouteKeys.has(k));
const newRoutes = new Set([...newRouteKeys.keys()].filter((k) => !oldRouteKeys.has(k)));
for (const k of goneRoutes) {
  const o = oldRouteKeys.get(k);
  const file = renames.get(o.f) || o.f;
  const m = [...newRoutes].find((nk) => { const n = newRouteKeys.get(nk); return n.file === file && o.h && n.handler === o.h; });
  if (m) { routeMoves.set(k, m); newRoutes.delete(m); }
}

// ---------- 4. reconcile descriptions ----------
const descDir = path.join(outDir, 'descriptions');
let carried = 0, pruned = 0, flagged = 0, routeCarried = 0, routePruned = 0;
const digestSet = new Set(digestChanged);
if (fs.existsSync(descDir)) {
  for (const name of fs.readdirSync(descDir).filter((n) => n.endsWith('.json'))) {
    const fp = path.join(descDir, name);
    let d;
    try { d = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { continue; }
    let changed = false;
    const filesOut = {};
    for (const [p, v] of Object.entries(d.files || {})) {
      if (renames.has(p)) {
        const np = renames.get(p);
        filesOut[np] = now.get(np).sig !== before.get(p).sig ? { ...v, review: `moved from ${p}; ${changeNote(np, p)}` } : v;
        carried++; changed = true;
      } else if (deleted.includes(p)) { pruned++; changed = true; }
      else if (digestSet.has(p) && v.description) { filesOut[p] = { ...v, review: changeNote(p) }; flagged++; changed = true; }
      else filesOut[p] = v;
    }
    const routesOut = {};
    for (const [k, v] of Object.entries(d.routes || {})) {
      if (routeMoves.has(k)) { routesOut[routeMoves.get(k)] = { ...v, review: `path changed from ${k}` }; routeCarried++; changed = true; }
      else if (!newRouteKeys.has(k) && oldRouteKeys.has(k)) { routePruned++; changed = true; }
      else routesOut[k] = v;
    }
    if (changed) {
      const outObj = { files: filesOut, ...(Object.keys(routesOut).length ? { routes: routesOut } : {}) };
      if (!Object.keys(filesOut).length && !Object.keys(routesOut).length) fs.unlinkSync(fp);
      else fs.writeFileSync(fp, JSON.stringify(outObj, null, 2) + '\n');
    }
  }
}

// what changed since the last build, for recent.mjs (marking recent work on the map)
fs.writeFileSync(path.join(outDir, '.cache', 'changes.json'), JSON.stringify({
  since: old.meta.generatedAt, at: new Date().toISOString(),
  files: { new: created, edited: edited.filter((p) => !created.includes(p)), moved: [...renames].map(([a, b]) => ({ from: a, to: b })), deleted },
  routes: { new: [...newRoutes], removed: goneRoutes.filter((k) => !routeMoves.has(k)), moved: [...routeMoves].map(([a, b]) => ({ from: a, to: b })) },
}, null, 2));

// ---------- 5. rebuild (no tokens) ----------
let buildOut = '';
let buildOk = true;
try { buildOut = execFileSync(node, [path.join(HERE, 'build.mjs'), root], { encoding: 'utf8' }); }
catch (e) { buildOut = (e.stdout || '') + (e.stderr || ''); buildOk = false; }

// ---------- 6. report ----------
const since = new Date(old.meta.generatedAt);
const L = [];
L.push(`Floorplan refresh — last map ${since.toLocaleString()}`);
L.push(`  files   +${created.length} new · −${deleted.length} deleted · ${renames.size} moved/renamed (descriptions carried over) · ${edited.length} edited, ${digestChanged.length} with changed exports/routes`);
L.push(`  routes  +${newRoutes.size} new · −${goneRoutes.length - routeMoves.size} removed · ${routeMoves.size} re-pathed (descriptions carried over)`);
L.push(`  descriptions: ${carried + routeCarried} carried over, ${pruned + routePruned} removed, ${flagged} flagged for review`);
if (!before.values().next().value?.h) L.push('  (the previous map predates content fingerprints, so edits since then could not be detected; future refreshes will)');
const byDir = new Map();
for (const p of created) { const d = p.split('/').slice(0, -1).join('/'); byDir.set(d, (byDir.get(d) || 0) + 1); }
if (byDir.size) {
  L.push('  new files by directory:');
  for (const [d, c] of [...byDir.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) L.push(`    ${String(c).padStart(4)}  ${d}/`);
}
L.push('');
L.push('BUILD');
L.push(buildOut.split('\n').filter((l) => /^(✗|!|  - |ASSIGNMENT|  unassigned|    |DESCRIPTIONS|  Run describe|✓)/.test(l)).slice(0, 40).join('\n'));
L.push('');
const todo = [];
if (!buildOk) todo.push('Fix the build errors above in architecture.json (usually a flow step or annotation pointing at a deleted file), then run build.mjs.');
if (/unassigned, by directory/.test(buildOut)) todo.push('New files landed outside every node: add globs (or a node) in architecture.json for the directories listed under "unassigned".');
if (/Run describe/.test(buildOut)) todo.push('Run describe.mjs: it writes worksheets for only the new and flagged items. Fill them in (drop each "review" field once the entry is accurate), then run build.mjs.');
if (created.length + deleted.length > Math.max(20, before.size * 0.15)) todo.push('This is a large change: re-read the summaries of the modules that gained or lost many files, and check the flows still hold.');
todo.push('Mark recent work: run recent.mjs, rewrite recent-work.json for what was just worked on (an empty "tasks" list if nothing was), then run build.mjs.');
L.push('NEXT');
todo.forEach((t, i) => L.push(`  ${i + 1}. ${t}`));
console.log(L.join('\n'));

`


# scripts/scan.mjs

`javascript
#!/usr/bin/env node
// floorplan scanner: discover every repo under a codebase root, list files, extract imports,
// symbols and HTTP routes/calls, resolve them, and write floorplan/.cache/scan.json.
// Prints a compact summary meant to be read by Antigravity (the JSON itself can be large).
//
// usage: node scan.mjs [root] [--out <file>] [--include-worktrees] [--max-file-kb 2048]

import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { discover, gitFiles, gitInfo, classify, toPosix, parseArgs, fmtNum, HARD_IGNORE_DIRS, MAP_DIR, LEGACY_MAP_DIR, isMapDir, mapDir, keepOutOfGit } from './lib/common.mjs';
import { extract, callableCallsVia } from './lib/extract.mjs';
import { findIssues } from './lib/health.mjs';
import { findScreens } from './lib/screens.mjs';
import { createResolver } from './lib/resolve.mjs';
import { resolveRoutes, matchCalls } from './lib/routes.mjs';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || '.');
const outDir = args.out ? path.dirname(path.dirname(path.resolve(args.out))) : mapDir(root);
const outFile = path.resolve(args.out || path.join(outDir, '.cache', 'scan.json'));
const maxBytes = (Number(args['max-file-kb']) || 2048) * 1024;
const t0 = Date.now();
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

// ---------- 1. discover repos and files ----------
const found = discover(root, { includeWorktrees: !!args['include-worktrees'] });
const repos = [];
const fileList = []; // { path, repo }
const seen = new Set();
// map folders (ours, or an old show-code/ one) are output, not code
const mapDirs = new Map();
const inMap = (p) => {
  const segs = p.split('/');
  for (let i = 0; i < segs.length - 1; i++) {
    if (segs[i] !== MAP_DIR && segs[i] !== LEGACY_MAP_DIR) continue;
    const d = segs.slice(0, i + 1).join('/');
    if (!mapDirs.has(d)) mapDirs.set(d, isMapDir(path.join(root, d)));
    if (mapDirs.get(d)) return true;
  }
  return false;
};
const ignoredByDir = (p) => p.split('/').some((seg) => HARD_IGNORE_DIRS.has(seg)) || inMap(p);

for (const r of found.repos) {
  const listed = gitFiles(r.abs);
  const info = gitInfo(r.abs);
  const prefix = r.path === '.' ? '' : r.path + '/';
  let count = 0;
  for (const f of listed || []) {
    const p = prefix + f;
    if (seen.has(p) || ignoredByDir(p)) continue;
    seen.add(p);
    fileList.push({ path: p, repo: r.path });
    count++;
  }
  repos.push({ path: r.path, name: path.basename(r.abs), ...info, files: count, ...(r.worktreeOf ? { worktreeOf: toPosix(r.worktreeOf) } : {}) });
}
for (const p of found.loose) if (!seen.has(p) && !inMap(p)) { seen.add(p); fileList.push({ path: p, repo: null }); }

// ---------- 2. classify, read, extract ----------
const files = [];
for (const { path: p, repo } of fileList) {
  const abs = path.join(root, p);
  let st;
  try { st = fs.statSync(abs); } catch { continue; }
  if (!st.isFile()) continue;
  const { category, lang } = classify(p, st.size);
  const f = { path: p, repo, category, lang, bytes: st.size, loc: 0 };
  if ((category === 'code' || category === 'config' || category === 'docs') && st.size <= maxBytes) {
    let src;
    try { src = fs.readFileSync(abs, 'utf8'); } catch { src = ''; }
    if (src.includes('\u0000')) { f.category = 'asset'; files.push(f); continue; }
    f.loc = src.split('\n').filter((l) => l.trim()).length;
    if (category === 'code' && src.length) {
      try { Object.assign(f, extract(src, lang, p)); } catch (e) { f.extractError = String(e.message || e); }
      // h: exact content. sig: the parts a description depends on (exports, routes, docstring),
      // so edits inside function bodies don't mark a file's description as stale.
      f.h = hash(src);
      f.sig = hash(JSON.stringify([(f.symbols || []).map((s) => s.name).sort(), (f.routes || []).map((r) => `${r.method} ${r.path}`).sort(), f.doc || '']));
    }
    // extension hooks: per-file health findings (lib/health.mjs) and app screens (lib/screens.mjs)
    if (src.length) {
      try { const iss = findIssues(src, f); if (iss?.length) f.issues = iss; } catch (e) { f.healthError = String(e.message || e); }
      try { const scr = findScreens(src, f); if (scr?.length) f.screens = scr; } catch (e) { f.screensError = String(e.message || e); }
    }
  } else if (category === 'code' || category === 'config' || category === 'docs') {
    // too big to read and parse, but still on the map: count its lines without loading it all
    f.tooLarge = true;
    f.loc = countLines(abs);
  }
  files.push(f);
}

/** Lines in a file, read in chunks so a huge file is never held in memory at once. */
function countLines(abs) {
  let fd, n = 0, last = 10;
  try {
    fd = fs.openSync(abs, 'r');
    const buf = Buffer.alloc(1 << 20);
    for (let got; (got = fs.readSync(fd, buf, 0, buf.length, null)) > 0;) {
      for (let i = 0; i < got; i++) if (buf[i] === 10) n++;
      last = buf[got - 1];
    }
  } catch { return 0; } finally { if (fd !== undefined) fs.closeSync(fd); }
  return n + (last === 10 ? 0 : 1);
}

// ---------- 3. resolve imports ----------
const resolve = createResolver(root, files);
const edges = [];
const externals = new Map(); // `${eco}:${name}` -> { eco, name, count, files:Set }
const extEdges = [];
let unresolved = 0;
for (const f of files) {
  if (!f.imports) continue;
  for (const imp of f.imports) {
    const res = resolve(f, imp);
    if (res.file || res.files) {
      imp.files = res.files || [res.file];
      const targets = res.files ? res.files.map((t, i) => [t, res.names?.[i]]) : [[res.file, null]];
      for (const [to, subName] of targets) {
        if (to === f.path) continue;
        edges.push({ from: f.path, to, names: subName ? [] : (imp.names || []), line: imp.line, ...(imp.dynamic ? { dynamic: true } : {}) });
      }
    } else if (res.external) {
      const key = `${res.eco}:${res.external}`;
      if (!externals.has(key)) externals.set(key, { eco: res.eco, name: res.external, count: 0, files: new Set() });
      const e = externals.get(key);
      e.count++;
      e.files.add(f.path);
      extEdges.push({ from: f.path, pkg: key });
    } else if (res.unresolved) unresolved++;
  }
}
// merge duplicate edges (same from/to)
const edgeMap = new Map();
for (const e of edges) {
  const k = e.from + '\u0000' + e.to;
  const prev = edgeMap.get(k);
  if (prev) { prev.names = [...new Set([...prev.names, ...e.names])]; prev.count++; }
  else edgeMap.set(k, { ...e, count: 1 });
}

// Firebase callable helpers used from other files: `import { callFunction } from '../lib/firebase'`,
// then callFunction('approveItem', data) calls the approveItem function
const wrappers = new Map(files.filter((f) => f.callableWrappers).map((f) => [f.path, new Set(f.callableWrappers)]));
if (wrappers.size) for (const f of files) {
  const via = (f.imports || []).flatMap((imp) => Object.entries(imp.locals || {}).filter(([, orig]) => imp.files?.some((t) => wrappers.get(t)?.has(orig))).map(([local]) => local));
  if (!via.length) continue;
  let src;
  try { src = fs.readFileSync(path.join(root, f.path), 'utf8'); } catch { continue; }
  for (const local of via) f.calls = [...(f.calls || []), ...callableCallsVia(src, local)];
}

// ---------- 4. routes and HTTP calls ----------
const routes = resolveRoutes(files);
const http = matchCalls(files, routes);
const hosts = [];
for (const f of files) for (const h of f.hosts || []) hosts.push({ from: f.path, host: h.host, line: h.line });

// ---------- 5. write scan.json ----------
const scan = {
  version: 1,
  generatedAt: new Date().toISOString(),
  root: toPosix(root),
  rootName: path.basename(root),
  repos,
  skipped: found.skipped,
  files: files.map((f) => ({
    path: f.path, repo: f.repo, category: f.category, lang: f.lang, loc: f.loc, bytes: f.bytes,
    ...(f.doc ? { doc: f.doc } : {}),
    ...(f.h ? { h: f.h, sig: f.sig } : {}),
    ...(f.symbols?.length ? { symbols: f.symbols } : {}),
    ...(f.tooLarge ? { tooLarge: true } : {}),
    ...(f.issues ? { issues: f.issues } : {}),
    ...(f.screens ? { screens: f.screens } : {}),
    ...(f.triggers ? { triggers: f.triggers } : {}),
  })),
  edges: [...edgeMap.values()].map(({ from, to, names, count, dynamic }) => ({ from, to, ...(names.length ? { names } : {}), ...(count > 1 ? { count } : {}), ...(dynamic ? { dynamic } : {}) })),
  externals: [...externals.values()].map((e) => ({ id: `${e.eco}:${e.name}`, eco: e.eco, name: e.name, imports: e.count, files: e.files.size })),
  extEdges: dedupeExt(extEdges),
  routes,
  http,
  hosts,
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(scan));
if (!args.out) keepOutOfGit(outDir);

function dedupeExt(list) {
  const m = new Map();
  for (const e of list) { const k = e.from + '|' + e.pkg; m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].map(([k, count]) => { const [from, pkg] = k.split('|'); return { from, pkg, count }; });
}

// ---------- 6. summary for Antigravity ----------
const code = scan.files.filter((f) => f.category === 'code');
const out = [];
const line = (s = '') => out.push(s);
line(`Floorplan scan of ${scan.rootName}  (${((Date.now() - t0) / 1000).toFixed(1)}s) -> ${toPosix(path.relative(root, outFile))}`);
line();
line(`REPOS (${repos.length})`);
for (const r of repos) line(`  ${r.path.padEnd(40)} ${String(r.files).padStart(6)} files  ${r.branch || '-'}@${(r.head || '').slice(0, 8)}${r.worktreeOf ? '  (worktree)' : ''}`);
const looseCount = scan.files.filter((f) => f.repo === null).length;
if (looseCount) line(`  (outside any repo)${''.padEnd(22)} ${String(looseCount).padStart(6)} files`);
const wts = found.skipped.filter((s) => s.reason.includes('worktree'));
if (wts.length) line(`  skipped ${wts.length} duplicate worktree(s), e.g. ${wts.slice(0, 3).map((s) => s.path).join(', ')}`);
const dumps = found.skipped.filter((s) => s.reason.includes('data dump'));
if (dumps.length) line(`  skipped ${dumps.length} large non-git dir(s), e.g. ${dumps.slice(0, 2).map((s) => s.path).join(', ')}`);
line();

const byCat = {};
for (const f of scan.files) byCat[f.category] = (byCat[f.category] || 0) + 1;
line(`FILES  ${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
const byLang = {};
for (const f of code) { byLang[f.lang] ??= { files: 0, loc: 0 }; byLang[f.lang].files++; byLang[f.lang].loc += f.loc; }
line(`CODE   ${Object.entries(byLang).sort((a, b) => b[1].loc - a[1].loc).slice(0, 10).map(([k, v]) => `${k} ${v.files} files/${fmtNum(v.loc)} loc`).join(' · ')}`);
line();

// directory tree of code, collapsing small dirs
line('CODE TREE (files / loc; dirs under 2% of code collapsed)');
const tree = { children: new Map(), files: 0, loc: 0 };
for (const f of code) {
  let node = tree;
  node.files++; node.loc += f.loc;
  const parts = f.path.split('/').slice(0, -1);
  for (const part of parts) {
    if (!node.children.has(part)) node.children.set(part, { children: new Map(), files: 0, loc: 0 });
    node = node.children.get(part);
    node.files++; node.loc += f.loc;
  }
}
const minLoc = Math.max(50, tree.loc * 0.02);
const printTree = (node, prefix, depth) => {
  const kids = [...node.children.entries()].sort((a, b) => b[1].loc - a[1].loc);
  const shown = kids.filter(([, n]) => n.loc >= minLoc);
  for (const [name, n] of shown) {
    line(`${prefix}${name}/`.padEnd(64) + `${String(n.files).padStart(5)}  ${fmtNum(n.loc).padStart(6)}`);
    if (depth < 5) printTree(n, prefix + '  ', depth + 1);
  }
  const rest = kids.length - shown.length;
  if (rest > 0) { const rf = kids.slice(shown.length).reduce((s, [, n]) => s + n.files, 0); line(`${prefix}… ${rest} smaller dir(s), ${rf} files`); }
};
printTree(tree, '  ', 0);
line();

// entrypoint candidates
const ENTRY = /(^|\/)(main|index|app|server|cli|manage|wsgi|asgi|__main__|program|lib)\.(py|ts|tsx|js|mjs|go|rs|java|kt|cs|rb)$|(^|\/)app\/(page|layout)\.(t|j)sx?$|(^|\/)cmd\/[^/]+\/main\.go$|(^|\/)Dockerfile[^/]*$|(^|\/)(docker-compose|compose)\.ya?ml$|(^|\/)(cloudbuild|serverless|vercel|netlify|fly|render|app)\.(ya?ml|json|toml)$/i;
const entries = scan.files.filter((f) => ENTRY.test(f.path) && f.path.split('/').length <= 5).map((f) => f.path);
line(`ENTRYPOINT / DEPLOY CANDIDATES (${entries.length})`);
for (const e of entries.slice(0, 30)) line(`  ${e}`);
if (entries.length > 30) line(`  … ${entries.length - 30} more`);
line();

// directory-level dependency clusters
const dirOf = (p, depth) => p.split('/').slice(0, -1).slice(0, depth).join('/') || '.';
const depthFor = (p) => {
  const r = p.split('/');
  return Math.min(r.length - 1, 3 + (repos.length > 1 ? 1 : 0));
};
const dirEdges = new Map();
for (const e of scan.edges) {
  const a = dirOf(e.from, depthFor(e.from)), b = dirOf(e.to, depthFor(e.to));
  if (a === b) continue;
  const k = `${a} -> ${b}`;
  dirEdges.set(k, (dirEdges.get(k) || 0) + (e.count || 1));
}
line(`IMPORT EDGES  ${scan.edges.length} file->file resolved, ${unresolved} unresolved. Heaviest directory->directory:`);
for (const [k, v] of [...dirEdges.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) line(`  ${String(v).padStart(5)}  ${k}`);
line();

line(`HTTP  ${routes.length} route definitions, ${http.length} call->route matches (cross-file links not visible to imports)`);
const httpDir = new Map();
for (const h of http) {
  const k = `${dirOf(h.from, depthFor(h.from))} -> ${dirOf(h.to, depthFor(h.to))}`;
  httpDir.set(k, (httpDir.get(k) || 0) + 1);
}
for (const [k, v] of [...httpDir.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) line(`  ${String(v).padStart(5)}  ${k}`);
line();

// Firebase Cloud Functions: endpoints are already in the HTTP line; background ones need a place on the map
const fbRoutes = files.flatMap((f) => (f.routes || []).filter((r) => r.framework === 'firebase'));
const triggers = files.flatMap((f) => (f.triggers || []).map((t) => ({ ...t, file: f.path })));
if (fbRoutes.length || triggers.length) {
  const callable = fbRoutes.filter((r) => r.method === 'CALL').length;
  line(`FIREBASE FUNCTIONS  ${callable} callable, ${fbRoutes.length - callable} onRequest, ${triggers.length} background`);
  if (triggers.length) {
    line('  background (schedules and triggers; place them in a worker node):');
    for (const t of triggers.slice(0, 20)) line(`    ${t.name}  ${t.on}${t.what ? ` "${t.what}"` : ''}  ${t.file}:${t.line}`);
    if (triggers.length > 20) line(`    … ${triggers.length - 20} more`);
  }
  line();
}

const topExt = scan.externals.sort((a, b) => b.files - a.files).slice(0, 25);
line(`EXTERNAL PACKAGES (top ${topExt.length} by importing files)`);
line('  ' + topExt.map((e) => `${e.id}(${e.files})`).join('  '));
const hostCounts = new Map();
for (const h of hosts) hostCounts.set(h.host, (hostCounts.get(h.host) || 0) + 1);
if (hostCounts.size) {
  line(`EXTERNAL HOSTS called from code`);
  line('  ' + [...hostCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([h, c]) => `${h}(${c})`).join('  '));
}
line();
const big = code.filter((f) => f.loc > 1500).sort((a, b) => b.loc - a.loc).slice(0, 10);
if (big.length) { line('LARGEST FILES'); for (const f of big) line(`  ${fmtNum(f.loc).padStart(6)}  ${f.path}`); line(); }
const unread = files.filter((f) => f.tooLarge).sort((a, b) => b.bytes - a.bytes);
if (unread.length) {
  line(`NOT READ  ${unread.length} file(s) over ${fmtNum(maxBytes / 1024)} KB: on the map, but their imports, endpoints, requests and secrets weren't checked. Re-run scan.mjs with --max-file-kb <bigger> to read them.`);
  for (const f of unread.slice(0, 15)) line(`  ${fmtNum(Math.round(f.bytes / 1024)).padStart(6)} KB  ${f.path}`);
  if (unread.length > 15) line(`  … ${unread.length - 15} more`);
  line();
}
line('Next: read references/schema.md, explore entrypoints, then write floorplan/architecture.json and run build.mjs.');
console.log(out.join('\n'));

`


# scripts/status.mjs

`javascript
#!/usr/bin/env node
// Prints whether a floorplan already exists here and how stale it is. Never fails.
// usage: node status.mjs [root]
import fs from 'node:fs';
import path from 'node:path';
import { git, mapDir, LEGACY_MAP_DIR, isMapDir } from './lib/common.mjs';

try {
  const root = path.resolve(process.argv[2] || '.');
  const legacy = !fs.existsSync(path.join(root, 'floorplan')) && isMapDir(path.join(root, LEGACY_MAP_DIR));
  if (legacy) console.log(`(a map from before the rename is in ${LEGACY_MAP_DIR}/; the next scan, build or refresh moves it to floorplan/)`);
  const dir = legacy ? path.join(root, LEGACY_MAP_DIR) : mapDir(root, { migrate: false });
  const graphFile = path.join(dir, 'graph.json');
  const hasArch = fs.existsSync(path.join(dir, 'architecture.json'));
  if (!fs.existsSync(graphFile)) {
    const hasPlan = fs.existsSync(path.join(dir, 'plan.json'));
    console.log(hasPlan ? 'a blueprint was started (plan.json) but never drawn: write architecture.json if it is missing, then run plan.mjs and build.mjs.' : hasArch ? 'architecture.json exists but was never built: run build.mjs.' : 'none: no floorplan here yet (fresh run).');
    process.exit(0);
  }
  const g = JSON.parse(fs.readFileSync(graphFile, 'utf8'));
  if (g.meta.blueprint) {
    console.log(`a blueprint (planned, not built${g.meta.blueprint.source ? `, from ${g.meta.blueprint.source}` : ''}) built ${g.meta.generatedAt}: ${g.meta.counts.files} planned files, ${g.nodes.length} nodes.\nTo change the plan, edit floorplan/plan.json and architecture.json, then run refresh.mjs (it redraws from plan.json). If the code now exists and the user wants a map of it, run refresh.mjs --from-code.`);
    process.exit(0);
  }
  const lines = [`map built ${g.meta.generatedAt} covering ${g.meta.counts.files} files, ${g.nodes.length} nodes.`];
  for (const r of g.meta.repos || []) {
    const abs = path.join(root, r.path);
    const head = git(abs, ['rev-parse', 'HEAD']);
    if (!head || !r.head) { lines.push(`  ${r.path}: not a git repo now`); continue; }
    const changed = head === r.head ? [] : (git(abs, ['diff', '--name-only', r.head, head]) || '').split('\n').filter(Boolean);
    const dirty = (git(abs, ['status', '--porcelain']) || '').split('\n').filter(Boolean).length;
    lines.push(`  ${r.path}: ${head === r.head ? 'same commit' : `${changed.length} file(s) changed since ${r.head.slice(0, 7)}`}${dirty ? `, ${dirty} uncommitted` : ''}`);
    if (changed.length) lines.push(`    e.g. ${changed.slice(0, 6).map((p) => (r.path === '.' ? p : `${r.path}/${p}`)).join(', ')}`);
  }
  lines.push('A map exists: update it with refresh.mjs (only changed files cost tokens) rather than starting over.');
  console.log(lines.join('\n'));
} catch (e) {
  console.log(`status unavailable (${e.message})`);
}

`


# scripts/lib/agent.mjs

`javascript
// Coding agent: Antigravity is the primary agent.
export const AGENTS = ['antigravity'];

export function detectAgent(args = {}, env = process.env) {
  const v = String(args.agent || env.FLOORPLAN_AGENT || '').toLowerCase();
  if (AGENTS.includes(v)) return v;
  return 'antigravity';
}

`


# scripts/lib/blueprint.mjs

`javascript
// Blueprints: a floorplan of a system that hasn't been built yet, planned from a PRD or a description.
//
// planToScan(plan, root) — turns floorplan/plan.json (the planned files, endpoints and calls, written by
//                          the agent) into the same scan.json shape scan.mjs writes for real code, so
//                          build.mjs and the viewer work unchanged. Returns { scan, errors, warnings }.
// buildPlanHealth(ctx)   — called by build.mjs instead of buildHealth for a blueprint: a design review of
//                          the plan (who may call each endpoint, loose ends, open questions) in the same
//                          { summary, issues } shape, so the Health panel shows it.

import path from 'node:path';
import { classify, toPosix } from './common.mjs';
import { matchCalls } from './routes.mjs';

// who may use an endpoint. "team" is the people who run the service (its own admin pages), not the app's users.
export const ACCESS = ['public', 'signed-in', 'team', 'webhook', 'internal'];
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'CALL', 'ANY'];
const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE', 'CALL']);
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const strArr = (v) => (Array.isArray(v) ? v.filter(isStr) : []);
const routeKey = (m, p) => `${m} ${p}`;

/** "POST /api/orders" -> { method, path }, or null. */
export function parseCall(s) {
  const m = /^\s*([A-Za-z]+)\s+(\/\S*)\s*$/.exec(String(s || ''));
  return m && METHODS.includes(m[1].toUpperCase()) ? { method: m[1].toUpperCase(), path: m[2] } : null;
}

export function planToScan(plan, root) {
  const errors = [], warnings = [];
  const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
  if (!plan || typeof plan !== 'object') return { scan: null, errors: ['plan.json must be an object'], warnings };
  const files = Array.isArray(plan.files) ? plan.files : [];
  const endpoints = Array.isArray(plan.endpoints) ? plan.endpoints : [];
  if (!files.length) err('files must be a non-empty array of the files the system would have');

  const byPath = new Map();
  files.forEach((f, i) => {
    const where = `files[${i}]${f?.path ? ` ("${f.path}")` : ''}`;
    if (!isStr(f?.path)) return err(`${where}.path is required`);
    const p = toPosix(f.path.trim()).replace(/^\.\//, '');
    if (p.startsWith('/') || p.includes('..')) return err(`${where}.path must be relative to the project folder`);
    if (byPath.has(p)) return err(`${where}.path duplicates an earlier file`);
    if (!isStr(f.description)) warn(`${where} has no description`);
    byPath.set(p, f);
  });
  const known = [...byPath.keys()];
  const near = (p) => { const base = p.split('/').pop(); const hit = known.find((k) => k.split('/').pop() === base); return hit ? ` (did you mean "${hit}"?)` : ''; };

  // endpoints, keyed by "METHOD /path"
  const routes = [], access = {}, seen = new Set();
  endpoints.forEach((e, i) => {
    const where = `endpoints[${i}]${e?.method && e?.path ? ` ("${e.method} ${e.path}")` : ''}`;
    const method = String(e?.method || '').toUpperCase();
    if (!METHODS.includes(method)) return err(`${where}.method must be one of ${METHODS.join(', ')}`);
    if (!isStr(e.path) || !e.path.startsWith('/')) return err(`${where}.path must start with "/"`);
    if (!isStr(e.file)) return err(`${where}.file is required: the planned file that handles it`);
    const file = toPosix(e.file.trim()).replace(/^\.\//, '');
    if (!byPath.has(file)) return err(`${where}.file "${file}" is not one of the planned files${near(file)}`);
    const key = routeKey(method, e.path);
    if (seen.has(key)) return err(`${where} duplicates an earlier endpoint`);
    seen.add(key);
    if (e.access !== undefined && !ACCESS.includes(e.access)) err(`${where}.access "${e.access}" must be one of ${ACCESS.join(', ')}${e.access === 'staff' ? ' ("team" is your own team; for some of the app’s users, use "signed-in" with "who")' : ''}`);
    if (e.who !== undefined && !isStr(e.who)) err(`${where}.who must be a few words, e.g. "managers of that location"`);
    if (e.publicBecause !== undefined && !isStr(e.publicBecause)) err(`${where}.publicBecause must say why it is open to anyone`);
    if (ACCESS.includes(e.access)) access[key] = e.access;
    routes.push({ file, method, path: e.path, line: 0, ...(ACCESS.includes(e.access) ? { access: e.access } : {}), ...(isStr(e.who) ? { who: e.who.trim() } : {}), ...(isStr(e.publicBecause) ? { publicBecause: e.publicBecause.trim() } : {}), ...(isStr(e.name) ? { name: e.name.trim() } : {}), ...(isStr(e.description) ? { desc: e.description.trim() } : {}) });
  });
  const routeKeys = new Set(routes.map((r) => routeKey(r.method, r.path)));

  // imports, calls, and links to outside services and data stores
  const edges = [], nodeLinks = [], callFiles = [];
  for (const [p, f] of byPath) {
    for (const u of strArr(f.uses)) {
      const to = toPosix(u.trim()).replace(/^\.\//, '');
      if (!byPath.has(to)) { err(`files "${p}".uses "${u}" is not one of the planned files${near(to)}`); continue; }
      if (to !== p) edges.push({ from: p, to });
    }
    const calls = [];
    for (const c of strArr(f.calls)) {
      const pc = parseCall(c);
      if (!pc) { err(`files "${p}".calls "${c}" must look like "POST /api/orders"`); continue; }
      if (!routeKeys.has(routeKey(pc.method, pc.path))) warn(`files "${p}".calls "${c}" matches no planned endpoint`);
      calls.push({ path: pc.path, method: pc.method, line: 0 });
    }
    if (calls.length) callFiles.push({ path: p, calls });
    for (const s of strArr(f.services)) nodeLinks.push({ from: p, to: s.trim(), kind: 'http' });
    for (const d of strArr(f.data)) nodeLinks.push({ from: p, to: d.trim(), kind: 'data' });
  }
  // calls only reach the exact planned endpoint (method and path), never a near miss
  const http = matchCalls(callFiles, routes).filter((h) => routeKeys.has(routeKey(h.method, h.path)) && h.call === h.path);

  const questions = [];
  (Array.isArray(plan.questions) ? plan.questions : []).forEach((q, i) => {
    const text = isStr(q) ? q : q?.question;
    if (!isStr(text)) return err(`questions[${i}] needs a question`);
    questions.push({ question: text.trim(), about: strArr(q?.about) });
  });

  const scan = {
    version: 1,
    blueprint: {
      source: isStr(plan.source) ? plan.source.trim() : '',
      stack: strArr(plan.stack),
      assumptions: strArr(plan.assumptions),
      questions,
      access,
    },
    generatedAt: new Date().toISOString(),
    root: toPosix(root),
    rootName: path.basename(root),
    repos: [],
    files: [...byPath].map(([p, f]) => {
      const c = classify(p, 0);
      return {
        path: p, repo: null, category: 'code', lang: c.lang || path.posix.extname(p).slice(1) || null, loc: 0, bytes: 0,
        ...(isStr(f.name) ? { name: f.name.trim() } : {}),
        ...(isStr(f.description) ? { desc: f.description.trim() } : {}),
        ...(isStr(f.screen) && f.screen.startsWith('/') ? { screens: [{ fw: 'plan', url: f.screen.trim() }] } : {}),
      };
    }),
    edges,
    externals: [],
    extEdges: [],
    routes,
    http,
    hosts: [],
    nodeLinks,
  };
  return { scan, errors, warnings };
}

/** The design review shown in the Health panel for a blueprint. */
export function buildPlanHealth({ graph, scan }) {
  const bp = scan.blueprint || {};
  const issues = [];
  const routes = graph.routes || [];
  const ridOf = new Map(routes.map((r, i) => [routeKey(r.m, r.p), 'r:' + i]));
  const fileIds = new Set(graph.files.map((f) => 'f:' + f.p));
  const nodeIds = new Set(graph.nodes.map((n) => 'n:' + n.id));
  const refOf = (s) => {
    if (!isStr(s)) return null;
    const t = s.trim();
    if (nodeIds.has('n:' + t)) return 'n:' + t;
    if (fileIds.has('f:' + t)) return 'f:' + t;
    const pc = parseCall(t);
    return pc ? ridOf.get(routeKey(pc.method, pc.path)) || null : null;
  };
  const line = (r) => `- ${r.m} ${r.p} (${r.f})${r.name ? ` — ${r.name}` : ''}`;
  const rebuild = 'Then rebuild the blueprint: run plan.mjs and build.mjs from the Floorplan skill, as its instructions say.';
  // each item also carries `change`: a request to settle it from the map (the Ask bar's Change mode), for the person to finish or edit
  const names = (xs, max = 6) => { const l = xs.slice(0, max).concat(xs.length > max ? [`${xs.length - max} more`] : []); return l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} and ${l.at(-1)}`; };
  const ep = (r) => `${r.m} ${r.p}`;

  // ---------- who may call each endpoint ----------
  const accessOf = (r) => bp.access?.[routeKey(r.m, r.p)];
  // open on purpose, with a reason (publicBecause), counts as reviewed
  const openWrites = routes.map((r, i) => ({ r, i })).filter(({ r }) => accessOf(r) === 'public' && WRITE.has(r.m) && !r.publicBecause);
  if (openWrites.length) issues.push({
    id: 'plan-open-writes', kind: 'unprotected-endpoint', severity: 'medium',
    change: `Review who may use ${names(openWrites.map(({ r }) => ep(r)))}: anyone can change data through ${openWrites.length === 1 ? 'it' : 'them'} now. `,
    title: openWrites.length === 1 ? 'Anyone could change data through one planned endpoint' : `Anyone could change data through ${openWrites.length} planned endpoints`,
    detail: `The plan lets ${openWrites.length === 1 ? 'this endpoint' : 'these endpoints'} create, change or delete data with no sign-in. That's right for things like signing up or a guest checkout, but worth a second look before building: ${openWrites.length === 1 ? 'it is' : 'they are'} the easiest thing for a stranger to misuse.`,
    items: openWrites.slice(0, 24).map(({ i }) => 'r:' + i),
    notes: Object.fromEntries(openWrites.slice(0, 24).map(({ i }) => ['r:' + i, 'Planned as open to anyone, and changes data'])),
    locations: [],
    fix: [`Design review of floorplan/plan.json: these planned endpoints change data and are marked "access": "public":`, ...openWrites.map(({ r }) => line(r)), ``, `For each one, tell me in plain words whether a stranger should really be able to use it. Where they shouldn't, change its access to "signed-in" (with "who" if only some users may) in plan.json. Where it must stay public (sign-in, sign-up, guest checkout), set "publicBecause" to why, including what limits abuse (rate limits, a CAPTCHA, email confirmation). Ask me if you're unsure.`, rebuild].join('\n'),
  });
  const unknown = routes.map((r, i) => ({ r, i })).filter(({ r }) => !accessOf(r));
  if (unknown.length) issues.push({
    id: 'plan-no-access', kind: 'unprotected-endpoint', severity: 'medium',
    change: `Decide who may use ${names(unknown.map(({ r }) => ep(r)))}, going by the PRD. `,
    title: unknown.length === 1 ? 'The plan doesn’t say who may use one endpoint' : `The plan doesn’t say who may use ${unknown.length} endpoints`,
    detail: `Deciding who can use each part of the system now (anyone, signed-in customers, only managers, your own team, another service) is much easier than adding sign-in checks after it's built.`,
    items: unknown.slice(0, 24).map(({ i }) => 'r:' + i),
    notes: Object.fromEntries(unknown.slice(0, 24).map(({ i }) => ['r:' + i, 'Who may use this isn’t decided'])),
    locations: [],
    fix: [`Design review of floorplan/plan.json: these planned endpoints have no "access" set:`, ...unknown.map(({ r }) => line(r)), ``, `For each, choose who may use it: "public" (anyone), "signed-in" (plus "who" when only some users may, such as "managers of that location"), "team" (only the people who run the service), "webhook" (another company's service, which must prove it's them) or "internal" (only our own services). Base it on the PRD; ask me where the PRD doesn't say.`, rebuild].join('\n'),
  });

  // ---------- open questions from the PRD ----------
  bp.questions?.forEach((q, k) => {
    const items = [...new Set(q.about.map(refOf).filter(Boolean))];
    issues.push({
      id: 'plan-question:' + k, kind: 'question', severity: 'medium',
      change: `Open question: "${q.question}" My answer: `,
      title: q.question,
      detail: 'The PRD doesn’t answer this, and the answer changes what gets built. Decide it before building the parts it touches.',
      items, notes: Object.fromEntries(items.map((id) => [id, 'Depends on an open question'])),
      locations: [],
      fix: [`Open question in the blueprint (floorplan/plan.json): ${q.question}`, ``, `Explain the options to me in plain words, with what each would mean for the parts it touches${q.about.length ? ` (${q.about.join(', ')})` : ''}, and recommend one. After I decide, update plan.json and architecture.json to match and remove the question from plan.json's questions.`, rebuild].join('\n'),
    });
  });

  // ---------- loose ends ----------
  const called = new Set(graph.links.filter((l) => l.k === 'http' && l.calls).flatMap((l) => l.calls.map(([ri]) => ri)));
  const unusedRoutes = routes.map((r, i) => ({ r, i })).filter(({ r, i }) => !called.has(i) && !['webhook', 'internal', 'public'].includes(accessOf(r)));
  if (unusedRoutes.length) issues.push({
    id: 'plan-unused-endpoints', kind: 'unused-file', severity: 'low',
    change: `Nothing calls ${names(unusedRoutes.map(({ r }) => ep(r)))}. Add the screen or service that should use ${unusedRoutes.length === 1 ? 'it' : 'them'}, or remove ${unusedRoutes.length === 1 ? 'it' : 'them'} if not needed. `,
    title: unusedRoutes.length === 1 ? 'Nothing in the plan uses one endpoint' : `Nothing in the plan uses ${unusedRoutes.length} endpoints`,
    detail: `No planned page or service calls ${unusedRoutes.length === 1 ? 'it' : 'them'}. Either a screen that needs ${unusedRoutes.length === 1 ? 'it is' : 'them is'} missing from the plan, or ${unusedRoutes.length === 1 ? 'it isn’t' : 'they aren’t'} needed.`,
    items: unusedRoutes.slice(0, 24).map(({ i }) => 'r:' + i),
    notes: Object.fromEntries(unusedRoutes.slice(0, 24).map(({ i }) => ['r:' + i, 'No planned caller'])),
    locations: [],
    fix: [`Design review of floorplan/plan.json: nothing in the plan calls these endpoints:`, ...unusedRoutes.map(({ r }) => line(r)), ``, `For each, find which planned screen or service should call it and add it to that file's "calls", or tell me it isn't needed and remove it.`, rebuild].join('\n'),
  });
  const linked = new Set();
  for (const l of graph.links) { linked.add(l.a); linked.add(l.b); }
  const screenFiles = new Set((graph.screens || []).map((s) => s.file));
  const routeFiles = new Set(routes.map((r) => r.f));
  const loose = graph.files.filter((f) => !linked.has('f:' + f.p) && !screenFiles.has(f.p) && !routeFiles.has(f.p));
  if (loose.length) issues.push({
    id: 'plan-loose-files', kind: 'unused-file', severity: 'low',
    change: `${names(loose.map((f) => f.p))} ${loose.length === 1 ? 'isn’t' : 'aren’t'} connected to anything. Connect ${loose.length === 1 ? 'it' : 'them'} to what should use ${loose.length === 1 ? 'it' : 'them'}, or remove ${loose.length === 1 ? 'it' : 'them'}. `,
    title: loose.length === 1 ? 'One planned file isn’t connected to anything' : `${loose.length} planned files aren’t connected to anything`,
    detail: `Nothing in the plan uses ${loose.length === 1 ? 'it' : 'them'}, and ${loose.length === 1 ? 'it doesn’t' : 'they don’t'} use anything. That usually means a connection is missing from the plan.`,
    items: loose.slice(0, 24).map((f) => 'f:' + f.p),
    notes: Object.fromEntries(loose.slice(0, 24).map((f) => ['f:' + f.p, 'Not connected to anything in the plan'])),
    locations: [],
    fix: [`Design review of floorplan/plan.json: these planned files aren't connected to anything:`, ...loose.map((f) => `- ${f.p}`), ``, `Add the missing "uses", "calls", "services" or "data" entries, or remove files that aren't needed.`, rebuild].join('\n'),
  });

  const ORDER = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  const summary = { high: 0, medium: 0, low: 0 };
  for (const i of issues) summary[i.severity]++;
  return { summary, issues: issues.slice(0, 40), review: true };
}

`


# scripts/lib/common.mjs

`javascript
// Shared helpers: paths, globs, file classification, git, and codebase discovery.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const toPosix = (p) => p.replace(/\\/g, '/');
export const rel = (from, to) => toPosix(path.relative(from, to)) || '.';

// ---------- globs ----------

const GLOB_CHARS = /[*?{[]/;

export function globToRegExp(glob) {
  const g = toPosix(glob).replace(/^\.\//, '').replace(/\/$/, '');
  let re = '';
  let braces = 0;
  for (let i = 0; i < g.length; ) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        const atStart = i === 0 || g[i - 1] === '/';
        const atEnd = i + 2 === g.length || g[i + 2] === '/';
        if (atStart && atEnd) {
          if (i + 2 === g.length) { re += '.*'; i += 2; }
          else { re += '(?:.*/)?'; i += 3; }
          continue;
        }
        re += '.*'; i += 2; continue;
      }
      re += '[^/]*'; i++; continue;
    }
    if (c === '?') { re += '[^/]'; i++; continue; }
    if (c === '{') { braces++; re += '(?:'; i++; continue; }
    if (c === '}' && braces) { braces--; re += ')'; i++; continue; }
    if (c === ',' && braces) { re += '|'; i++; continue; }
    // a whole segment like [id], [...slug] or [[...slug]] is a folder name (Next.js, SvelteKit), not a character class
    if (c === '[' && (i === 0 || g[i - 1] === '/')) {
      const end = g.indexOf('/', i) < 0 ? g.length : g.indexOf('/', i);
      const seg = g.slice(i, end);
      if (/^\[\[?(\.\.\.)?[A-Za-z_$][\w$-]*\]\]?$/.test(seg)) { re += seg.replace(/[.[\]$\\]/g, '\\$&'); i = end; continue; }
    }
    if (c === '[') {
      const j = g.indexOf(']', i + 1);
      if (j > i) { re += '[' + g.slice(i + 1, j).replace(/^!/, '^').replace(/\\/g, '\\\\') + ']'; i = j + 1; continue; }
    }
    re += c.replace(/[.+^$()|\\\]]/g, '\\$&');
    i++;
  }
  return new RegExp('^' + re + '$');
}

/** Compile a glob. A pattern with no wildcards also matches everything under it as a directory. */
export function compileGlob(glob) {
  const g = toPosix(glob).replace(/^\.\//, '').replace(/\/$/, '');
  const literalPrefix = g.split(GLOB_CHARS)[0];
  if (!GLOB_CHARS.test(g)) {
    return { glob, specificity: g.length, test: (p) => p === g || p.startsWith(g + '/') };
  }
  // A glob that names directories (src/components/{a,b}) also matches everything beneath them.
  const re = globToRegExp(g);
  const under = globToRegExp(g + '/**');
  return { glob, specificity: literalPrefix.length, test: (p) => re.test(p) || under.test(p) };
}

// ---------- file classification ----------

const LANG_BY_EXT = {
  '.ts': 'typescript', '.tsx': 'typescript', '.mts': 'typescript', '.cts': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.vue': 'vue', '.svelte': 'svelte', '.astro': 'astro',
  '.py': 'python', '.pyi': 'python',
  '.go': 'go', '.rs': 'rust', '.java': 'java', '.kt': 'kotlin', '.kts': 'kotlin', '.scala': 'scala',
  '.cs': 'csharp', '.fs': 'fsharp', '.rb': 'ruby', '.php': 'php', '.swift': 'swift', '.dart': 'dart',
  '.c': 'c', '.h': 'c', '.cc': 'cpp', '.cpp': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hh': 'cpp', '.m': 'objc', '.mm': 'objc',
  '.ex': 'elixir', '.exs': 'elixir', '.erl': 'erlang', '.clj': 'clojure', '.lua': 'lua', '.r': 'r', '.jl': 'julia',
  '.zig': 'zig', '.elm': 'elm', '.hs': 'haskell', '.ml': 'ocaml', '.groovy': 'groovy',
  '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell', '.ps1': 'powershell', '.psm1': 'powershell',
  '.sql': 'sql', '.tf': 'terraform', '.proto': 'protobuf', '.graphql': 'graphql', '.gql': 'graphql',
  '.css': 'css', '.scss': 'css', '.sass': 'css', '.less': 'css',
  '.html': 'html', '.htm': 'html', '.ejs': 'html', '.hbs': 'html', '.jinja': 'html', '.j2': 'html', '.njk': 'html',
};
const CONFIG_EXT = new Set(['.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.xml', '.gradle', '.properties', '.env']);
const CONFIG_NAMES = /^(dockerfile.*|makefile|procfile|justfile|\.env\..*|\.?[\w-]*rc|gemfile|rakefile|cargo\.toml|go\.mod|pyproject\.toml|setup\.cfg|requirements.*\.txt)$/i;
const JSON_CONFIG = /^(package|tsconfig.*|jsconfig|composer|manifest|app|components|turbo|nx|lerna|angular|firebase|vercel|now|renovate|tslint|.?eslintrc|.?babelrc|.?prettierrc|.*.config|.*rc|settings|launch|tasks|deno|biome|project|workspace|devcontainer|cdk|serverless|appsettings.*|openapi|swagger).json$/i;
const DOC_EXT = new Set(['.md', '.mdx', '.rst', '.adoc', '.txt']);
const DATA_EXT = new Set(['.csv', '.tsv', '.jsonl', '.ndjson', '.parquet', '.sqlite', '.db', '.xlsx', '.xls', '.avro']);
const ASSET_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif', '.bmp', '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.wav', '.webm', '.mov', '.pdf', '.zip', '.gz', '.tar', '.tgz', '.7z', '.jar', '.wasm', '.exe', '.dll', '.so', '.dylib', '.bin']);
const LOCK_NAMES = /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|poetry\.lock|pipfile\.lock|cargo\.lock|go\.sum|composer\.lock|gemfile\.lock|.*\.lock)$/i;
const GENERATED = /(\.min\.(js|css)$|\.map$|\.tsbuildinfo$|\.pyc$|\.pyo$|\.class$|\.o$|(^|\/)next-env\.d\.ts$)/i;

/** Directories never worth scanning, even if a repo tracks them. */
export const HARD_IGNORE_DIRS = new Set([
  'node_modules', '.git', '.pnpm-store', '.yarn', '__pycache__', '.venv', 'venv', 'site-packages',
  '.tox', '.mypy_cache', '.pytest_cache', '.ruff_cache', '.next', '.nuxt', '.svelte-kit', '.turbo',
  '.parcel-cache', '.gradle', '.idea', '.agent', '.agents', '.gemini', '.claude', '.codex',
]);

/** The folder the map lives in, at the codebase root. Maps made before the rename used show-code/. */
export const MAP_DIR = 'floorplan';
export const LEGACY_MAP_DIR = 'show-code';
/** True for a folder holding a map, so a project's own folder that happens to be called "floorplan" isn't taken for one. */
export const isMapDir = (d) => ['architecture.json', 'plan.json', 'graph.json', '.cache'].some((f) => fs.existsSync(path.join(d, f)));
/**
 * Keeps the map folder out of git: its own .gitignore ignores everything in it, itself included, so
 * nothing in the project's tracked files changes. Returns a warning when git already tracks files
 * there (ignoring doesn't untrack them), else null.
 */
export function keepOutOfGit(dir) {
  const gi = path.join(dir, '.gitignore');
  const want = '# Floorplan keeps its map out of git: this ignores everything in this folder, this file included.\n*\n';
  fs.mkdirSync(dir, { recursive: true });
  try { if (!fs.existsSync(gi) || fs.readFileSync(gi, 'utf8') !== want) fs.writeFileSync(gi, want); } catch {}
  const tracked = (git(dir, ['ls-files', '--', '.']) || '').split('\n').filter(Boolean);
  if (!tracked.length) return null;
  const rel = path.basename(dir);
  return `${tracked.length} file(s) in ${rel}/ were committed to git before; they stay tracked until you run: git rm -r --cached ${rel}  (this keeps the files on disk)`;
}

/** The map folder for a codebase root. Moves an old show-code/ map into place unless migrate is false. */
export function mapDir(root, { migrate = true } = {}) {
  const dir = path.join(root, MAP_DIR);
  const old = path.join(root, LEGACY_MAP_DIR);
  if (migrate && !fs.existsSync(dir) && isMapDir(old)) {
    fs.renameSync(old, dir);
    console.error(`(moved the existing map from ${LEGACY_MAP_DIR}/ to ${MAP_DIR}/)`);
  }
  if (fs.existsSync(dir) && !isMapDir(dir) && fs.readdirSync(dir).length) {
    console.error(`✗ ${MAP_DIR}/ already exists here and isn't a map (it's part of the project). Pass --out <folder> to put the map somewhere else.`);
    process.exit(1);
  }
  return dir;
}
/** Extra directories skipped when walking outside of git (where .gitignore can't help). */
export const WALK_IGNORE_DIRS = new Set([...HARD_IGNORE_DIRS, 'dist', 'build', 'out', 'target', 'coverage', '.cache', 'vendor', 'bin', 'obj', 'env', '.vscode', '.claude']);

export function classify(relPath, bytes) {
  const base = path.posix.basename(relPath).toLowerCase();
  const ext = path.posix.extname(base);
  if (GENERATED.test(relPath)) return { category: 'generated', lang: null };
  if (LOCK_NAMES.test(base)) return { category: 'lock', lang: null };
  if (ext === '.log' || base.endsWith('.log')) return { category: 'log', lang: null };
  if (ASSET_EXT.has(ext)) return { category: 'asset', lang: null };
  if (DATA_EXT.has(ext)) return { category: 'data', lang: null };
  if (LANG_BY_EXT[ext]) {
    if (ext === '.svg') return { category: 'asset', lang: null };
    return { category: 'code', lang: LANG_BY_EXT[ext] };
  }
  if (ext === '.json' && (bytes > 100_000 || !JSON_CONFIG.test(base))) return { category: 'data', lang: null };
  if (CONFIG_EXT.has(ext) || CONFIG_NAMES.test(base)) return { category: 'config', lang: ext ? ext.slice(1) : base };
  if (DOC_EXT.has(ext)) return { category: 'docs', lang: null };
  return { category: 'other', lang: null };
}

// ---------- git ----------

export function git(cwd, args) {
  try {
    return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd();
  } catch {
    return null;
  }
}

export function gitInfo(dir) {
  const head = git(dir, ['rev-parse', 'HEAD']);
  const branch = git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const remote = git(dir, ['config', '--get', 'remote.origin.url']);
  return { head, branch, remote: remote ? remote.replace(/\/\/[^@/]+@/, '//') : null };
}

/** Files git considers part of the repo: tracked + untracked-but-not-ignored. */
export function gitFiles(dir) {
  const out = git(dir, ['ls-files', '-co', '--exclude-standard', '-z']);
  if (out == null) return null;
  return [...new Set(out.split('\0').filter(Boolean))].map(toPosix);
}

/** If dir/.git is a file pointing into another repo's worktrees/, return that repo's working dir. */
function worktreeMain(dir) {
  const dotgit = path.join(dir, '.git');
  let st;
  try { st = fs.statSync(dotgit); } catch { return null; }
  if (!st.isFile()) return null;
  const m = /gitdir:\s*(.+)/.exec(fs.readFileSync(dotgit, 'utf8'));
  if (!m) return null;
  const gitdir = path.resolve(dir, m[1].trim());
  const idx = toPosix(gitdir).lastIndexOf('/.git/worktrees/');
  if (idx === -1) return null; // submodule or other indirection: treat as a normal repo
  return path.resolve(toPosix(gitdir).slice(0, idx));
}

// ---------- discovery ----------

/**
 * Walk the codebase root and find every git repo in it. Repos are not descended into
 * (git ls-files covers them). Loose files outside any repo are collected too.
 * Linked worktrees of a repo that is itself in the codebase are skipped as duplicates.
 */
export function discover(root, { includeWorktrees = false, maxLooseFiles = 5000 } = {}) {
  const repos = [];
  const loose = [];
  const skipped = [];

  const walk = (dir, depth) => {
    if (fs.existsSync(path.join(dir, '.git'))) {
      repos.push({ abs: dir, path: rel(root, dir), worktreeOf: worktreeMain(dir) });
      return;
    }
    if (depth > 8) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    if (entries.filter((e) => e.isFile()).length > 500) { skipped.push({ path: rel(root, dir), reason: 'over 500 files outside git (data dump?)' }); return; }
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (WALK_IGNORE_DIRS.has(e.name) || (e.name.startsWith('.') && e.name !== '.github')) {
          if (!['.git', 'node_modules', '__pycache__'].includes(e.name)) skipped.push({ path: rel(root, abs), reason: 'ignored directory' });
          continue;
        }
        walk(abs, depth + 1);
      } else if (e.isFile()) {
        if (loose.length < maxLooseFiles) loose.push(rel(root, abs));
      }
    }
  };
  walk(root, 0);

  // Drop worktree duplicates.
  const norm = (p) => toPosix(path.resolve(p)).toLowerCase();
  const primary = new Set(repos.filter((r) => !r.worktreeOf).map((r) => norm(r.abs)));
  const seenMains = new Set();
  const kept = [];
  for (const r of repos) {
    if (r.worktreeOf && !includeWorktrees && r.abs !== root) {
      const main = norm(r.worktreeOf);
      if (primary.has(main)) { skipped.push({ path: r.path, reason: `worktree of ${rel(root, r.worktreeOf)}` }); continue; }
      if (seenMains.has(main)) { skipped.push({ path: r.path, reason: `another worktree of ${r.worktreeOf}` }); continue; }
      seenMains.add(main);
    }
    kept.push(r);
  }
  return { repos: kept, loose, skipped };
}

// ---------- misc ----------

export function readJsonLoose(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8')
      .replace(/^﻿/, '')
      .replace(/("(?:[^"\\]|\\.)*")|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m, str) => str ?? '')
      .replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export function parseArgs(argv, defaults = {}) {
  const out = { _: [], ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

export const fmtNum = (n) => n >= 10000 ? (n / 1000).toFixed(0) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

`


# scripts/lib/extract.mjs

`javascript
// Per-language, regex-based extraction of imports, exported symbols, HTTP routes and HTTP calls.
// Deliberately approximate: good enough to draw the map, cheap enough to run on any repo.

const lineIndex = (src) => {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
};

const blank = (s) => s.replace(/[^\n]/g, ' ');
// Strip comments while keeping offsets (so line numbers stay right). Strings are stepped over, so a
// '/*' inside one (app.use('/api/*', cors())) doesn't start a comment that swallows the code after it.
const stripCStyle = (src) => {
  let out = '';
  for (let i = 0; i < src.length;) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      // quotes end at the line's end, backticks can span lines
      let j = i + 1;
      while (j < src.length && src[j] !== c && (c === '`' || src[j] !== '\n')) j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    let end = -1;
    if (c === '/' && src[i + 1] === '*') { end = src.indexOf('*/', i + 2); if (end >= 0) end += 2; }
    else if (c === '/' && src[i + 1] === '/' && !/[:\\]/.test(src[i - 1] || '')) { end = src.indexOf('\n', i); if (end < 0) end = src.length; }
    if (end >= 0) { out += blank(src.slice(i, end)); i = end; continue; }
    out += c;
    i++;
  }
  return out;
};
const stripHash = (src) => src.replace(/(^|\s)#[^\n]*/g, (m, pre) => pre + blank(m.slice(pre.length)));

const all = (re, s) => [...s.matchAll(re)];

// ---------- route tables keyed by "METHOD /path" ----------

// Servers without a framework often keep their endpoints in a lookup keyed by method and path, and
// a dispatcher picks the handler: { "GET /api/orders": listOrders } in JS, or
// { "POST /v1/claim": claim_draft, "GET /v1/paths/{slug}": lambda e, s: get_path(s, e) } in Python.
// There's no app.get(...) to find, so these keys are the endpoints. A value counts when it names a
// function (`listOrders`, `oauth.register`), is a short inline function that calls one, or wraps one
// (`requireAuth(listOrders)`). Tables of other things keyed the same way (access levels, docs, status
// codes, ALL_CAPS constants) are left alone, and a file needs two such entries before they count.
const TABLE_KEY = /^[ \t]*["'`](GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|ANY|ALL)[ \t]+(\/[^"'`\s]*)["'`][ \t]*:[ \t]*([^\n]*)/gm;
const NOT_A_HANDLER = /^(?:[A-Z][A-Z0-9_]*|true|false|null|undefined|None|True|False|await|new|return|lambda|function|async)$/;

function tableHandler(raw) {
  const v = raw.trim().replace(/,\s*$/, '').trim();
  const last = (dotted) => dotted.split('.').pop();
  const ref = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.exec(v);
  if (ref) return NOT_A_HANDLER.test(last(v)) ? null : { handler: last(v) };
  // lambda e, s: get_path(s, e)  ·  (req) => getPath(req)  ·  async function (req) { return getPath(req) }
  const inline = /^(?:lambda\b[^:]*:|(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>|(?:async\s+)?function\b[^{]*\{)([\s\S]*)$/.exec(v);
  if (inline) {
    const call = [...inline[1].matchAll(/([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\(/g)].map((m) => last(m[1])).find((n) => !NOT_A_HANDLER.test(n));
    return { handler: call || null };
  }
  // requireAuth(listOrders), login_required(views.orders): the wrapped function is the handler
  const wrap = /^[A-Za-z_$][\w$.]*\(\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*[,)]/.exec(v);
  if (wrap && !NOT_A_HANDLER.test(last(wrap[1]))) return { handler: last(wrap[1]) };
  return null; // a string, number, object, list, or a call on a constant: not a route table
}

function keyedRouteTable(code, at) {
  const out = [];
  for (const m of all(TABLE_KEY, code)) {
    const h = tableHandler(m[3]);
    if (!h) continue;
    const method = m[1] === 'ALL' ? 'ANY' : m[1];
    out.push({ method, path: m[2], var: null, line: at(m.index), framework: 'table', ...(h.handler ? { handler: h.handler } : {}) });
  }
  return out.length >= 2 ? out : [];
}

// ---------- HTTP call literals ----------

const HTTP_CONTEXT = /\b(fetch|axios|ky|got|request|requests|httpx|aiohttp|session|client|http|https|api|Api|API|endpoint|Endpoint|url|Url|URL|BASE|base)\b|\.(get|post|put|patch|delete|head)\s*(<[^>]*>)?\s*\(|(?<![.\w$])(get|post|put|patch|delete)\s*\(\s*[rf]?["'`]\//;
const NAV_CONTEXT = /\b(router\.(push|replace|prefetch)|navigate|redirect|href|revalidatePath|pathname|Link|to=|location\.)\b|window\.location/;
const STR_LITERAL = /(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const IGNORED_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$|\.(test|example|invalid|local|localhost|internal)(:\d+)?$|(^|\.)example\.(com|org|net)$/;
const FILE_EXT_TAIL = /\.(png|jpe?g|gif|svg|ico|webp|css|js|mjs|ts|tsx|json|html?|txt|md|pdf|csv|xml|woff2?|ttf|map)$/i;

function normalizeCallLiteral(raw) {
  let s = raw.trim();
  let host = null;
  // a Firebase function's own address (https://us-central1-<project>.cloudfunctions.net/signDocument) is
  // this app's backend, not an outside service
  const fn = /^https?:\/\/[^/\s]*\.cloudfunctions\.net(\/.*)$/i.exec(s);
  if (fn) s = fn[1];
  const abs = /^https?:\/\/([^/${}\s]+)(.*)$/i.exec(s);
  if (abs) { host = abs[1].toLowerCase(); s = abs[2] || '/'; }
  // leading interpolations: ${API_BASE}/x, {BASE_URL}/x
  s = s.replace(/^(?:\$\{[^}]*\}|\{[^}]*\})+/, '');
  if (!s.startsWith('/')) return null;
  s = s.split(/[?#]/)[0];
  // a query string interpolated straight onto the last segment: `/cost-lots${qs}`, `/items{query}`
  s = s.replace(/([A-Za-z0-9_\-])(?:\$\{[^}]*\}|\{[^}]*\})+$/, '$1');
  if (!/^\/[\w\-.~%/*${}:@<>\[\]]*$/.test(s)) return null;
  if (FILE_EXT_TAIL.test(s)) return null;
  if (!/[a-zA-Z]{2,}/.test(s.replace(/\$\{[^}]*\}|\{[^}]*\}/g, ''))) return host ? { host, path: null } : null;
  return { host, path: s };
}

/**
 * Collapse every ${…} inside template literals to ${x}, counting braces, so nested templates like
 * `/orders${q ? `?${q}` : ''}` read as one literal "/orders${x}" instead of breaking at the inner backtick.
 */
export function flattenTemplates(line) {
  let out = '', inTpl = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\') { out += c + (line[i + 1] ?? ''); i++; continue; }
    if (c === '`') { inTpl = !inTpl; out += c; continue; }
    if (inTpl && c === '$' && line[i + 1] === '{') {
      let depth = 1, j = i + 2;
      for (; j < line.length && depth; j++) { if (line[j] === '{') depth++; else if (line[j] === '}') depth--; }
      out += '${x}'; i = j - 1; continue;
    }
    out += c;
  }
  return out;
}

// `api.post(…)`, or a bare helper imported from an API client: `post("/orders", …)`
const METHOD_CALL = /(?:\.|(?<![\w$])(?=(?:get|post|put|patch|delete)\s*\(\s*[rf]?["'`]\/))(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(/i;
const METHOD_OPT = /method\s*[:=]\s*["'`](\w+)/i;
// `const url = …`, `url = f"…"`, `this.endpoint = …`: a URL kept in a variable for the call below
const ASSIGN = /(?:\b(?:const|let|var)\s+|^\s*(?:self\.|this\.)?)([A-Za-z_$][\w$]*)\s*(?::\s*[\w<>[\]|. ]+?\s*)?=(?![=>])/;
/** Where a variable is passed to an HTTP call within the next few lines, and with which method. */
function variableUse(lines, i, name) {
  const use = new RegExp(`(?:\\.(get|post|put|patch|delete|head|request)\\s*(?:<[^>]*>)?\\s*\\(|\\b(?:fetch|axios|ky|got|request|urlopen)\\s*\\(|\\brequests\\.(get|post|put|patch|delete)\\s*\\()\\s*${name}\\b`, 'i');
  for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
    const m = use.exec(lines[j]);
    if (!m) continue;
    const verb = (m[1] && m[1].toLowerCase() !== 'request' ? m[1] : m[2]) || METHOD_OPT.exec(lines.slice(j, j + 4).join(' '))?.[1] || '';
    return { method: verb.toUpperCase() || null };
  }
  return null;
}

function extractCalls(src, at, { skip } = {}) {
  const calls = [];
  const hosts = [];
  const lines = src.split('\n');
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = flattenTemplates(lines[i]);
    const lineStart = offset;
    offset += lines[i].length + 1;
    if (line.length > 500 || NAV_CONTEXT.test(line)) continue;
    if (skip && skip.test(line)) continue;
    // a URL assigned to a variable counts when an HTTP call below uses that variable
    const assigned = ASSIGN.exec(line)?.[1];
    const use = assigned ? variableUse(lines, i, assigned) : null;
    if (!HTTP_CONTEXT.test(line) && !use) continue;
    const method = (METHOD_CALL.exec(line)?.[1] || METHOD_OPT.exec(line)?.[1] || use?.method || '').toUpperCase() || null;
    for (const m of line.matchAll(STR_LITERAL)) {
      const n = normalizeCallLiteral(m[2]);
      if (!n) continue;
      const lineNo = at(lineStart);
      if (n.host && !IGNORED_HOST.test(n.host) &&!n.host.includes('${') && !n.host.includes('{')) hosts.push({ host: n.host, line: lineNo });
      if (n.path && !n.host) calls.push({ path: n.path, method, line: lineNo });
    }
  }
  return { calls, hosts };
}

// ---------- JS / TS ----------

/** Imported names plus their local bindings: `import users, { a as b } from` → locals { users: 'default', b: 'a' }. */
function parseImportClause(clause) {
  const names = [];
  const locals = {};
  const c = clause.replace(/^type\s+/, '').trim();
  const brace = /\{([^}]*)\}/.exec(c);
  if (brace) for (const part of brace[1].split(',')) {
    const [orig, alias] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).map((s) => s?.trim());
    if (orig) { names.push(orig); locals[alias || orig] = orig; }
  }
  const head = c.replace(/\{[^}]*\}/, '').replace(/,/g, ' ').trim();
  const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(head);
  if (ns) locals[ns[1]] = '*';
  const def = /^([A-Za-z_$][\w$]*)/.exec(head);
  if (def && def[1] !== 'as') { names.push('default'); locals[def[1]] = 'default'; }
  return { names, locals };
}

function extractJs(src, filePath) {
  const code = stripCStyle(src);
  const at = lineIndex(code);
  const imports = [];
  for (const m of all(/(?:^|[;\n}])\s*import\s+(?!\()((?:type\s+)?[^'";]*?)\s+from\s+["']([^"'\n]+)["']/g, code)) imports.push({ spec: m[2], ...parseImportClause(m[1]), line: at(m.index) });
  for (const m of all(/(?:^|[;\n])\s*import\s+["']([^"'\n]+)["']/g, code)) imports.push({ spec: m[1], names: [], line: at(m.index) });
  for (const m of all(/\bexport\s+(?:type\s+)?(\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+["']([^"'\n]+)["']/g, code)) {
    // `export { a as b } from` → exported { b: 'a' }, the names this file passes on
    const clause = m[1].startsWith('{') ? parseImportClause(m[1]) : null;
    imports.push({ spec: m[2], names: clause ? clause.names : [], ...(clause ? { exported: clause.locals } : {}), line: at(m.index), reexport: true });
  }
  for (const m of all(/\brequire\(\s*["']([^"'\n]+)["']\s*\)/g, code)) {
    // `const usersRouter = require('./users')` / `const { a, b: c } = require(…)` bind local names
    const before = code.slice(code.lastIndexOf('\n', m.index) + 1, m.index);
    const bind = /(?:const|let|var)\s+(\{[^}]*\}|[A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?$/.exec(before);
    const locals = {};
    if (bind?.[1].startsWith('{')) for (const part of bind[1].slice(1, -1).split(',')) { const [orig, alias] = part.trim().split(/\s*:\s*/); if (orig) locals[(alias || orig).trim()] = orig.trim(); }
    else if (bind) locals[bind[1]] = 'default';
    imports.push({ spec: m[1], names: Object.values(locals), locals, line: at(m.index) });
  }
  for (const m of all(/\bimport\(\s*["']([^"'\n]+)["']\s*\)/g, code)) imports.push({ spec: m[1], names: [], line: at(m.index), dynamic: true });

  const symbols = [];
  const seen = new Set();
  const addSym = (name, kind, idx, isDefault) => {
    const key = name + (isDefault ? '#d' : '');
    if (seen.has(key)) return;
    seen.add(key);
    symbols.push({ name, kind, line: at(idx), ...(isDefault ? { default: true } : {}) });
  };
  for (const m of all(/^[ \t]*export\s+(default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(function\*?|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm, code)) {
    const kind = m[2].startsWith('function') ? 'function' : ['const', 'let', 'var'].includes(m[2]) ? 'const' : m[2];
    addSym(m[3], kind, m.index, !!m[1]);
  }
  for (const m of all(/^[ \t]*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/gm, code)) {
    if (!['function', 'class', 'async'].includes(m[1])) addSym(m[1], 'default', m.index, true);
  }
  for (const m of all(/^[ \t]*export\s*\{([^}]*)\}\s*;?\s*$/gm, code)) {
    for (const part of m[1].split(',')) {
      const [orig, alias] = part.trim().split(/\s+as\s+/);
      if (orig) addSym((alias || orig).trim(), 'export', m.index, (alias || '').trim() === 'default');
    }
  }
  // Next.js route handlers / module exports
  for (const m of all(/^[ \t]*module\.exports\s*=\s*([A-Za-z_$][\w$]*)?/gm, code)) addSym(m[1] || 'module.exports', 'default', m.index, true);

  // Express / Koa / Hono style routes and mounts
  const routes = [];
  const mounts = [];
  for (const m of all(/\b([A-Za-z_$][\w$]*)\.(get|post|put|patch|delete|all|options|head)\(\s*["'`](\/[^"'`]*)["'`]/g, code)) {
    if (!/^(app|server|fastify|hono|routes?|[a-z]*Router|router)$/.test(m[1])) continue;
    routes.push({ method: m[2].toUpperCase(), path: m[3], var: m[1], line: at(m.index) });
  }
  for (const m of all(/\b([A-Za-z_$][\w$]*)\.(use|route)\(\s*["'`](\/[^"'`]*)["'`]\s*,([^\n;]*)/g, code)) {
    const req = /require\(\s*["']([^"']+)["']\s*\)/.exec(m[4]);
    const mw = (m[4].split(',').map((s) => s.trim()).filter((s) => /^[A-Za-z_$][w$.]*$/.test(s))).map((s) => s.split('.').pop());
    if (req) { mounts.push({ prefix: m[3], spec: req[1], line: at(m.index), ...(mw.length ? { mw } : {}) }); continue; }
    const args = m[4].replace(/\)\s*$/, '').split(',').map((s) => s.trim()).filter((s) => /^[A-Za-z_$][\w$.]*$/.test(s));
    if (args.length) mounts.push({ prefix: m[3], var: args[args.length - 1], line: at(m.index), ...(args.length > 1 ? { mw: args.slice(0, -1).map((s) => s.split('.').pop()) } : {}) });
  }
  // Fastify plugins: app.register(ticketRoutes, { prefix: '/api/tickets' }), or register(import('./x.js'), …).
  // A plugin registered with no prefix still sits under its parent's, so it's a mount with an empty one.
  // Only an imported plugin counts: one defined in this file would put its prefix on every route here.
  for (const m of all(/\.register\(\s*(?:await\s+)?(?:(?:import|require)\(\s*["']([^"'\n]+)["']\s*\)|([A-Za-z_$][\w$]*))\s*(?:,\s*\{([^{}]*)\}\s*)?\)/g, code)) {
    const opts = m[3] || '';
    const prefix = /\bprefix\s*:\s*["'`](\/[^"'`$]*)["'`]/.exec(opts)?.[1] ?? (/\bprefix\s*:/.test(opts) ? null : '');
    if (prefix == null) continue;
    if (m[1]) mounts.push({ prefix, spec: m[1], line: at(m.index) });
    else if (imports.some((i) => i.locals && Object.hasOwn(i.locals, m[2]))) mounts.push({ prefix, var: m[2], line: at(m.index) });
  }

  // Next.js app/pages API routes, derived from the file path
  const next = /(?:^|\/)(?:src\/)?app\/(.*?)\/?route\.(?:t|j)sx?$/.exec(filePath) || /(?:^|\/)(?:src\/)?pages\/(api\/.*?)(?:\/index)?\.(?:t|j)sx?$/.exec(filePath);
  if (next) {
    const p = '/' + next[1].split('/').filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith('@')).join('/');
    const methods = all(/export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g, code).map((m) => m[1]);
    for (const method of methods.length ? methods : ['ANY']) routes.push({ method, path: p, var: null, line: 1, framework: 'next' });
  }

  routes.push(...keyedRouteTable(code, at));

  const triggers = /firebase-functions/.test(code) ? firebaseFunctions(code, at, routes, mounts) : [];

  // a mount's prefix (including Fastify's `prefix: '/api'` option, often on a line of its own) isn't a request
  const serverLine = /\b\w+\.(use|route)\(\s*["'`]\/|\b(?:app|server|fastify|hono|routes?|router|[a-z]+Router)\.(?:get|post|put|patch|delete|all|options|head)\(\s*["'`]\/|\bprefix\s*:\s*["'`]\//;
  const { calls, hosts } = extractCalls(code, at, { skip: serverLine });
  const seenCall = new Set(calls.map((c) => `${c.line}|${c.path}`));
  for (const c of wrapperCalls(code, at)) if (!seenCall.has(`${c.line}|${c.path}`)) calls.push(c);
  const callables = /\bhttpsCallable\b/.test(code) ? callableCalls(code, at) : { calls: [], wrappers: [] };
  calls.push(...callables.calls);
  return { imports, symbols, routes, mounts, calls, hosts, ...(triggers.length ? { triggers } : {}), ...(callables.wrappers.length ? { callableWrappers: callables.wrappers } : {}) };
}

// ---------- Firebase Cloud Functions ----------

// `export const approveItem = onCall(…)`, `exports.sign = functions.region('eu').https.onRequest(…)`,
// `export const nightly = onSchedule('every day 03:00', …)`: the exported name, the chain before the
// trigger (v1 style `functions.firestore.document('x')`), and the trigger itself
const FIREBASE_FN = /(?:\bexport\s+(?:const|let|var)\s+|(?:^|[;\n])[ \t]*(?:const|let|var)\s+|\b(?:module\.)?exports\.)([A-Za-z_$][\w$]*)\s*(?::[^=\n]*)?=\s*((?:[A-Za-z_$][\w$]*(?:\([^()]*\))?\s*\.\s*)*)((?:on|before)[A-Z]\w*)\s*(?:<[^;]{0,300}?>)?\s*\(/g;
const FIRST_STRING = /["'`]([^"'`\n]{1,120})["'`]/;

/**
 * Callable and onRequest functions become endpoints named after their export (CALL /approveItem,
 * ANY /signDocument); Firebase serves an Express app passed to onRequest under the function's name,
 * so that becomes a mount. Every other trigger (schedules, Firestore, Storage, Pub/Sub, Auth) is a
 * background job, returned for the scan summary.
 */
function firebaseFunctions(code, at, routes, mounts) {
  const triggers = [];
  for (const m of code.matchAll(FIREBASE_FN)) {
    const [, name, chain, on] = m;
    const line = at(m.index + m[0].indexOf(name));
    const args = code.slice(m.index + m[0].length, m.index + m[0].length + 300);
    if (on === 'onCall' || on === 'onCallGenkit' || on === 'onRequest') {
      routes.push({ method: on === 'onRequest' ? 'ANY' : 'CALL', path: '/' + name, var: null, line, framework: 'firebase', handler: name });
      const app = on === 'onRequest' && /^\s*(?:\{[^{}]*\}\s*,\s*)?([A-Za-z_$][\w$]*)\s*\)/.exec(args)?.[1];
      if (app) mounts.push({ prefix: '/' + name, var: app, line });
      continue;
    }
    // v1 triggers name the provider in the chain (functions.pubsub.schedule(…).onRun); v2 ones are named for it
    const provider = /\b(pubsub|firestore|storage|auth|database|tasks|analytics|remoteConfig|testLab)\b/.exec(chain)?.[1];
    if (chain ? !provider : !/^(onSchedule|onDocument|onObject|onMessagePublished|onValue|onTaskDispatched|onCustomEventPublished|on\w*Alert|onTestMatrix|onConfigUpdated|before[A-Z])/.test(on)) continue;
    // what it runs on: the last string in the chain (after any region), else the first argument
    const what = [...chain.matchAll(new RegExp(FIRST_STRING, 'g'))].pop()?.[1] || FIRST_STRING.exec(/^[^)]*/.exec(args)[0])?.[1] || null;
    triggers.push({ name, on: provider ? `${provider}.${on}` : on, ...(what ? { what } : {}), line });
  }
  return triggers;
}

// httpsCallable(functions, 'approveItem'), httpsCallable<Req, Res>(getFunctions(app), 'x') and the
// older functions.httpsCallable('x'); the generic arguments may span lines
const CALLABLE = /\bhttpsCallable\s*(?:<[^;]{0,300}?>)?\s*\(\s*(?:[^,()'"`]*(?:\([^()]*\))?\s*,\s*)?(["'`])([\w-]+)\1/g;
const DEFS = /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(([^)]*)\)|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:<[^>]*>\s*)?\(([^)]*)\)\s*(?::\s*[^=]+?)?=>/g;
/** A callable's name as a path: grouped functions deploy as `group-name`, so 'items-approve' → /items/approve. */
const callablePath = (name) => '/' + name.split('-').filter(Boolean).join('/');

/**
 * Calls to Firebase callable functions, by name, plus helpers that wrap httpsCallable
 * (`const call = (name, data) => httpsCallable(functions, name)(data)`) and their same-file uses.
 * The helpers' names are returned too, so scan.mjs can follow uses in the files that import them.
 */
function callableCalls(code, at) {
  const calls = [...code.matchAll(CALLABLE)].map((m) => ({ path: callablePath(m[2]), method: 'CALL', line: at(m.index) }));
  const wrappers = [];
  for (const m of code.matchAll(DEFS)) {
    const name = m[1] || m[3];
    const p0 = /^[A-Za-z_$][\w$]*/.exec((m[2] ?? m[4]).trim())?.[0];
    if (!p0) continue;
    const body = code.slice(m.index + m[0].length, m.index + m[0].length + 400);
    if (!new RegExp(`\\bhttpsCallable\\s*(?:<[^;]{0,300}?>)?\\s*\\(\\s*(?:[^,()'"\`]*(?:\\([^()]*\\))?\\s*,\\s*)?${p0}\\s*[,)]`).test(body)) continue;
    wrappers.push(name);
    calls.push(...callsVia(code, name, at(m.index)));
  }
  return { calls, wrappers };
}

/** Uses of a callable helper: `callFunction('approveItem', data)` → CALL /approveItem. */
function callsVia(code, name, skipLine = 0) {
  const out = [];
  const re = new RegExp(`(?<![\\w$.])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?:<[^;]{0,300}?>)?\\s*\\(\\s*(["'\`])([\\w-]+)\\1`, 'g');
  const at = lineIndex(code);
  for (const m of code.matchAll(re)) {
    const line = at(m.index);
    if (line !== skipLine) out.push({ path: callablePath(m[2]), method: 'CALL', line });
  }
  return out;
}
/** The same, in another file that imports the helper (under its local name there). */
export const callableCallsVia = (src, localName) => callsVia(stripCStyle(src), localName);

/**
 * Calls through a helper defined in the same file that adds a prefix and fetches, e.g.
 *   const call = (path, method = 'GET') => apiClient.request(`/inventory${path}`, { method });
 *   definitions: () => call('/definitions'),
 * becomes GET /inventory/definitions. Only same-file helpers whose first parameter is
 * spliced into a URL that an HTTP call fetches.
 */
function wrapperCalls(code, at) {
  const out = [];
  for (const m of code.matchAll(DEFS)) {
    const name = m[1] || m[3];
    const params = (m[2] ?? m[4]).split(',').map((p) => p.trim()).filter(Boolean);
    const pnames = params.map((p) => /^[A-Za-z_$][\w$]*/.exec(p)?.[0]);
    if (!pnames[0] || /^(get|post|put|patch|delete|request|fetch)$/i.test(name)) continue;
    const rawBody = code.slice(m.index + m[0].length, m.index + m[0].length + 700);
    const body = flattenTemplates(rawBody);
    if (!HTTP_CONTEXT.test(body)) continue;
    const tpl = spliced(rawBody, pnames[0]);
    if (tpl == null) continue;
    const methodIdx = pnames.findIndex((p, i) => i > 0 && (/^method$/i.test(p) || new RegExp(`method\\s*:\\s*${p}\\b`).test(body)));
    const defMethod = (methodIdx > 0 && /=\s*["'`](\w+)["'`]/.exec(params[methodIdx])?.[1]) || METHOD_CALL.exec(body)?.[1] || 'GET';
    const callRe = new RegExp(`\\b${name}\\s*(?:<[^>]*>)?\\(\\s*([\"'\`])((?:\\\\.|(?!\\1)[^\\\\\\n])*)\\1([^\\n]*)`, 'g');
    const defLine = at(m.index);
    code.split('\n').forEach((raw, i) => {
      if (i + 1 === defLine) return; // the definition itself
      for (const c of flattenTemplates(raw).matchAll(callRe)) {
        const n = normalizeCallLiteral(tpl + c[2]);
        if (!n?.path || n.host) continue;
        const verb = methodIdx > 0 ? /["'`](GET|POST|PUT|PATCH|DELETE)["'`]/i.exec(c[3])?.[1] : null;
        out.push({ path: n.path, method: (verb || defMethod).toUpperCase(), line: i + 1 });
      }
    });
  }
  return out;
}
/** The literal prefix right before ${param} in the helper's URL template (`${BASE}/prefix${path}` → "/prefix"), or null. */
function spliced(rawBody, param) {
  const raw = new RegExp(`\`((?:\\$\\{[^}]*\\})*)([^\`$]*)\\$\\{\\s*${param}\\s*\\}`).exec(rawBody);
  return raw ? raw[2] : null;
}

// ---------- Python ----------

function extractPy(src) {
  const code = stripHash(src);
  const at = lineIndex(code);
  const imports = [];
  for (const m of all(/^[ \t]*import[ \t]+([\w., \t]+)$/gm, code)) {
    for (const part of m[1].split(',')) {
      const [mod, alias] = part.trim().split(/\s+as\s+/);
      if (mod) imports.push({ spec: mod.trim(), names: [], alias: alias?.trim(), line: at(m.index) });
    }
  }
  for (const m of all(/^[ \t]*from[ \t]+(\.*[\w.]*)[ \t]+import[ \t]+(\([^)]*\)|[^\n]+)/gm, code)) {
    const names = [];
    const aliases = {};
    for (const part of m[2].replace(/[()\\]/g, ' ').split(',')) {
      const [orig, alias] = part.trim().split(/\s+as\s+/);
      if (orig && orig !== '*') { names.push(orig.trim()); if (alias) aliases[alias.trim()] = orig.trim(); }
    }
    imports.push({ spec: m[1], names, aliases, from: true, line: at(m.index) });
  }

  const symbols = [];
  for (const m of all(/^(?:async[ \t]+)?def[ \t]+([A-Za-z]\w*)/gm, code)) symbols.push({ name: m[1], kind: 'function', line: at(m.index) });
  for (const m of all(/^class[ \t]+([A-Za-z]\w*)/gm, code)) symbols.push({ name: m[1], kind: 'class', line: at(m.index) });
  symbols.sort((a, b) => a.line - b.line);

  const routes = [];
  const routers = {};
  for (const m of all(/^[ \t]*([A-Za-z_]\w*)\s*=\s*(?:\w+\.)?(Blueprint|APIRouter|Router)\(([^)]*)\)/gm, code)) {
    routers[m[1]] = /(?:url_)?prefix\s*=\s*["']([^"']*)["']/.exec(m[3])?.[1] || '';
  }
  for (const m of all(/^[ \t]*@([A-Za-z_]\w*)\.(route|get|post|put|patch|delete|api_route|websocket)\(\s*[rf]?["']([^"']*)["']([^\n]*)/gm, code)) {
    let methods = [m[2].toUpperCase()];
    if (m[2] === 'route' || m[2] === 'api_route') {
      // the decorator's arguments may continue over several lines, up to the next decorator or def
      const rest = code.slice(m.index + m[0].length - m[4].length, m.index + m[0].length + 400).split(/\n\s*(?:@|def |async def )/)[0];
      const ms = /methods\s*=\s*[\[(]([^\])]*)[\])]/.exec(rest);
      methods = ms ? [...ms[1].matchAll(/["'](\w+)["']/g)].map((x) => x[1].toUpperCase()) : ['GET'];
    }
    for (const method of methods) routes.push({ method, path: m[3], var: m[1], line: at(m.index) });
  }
  routes.push(...keyedRouteTable(code, at));
  // Django urls.py
  for (const m of all(/\b(?:re_)?path\(\s*r?["']([^"']*)["']\s*,(?!\s*include\()/g, code)) routes.push({ method: 'ANY', path: '/' + m[1].replace(/^\^|\$$/g, ''), var: null, line: at(m.index), framework: 'django' });

  const mounts = [];
  // path('api/orders/', include('orders.urls')): that module's urls sit under the prefix, and this file uses it
  for (const m of all(/\b(?:re_)?path\(\s*r?["']([^"']*)["']\s*,\s*include\(\s*\(?\s*["']([\w.]+)["']/g, code)) {
    imports.push({ spec: m[2], names: [], line: at(m.index) });
    mounts.push({ spec: m[2], prefix: m[1].replace(/^\^|\$$/g, ''), line: at(m.index) });
  }
  for (const m of all(/\b(register_blueprint|include_router|mount)\(\s*([A-Za-z_][\w.]*)/g, code)) {
    // the call's arguments, up to its own closing bracket: dependencies=[Depends(x)] holds brackets of its own
    let depth = 1, j = m.index + m[0].length;
    while (j < code.length && depth && j - m.index < 2000) { if (code[j] === '(') depth++; else if (code[j] === ')') depth--; j++; }
    const args = code.slice(m.index + m[0].length, j - 1);
    // FastAPI checks applied to every route of the router where it's included:
    // app.include_router(admin.router, dependencies=[Depends(require_admin)])
    const deps = m[1] === 'include_router' ? /dependencies\s*=\s*\[([\s\S]*?)\]/.exec(args)?.[1] : null;
    const mw = deps ? [...deps.matchAll(/\b(?:Depends|Security)\(\s*([\w.]+)/g)].map((d) => d[1].split('.').pop()) : [];
    mounts.push({ var: m[2], prefix: /(?:url_)?prefix\s*=\s*["']([^"']*)["']/.exec(args)?.[1] || '', line: at(m.index), ...(mw.length ? { mw } : {}) });
  }

  const routeLine = /^\s*@\w+\.(route|get|post|put|patch|delete)\(/;
  const { calls, hosts } = extractCalls(code, at, { skip: routeLine });
  return { imports, symbols, routes, mounts, calls, hosts, routers };
}

// ---------- Go ----------

function extractGo(src) {
  const code = stripCStyle(src);
  const at = lineIndex(code);
  const imports = [];
  for (const m of all(/^import\s+(?:[\w.]+\s+)?"([^"]+)"/gm, code)) imports.push({ spec: m[1], names: [], line: at(m.index) });
  for (const block of all(/^import\s*\(([\s\S]*?)\)/gm, code)) {
    for (const m of all(/(?:[\w.]+\s+)?"([^"]+)"/g, block[1])) imports.push({ spec: m[1], names: [], line: at(block.index) });
  }
  const symbols = [];
  for (const m of all(/^func\s+(?:\([^)]*\)\s*)?([A-Z]\w*)/gm, code)) symbols.push({ name: m[1], kind: 'function', line: at(m.index) });
  for (const m of all(/^type\s+([A-Z]\w*)\s+(struct|interface)?/gm, code)) symbols.push({ name: m[1], kind: m[2] || 'type', line: at(m.index) });
  const routes = [];
  for (const m of all(/\.(HandleFunc|Handle|GET|POST|PUT|PATCH|DELETE|Get|Post|Put|Patch|Delete)\(\s*"(\/[^"]*)"/g, code)) {
    const method = /^handle/i.test(m[1]) ? 'ANY' : m[1].toUpperCase();
    const p = m[2].replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '');
    routes.push({ method, path: p, var: null, line: at(m.index) });
  }
  const { calls, hosts } = extractCalls(code, at, { skip: /\.(HandleFunc|Handle|GET|POST)\(/ });
  return { imports, symbols, routes, mounts: [], calls, hosts };
}

// ---------- Rust ----------

function extractRust(src) {
  const code = stripCStyle(src);
  const at = lineIndex(code);
  const imports = [];
  for (const m of all(/^[ \t]*(?:pub(?:\([^)]*\))?\s+)?mod\s+(\w+)\s*;/gm, code)) imports.push({ spec: m[1], kind: 'mod', names: [], line: at(m.index) });
  for (const m of all(/^[ \t]*(?:pub(?:\([^)]*\))?\s+)?use\s+([\w:]+)/gm, code)) imports.push({ spec: m[1], kind: 'use', names: [], line: at(m.index) });
  const symbols = [];
  for (const m of all(/^[ \t]*pub\s+(?:async\s+)?(fn|struct|enum|trait|type|const|static)\s+(\w+)/gm, code)) symbols.push({ name: m[2], kind: m[1] === 'fn' ? 'function' : m[1], line: at(m.index) });
  const routes = [];
  for (const m of all(/#\[(get|post|put|patch|delete)\(\s*"([^"]+)"/g, code)) routes.push({ method: m[1].toUpperCase(), path: m[2], var: null, line: at(m.index) });
  for (const m of all(/\.route\(\s*"([^"]+)"\s*,\s*(get|post|put|patch|delete)/g, code)) routes.push({ method: m[2].toUpperCase(), path: m[1], var: null, line: at(m.index) });
  const { calls, hosts } = extractCalls(code, at);
  return { imports, symbols, routes, mounts: [], calls, hosts };
}

// ---------- JVM ----------

function extractJvm(src) {
  const code = stripCStyle(src);
  const at = lineIndex(code);
  const pkg = /^\s*package\s+([\w.]+)/m.exec(code)?.[1] || null;
  const imports = all(/^\s*import\s+(?:static\s+)?([\w.*]+)/gm, code).map((m) => ({ spec: m[1], names: [], line: at(m.index) }));
  const symbols = [];
  for (const m of all(/^\s*(?:public\s+|internal\s+)?(?:abstract\s+|final\s+|data\s+|sealed\s+|open\s+)*(class|interface|enum|record|object)\s+(\w+)/gm, code)) symbols.push({ name: m[2], kind: m[1], line: at(m.index) });
  const routes = [];
  const classPrefix = /@RequestMapping\(\s*(?:value\s*=\s*|path\s*=\s*)?"([^"]*)"[^)]*\)\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:public\s+)?class/.exec(code)?.[1] || '';
  for (const m of all(/@(Get|Post|Put|Patch|Delete|Request)Mapping\(\s*(?:value\s*=\s*|path\s*=\s*)?"([^"]*)"/g, code)) {
    if (m[1] === 'Request' && m[2] === classPrefix) continue;
    routes.push({ method: m[1] === 'Request' ? 'ANY' : m[1].toUpperCase(), path: classPrefix + m[2], var: null, line: at(m.index) });
  }
  const { calls, hosts } = extractCalls(code, at, { skip: /@\w+Mapping/ });
  return { imports, symbols, routes, mounts: [], calls, hosts, pkg };
}

// ---------- small ones ----------

function extractSimple(src, lang) {
  const code = lang === 'ruby' ? stripHash(src) : stripCStyle(src);
  const at = lineIndex(code);
  const imports = [];
  if (lang === 'ruby') for (const m of all(/\brequire_relative\s*\(?\s*["']([^"']+)["']/g, code)) imports.push({ spec: './' + m[1].replace(/^\.\//, ''), names: [], line: at(m.index) });
  if (lang === 'c' || lang === 'cpp' || lang === 'objc') for (const m of all(/^\s*#\s*(?:include|import)\s+"([^"]+)"/gm, code)) imports.push({ spec: m[1], names: [], kind: 'include', line: at(m.index) });
  if (lang === 'php') for (const m of all(/\b(?:require|include)(?:_once)?\s*\(?\s*(?:__DIR__\s*\.\s*)?["']([^"']+)["']/g, code)) imports.push({ spec: m[1].startsWith('/') ? '.' + m[1] : m[1], names: [], line: at(m.index) });
  if (lang === 'css') for (const m of all(/@(?:import|use|forward)\s+(?:url\()?["']([^"']+)["']/g, code)) imports.push({ spec: m[1].startsWith('.') ? m[1] : './' + m[1], names: [], line: at(m.index) });
  const symbols = [];
  if (lang === 'ruby') for (const m of all(/^\s*(class|module)\s+([A-Z][\w:]*)/gm, code)) symbols.push({ name: m[2], kind: m[1], line: at(m.index) });
  if (lang === 'csharp') for (const m of all(/^\s*public\s+(?:static\s+|abstract\s+|sealed\s+|partial\s+)*(class|interface|enum|record|struct)\s+(\w+)/gm, code)) symbols.push({ name: m[2], kind: m[1], line: at(m.index) });
  const { calls, hosts } = ['ruby', 'php', 'csharp', 'swift', 'dart', 'kotlin'].includes(lang) ? extractCalls(code, at) : { calls: [], hosts: [] };
  return { imports, symbols, routes: [], mounts: [], calls, hosts };
}

function extractByLang(src, lang, filePath) {
  switch (lang) {
    case 'typescript': case 'javascript': case 'vue': case 'svelte': case 'astro': return extractJs(src, filePath);
    case 'python': return extractPy(src);
    case 'go': return extractGo(src);
    case 'rust': return extractRust(src);
    case 'java': case 'kotlin': case 'scala': case 'groovy': return extractJvm(src);
    default: return extractSimple(src, lang);
  }
}

export function extract(src, lang, filePath) {
  const r = extractByLang(src, lang, filePath);
  addDocs(src, lang, r);
  return r;
}

// ---------- docs: file headers, docstrings, JSDoc, route handlers ----------

const HASH_LANGS = new Set(['python', 'ruby', 'shell', 'powershell', 'r', 'elixir', 'perl']);
const LICENSE = /copyright|license|spdx|eslint-disable|@ts-nocheck|prettier-ignore|^-\*-|coding[:=]|generated by|do not edit/i;

export function cleanDoc(text) {
  if (!text) return null;
  const lines = text.split('\n')
    .map((l) => l.replace(/^\s*(\/\*\*?|\*\/|\*|\/\/\/?|#+|"""|''')\s?/, '').replace(/(\*\/|"""|''')\s*$/, '').trim())
    .filter((l) => l && !/^@\w+/.test(l) && !/^[-=*_]{3,}$/.test(l));
  // first paragraph only
  const para = [];
  for (const l of lines) { if (!l && para.length) break; para.push(l); }
  let s = para.join(' ').replace(/\s+/g, ' ').trim();
  if (!s || s.length < 8 || LICENSE.test(s)) return null;
  const sentence = /^(.{20,220}?[.!?])(\s|$)/.exec(s);
  s = sentence ? sentence[1] : s.length > 220 ? s.slice(0, 217).replace(/\s+\S*$/, '') + '…' : s;
  return s;
}

function pyDocAfter(lines, idx) {
  // idx: 0-based line of the def/class (or -1 for module). Find the end of the signature, then a string literal.
  let i = idx;
  if (idx >= 0) {
    while (i < lines.length && i < idx + 20 && !/:\s*(#.*)?$/.test(lines[i])) i++;
    i++;
  } else i = 0;
  while (i < lines.length && (!lines[i].trim() || (idx < 0 && /^\s*(#|from __future__)/.test(lines[i])))) i++;
  const first = lines[i];
  if (!first) return null;
  const m = /^\s*[rRbBuUfF]?("""|''')(.*)$/.exec(first);
  if (!m) return idx < 0 ? hashHeader(lines) : null;
  const q = m[1];
  if (m[2].includes(q)) return cleanDoc(m[2].slice(0, m[2].indexOf(q)));
  const buf = [m[2]];
  for (let j = i + 1; j < lines.length && j < i + 40; j++) {
    const k = lines[j].indexOf(q);
    if (k >= 0) { buf.push(lines[j].slice(0, k)); break; }
    buf.push(lines[j]);
  }
  return cleanDoc(buf.join('\n'));
}

function hashHeader(lines) {
  const buf = [];
  for (const l of lines) {
    if (/^#!/.test(l)) continue;
    if (/^\s*#/.test(l)) { buf.push(l); continue; }
    if (!l.trim() && !buf.length) continue;
    break;
  }
  return cleanDoc(buf.join('\n'));
}

function commentBefore(lines, idx) {
  // idx: 0-based line of the declaration. Skip decorators/annotations, then read a /** */ block or // run.
  let i = idx - 1;
  while (i >= 0 && /^\s*@/.test(lines[i])) i--;
  if (i < 0) return null;
  if (/\*\/\s*$/.test(lines[i])) {
    const end = i;
    while (i >= 0 && !/\/\*/.test(lines[i])) i--;
    return i >= 0 ? cleanDoc(lines.slice(i, end + 1).join('\n')) : null;
  }
  const buf = [];
  while (i >= 0 && /^\s*(\/\/|#(?!!))/.test(lines[i])) buf.unshift(lines[i--]);
  return buf.length ? cleanDoc(buf.join('\n')) : null;
}

function headerComment(lines) {
  let i = 0;
  while (i < lines.length && (!lines[i].trim() || /^\s*['"]use (client|server|strict)['"];?\s*$/.test(lines[i]) || /^#!/.test(lines[i]))) i++;
  const l = lines[i] || '';
  if (/^\s*\/\*/.test(l)) {
    const start = i;
    while (i < lines.length && !/\*\//.test(lines[i])) i++;
    return cleanDoc(lines.slice(start, i + 1).join('\n'));
  }
  const buf = [];
  while (i < lines.length && /^\s*\/\//.test(lines[i])) buf.push(lines[i++]);
  return cleanDoc(buf.join('\n'));
}

function addDocs(src, lang, r) {
  const lines = src.split('\n');
  r.doc = lang === 'python' ? pyDocAfter(lines, -1) : HASH_LANGS.has(lang) ? hashHeader(lines) : headerComment(lines);
  for (const s of r.symbols || []) {
    const d = lang === 'python' ? pyDocAfter(lines, s.line - 1) : commentBefore(lines, s.line - 1);
    if (d) s.doc = d;
  }
  // A route's handler is the first declaration after it (decorator-style frameworks).
  // (a Firebase function's export isn't the handler of the Express routes above it)
  const fbNames = new Set((r.routes || []).filter((rt) => rt.framework === 'firebase').map((rt) => rt.handler));
  const syms = (r.symbols || []).filter((s) => !fbNames.has(s.name)).sort((a, b) => a.line - b.line);
  for (const rt of r.routes || []) {
    if (rt.framework === 'next') { rt.handler = rt.method; continue; }
    if (rt.framework === 'table') { const d = r.symbols?.find((s) => s.name === rt.handler)?.doc; if (d) rt.doc = d; continue; }
    if (rt.framework === 'firebase') { const d = r.symbols.find((s) => s.name === rt.handler)?.doc || commentBefore(lines, rt.line - 1); if (d) rt.doc = d; continue; }
    const h = syms.find((s) => s.line >= rt.line && s.line - rt.line <= 12);
    if (h) { rt.handler = h.name; if (h.doc) rt.doc = h.doc; }
    else if (lang === 'python') {
      const m = lines.slice(rt.line, rt.line + 12).findIndex((l) => /^\s*(async\s+)?def\s+\w+/.test(l));
      if (m >= 0) {
        rt.handler = /def\s+(\w+)/.exec(lines[rt.line + m])[1];
        const d = pyDocAfter(lines, rt.line + m);
        if (d) rt.doc = d;
      }
    }
  }
}

`


# scripts/lib/health.mjs

`javascript
// Health check: plain-language warnings about the codebase (secrets, endpoints anyone can call,
// the usual Supabase / Firebase / Stripe / CORS mistakes, unused files, oversized files), written for
// people who built an app with AI and don't know its insides. It's a check, not an audit. Precision
// beats recall: a false alarm costs this audience more than a missed one.
//
// findIssues(src, file)  — called by scan.mjs for every code/config/docs file with its source.
//                           Returns raw findings for that file, stored in scan.json files[].issues.
//                           Findings never contain a secret's value, only its line, kind and a masked hint.
// buildHealth(ctx)       — called by build.mjs with { graph, scan, arch, root } after the graph is built.
//                           Returns { summary: { high, medium, low }, issues: [...] }, stored as graph.health.

import fs from 'node:fs';
import path from 'node:path';
import { git, compileGlob } from './common.mjs';

const lineIndex = (src) => {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
};

/** Shannon entropy in bits per character: random keys score ~4+, words and placeholders ~2-3. */
function entropy(s) {
  const counts = new Map();
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
  let e = 0;
  for (const n of counts.values()) { const p = n / s.length; e -= p * Math.log2(p); }
  return e;
}

// Files where keys are usually fake: tests, fixtures, examples, docs.
const TEST_FILE = /(^|\/)(tests?|__tests__|__mocks__|spec|specs|e2e|fixtures?|testdata|mocks?)\/|\.(test|spec|stories)\.[a-z]+$|(^|\/)test_[^/]*\.py$|_test\.(py|go)$|(^|\/)conftest\.py$/i;
const EXAMPLE_FILE = /(^|\/)(examples?|samples?|docs?|demo)\/|\.(example|sample|template|dist|tmpl)(\.|$)|(^|\/)[^/]*example[^/]*$/i;
const PLACEHOLDER = /your|xxxx|example|changeme|change[-_]?me|placeholder|replace|dummy|fake|sample|redacted|insert|<[^>]*>|\$\{|\{\{|%\(|\*\*\*|0{8,}|1234567|abcdef|_here\b|-here\b/i;

// ---------- 1. secrets ----------

// Well-known key formats. `sev` defaults to high; `live` formats are flagged even in test files.
const FORMATS = [
  { re: /\bAKIA[0-9A-Z]{16}\b/g, what: 'an Amazon Web Services (AWS) access key', svc: 'AWS', live: true },
  { re: /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}/g, what: 'a Stripe live secret key', svc: 'Stripe', live: true },
  { re: /\b(?:sk|rk)_test_[0-9a-zA-Z]{20,}/g, what: 'a Stripe test key', svc: 'Stripe', sev: 'medium' },
  { re: /\bwhsec_[A-Za-z0-9]{24,}/g, what: 'a Stripe webhook signing secret', svc: 'Stripe' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g, what: 'a GitHub access token', svc: 'GitHub', live: true },
  { re: /\bgithub_pat_[A-Za-z0-9_]{50,}/g, what: 'a GitHub access token', svc: 'GitHub', live: true },
  { re: /\bglpat-[A-Za-z0-9_-]{20,}/g, what: 'a GitLab access token', svc: 'GitLab', live: true },
  { re: /\bxox[abposr]-[A-Za-z0-9-]{10,}/g, what: 'a Slack token', svc: 'Slack', live: true },
  { re: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]{20,}/g, what: 'a Slack webhook address (anyone with it can post to your Slack)', svc: 'Slack', sev: 'medium' },
  { re: /\bAIza[0-9A-Za-z_\-]{35}\b/g, what: 'a Google API key', svc: 'Google Cloud', sev: 'medium', skipIf: /firebase|authDomain|messagingSenderId/i },
  { re: /\bGOCSPX-[A-Za-z0-9_\-]{20,}/g, what: 'a Google sign-in client secret', svc: 'Google Cloud' },
  { re: /\bsk-ant-[a-z]+\d*-[A-Za-z0-9_\-]{40,}/g, what: 'an Anthropic (Claude) API key', svc: 'Anthropic', live: true },
  { re: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_\-]{16,}T3BlbkFJ[A-Za-z0-9_\-]{16,}/g, what: 'an OpenAI API key', svc: 'OpenAI', live: true },
  { re: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_\-]{40,}/g, what: 'an OpenAI API key', svc: 'OpenAI', live: true },
  // (a passphrase-protected key, ENCRYPTED PRIVATE KEY or Proc-Type: 4,ENCRYPTED, is left alone: see encryptedKeyAt)
  { re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g, what: 'a private key', svc: null, whole: true },
  { re: /\bSG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}\b/g, what: 'a SendGrid email API key', svc: 'SendGrid', live: true },
  { re: /\bsq0csp-[0-9A-Za-z_\-]{40,}/g, what: 'a Square app secret', svc: 'Square', live: true },
  { re: /\bsq0atp-[0-9A-Za-z_\-]{20,}/g, what: 'a Square access token', svc: 'Square', live: true },
  { re: /\bEAAA[A-Za-z0-9_\-]{60,}/g, what: 'a Square access token', svc: 'Square', live: true },
  { re: /\bshp(?:at|ss|ca|pa)_[a-fA-F0-9]{32}\b/g, what: 'a Shopify access token', svc: 'Shopify', live: true },
  { re: /\bhf_[A-Za-z0-9]{30,}\b/g, what: 'a Hugging Face token', svc: 'Hugging Face', live: true },
  { re: /\bnpm_[A-Za-z0-9]{36}\b/g, what: 'an npm publishing token', svc: 'npm', live: true },
  { re: /\bsbp_[a-f0-9]{40}\b/g, what: 'a Supabase account token', svc: 'Supabase', live: true },
  { re: /\bsb_secret_[A-Za-z0-9_\-]{20,}/g, what: 'a Supabase secret key', svc: 'Supabase', live: true },
  { re: /\b\d{8,10}:AA[0-9A-Za-z_\-]{33}\b/g, what: 'a Telegram bot token', svc: 'Telegram', live: true },
  { re: /\bdop_v1_[a-f0-9]{64}\b/g, what: 'a DigitalOcean token', svc: 'DigitalOcean', live: true },
  { re: /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/g, what: 'an Airtable token', svc: 'Airtable', live: true },
];
const JWT = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}/g;
const DB_URL = /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?)(?:\+\w+)?:\/\/([^:\s\/'"@]+):([^@\s'"]+)@([^\/\s'":?,]+)/g;
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|db|postgres|mysql|redis|mongo|database|host\.docker\.internal)$/i;

// Names that hold secrets (after camelCase → snake_case). Public-by-design keys are excluded below.
const SECRET_NAME = /(?:^|[_.-])(api_?key|apikey|secret(?:_?key)?|client_?secret|app_?secret|token|access_?token|refresh_?token|auth_?token|authtoken|bearer_?token|passw(?:or)?d|passwd|pwd|private_?key|secret_?access_?key|signing_?(?:key|secret)|signature_?key|webhook_?secret|encryption_?key|auth(?:orization)?_?key|master_?key|credentials?)$/i;
const PUBLIC_NAME = /(^|_)(public|publishable|anon|site_?key|example|sample|test|dummy|fake|mock|placeholder|default|field|label|header|name|type|url|uri|endpoint|path|file|env|var|prefix|length|len|min|max|regex|pattern|format|expires?|ttl)(_|$)|^(next_public|vite|react_app|expo_public|nuxt_public|gatsby)_/i;
const ENV_LOOKUP = /os\.environ|os\.getenv|getenv\(|process\.env|import\.meta\.env|ENV\[|ENV\.fetch|System\.getenv|Deno\.env|secrets\.|config\(\s*['"]|env\(\s*['"]|\$\{\{/;
const PASSWORD_NAME = /pass|pwd/i;
const CONFIG_LANGS = new Set(['yaml', 'yml', 'ini', 'cfg', 'conf', 'properties', 'env', 'toml']);

const snake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const kindFromName = (name) => {
  const n = snake(name);
  if (/pass|pwd/.test(n)) return 'a password';
  if (/private_?key/.test(n)) return 'a private key';
  if (/token/.test(n)) return 'an access token';
  if (/api_?key|apikey/.test(n)) return 'an API key';
  if (/credential/.test(n)) return 'login credentials';
  return 'a secret key';
};
const mask = (v, password) => password || v.length < 12 ? `${v.length} characters` : `starts “${v.slice(0, 4)}…”, ${v.length} characters`;

// A stored password hash isn't the password: bcrypt / argon2 / scrypt / crypt(3) ($2b$…, $argon2id$…,
// $6$…), Django's pbkdf2_sha256$…, LDAP's {SSHA}…, and anything kept under a name that says it's a hash.
const HASHED_VALUE = /^\$(2[abxy]?|argon2(id|i|d)|scrypt|pbkdf2[\w-]*|[156]|y|7|sha\d*|md5)\$|^(pbkdf2_sha\d+|bcrypt(_sha256)?|argon2|scrypt|sha1|md5)\$|^\{(S?SHA\d*|SMD5|CRYPT|PBKDF2[\w-]*)\}/i;
// (HASH_SECRET, PASSWORD_HASH_KEY and HASH_SALT are the secret that makes the hash, so they don't count.)
const HASHED_NAME = /(^|_)(hash|hashed|hashes|digest|bcrypt|argon2?|scrypt|pbkdf2)(_(?!.*(secret|key|salt|pepper|token))|$)/i;
// Encrypted values are safe to commit (that's the point): dotenvx's encrypted:…, sops' ENC[AES256_GCM,…],
// Ansible Vault, AWS KMS ciphertext, HashiCorp Vault transit (vault:v1:…), age and PGP armour, OpenSSL's
// "Salted__" (U2FsdGVkX1…) and Python's Fernet (gAAAAA…).
const ENCRYPTED_VALUE = /^encrypted:[A-Za-z0-9+/=_-]{20,}|^ENC\[[A-Z0-9_]+,data:|^\$ANSIBLE_VAULT;|^!vault\b|^AQICAH[A-Za-z0-9+/=]{40,}$|^vault:v\d+:|^-----BEGIN (AGE ENCRYPTED FILE|PGP MESSAGE)-----|^U2FsdGVkX1[A-Za-z0-9+/=]{10,}|^gAAAAA[A-Za-z0-9_=-]{40,}/;
/** A value that's a password hash or ciphertext rather than the secret itself. */
export const protectedValue = (v, name = '') => ENCRYPTED_VALUE.test(v) || HASHED_VALUE.test(v) || HASHED_NAME.test(snake(name));

function valueLooksReal(v, name) {
  if (/\s/.test(v) || PLACEHOLDER.test(v)) return false;
  if (protectedValue(v, name)) return false;
  if (/^(none|null|nil|undefined|true|false|string|number|text|required|optional|bearer|basic|secret|token|password|test|dev|development|local|admin)$/i.test(v)) return false;
  if (/^[A-Z][A-Z0-9_]+$/.test(v)) return false;                 // the NAME of an env var
  if (/^env\([A-Za-z_][\w]*\)$/.test(v)) return false;           // Supabase config.toml reading one: "env(S3_SECRET_KEY)"
  if (/^[a-z_]+(\.[a-z_]+)+$/i.test(v)) return false;            // dotted identifier / key path
  if (/^(\.{0,2}\/|~\/|https?:\/\/|[a-z]:\\)/i.test(v)) return false; // paths and URLs
  if (/\.(json|pem|key|txt|ya?ml|env|crt|p12)$/i.test(v)) return false; // a file name, not the key
  if (/^x-[\w-]+$/i.test(v) || /^(application|text)\//.test(v)) return false;
  if (/^(.)\1+$/.test(v)) return false;
  if (/^(pass(word)?|secret|admin|test|user|changeit|letmein|qwerty|demo|guest|root|welcome)[\d!@#$._-]*$/i.test(v)) return false;
  if (PASSWORD_NAME.test(name)) return v.length >= 6 && !/^[a-z]+$/.test(v);
  return v.length >= 16 && entropy(v) >= 3.2 && /\d/.test(v) && /[a-zA-Z]/.test(v);
}

// Tokens that are public by design, because the browser has to send them: Cloudflare Web Analytics'
// beacon (data-cf-beacon='{"token":"…"}') and Mapbox public tokens (pk.…)
const PUBLIC_TOKEN_LINE = /data-cf-beacon|cloudflareinsights\.com/i;
const PUBLIC_TOKEN_VALUE = /^pk\.[\w-]{20,}\.[\w-]{10,}$/;
// A site token handed to a browser tracker's script: the script reads it from the page, so every visitor has it.
// Names that say more than "token" (access, auth, secret…) and real key formats are never excused this way.
const SCRIPT_TAG = /<script\b|createElement\(\s*['"]script['"]\s*\)/i;
const TRACKER_FILE = /analytics|tracker|tracking|beacon|pixel|telemetry/i;
const NOT_SITE_TOKEN = /secret|passw|private|access|refresh|auth|bearer|api_?key|signing/i;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function trackerToken(name, value, src, file) {
  const n = snake(name);
  if (!/token$/.test(n) || NOT_SITE_TOKEN.test(n) || !SCRIPT_TAG.test(src)) return false;
  if (TRACKER_FILE.test(file.split('/').pop())) return true;
  const id = escapeRe(name), val = escapeRe(value);
  return new RegExp('<script\\b[^>]*\\bdata-[\\w-]+\\s*=\\s*(?:\\{\\s*' + id + '\\s*\\}|["\'`]' + val + ')', 'i').test(src)
    || new RegExp('dataset\\.\\w+\\s*=\\s*' + id + '\\b|setAttribute\\(\\s*[\'"]data-[\\w-]+[\'"]\\s*,\\s*' + id + '\\b').test(src);
}

/** 1-based line numbers inside docstrings or block comments (examples there aren't real config). */
function docLines(src, lang) {
  const set = new Set();
  if (!['python', 'typescript', 'javascript', 'java', 'kotlin', 'go', 'csharp', 'php', 'rust', 'swift'].includes(lang)) return set;
  const re = lang === 'python' ? /("""|''')[\s\S]*?\1/g : /\/\*[\s\S]*?\*\//g;
  const at = lineIndex(src);
  for (const m of src.matchAll(re)) { const a = at(m.index), b = at(m.index + m[0].length); for (let l = a; l <= b; l++) set.add(l); }
  return set;
}

/** A PEM private key block starting at `idx` that is passphrase-protected (legacy OpenSSL headers). */
const encryptedKeyAt = (src, idx) => /^[^\n]*\n(?:[^\n]*\n)?\s*Proc-Type:\s*4,\s*ENCRYPTED/.test(src.slice(idx, idx + 300));
/** A key file's head holds a private key that isn't passphrase-protected. */
const plainKeyIn = (head) => [...head.matchAll(/-----BEGIN ([A-Z ]*)PRIVATE KEY(?: BLOCK)?-----/g)].some((m) => !/ENCRYPTED/.test(m[1]) && !encryptedKeyAt(head, m.index));

function findSecrets(src, f, out) {
  const at = lineIndex(src);
  const isTest = TEST_FILE.test(f.path) || EXAMPLE_FILE.test(f.path);
  const seenLines = new Set();
  const add = (line, rec) => { if (seenLines.has(line)) return; seenLines.add(line); out.push({ k: 'secret', line, ...rec }); };

  for (const fm of FORMATS) {
    if (fm.skipIf?.test(src)) continue;
    for (const m of src.matchAll(fm.re)) {
      const v = m[0];
      if (isTest && (!fm.live || fm.whole)) continue;
      if (!fm.whole && (/EXAMPLE|xxxx|XXXX|0{10,}/.test(v) || entropy(v) < 3)) continue;
      if (fm.whole && encryptedKeyAt(src, m.index)) continue;
      add(at(m.index), { what: fm.what, svc: fm.svc, sev: fm.sev || 'high', hint: fm.whole ? 'private key block' : mask(v) });
    }
  }
  if (!isTest) {
    for (const m of src.matchAll(JWT)) {
      let payload = null;
      try { payload = JSON.parse(Buffer.from(m[0].split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch { continue; }
      if (payload?.role !== 'service_role') continue; // "anon" keys are public by design
      add(at(m.index), { what: 'a Supabase service-role key (full access to your database, skipping all security rules)', svc: 'Supabase', sev: 'high', hint: mask(m[0]) });
    }
    for (const m of src.matchAll(DB_URL)) {
      const [, user, pw, host] = m;
      if (LOCAL_HOST.test(host) || PLACEHOLDER.test(pw) || /^[:$%{<]/.test(pw) || pw.length < 4 || /^(password|pass|postgres|root|secret|admin|user)$/i.test(pw)) continue;
      add(at(m.index), { what: 'a database password inside a connection address', svc: 'your database', sev: 'high', hint: mask(pw, true) });
    }
  }
  if (isTest || f.category === 'docs') return;

  // Assignments: api_key = "…", "password": "…", PASSWORD=… (config files may leave values unquoted).
  const lines = src.split('\n');
  const inDoc = docLines(src, f.lang);
  // CI / docker-compose database containers get throwaway passwords
  const throwawayDb = /(^|\/)\.github\/|(^|\/)(docker-)?compose[\w.-]*\.ya?ml$/i.test(f.path);
  const quoted = /(["']?)([A-Za-z_][\w.-]*)\1\s*(?::=|=>|=|:)\s*(?:[rbuRBU]{1,2})?(["'`])([^"'`\n]{6,200})\3/g;
  const unquoted = /^\s*(?:export\s+)?([A-Za-z_][\w.-]*)\s*[:=]\s*([^\s#'"]{6,200})\s*(?:#.*)?$/;
  lines.forEach((text, i) => {
    if (text.length > 400 || ENV_LOOKUP.test(text) || PUBLIC_TOKEN_LINE.test(text) || inDoc.has(i + 1) || /^\s*(#|\/\/|\*|\/\*|<!--)/.test(text)) return;
    const pairs = [...text.matchAll(quoted)].map((m) => [m[2], m[4]]);
    if (!pairs.length && (f.category === 'config' && CONFIG_LANGS.has(f.lang))) { const u = unquoted.exec(text); if (u) pairs.push([u[1], u[2]]); }
    for (const [name, value] of pairs) {
      const n = snake(name.split('.').pop());
      if (!SECRET_NAME.test(n) || PUBLIC_NAME.test(n) || PUBLIC_TOKEN_VALUE.test(value) || !valueLooksReal(value, n)) continue;
      if (trackerToken(name.split('.').pop(), value, src, f.path)) continue;
      if (throwawayDb && /^(postgres|mysql|mariadb|mongo(_initdb_root)?|redis|pg|rabbitmq_default|db|database)_(root_)?(password|pass|pwd)$/.test(n)) continue;
      add(i + 1, { what: kindFromName(name), name: name.split('.').pop(), sev: 'high', hint: mask(value, PASSWORD_NAME.test(n)), generic: true });
    }
  });
}

// ---------- 2. who may call each endpoint ----------

// Decorators / middleware / dependencies whose names say "check who is calling".
const GUARD_NAME = /(^|_)(login|auth|authenticated|authorized?|jwt|token|permission|permissions|perm|role|roles|staff|admin|superuser|owner|scope|scopes|session|api_?key|signature|signed|hmac|device|member|user)(_|$)|_required$|^requires?_|^ensure_|^verify_|^guard(?:_|$)|_guard$|^check_(auth|token|user|session|permission|role|api)|protect|^is_?authenticated|^is_?admin/i;
const NOT_GUARD = /^(route|get|post|put|patch|delete|cached?|limit|limiter|rate_?limit\w*|cross_origin|wraps|staticmethod|classmethod|property|retry|timed|log\w*|swag_from|validate\w*|expects|marshal\w*|doc|json_required|fields?_required|params?_required|body_required|transaction\w*|csrf\w*|exempt)$/i;
const isGuardName = (name) => !!name && !NOT_GUARD.test(name) && GUARD_NAME.test(snake(name));
// FastAPI dependencies that hand over a database session rather than check the caller
// (SessionDep, get_db, get_sql_session, SessionLocal, a unit of work), matched on the snake_case name
const DB_DEPENDENCY = /^(get_|new_|create_)?(async_)?(db|database|session|db_session|sessionmaker)$|(^|_)(db|database|sql\w*|engine|conn|connection|cursor|uow|unit_of_work)(_|$)|session_?(local|maker|factory)/i;
const isDbDep = (name) => DB_DEPENDENCY.test(snake(name));
const isGuardDep = (name) => isGuardName(name) && !isDbDep(name);
// A handler body that inspects the caller itself.
const INLINE_CHECK = /request\.headers(?:\.get)?\(?\s*\[?\s*['"](authorization|x-api-key|x-[\w-]*(token|key|secret|signature)[\w-]*)['"]|req\.headers(?:\.|\[\s*['"])(authorization|x-api-key)|\b(verify|check|require|validate|authenticate|authorize)_?\w*(auth|token|session|user|key|signature|webhook|hmac|jwt|device|staff|admin|permission|role|request|caller)\w*\s*\(|\bcurrent_user\b|get_jwt_identity|verify_jwt_in_request|compare_digest|abort\(\s*40[13]\b|,\s*40[13]\s*\)?\s*$|status(?:Code)?\s*[:=(]\s*40[13]\b|\.status\(\s*40[13]\s*\)|req\.user\b|req\.session\.user|req\.auth\b|jwt\.verify|jwtVerify|getServerSession|auth\(\)|currentUser\(|getAuth\(|auth\.getUser|getSession\(|verifyIdToken|getToken\(|\b(?:verify|check|require|validate|authenticate|authorize)\w*(?:Auth|Token|Session|Signature|Webhook|Hmac|Jwt|Secret|Permission|Role)\w*\s*\(|\bis_?(?:[Vv]alid_?)?(?:[Aa]uthorized|[Aa]uthenticated|[Ss]ignature|[Tt]oken|[Ss]ecret|[Aa]pi_?[Kk]ey)\w*\s*\(|timingSafeEqual|safeCompare|[!=]==?\s*(?:[`'"]Bearer\s+\$\{\s*)?process\.env\.\w*(?:SECRET|TOKEN|KEY|PASSWORD)|process\.env\.\w*(?:SECRET|TOKEN|KEY|PASSWORD)\w*\s*[!=]==?/m;
// A Header parameter alone is NOT authentication. Count it only when the
// handler checks that token and rejects a bad value with HTTP 401/403.
function pyValidatedHeader(sig, body) {
  const names = [...sig.matchAll(/\b([A-Za-z_]\w*(?:token|key|signature)\w*)\s*:\s*[^,\n]*=\s*Header\s*\(/g)]
    .map((m) => m[1]);
  if (!names.length || !/raise\s+HTTPException\s*\(\s*status_code\s*=\s*40[13]\b/.test(body)) return false;
  return names.some((name) => new RegExp('\\bif\\s+(?:not\\s+)?' + name + '\\b').test(body));
}

const FIREBASE_CHECK = /\b\w+\.auth\b(?!\s*\()|HttpsError\(\s*["'](unauthenticated|permission-denied)["']|enforceAppCheck\s*:\s*true|\b\w+\.app\b\s*(==|!=|===|!==)\s*(undefined|null)|!\s*\w+\.app\b/;
const SIGNATURE_CHECK =/hmac|signature|verify_?webhook|construct_?event|x-hub-signature|compare_digest|svix|webhooks?\.verify|jwt\.decode|oidc|id_token|authenticated|verify_\w*(token|request|push)/i;
const NEXT_GUARD = /getServerSession|\bauth\(\)|currentUser\(|getAuth\(|auth\.getUser|supabase\.auth\.get(User|Session)|getSession\(|verifyIdToken|jwt\.verify|jwtVerify|getToken\(|clerkClient|requireAuth|requireUser|withAuth|validateRequest|headers\(\)\.get\(\s*['"]authorization|status:\s*40[13]\b/;
// A response marked to be stored and served to everyone can't hold one caller's data.
const PUBLIC_RESPONSE = /cache-control['"]?\]?\s*[:,=]\s*[`'"f]*[^`'"\n]*\b(?:public|s-maxage)\b/i;
const PRIVATE_RESPONSE = /cache-control['"]?\]?\s*[:,=]\s*[`'"f]*[^`'"\n]*\b(?:private|no-store)\b/i;
const NEXT_STATIC = /\bdynamic\s*=\s*['"]force-static['"]|export\s+const\s+revalidate\s*=\s*[1-9]/;
// API routes from a library that checks access itself: Payload CMS generates these and applies its collections' access rules
const SELF_CHECKING_ROUTES = /from\s+['"]@payloadcms\/next\/routes['"]/;
// Where a Next.js GET could get something worth protecting from: a data store, the caller's session, or a server-side secret
const READS_PRIVATE = /\b(?:prisma\w*|drizzle\w*|mongoose|mongodb|sequelize|typeorm|knex|kysely|supabase|firestore|firebase-admin|firebase\/\w+|dynamodb|redis|upstash|postgres|pg|mysql2?|sqlite3?|payload\w*|neon|turso|libsql)\b|\bdb\s*[.(]|\bdatabase\s*\.|\.(?:findMany|findUnique|findFirst|findOne|findAll|query|execute)\s*\(|\bcookies\s*\(|\bgetServerSession\b|\.session\b|\breq(?:uest)?\.(?:user|auth)\b|process\.env\.(?!NEXT_PUBLIC_|NODE_ENV\b|VERCEL|PUBLIC_|SITE_URL\b|BASE_URL\b|APP_URL\b)\w+/i;
const READS_FILES = /\b(?:readFile(?:Sync)?|createReadStream|readdir(?:Sync)?)\b/;
// Helpers around a route that don't feed what it returns
const NOT_ITS_DATA = /(^|\/)[^/]*(rate-?limit|limiter|logger|logging|metrics|telemetry|sentry|analytics)[^/]*$/i;
const METHOD_NOT_ALLOWED = /status(?:Code)?\s*[:=(]\s*405\b|\.status\(\s*405\b|\bmethodNotAllowed\b/i;
/** The code of one exported handler in a Next.js route file. */
function nextHandler(src, method) {
  const m = new RegExp('^[ \\t]*export\\s+(?:async\\s+)?(?:function|const)\\s+' + method + '\\b', 'm').exec(src);
  if (!m) return '';
  const rest = src.slice(m.index + m[0].length);
  const end = rest.search(/^[ \t]*export\s/m);
  return end < 0 ? rest : rest.slice(0, end);
}
const NEXT_MIDDLEWARE_GUARD = /getToken|withAuth|clerkMiddleware|authMiddleware|auth\(|supabase|getSession|jwtVerify|jwt\.verify|cookies\.get\([^)]*(session|token|auth)|redirect\([^)]*login/i;

function blockAfter(lines, defIdx) {
  // A Python def's body: every line after it that's more indented, up to 120 lines.
  const ind = /^\s*/.exec(lines[defIdx])[0].length;
  let end = defIdx + 1;
  while (end < lines.length && end < defIdx + 120 && (!lines[end].trim() || /^\s*/.exec(lines[end])[0].length > ind || /^\s*[)\]]/.test(lines[end]))) end++;
  return lines.slice(defIdx, end).join('\n');
}

function pyRoutes(src, f, out) {
  const lines = src.split('\n');
  // Blueprint / app-wide before_request hooks and router-level dependencies that check the caller.
  const guardedVars = new Map();
  for (const m of src.matchAll(/^@(\w+)\.before_(?:app_)?request\s*\n(?:@.*\n)*\s*def\s+(\w+)/gm)) {
    const defIdx = src.slice(0, m.index + m[0].length).split('\n').length - 1;
    const body = blockAfter(lines, defIdx);
    if (!/\b40[13]\b|Unauthorized|Forbidden|verify_jwt_in_request|login_required|is_authenticated|current_user/.test(body)) continue;
    guardedVars.set(m[1], m[2]);
    if (m[1] === 'app') out.push({ k: 'global-guard', framework: 'flask', name: m[2], line: defIdx + 1 });
  }
  for (const m of src.matchAll(/^\s*(\w+)\s*=\s*(?:\w+\.)?APIRouter\(([^)]*(?:\([^)]*\)[^)]*)*)\)/gm)) {
    const dep = /dependencies\s*=\s*\[[^\]]*Depends\(\s*([\w.]+)/.exec(m[2]);
    if (dep && isGuardDep(dep[1].split('.').pop())) guardedVars.set(m[1], dep[1]);
  }
  // FastAPI dependency aliases, `AdminUser = Annotated[Session, Depends(admin_user)]`, and the dependency
  // functions behind them. They're usually imported from a shared deps.py, so build decides repo-wide
  // which ones check the caller (see pyAliasGuards).
  const lineAt = (i) => src.slice(0, i).split('\n').length - 1;
  const sigAt = (idx) => lines.slice(idx, idx + 15).join('\n').split(/\)\s*(->[^:]*)?:\s*$/m)[0];
  const depsIn = (text) => [...text.matchAll(/\b(?:Depends|Security)\(\s*([\w.]+)/g)].map((m) => m[1].split('.').pop());
  const typesIn = (sig) => [...new Set([...sig.matchAll(/\b\w+\s*:\s*(?:[\w.]*Annotated\[\s*)?([A-Za-z_][\w.]*)/g)].map((m) => m[1].split('.').pop()))];
  if (/\b(Depends|Security)\(/.test(src)) {
    for (const m of src.matchAll(/^(?:type\s+)?(\w+)\s*(?::[^=\n]*)?=\s*(?:[\w.]+\.)?Annotated\[/gm)) {
      let depth = 1, j = m.index + m[0].length;
      while (j < src.length && depth && j - m.index < 800) { if (src[j] === '[') depth++; else if (src[j] === ']') depth--; j++; }
      const fn = depsIn(src.slice(m.index, j))[0];
      if (fn) out.push({ k: 'py-alias', name: m[1], fn, line: lineAt(m.index) + 1 });
    }
    // top-level functions that aren't routes, with the dependencies and types they take
    for (const m of src.matchAll(/^(?:async\s+)?def\s+(\w+)\s*\(/gm)) {
      const idx = lineAt(m.index);
      if (idx > 0 && /^\s*@/.test(lines[idx - 1])) continue;
      const sig = sigAt(idx), deps = depsIn(sig), types = typesIn(sig);
      if (deps.length || types.length) out.push({ k: 'py-dep-fn', name: m[1], ...(deps.length ? { deps } : {}), ...(types.length ? { types } : {}) });
    }
  }
  // Only treat a helper as a verifier if its body visibly checks the
  // provider signature and rejects an invalid request. A helper name alone
  // (validated_sender, for example) is not proof of authentication.
  for (const m of src.matchAll(/^(?:async\s+)?def\s+(\w+)\s*\(/gm)) {
    const idx = lineAt(m.index);
    const body = blockAfter(lines, idx);
    if (/\bRequestValidator\s*\(/.test(body) && /\.validate\s*\(/.test(body) &&
        /raise\s+HTTPException\s*\(\s*status_code\s*=\s*40[13]\b/.test(body)) {
      out.push({ k: 'py-verified-helper', name: m[1], line: idx + 1 });
    }
  }
  // Decorators defined here: auth-named ones, and project wrappers like `@endpoint(write=True)` whose
  // body applies an auth decorator itself. Repeat once so a wrapper of a wrapper counts too.
  const localGuards = new Set();
  const defs = [...src.matchAll(/^def\s+(\w+)\s*\(/gm)].map((m) => { const idx = src.slice(0, m.index).split('\n').length - 1; return { name: m[1], line: idx + 1, body: blockAfter(lines, idx) }; });
  const decoratorish = (body) => /wraps|decorat|def\s+\w+\(\s*\*args|return\s+\w+\s*$/m.test(body);
  for (let pass = 0; pass < 2; pass++) for (const d of defs) {
    if (localGuards.has(d.name) || !decoratorish(d.body)) continue;
    const applied = [...d.body.matchAll(/^\s*@([\w.]+)/gm)].map((m) => m[1].split('.').pop());
    const wraps = applied.some((a) => isGuardName(a) || localGuards.has(a));
    if (isGuardName(d.name) || wraps) { localGuards.add(d.name); out.push({ k: 'guard-def', name: d.name, line: d.line, ...(wraps && !isGuardName(d.name) ? { wrapper: true } : {}) }); }
  }

  for (const r of f.routes || []) {
    // django: no per-route checks to read; table: sign-in is checked by the dispatcher or inside the handler
    if (r.framework === 'django' || r.framework === 'table') continue;
    const i0 = r.line - 1;
    // decorators above the route decorator (wrong place in Flask/FastAPI: the route registers the unwrapped function)
    const above = [];
    for (let i = i0 - 1; i >= 0 && /^\s*@/.test(lines[i]); i--) above.push(/^\s*@([\w.]+)/.exec(lines[i])[1].split('.').pop());
    // decorators below it, up to the def
    const below = [];
    let defIdx = -1;
    for (let i = i0 + 1; i < lines.length && i < i0 + 30; i++) {
      if (/^\s*(async\s+)?def\s/.test(lines[i])) { defIdx = i; break; }
      const d = /^\s*@([\w.]+)/.exec(lines[i]);
      if (d) below.push(d[1].split('.').pop());
    }
    const decoText = lines.slice(i0, defIdx > 0 ? defIdx : i0 + 1).join('\n');
    const sig = defIdx > 0 ? lines.slice(defIdx, defIdx + 15).join('\n').split(/\)\s*(->[^:]*)?:\s*$/m)[0] : '';
    const body = defIdx > 0 ? blockAfter(lines, defIdx) : '';
    const rec = { k: 'route', line: r.line, method: r.method };
    const deco = below.find((d) => (isGuardName(d) || localGuards.has(d)) && !/^(route|get|post|put|patch|delete)$/.test(d));
    const dep = /Depends\(\s*([\w.]+)|Security\(\s*([\w.]+)/g;
    const deps = [...(decoText + '\n' + sig).matchAll(dep)].map((m) => (m[1] || m[2]).split('.').pop());
    if (deco) Object.assign(rec, { guard: deco, via: 'decorator' });
    else if (guardedVars.has(r.var)) Object.assign(rec, { guard: guardedVars.get(r.var), via: 'blueprint' });
    else if (deps.some(isGuardDep)) Object.assign(rec, { guard: deps.find(isGuardDep), via: 'dependency' });
    else if (INLINE_CHECK.test(body)) Object.assign(rec, { via: 'inline' });
    else if (pyValidatedHeader(sig, body)) Object.assign(rec, { via: 'inline' });
    else {
      const misplaced = above.find((d) => isGuardName(d) && !/^(route|get|post|put|patch|delete)$/.test(d));
      if (misplaced) rec.misplaced = misplaced;
      // other decorators may be auth wrappers defined in another file; build resolves them
      const other = below.filter((d) => !/^(route|get|post|put|patch|delete|api_route|websocket)$/.test(d));
      if (other.length) rec.decos = other;
      // so may parameter types: `user: AdminUser`, a dependency alias (pyAliasGuards)
      const types = typesIn(sig);
      if (types.length) rec.types = types;
    }
    if (body) rec.calls = [...new Set([...body.matchAll(/\b(?:await\s+)?([A-Za-z_]\w*)\s*\(/g)].map((m) => m[1]))];
    if (SIGNATURE_CHECK.test(body)) rec.signed = true;
    if (PUBLIC_RESPONSE.test(body)) rec.publicResponse = true;
    if (defIdx > 0) rec.fn = /def\s+(\w+)/.exec(lines[defIdx])[1];
    out.push(rec);
  }
}

function jsRoutes(src, f, out) {
  const routes = f.routes || [];
  if (!routes.length && !/\.use\(/.test(src) && !/(^|\/)middleware\.(t|j)s$/.test(f.path)) return;
  const lines = src.split('\n');
  // Next.js middleware.ts protecting the app
  if (/(^|\/)(src\/)?middleware\.(t|j)s$/.test(f.path) && NEXT_MIDDLEWARE_GUARD.test(src)) {
    const matcher = /matcher\s*:\s*([^\n]+)/.exec(src)?.[1] || '';
    if (!matcher || /api|\(\?!/.test(matcher)) out.push({ k: 'global-guard', framework: 'next', line: 1 });
  }
  // app.use(auth) / router.use(requireAuth) without a path guards everything registered after it
  const uses = [];
  for (const m of src.matchAll(/\b(\w+)\.use\(\s*([^'"`)][^)]*)\)/g)) {
    const names = m[2].match(/[A-Za-z_$][\w$]*/g) || [];
    if (names.some(isGuardName)) uses.push({ v: m[1], line: src.slice(0, m.index).split('\n').length, name: names.find(isGuardName) });
  }
  for (const u of uses) if (u.v === 'app' || u.v === 'server') out.push({ k: 'global-guard', framework: 'express', name: u.name, line: u.line });

  routes.forEach((r, idx) => {
    if (r.framework === 'table') return; // sign-in is checked by the dispatcher or inside the handler
    const rec = { k: 'route', line: r.line, method: r.method };
    if (r.framework === 'firebase') {
      // a callable checks request.auth (v1: context.auth) or turns on App Check; an onRequest function
      // checks a token or signature itself, like any other handler
      const next = routes.slice(idx + 1).find((x) => x.line > r.line)?.line || r.line + 80;
      const body = lines.slice(r.line - 1, Math.min(next - 1, r.line + 80)).join('\n');
      if (FIREBASE_CHECK.test(body) || INLINE_CHECK.test(body)) rec.via = 'inline';
      if (SIGNATURE_CHECK.test(body)) rec.signed = true;
      rec.fn = r.handler;
      out.push(rec);
      return;
    }
    if (r.framework === 'next') {
      if (SELF_CHECKING_ROUTES.test(src)) rec.via = 'library';
      else if (NEXT_GUARD.test(src) || INLINE_CHECK.test(src)) rec.via = 'inline';
      if (SIGNATURE_CHECK.test(src)) rec.signed = true;
      const handler = nextHandler(src, r.method);
      if (METHOD_NOT_ALLOWED.test(handler) && !READS_PRIVATE.test(handler)) rec.notAllowed = true;
      if (r.method === 'GET') rec.nextGet = true;
      rec.fn = r.method;
      out.push(rec);
      return;
    }
    // the route call's own arguments before its handler: router.post('/x', requireAuth, async (req, res) => …),
    // or router.post('/x', requireAuth, createOrder) where the last one is the handler
    const head = lines.slice(r.line - 1, r.line + 4).join('\n');
    const call = /\.\w+\(\s*["'`][^"'`]*["'`]\s*,/.exec(head);
    let args = '';
    if (call) {
      let depth = 1, j = call.index + call[0].length;
      for (; j < head.length && depth; j++) { if (head[j] === '(') depth++; else if (head[j] === ')') depth--; }
      const own = head.slice(call.index + call[0].length, depth ? j : j - 1);
      const fn = /(?:async\s*)?(?:\(\s*req\b|function\b|\breq\s*=>|\(\s*\{|\(\s*c\s*\)|\(\s*ctx\b)/.exec(own);
      args = fn ? own.slice(0, fn.index) : own.slice(0, Math.max(0, own.lastIndexOf(',')));
    }
    const mw = (args.match(/[A-Za-z_$][\w$.]*/g) || []).map((x) => x.split('.').pop()).find(isGuardName);
    const next = routes[idx + 1]?.line || r.line + 60;
    const body = lines.slice(r.line - 1, Math.min(next - 1, r.line + 60)).join('\n');
    const prior = uses.find((u) => u.v === r.var && u.line < r.line);
    if (mw) Object.assign(rec, { guard: mw, via: 'middleware' });
    else if (prior) Object.assign(rec, { guard: prior.name, via: 'router' });
    else if (INLINE_CHECK.test(body)) rec.via = 'inline';
    if (SIGNATURE_CHECK.test(body)) rec.signed = true;
    if (PUBLIC_RESPONSE.test(body)) rec.publicResponse = true;
    out.push(rec);
  });
}

/**
 * FastAPI dependency aliases that check the caller, per repo: Map(repo -> Map(alias -> file)).
 * An alias checks the caller when its dependency function does: by its name (admin_user), by taking a
 * checking dependency (Depends(require_login)), or by taking a checking alias itself, e.g.
 * `AdminOffice = Annotated[Office, Depends(admin_owned_office)]` where admin_owned_office takes `admin: AdminUser`.
 * An alias whose own name reads as a check counts too (`AdminAccess = Annotated[dict, Depends(check)]`),
 * unless either name says it's a database session (`SqlSessionDep` over `get_sql_session`).
 */
function pyAliasGuards(files, findings) {
  const byRepo = new Map(); // repo -> { aliases: Map(name -> {fn, file}), fns: Map(name -> {deps, types}) }
  for (const f of files) for (const x of findings(f.path)) {
    if (x.k !== 'py-alias' && x.k !== 'py-dep-fn') continue;
    const k = f.repo ?? '';
    if (!byRepo.has(k)) byRepo.set(k, { aliases: new Map(), fns: new Map() });
    const r = byRepo.get(k);
    if (x.k === 'py-alias') r.aliases.set(x.name, { fn: x.fn, file: f.path });
    else r.fns.set(x.name, { deps: x.deps || [], types: x.types || [] });
  }
  const out = new Map();
  for (const [repo, { aliases, fns }] of byRepo) {
    const ok = new Map();
    const checks = (fn) => isGuardDep(fn) || (!isDbDep(fn) && !!fns.get(fn) && (fns.get(fn).deps.some(isGuardDep) || fns.get(fn).types.some((t) => ok.has(t))));
    const aliasChecks = (name, fn) => checks(fn) || (isGuardDep(name) && !isDbDep(fn));
    // a few passes, so aliases built on other aliases resolve in any file order
    for (let pass = 0; pass < 3; pass++) for (const [name, a] of aliases) if (!ok.has(name) && aliasChecks(name, a.fn)) ok.set(name, a.file);
    if (ok.size) out.set(repo, ok);
  }
  return out;
}

// ---------- 3. the usual mistakes in apps built on Supabase, Firebase, Stripe, Next.js and Vite ----------

// Frontend build tools copy variables with these prefixes into the code every visitor downloads.
// (A bare PUBLIC_ prefix only means that to SvelteKit and Astro, so it counts only where they read it.)
const PUBLIC_PREFIX = /^(NEXT_PUBLIC|VITE|REACT_APP|EXPO_PUBLIC|NUXT_PUBLIC|GATSBY|PUBLIC)_/;
const CLIENT_ONLY_PREFIX = /^(VITE|REACT_APP|EXPO_PUBLIC|GATSBY|PUBLIC)_/; // these exist only in browser code
// After the prefix: names that hold something private…
const PRIVATE_NAME = /(^|_)(SECRETS?|SERVICE_ROLE|SERVICE_KEY|PRIVATE|PASSWORD|PASSWD|PWD|DATABASE_URL|DB_URL|CONNECTION_STRING|ADMIN_KEY|ADMIN_TOKEN|AUTH_TOKEN|JWT_SECRET)(_|$)/;
// …or a key or token for a service that charges you or acts as you (AI, email, messaging, code hosting)
const PRIVATE_SERVICE = /(^|_)(OPENAI|ANTHROPIC|CLAUDE|GEMINI|GROQ|GROK|XAI|MISTRAL|REPLICATE|ELEVEN_?LABS|SENDGRID|RESEND|POSTMARK|MAILGUN|BREVO|TWILIO|OPENROUTER|DEEPSEEK|PERPLEXITY|COHERE|TOGETHER|FIREWORKS|HUGGING_?FACE|HF|STABILITY|FAL|ASSEMBLY_?AI|DEEPGRAM|PINECONE|SERPAPI|TAVILY|FIRECRAWL|AIRTABLE|NOTION|GITHUB|SLACK|DISCORD|TELEGRAM|STRIPE)(_|$)/;
const KEYISH = /(^|_)(KEY|API_?KEY|TOKEN|SECRET)$/;
// Keys that are public by design: Supabase's anon key, Stripe's publishable key, reCAPTCHA site keys, IDs
const PUBLIC_BY_DESIGN = /(^|_)(PUBLISHABLE|ANON|PK|PUBLIC|SITE|CLIENT_ID|APP_ID|PROJECT_ID|MEASUREMENT_ID)(_|$)/;
const SERVICE_LABEL = { OPENAI: 'OpenAI', ANTHROPIC: 'Anthropic', CLAUDE: 'Anthropic', GEMINI: 'Google Gemini', GROQ: 'Groq', GROK: 'xAI', XAI: 'xAI', ELEVENLABS: 'ElevenLabs', ELEVEN_LABS: 'ElevenLabs', SENDGRID: 'SendGrid', OPENROUTER: 'OpenRouter', DEEPSEEK: 'DeepSeek', HF: 'Hugging Face', HUGGINGFACE: 'Hugging Face', HUGGING_FACE: 'Hugging Face', ASSEMBLYAI: 'AssemblyAI', ASSEMBLY_AI: 'AssemblyAI', SERPAPI: 'SerpApi', GITHUB: 'GitHub' };

/** For a variable like VITE_OPENAI_API_KEY: the service it unlocks ('OpenAI', or '' for a generic secret), or null when it's fine to be public. */
export function leakyPublicVar(name) {
  const m = PUBLIC_PREFIX.exec(name);
  if (!m) return null;
  const rest = name.slice(m[0].length);
  if (PUBLIC_BY_DESIGN.test(rest) || HASHED_NAME.test(rest)) return null;
  const svc = PRIVATE_SERVICE.exec(rest)?.[2];
  if (svc && KEYISH.test(rest)) return SERVICE_LABEL[svc] || svc.charAt(0) + svc.slice(1).toLowerCase();
  if (PRIVATE_NAME.test(rest)) return /SERVICE_ROLE|SERVICE_KEY/.test(rest) ? 'Supabase' : '';
  return null;
}

function findPublicEnv(src, f, out) {
  const at = lineIndex(src);
  const seen = new Set();
  const add = (name, idx) => { if (leakyPublicVar(name) === null || seen.has(name)) return; seen.add(name); out.push({ k: 'public-env', name, line: at(idx) }); };
  for (const m of src.matchAll(/\b(process\.env\.|process\.env\[\s*['"]|import\.meta\.env\.)([A-Z][A-Z0-9_]*)/g)) {
    if (/^PUBLIC_/.test(m[2]) && m[1].startsWith('process')) continue; // PUBLIC_ means nothing to Node
    add(m[2], m.index);
  }
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]\$env\/(?:static|dynamic)\/public['"]/g)) for (const n of m[1].match(/[A-Z][A-Z0-9_]*/g) || []) add(n, m.index);
}

// Stripe: code that acts on payment events. Without checking Stripe's signature first, anyone can send
// a fake "payment succeeded" event to the webhook address.
const STRIPE_EVENT = /(?:\bcase\s*|[!=]==?\s*)["'](checkout\.session\.(?:completed|async_payment_succeeded)|payment_intent\.succeeded|invoice\.(?:paid|payment_succeeded|payment_failed)|customer\.subscription\.(?:created|updated|deleted)|charge\.(?:succeeded|refunded))["']/g;
const STRIPE_VERIFIED = /constructEvent(?:Async)?\s*\(|construct_event\s*\(|verifyHeader|verify_header|events\.retrieve\s*\(|Event\.retrieve\s*\(/;

function findStripeWebhook(src, f, out) {
  if (!/stripe/i.test(src) || STRIPE_VERIFIED.test(src)) return;
  const hits = [...src.matchAll(STRIPE_EVENT)];
  if (!hits.length) return;
  out.push({ k: 'stripe-unsigned', line: lineIndex(src)(hits[0].index), events: [...new Set(hits.map((m) => m[1]))].slice(0, 4) });
}

// CORS: a server that tells browsers any website may call it. Harmless for a public API without login
// cookies; with them, any site a signed-in visitor opens could act as them.
function findCors(src, f, out) {
  const at = lineIndex(src);
  const add = (idx, how, credentials) => out.push({ k: 'cors-any', line: at(idx), how, credentials });
  if (['typescript', 'javascript'].includes(f.lang)) {
    if (/require\(\s*['"]cors['"]\s*\)|from\s+['"]cors['"]/.test(src)) {
      for (const m of src.matchAll(/\bcors\(\s*\)/g)) add(m.index, 'cors()', false);
      for (const m of src.matchAll(/\bcors\(\s*\{([^}]*)\}/g)) {
        const origin = /\borigin\s*:\s*(?:(['"`])\*\1|(true)\b)/.exec(m[1]);
        // '*' with credentials is refused by browsers; origin: true echoes whichever site asks
        if (origin) add(m.index, origin[2] ? 'cors({ origin: true })' : "cors({ origin: '*' })", !!origin[2] && /\bcredentials\s*:\s*true/.test(m[1]));
      }
    }
    const credHeader = /['"]Access-Control-Allow-Credentials['"]\s*[,:]\s*['"`]?true/i.test(src);
    for (const m of src.matchAll(/['"]Access-Control-Allow-Origin['"]\s*[,:]\s*(?:(['"`])\*\1|(req(?:uest)?\.headers(?:\.origin\b|\[\s*['"]origin['"]\s*\]|\.get\(\s*['"]origin['"]\s*\))))/gi)) {
      add(m.index, m[2] ? 'Access-Control-Allow-Origin set to the caller’s origin' : 'Access-Control-Allow-Origin: *', !!m[2] && credHeader);
    }
  } else if (f.lang === 'python') {
    for (const m of src.matchAll(/CORSMiddleware\s*,([\s\S]{0,800}?)\)\s*$/gm)) {
      if (/allow_origins\s*=\s*\[\s*(['"])\*\1\s*\]|allow_origin_regex\s*=\s*r?(['"])\.\*\2/.test(m[1])) add(m.index, 'CORSMiddleware with allow_origins=["*"]', /allow_credentials\s*=\s*True/.test(m[1]));
    }
    for (const m of src.matchAll(/\bCORS\(\s*\w+\s*(?:\)|,([^)]*)\))/g)) {
      const opts = m[1] || '';
      if (/\borigins["']?\s*[:=]\s*(?!(['"])\*\1)/.test(opts)) continue; // a list of allowed sites (origins=… or "origins": …)
      add(m.index, 'CORS(app) with every origin allowed', /supports_credentials\s*=\s*True/.test(opts));
    }
    const all = /^\s*CORS_(?:ALLOW_ALL_ORIGINS|ORIGIN_ALLOW_ALL)\s*=\s*True\b/m.exec(src);
    if (all) add(all.index, 'CORS_ALLOW_ALL_ORIGINS = True', /^\s*CORS_ALLOW_CREDENTIALS\s*=\s*True\b/m.test(src));
  }
}

// Supabase / Postgres migrations: tables, row-level security switched on or off, tables dropped or
// renamed, and security rules that let anyone change a table. build.mjs replays them in file order.
const SQL_ID = String.raw`(?:"[^"]+"|[A-Za-z_][\w$]*)`;
const SQL_NAME = String.raw`(?:${SQL_ID}\s*\.\s*)?${SQL_ID}`;
const sqlName = (raw) => {
  const parts = raw.split(/\s*\.\s*(?=(?:"[^"]*"|[^"])*$)/).map((p) => p.trim().replace(/^"|"$/g, '').toLowerCase());
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : `public.${parts[0]}`;
};

function findSql(src, f, out) {
  // blank out comments, keeping line breaks so line numbers stay right
  const s = src.replace(/--[^\n]*/g, (m) => ' '.repeat(m.length)).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const at = lineIndex(s);
  const found = [];
  for (const m of s.matchAll(new RegExp(String.raw`\bcreate\s+(?:(temp|temporary)\s+|unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?(${SQL_NAME})`, 'gi'))) {
    if (!m[1]) found.push({ i: m.index, k: 'sql-table', table: sqlName(m[2]) });
  }
  for (const m of s.matchAll(new RegExp(String.raw`\balter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(${SQL_NAME})\s+(enable|disable|force|no\s+force)\s+row\s+level\s+security`, 'gi'))) {
    found.push({ i: m.index, k: 'sql-rls', table: sqlName(m[1]), on: !/^(disable|no)/i.test(m[2]) });
  }
  for (const m of s.matchAll(new RegExp(String.raw`\balter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(${SQL_NAME})\s+rename\s+to\s+(${SQL_ID})`, 'gi'))) {
    const from = sqlName(m[1]);
    found.push({ i: m.index, k: 'sql-rename', table: from, to: `${from.split('.')[0]}.${m[2].replace(/^"|"$/g, '').toLowerCase()}` });
  }
  for (const m of s.matchAll(new RegExp(String.raw`\bdrop\s+table\s+(?:if\s+exists\s+)?(${SQL_NAME}(?:\s*,\s*${SQL_NAME})*)`, 'gi'))) {
    for (const t of m[1].split(/\s*,\s*/)) found.push({ i: m.index, k: 'sql-drop', table: sqlName(t) });
  }
  // a permissive rule that lets signed-out visitors add, change or delete rows: `using (true)` / `with check (true)`
  for (const m of s.matchAll(new RegExp(String.raw`\bcreate\s+policy\s+(${SQL_ID})\s+on\s+(${SQL_NAME})([^;]*)`, 'gi'))) {
    const body = m[3];
    if (/\bas\s+restrictive\b/i.test(body)) continue;
    const cmd = (/\bfor\s+(all|select|insert|update|delete)\b/i.exec(body)?.[1] || 'all').toLowerCase();
    if (cmd === 'select') continue;
    const to = /\bto\s+([\w\s,"]+?)(?=\s+(?:using|with)\b|\s*$)/i.exec(body)?.[1];
    const roles = to ? to.split(/\s*,\s*/).map((r) => r.replace(/"/g, '').trim().toLowerCase()) : ['public'];
    if (!roles.some((r) => r === 'anon' || r === 'public')) continue;
    const yes = (clause) => new RegExp(String.raw`\b${clause}\s*\(\s*\(?\s*true\s*\)?\s*\)`, 'i').test(body);
    const open = cmd === 'insert' ? yes('with\\s+check') : cmd === 'all' ? yes('using') || yes('with\\s+check') : yes('using');
    if (open) found.push({ i: m.index, k: 'sql-open-policy', table: sqlName(m[2]), policy: m[1].replace(/^"|"$/g, ''), cmd, signedOut: roles.includes('anon') || !to });
  }
  for (const x of found.sort((a, b) => a.i - b.i)) { const { i, ...rest } = x; out.push({ ...rest, line: at(i) }); }
}

const USES_SUPABASE = /@supabase\/(?:supabase-js|ssr|auth-helpers[\w-]*)|from\s+supabase\s+import|^\s*import\s+supabase\b/m;

// ---------- per-file entry point ----------

export function findIssues(src, f) {
  const out = [];
  findSecrets(src, f, out);
  if (f.category !== 'code') return out;
  if (f.lang === 'sql') findSql(src, f, out);
  if (!TEST_FILE.test(f.path) && !EXAMPLE_FILE.test(f.path)) {
    if (['typescript', 'javascript', 'vue', 'svelte', 'astro'].includes(f.lang)) findPublicEnv(src, f, out);
    if (['typescript', 'javascript', 'python'].includes(f.lang)) { findStripeWebhook(src, f, out); findCors(src, f, out); }
  }
  if (['typescript', 'javascript', 'python'].includes(f.lang) && USES_SUPABASE.test(src)) out.push({ k: 'uses-supabase' });
  if (f.lang === 'python') pyRoutes(src, f, out);
  else if (['typescript', 'javascript'].includes(f.lang)) jsRoutes(src, f, out);
  // run directly or registered by name (so "nothing imports it" doesn't mean unused)
  if (/^#!|if\s+__name__\s*==\s*['"]__main__['"]|@(?:\w+\.)*(?:task|shared_task|command|group|receiver|scheduled_job|on_event|listener|hookimpl|periodic_task|cli\.command)\b|require\.main\s*===\s*module|import\.meta\.main/m.test(src)) out.push({ k: 'runnable' });
  // a frontend calling a fixed localhost address (breaks once deployed)
  // (only in files with no environment / hostname switching, where it can't be a dev-only fallback)
  if (['typescript', 'javascript', 'vue', 'svelte'].includes(f.lang) && !TEST_FILE.test(f.path) && !/process\.env|import\.meta\.env|NODE_ENV|location\.(hostname|host|origin)|isDev|__DEV__/.test(src)) {
    src.split('\n').forEach((t, i) => {
      if (/["'`]https?:\/\/(localhost|127\.0\.0\.1):\d+/.test(t) && !/\?\?|\|\||local|dev|fallback|default|^\s*(\/\/|\*)/i.test(t.replace(/https?:\/\/(localhost|127\.0\.0\.1)/g, ''))) out.push({ k: 'localhost', line: i + 1 });
    });
  }
  return out;
}

// ======================= build: turn findings into issues =======================

const SEV_ORDER = { high: 0, medium: 1, low: 2 };
const PUBLIC_PATH = /(^|\/)(health|healthz|healthcheck|ping|status|ready|readyz|readiness|live|livez|liveness|version|metrics|robots\.txt|sitemap[\w.]*|favicon[\w.]*|\.well-known|login|logout|signin|pair|sign-in|signout|signup|sign-up|register|forgot[\w-]*|reset[\w-]*|verify[\w-]*|oauth\w*|callback|auth|token|refresh|static|assets|public|newsletter|contact|waitlist|unsubscribe|openapi\.json|docs|swagger[\w.]*|i|images?)(\/|$)/i;
// Files and feeds that exist to be read by crawlers, feed readers and AI tools. Only for reading: see publicByDesign.
const PUBLIC_FILE_PATH = /(^|\/)(llms(-full)?\.txt|ai\.txt|humans\.txt|(app-)?ads\.txt|security\.txt|rss(\.xml)?|atom(\.xml)?|feed\.(xml|rss|atom|json)|index\.xml|opensearch\.xml|site\.webmanifest|manifest\.(json|webmanifest)|openapi\.ya?ml)$/i;
const LISTING_FILE = /(^|\/)(llms(-full)?\.txt|robots\.txt)$/i;
/** The addresses a project publishes in its llms.txt, or explicitly allows in its robots.txt. */
function listedPaths(file, src) {
  const found = /robots\.txt$/i.test(file) ? [...src.matchAll(/^\s*Allow:\s*(\/\S*)/gim)] : [...src.matchAll(/(?:https?:\/\/[^\s/)\]"'<>]+|(?<![\w./-]))(\/[^\s)\]"'<>#?*]+)/g)];
  return found.map((m) => m[1].replace(/[.,;:]+$/, '').replace(/\/$/, '')).filter((p) => p.length > 1 && !p.includes('*'));
}
const WEBHOOK_PATH = /webhook|\/hooks?\//i;
// endpoints under a webhook URL that manage the webhooks (create, list, test…) rather than receive them
const WEBHOOK_ADMIN = /\/(manage|admin|setup|settings|config|list|create|register|delete|test[\w-]*)(\/|$)/i;
const NOT_USED_KINDS = new Set(['test', 'script', 'infra', 'config', 'worker', 'external']);
const SPECIAL_FILE = /(^|\/)(index|main|app|server|cli|manage|wsgi|asgi|__init__|__main__|conftest|setup|config|settings|env|middleware|instrumentation|layout|page|route|loading|error|not-found|template|default|global-error|sitemap|robots|manifest|opengraph-image|twitter-image|icon|apple-icon|_app|_document|_error|404|500|models|admin|apps|views|urls|signals|tasks|forms|serializers|celery|gunicorn\.conf|vite-env\.d|worker|sw|service-worker)\.[a-z]+$|\.d\.ts$|\.config\.[a-z]+$|\.stories\.|(^|\/)(pages|migrations|alembic|versions|scripts|bin|tools|seeds?|fixtures?|examples?|docs?|public|static|templates|\.github|e2e|cypress|playwright)\//i;
// A comment saying a tool opens this file by name, or that it's generated: not leftover code, whatever imports it
const LOADED_BY_NAME = /^\s*(?:\/\/|\/?\*|#|<!--|"""|''')[^\n]*(?:\b(?:cli|tool|tooling|framework|runner|bundler|build|compiler|plugin|sdk|script)\b[^\n]*\b(?:reads?|loads?|imports?|runs?|executes?|opens?|requires?|picks? up)\b[^\n]*\b(?:this file|directly|by name|by path|at runtime)\b|\bthis file is (?:read|loaded|imported|run|executed|required|used|picked up)\b[^\n]*\b(?:by|directly|at runtime)\b|\bthis (?:file|code) (?:is|was) (?:auto-?)?generated\b|@generated\b|\b(?:auto-?)?generated (?:file|code)\b|\bcode generated by\b|\bdo not (?:edit|modify|delete|remove) (?:this|it)\b)/im;
const USED_LANGS = new Set(['typescript', 'javascript', 'python', 'vue', 'svelte', 'astro']);
const plural = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + 's'}`;

export function buildHealth({ graph, scan, arch, root }) {
  const issues = [];
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const fileByPath = new Map(graph.files.map((f) => [f.p, f]));
  const scanByPath = new Map(scan.files.map((f) => [f.path, f]));
  const lineage = (id) => { const out = []; let n = nodeById.get(id); while (n) { out.push(n); n = n.parent ? nodeById.get(n.parent) : null; } return out; };
  const kinds = (id) => lineage(id).map((n) => n.kind);
  const isFrontend = (p) => { const f = fileByPath.get(p); return !!f && kinds(f.n).includes('ui'); };
  const nameOf = (p) => fileByPath.get(p)?.name || p.split('/').pop();
  const label = (id) => nodeById.get(id)?.label || id;
  // Files outside the map (config, .env, Firebase rules) point at the module that owns their folder, or
  // failing that the most specific part of the map whose paths name them.
  const archGlobs = (arch?.nodes || []).filter((n) => n?.id && nodeById.has(n.id) && Array.isArray(n.paths)).flatMap((n) => n.paths.map((p) => ({ id: n.id, g: compileGlob(p) })));
  const globOwner = (p) => archGlobs.filter((x) => x.g.test(p)).sort((a, b) => b.g.specificity - a.g.specificity)[0]?.id;
  const dirOwner = new Map();
  for (const f of graph.files) { let d = f.p; while (d.includes('/')) { d = d.slice(0, d.lastIndexOf('/')); if (!dirOwner.has(d)) dirOwner.set(d, new Map()); const m = dirOwner.get(d); m.set(f.n, (m.get(f.n) || 0) + 1); } }
  const itemFor = (p) => {
    if (fileByPath.has(p)) return 'f:' + p;
    let d = p;
    while (d.includes('/')) {
      d = d.slice(0, d.lastIndexOf('/'));
      const m = dirOwner.get(d);
      const top = m && [...m.entries()].filter(([n]) => n !== 'unassigned').sort((a, b) => b[1] - a[1])[0];
      if (top) return 'n:' + top[0];
    }
    const owner = globOwner(p);
    return owner ? 'n:' + owner : null;
  };
  const findings = (p) => scanByPath.get(p)?.issues || [];

  // ---------- secrets in code and config ----------
  const secretFiles = [];
  for (const f of scan.files) {
    const s = findings(f.path).filter((x) => x.k === 'secret');
    if (s.length) secretFiles.push({ path: f.path, list: s });
  }
  // credential files (service-account JSON, .pem keys) that the scanner doesn't read as config
  for (const f of scan.files) {
    const base = f.path.split('/').pop();
    if (TEST_FILE.test(f.path) || EXAMPLE_FILE.test(f.path) || /\.pub$/.test(base)) continue;
    if (!/\.(pem|key|p12|pfx|jks|keystore)$|^id_(rsa|dsa|ecdsa|ed25519)$|service[-_]?account.*\.json$|^credentials?\.json$|firebase-adminsdk.*\.json$|^client_secret.*\.json$|-key\.json$/i.test(base)) continue;
    let head = '';
    try { head = readHead(path.join(root, f.path), 65536); } catch { continue; }
    if (plainKeyIn(head) || /"private_key"\s*:\s*"-----|"client_secret"\s*:\s*"[^"]{8,}/.test(head) || /\.(p12|pfx|jks|keystore)$/i.test(base)) secretFiles.push({ path: f.path, list: [{ k: 'secret', line: 1, what: 'a credentials file (a private key that logs in as your app)', sev: 'high', hint: 'whole file' }], file: true });
  }
  const secretIssue = (group) => {
    const locations = [], notes = {}, items = [];
    const kinds = new Set(), svcs = new Set();
    let frontend = false;
    for (const { path: p, list, file } of group) {
      list.sort((a, b) => a.line - b.line);
      const it = itemFor(p);
      if (it && !items.includes(it)) items.push(it);
      for (const s of list) {
        locations.push({ file: p, line: s.line });
        kinds.add(s.what);
        if (s.svc) svcs.add(s.svc);
      }
      if (isFrontend(p)) frontend = true;
      if (it) notes[it] = (notes[it] ? notes[it] + ' · ' : '') + list.slice(0, 4).map((s) => `${file ? p.split('/').pop() : `line ${s.line}`}: ${s.name ? `${s.name}, ` : ''}${s.what.replace(/ \(.*\)$/, '')} (${s.hint})`).join(' · ') + (list.length > 4 ? ` · +${list.length - 4} more` : '');
    }
    const n = locations.length;
    const sev = group.some((g) => g.list.some((s) => s.sev === 'high')) ? 'high' : 'medium';
    const one = group.length === 1 ? group[0].path : null;
    const kindText = kinds.size === 1 ? [...kinds][0].replace(/ \(.*\)$/, '') : 'passwords or keys';
    return {
      id: 'secret:' + (one || group.map((g) => g.path).join('|')),
      kind: 'secret', severity: sev,
      title: n === 1 ? `A secret key is written into ${one ? one.split('/').pop() : `${group.length} more files`}` : `${n} passwords or keys are written into ${one ? one.split('/').pop() : `${group.length} more files`}`,
      detail: `${one ? `${nameOf(one)} (${one})` : plural(group.length, 'file')} contains ${n === 1 ? kindText : `${n} secrets (${kindText})`}. Anyone who can see the code can use ${n === 1 ? 'it' : 'them'} to get into ${svcs.size ? [...svcs].slice(0, 4).join(', ') : 'the services they unlock'} as you${frontend ? ', and this code is sent to every visitor’s browser' : ''}. Treat ${n === 1 ? 'it' : 'them'} as leaked: move ${n === 1 ? 'it' : 'them'} out of the code and replace ${n === 1 ? 'it with a new one' : 'them with new ones'}.`,
      items, notes, locations,
      fix: [
        `Security fix: hard-coded secrets. Do not print, echo or repeat any secret value in your replies, commits or logs.`,
        ``,
        `These lines contain ${n === 1 ? 'a secret' : 'secrets'} written directly in the code:`,
        ...group.flatMap(({ path: p, list, file }) => list.map((s) => `- ${p}${file ? ' (the whole file)' : `:${s.line}`}: ${s.name ? `${s.name} — ` : ''}${s.what.replace(/ \(.*\)$/, '')}`)),
        ``,
        `For each one:`,
        `1. Replace the literal with an environment variable lookup (${group.some((g) => /\.py$/.test(g.path)) ? `os.environ["NAME"] in Python` : ''}${group.some((g) => /\.py$/.test(g.path)) && group.some((g) => /\.[jt]sx?$/.test(g.path)) ? ', ' : ''}${group.some((g) => /\.[jt]sx?$/.test(g.path)) ? 'process.env.NAME in JavaScript/TypeScript' : ''}${!group.some((g) => /\.(py|[jt]sx?)$/.test(g.path)) ? 'or a secret manager reference' : ''}), using a clear variable name. If the app can't run without it, fail with a clear error when it is missing instead of falling back to a hard-coded value.`,
        `2. Add each variable name (with an empty value, never the real one) to .env.example, and make sure .env is listed in .gitignore.`,
        frontend ? `3. This is frontend code that ships to the browser. Move the call that needs the secret to a server-side route or function so the key never reaches visitors.` : `3. Update any deployment config (Docker, Cloud Run, Vercel, etc.) so the variable is set in production.`,
        group.some((g) => g.file) ? `4. Remove the credentials file from the repository (git rm --cached), add its name to .gitignore, and load it from a path given by an environment variable.` : `4. Run the app or its tests to confirm it still starts with the variables set.`,
        ``,
        `Then give me a short checklist (without the values) of which services these keys belong to, so I can rotate each one: create a new key in that service's dashboard, put it in my environment, and revoke the old one. Because the old values are in git history, assume they are compromised.`,
      ].join('\n'),
    };
  };
  secretFiles.sort((a, b) => b.list.length - a.list.length);
  const MAX_SECRET_ISSUES = 8;
  secretFiles.slice(0, MAX_SECRET_ISSUES).forEach((g) => issues.push(secretIssue([g])));
  if (secretFiles.length > MAX_SECRET_ISSUES) issues.push(secretIssue(secretFiles.slice(MAX_SECRET_ISSUES)));

  // ---------- .env files that are (or will be) committed ----------
  for (const f of scan.files) {
    const base = f.path.split('/').pop();
    if (!/^\.env(\.[\w.-]+)?$/i.test(base) || /example|sample|template|dist|defaults?|schema|test/i.test(base)) continue;
    let src = '';
    try { src = readHead(path.join(root, f.path), 262144); } catch { continue; }
    const secretVars = [];
    src.split('\n').forEach((t, i) => {
      const m = /^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*["']?([^"'#\s]*)/.exec(t);
      if (!m || !m[2]) return;
      const n = snake(m[1]);
      const known = FORMATS.some((fm) => { fm.re.lastIndex = 0; const hit = fm.re.test(m[2]); fm.re.lastIndex = 0; return hit; });
      if (known || (SECRET_NAME.test(n) && !PUBLIC_NAME.test(n) && valueLooksReal(m[2], n)) || (/url|uri|dsn/i.test(n) && /:\/\/[^:\s\/]+:[^@\s]+@/.test(m[2]))) secretVars.push({ name: m[1], line: i + 1 });
    });
    if (!secretVars.length) continue;
    const repoAbs = f.repo ? path.join(root, f.repo) : root;
    const relInRepo = f.repo ? f.path.slice(f.repo.length + 1) : f.path;
    const tracked = !!git(repoAbs, ['ls-files', '--', relInRepo]);
    const it = itemFor(f.path);
    issues.push({
      id: 'env-file:' + f.path, kind: 'env-file', severity: tracked ? 'high' : 'medium',
      title: tracked ? 'Your private settings file is saved in git' : 'Your private settings file isn’t hidden from git',
      detail: tracked
        ? `${f.path} holds ${plural(secretVars.length, 'password or key', 'passwords and keys')} and is committed, so everyone with access to the code (and its history) can read them. This file is meant to stay on your computer only.`
        : `${f.path} holds ${plural(secretVars.length, 'password or key', 'passwords and keys')} and isn’t listed in .gitignore, so the next commit will upload it with your code.`,
      items: it ? [it] : [], notes: it ? { [it]: `${f.path}: ${secretVars.slice(0, 6).map((v) => v.name).join(', ')}${secretVars.length > 6 ? '…' : ''}` } : {},
      locations: secretVars.map((v) => ({ file: f.path, line: v.line })),
      fix: [
        `Security fix: ${f.path} contains secrets and ${tracked ? 'is committed to git' : 'is not ignored by git'}. Do not print or repeat any value from it.`,
        ``,
        `1. Add ${base} (and .env*.local) to ${f.repo ? f.repo + '/' : ''}.gitignore, keeping .env.example tracked.`,
        tracked ? `2. Stop tracking it without deleting my local copy: git rm --cached "${relInRepo}" (run inside ${f.repo || 'the repo'}), then commit.` : `2. Confirm with git status that the file no longer shows up as a new file.`,
        `3. Create or update .env.example next to it with the same variable names and empty values: ${secretVars.map((v) => v.name).join(', ')}.`,
        tracked ? `4. Give me a checklist (names only, no values) of which keys I need to rotate in each service's dashboard, since they are in git history. Mention that removing them from history needs a tool like git filter-repo, and ask before doing that.` : `4. Tell me which deployment settings need these variables.`,
      ].join('\n'),
    });
  }

  // ---------- secret keys in variables the browser gets (NEXT_PUBLIC_, VITE_ …) ----------
  const live = (p) => !TEST_FILE.test(p) && !EXAMPLE_FILE.test(p);
  const publicVars = new Map(); // name -> { svc, refs: [{file, line}], defs: [{file, line}] }
  const publicVar = (name) => { if (!publicVars.has(name)) publicVars.set(name, { name, svc: leakyPublicVar(name), refs: [], defs: [] }); return publicVars.get(name); };
  for (const f of scan.files) if (live(f.path)) for (const x of findings(f.path)) if (x.k === 'public-env') publicVar(x.name).refs.push({ file: f.path, line: x.line });
  for (const f of scan.files) {
    const base = f.path.split('/').pop();
    if (!/^\.env(\.[\w.-]+)?$/i.test(base) || /example|sample|template|dist|schema/i.test(base) || !live(f.path)) continue;
    let src = '';
    try { src = readHead(path.join(root, f.path), 262144); } catch { continue; }
    src.split('\n').forEach((t, i) => {
      const m = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*["']?([^"'#\s]*)/.exec(t);
      if (!m || !m[2] || leakyPublicVar(m[1]) === null) return;
      // VITE_ADMIN_PASSWORD=$2b$12$… is a hash (or ciphertext), not the password
      if (protectedValue(m[2], m[1])) publicVar(m[1]).protected = true;
      else if (!PLACEHOLDER.test(m[2]) && !/^\$/.test(m[2])) publicVar(m[1]).defs.push({ file: f.path, line: i + 1 });
    });
  }
  for (const [name, v] of publicVars) if (v.protected && !v.defs.length) publicVars.delete(name);
  if (publicVars.size) {
    const vars = [...publicVars.values()];
    const browserSide = (p) => isFrontend(p) || /\.(jsx|tsx|vue|svelte|astro)$/.test(p);
    const sev = vars.some((v) => CLIENT_ONLY_PREFIX.test(v.name) || v.refs.some((r) => browserSide(r.file))) ? 'high' : 'medium';
    const svcs = [...new Set(vars.map((v) => v.svc).filter(Boolean))];
    const locations = vars.flatMap((v) => [...v.defs, ...v.refs]);
    const items = [], notes = {};
    for (const v of vars) for (const loc of [...v.refs, ...v.defs]) {
      const it = itemFor(loc.file);
      if (!it) continue;
      if (!items.includes(it)) items.push(it);
      const note = `line ${loc.line}: ${v.name}`;
      if (!(notes[it] || '').includes(note)) notes[it] = (notes[it] ? notes[it] + ' · ' : '') + note;
    }
    const names = vars.map((v) => v.name);
    issues.push({
      id: 'public-env', kind: 'public-env-secret', severity: sev,
      title: vars.length === 1 ? `${names[0]} is sent to every visitor’s browser` : `${vars.length} secret keys are sent to every visitor’s browser`,
      detail: `Settings whose names start with NEXT_PUBLIC_, VITE_ and the like are copied into the code your site sends to every visitor, where anyone can read them in their browser’s developer tools. ${vars.length === 1 ? `${names[0]} looks like a secret key` : `${names.slice(0, 4).join(', ')}${vars.length > 4 ? '…' : ''} look like secret keys`}${svcs.length ? ` (for ${svcs.slice(0, 4).join(', ')})` : ''}, so anyone could use ${vars.length === 1 ? 'it' : 'them'} as you: run up your bill, send messages as you, or reach your data.${sev === 'medium' ? ' Right now only server code seems to read it, so it may not have reached a browser yet, but the name invites that.' : ''}`,
      items, notes, locations,
      fix: [
        `Security fix: secret keys in public environment variables (the browser gets every variable with these prefixes). Do not print, echo or repeat any key value.`,
        ``,
        ...vars.map((v) => `- ${v.name}${v.svc ? ` (${v.svc})` : ''}: ${[...v.defs.map((d) => `set in ${d.file}:${d.line}`), ...v.refs.map((r) => `used in ${r.file}:${r.line}`)].slice(0, 6).join(', ')}`),
        ``,
        `For each one:`,
        `1. Rename it without the public prefix (for example OPENAI_API_KEY instead of VITE_OPENAI_API_KEY) in the .env files, .env.example and the hosting settings.`,
        `2. Move every place that uses it into server-side code (a Next.js route handler or server action, a Supabase Edge Function, a serverless function or the existing backend) and have the frontend call that instead, so the key never reaches the browser.`,
        vars.some((v) => v.svc === 'Supabase') ? `3. For the Supabase service-role key: browser code should use the anon key and rely on row-level security; only server code may use the service-role key.` : `3. Keep the frontend working the same way, and run the app to check.`,
        ``,
        `Then give me a checklist (names only, no values) of the keys to rotate in each service's dashboard: anyone who loaded the site may have copied them.`,
      ].join('\n'),
    });
  }

  // ---------- Supabase tables anyone can read and change ----------
  const usesSupabase = scan.files.some((f) => /(^|\/)supabase\/(migrations\/|config\.toml$|functions\/)/.test(f.path) || findings(f.path).some((x) => x.k === 'uses-supabase'));
  if (usesSupabase) {
    const byRepo = new Map(); // repo -> [file, …] in path order (migrations are named by timestamp)
    for (const f of scan.files) if (f.lang === 'sql' && live(f.path) && findings(f.path).some((x) => x.k.startsWith('sql-'))) { const k = f.repo ?? ''; if (!byRepo.has(k)) byRepo.set(k, []); byRepo.get(k).push(f.path); }
    for (const [repo, sqlFiles] of byRepo) {
      const tables = new Map(); // table -> { file, line, rls, off }
      const policies = [];
      for (const p of sqlFiles.sort()) for (const x of findings(p)) {
        const t = tables.get(x.table);
        if (x.k === 'sql-table' && !t) tables.set(x.table, { file: p, line: x.line, rls: null });
        else if (x.k === 'sql-rls' && t) { t.rls = x.on; t.off = x.on ? null : { file: p, line: x.line }; }
        else if (x.k === 'sql-rename' && t) { tables.delete(x.table); tables.set(x.to, t); for (const pol of policies) if (pol.table === x.table) pol.table = x.to; }
        else if (x.k === 'sql-drop') tables.delete(x.table);
        else if (x.k === 'sql-open-policy') policies.push({ ...x, file: p });
      }
      const short = (t) => t.replace(/^public\./, '');
      const open = [...tables.entries()].filter(([name, t]) => name.startsWith('public.') && t.rls !== true);
      if (open.length) {
        const items = [], notes = {};
        for (const [name, t] of open) {
          const it = itemFor(t.file);
          if (!it) continue;
          if (!items.includes(it)) items.push(it);
          notes[it] = (notes[it] ? notes[it] + ' · ' : '') + `line ${t.line}: ${short(name)} (row-level security ${t.off ? 'switched off' : 'never switched on'})`;
        }
        const list = open.map(([name]) => short(name));
        issues.push({
          id: 'rls:' + repo, kind: 'database-rules', severity: 'high',
          title: open.length === 1 ? `Anyone can read and change your ${list[0]} table` : `Anyone can read and change ${open.length} of your database tables`,
          detail: `Your app talks to Supabase with a public key that every visitor’s browser has. Row-level security is what stops one person from reading or changing someone else’s rows, and it’s off for ${open.length === 1 ? `the ${list[0]} table` : `${list.slice(0, 6).join(', ')}${list.length > 6 ? ` and ${list.length - 6} more` : ''}`}. Without it, anyone can use that key to read, change or delete every row${open.length === 1 ? '' : ' in them'}. If your app only reaches the database from its own server, the risk is lower, but switching it on is still the safe default.`,
          items, notes,
          locations: open.map(([, t]) => t.off || { file: t.file, line: t.line }),
          fix: [
            `Security fix: Supabase tables without row-level security (RLS). Do not print any keys.`,
            ``,
            `Anyone with the app's public (anon) key can read and change these tables:`,
            ...open.map(([name, t]) => `- ${name}: created in ${t.file}:${t.line}${t.off ? `, row-level security switched off in ${t.off.file}:${t.off.line}` : ''}`),
            ``,
            `1. Read how the app uses each table: which pages read or write it, and whether rows belong to a user (for example a user_id column that should match auth.uid()).`,
            `2. Write one new migration (don't edit the old ones) that runs \`alter table <table> enable row level security;\` for each table, plus policies so the app keeps working: usually signed-in users can read and change only their own rows (\`using (auth.uid() = user_id)\`), and tables meant to be public get a read-only policy. Server code that uses the service-role key isn't affected by these rules.`,
            `3. Explain the policies to me in plain words before applying anything, and don't loosen any existing policy.`,
            `4. Tell me how to apply the migration (for example \`supabase db push\`) and how to check, while signed out, that I can't read other people's rows.`,
          ].join('\n'),
        });
      }
      const loose = policies.filter((pol) => tables.get(pol.table)?.rls === true);
      if (loose.length) {
        const verb = (cmd) => ({ insert: 'add', update: 'change', delete: 'delete' }[cmd] || 'add, change and delete');
        const rowsOf = (cmd, t) => `${verb(cmd)} rows ${{ insert: 'to', delete: 'from' }[cmd] || 'in'} ${t}`;
        const items = [], notes = {};
        for (const pol of loose) {
          const it = itemFor(pol.file);
          if (!it) continue;
          if (!items.includes(it)) items.push(it);
          notes[it] = (notes[it] ? notes[it] + ' · ' : '') + `line ${pol.line}: “${pol.policy}” lets anyone ${rowsOf(pol.cmd, short(pol.table))}`;
        }
        issues.push({
          id: 'open-policy:' + repo, kind: 'database-rules', severity: 'medium',
          title: loose.length === 1 ? `A database rule lets anyone change your ${short(loose[0].table)} table` : `${loose.length} database rules let anyone change your data`,
          detail: `${loose.length === 1 ? `The rule “${loose[0].policy}” lets anyone` : `These rules let anyone`}${loose.some((pol) => pol.signedOut) ? ', even people who aren’t signed in,' : ''} ${loose.length === 1 ? rowsOf(loose[0].cmd, short(loose[0].table)) : `add, change or delete rows in ${[...new Set(loose.map((pol) => short(pol.table)))].slice(0, 5).join(', ')}`}. If a table is a public form (like a waitlist or contact form), letting anyone add rows is fine; otherwise limit it to signed-in users and their own rows.`,
          items, notes,
          locations: loose.map((pol) => ({ file: pol.file, line: pol.line })),
          fix: [
            `Security review: Supabase row-level security policies that allow anyone to change data (\`using (true)\` / \`with check (true)\` for anon or public):`,
            ...loose.map((pol) => `- “${pol.policy}” on ${pol.table} (for ${pol.cmd}) — ${pol.file}:${pol.line}`),
            ``,
            `For each one, tell me in plain words what it allows and whether the app needs that. If the table isn't meant to be public, replace \`true\` with a check such as \`auth.uid() = user_id\`, limited to authenticated users, in a new migration. If it's a public form, keep adding rows open but make sure nobody can read, change or delete other people's rows. Show me the change before applying it.`,
          ].join('\n'),
        });
      }
    }
  }

  // ---------- Firebase security rules that let anyone in ----------
  const today = new Date();
  const longDate = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
  for (const f of scan.files) {
    const base = f.path.split('/').pop();
    if (!live(f.path) || !(/\.rules$/i.test(base) || /^database(\.[\w-]+)?\.rules\.json$/i.test(base))) continue;
    let src = '';
    try { src = readHead(path.join(root, f.path), 262144); } catch { continue; }
    const rtdb = /\.json$/i.test(base);
    const service = rtdb ? 'Realtime Database' : /service\s+firebase\.storage/.test(src) ? 'Storage' : /service\s+cloud\.firestore/.test(src) ? 'Firestore' : null;
    if (!service) continue;
    const rules = rtdb ? firebaseRtdbRules(src, today) : firebaseRules(src, today);
    // the whole database, or (Firestore and Storage) any change beyond adding new records to one place
    const severe = (r) => r.wide || (!rtdb && !r.createOnly);
    const writes = rules.filter((r) => r.write && r.open !== 'expired' && severe(r));
    const deepWrites = rules.filter((r) => r.write && r.open === 'always' && !severe(r));
    const reads = rules.filter((r) => r.read && !r.write && r.open !== 'expired' && r.wide);
    const until = rules.find((r) => r.open === 'until');
    const expired = rules.find((r) => r.open === 'expired');
    if (!writes.length && !deepWrites.length && !reads.length && !expired) continue;
    const files = service === 'Storage';
    const what = files ? 'files' : 'data';
    const deploy = { Firestore: 'firestore:rules', Storage: 'storage', 'Realtime Database': 'database' }[service];
    const shown = [...writes, ...deepWrites, ...reads, ...(expired ? [expired] : [])];
    let title, detail, severity;
    if (until && writes.length) {
      severity = 'high';
      title = `Your Firebase ${service} is open to anyone until ${longDate(until.until)}`;
      detail = `${base} still has Firebase’s “test mode” rules: anyone can read and change ${files ? 'every file' : 'everything'} until ${longDate(until.until)}, without signing in or using your app. After that date every request is refused and the app stops working, so replace them with real rules rather than moving the date.`;
    } else if (writes.length) {
      severity = 'high';
      title = files ? 'Anyone can upload, replace or delete your Firebase files' : `Anyone can change or delete your Firebase ${service} data`;
      detail = `A rule in ${base} (line ${writes[0].line}, at ${writes[0].where}) lets anyone, signed in or not, ${files ? 'upload, replace or delete files' : 'add, change or delete data'}. Your app’s Firebase settings are in every visitor’s browser, so anyone can use them to reach your ${service} directly, without going through your app.`;
    } else if (deepWrites.length || reads.length) {
      severity = 'medium';
      title = reads.length && !deepWrites.length ? `Anyone can read everything in your Firebase ${service}` : `Anyone can change part of your Firebase ${service}`;
      detail = [
        reads.length ? `A rule in ${base} (line ${reads[0].line}) lets anyone read every ${files ? 'file' : 'record'}, including data that may belong to your users. If everything there is meant to be public, that’s fine; otherwise it needs a sign-in check.` : '',
        deepWrites.length ? `A rule in ${base} (line ${deepWrites[0].line}) lets anyone ${deepWrites[0].createOnly ? 'add to' : 'change'} ${deepWrites[0].where} without signing in. If that’s a public form (like a waitlist or contact form), that can be fine; otherwise it needs a sign-in check.` : '',
      ].filter(Boolean).join(' ');
    } else {
      severity = 'medium';
      title = `Your Firebase ${service} test-mode rules ran out on ${longDate(expired.until)}`;
      detail = `${base} has Firebase’s “test mode” rules, which stopped allowing access on ${longDate(expired.until)}. Every read and write is now refused, so the parts of the app that use ${service} won’t work. Replace them with real rules instead of moving the date, which would open everything to anyone again.`;
    }
    const it = itemFor(f.path);
    issues.push({
      id: 'firebase-rules:' + f.path, kind: 'database-rules', severity, title, detail,
      items: it ? [it] : [], notes: it ? { [it]: shown.slice(0, 4).map((r) => `line ${r.line}: ${r.text}`).join(' · ') } : {},
      locations: shown.map((r) => ({ file: f.path, line: r.line })),
      fix: [
        `Security fix: Firebase ${service} security rules in ${f.path}.`,
        ``,
        `These rules let anyone in (or have expired):`,
        ...shown.map((r) => `- line ${r.line}: ${r.text}`),
        ``,
        `1. Read how the app uses each ${rtdb ? 'path' : files ? 'storage folder' : 'collection'}: what each screen reads and writes, and which data belongs to a user (for example ${files ? 'files under a folder named after the user’s uid' : 'documents keyed by the user’s uid, or with an ownerId field'}).`,
        `2. Rewrite the rules so signed-in users can only read and write their own ${what} (${rtdb ? 'auth != null && auth.uid === $uid' : files ? 'request.auth != null && request.auth.uid == userId' : 'request.auth != null && request.auth.uid == resource.data.ownerId'}), public content is read-only, and everything else is denied. Don't use test-mode dates.`,
        `3. Explain the new rules to me in plain words and wait for my OK.`,
        `4. Then deploy them with \`firebase deploy --only ${deploy}\` and check them in the Firebase console's Rules Playground (or the emulator): a signed-out user shouldn't be able to read or change anything private.`,
      ].join('\n'),
    });
  }

  // ---------- Stripe webhooks that don't check Stripe's signature ----------
  const stripeFiles = new Map(); // file -> finding
  for (const f of scan.files) if (live(f.path)) { const x = findings(f.path).find((y) => y.k === 'stripe-unsigned'); if (x) stripeFiles.set(f.path, x); }
  for (const [file, x] of stripeFiles) {
    const routesHere = graph.routes.map((r, i) => ({ r, i })).filter(({ r }) => r.f === file && r.m !== 'GET');
    const it = itemFor(file);
    const items = [...(it ? [it] : []), ...routesHere.map(({ i }) => 'r:' + i)];
    const py = /\.py$/.test(file);
    const next = /(^|\/)app\/.*route\.[jt]s$|(^|\/)pages\/api\//.test(file);
    issues.push({
      id: 'stripe-webhook:' + file, kind: 'stripe-webhook', severity: 'high',
      title: `Anyone could fake a Stripe payment in ${nameOf(file)}`,
      detail: `${file.split('/').pop()} acts on Stripe events (like “${x.events[0]}”) without checking Stripe’s signature, so anyone who finds the address can send a fake “payment succeeded” message and get orders, credits or a subscription for free. Stripe signs every real event; checking that signature takes a few lines.`,
      items, notes: Object.fromEntries(items.map((id) => [id, id.startsWith('r:') ? 'Receives Stripe events without checking they’re real' : `line ${x.line}: handles ${x.events.join(', ')} without checking Stripe’s signature`])),
      locations: [{ file, line: x.line }],
      fix: [
        `Security fix in ${file}: verify Stripe webhook signatures before acting on any event. Do not print any secret values.`,
        ``,
        `It handles ${x.events.join(', ')} (line ${x.line}) without calling ${py ? 'stripe.Webhook.construct_event' : 'stripe.webhooks.constructEvent'}.`,
        ``,
        py
          ? `1. Read the raw request body as bytes (FastAPI: \`await request.body()\`; Flask: \`request.get_data()\`), not the parsed JSON.`
          : next ? `1. Read the raw request body with \`await req.text()\` (App Router) or turn off the body parser for this route (Pages Router), not the parsed JSON.` : `1. Give this route the raw body: \`express.raw({ type: 'application/json' })\` on it, registered before \`express.json()\` runs for it.`,
        py
          ? `2. Call \`stripe.Webhook.construct_event(payload, request.headers["stripe-signature"], os.environ["STRIPE_WEBHOOK_SECRET"])\` and return 400 if it raises.`
          : `2. Call \`stripe.webhooks.constructEvent(rawBody, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET)\` (the \`stripe-signature\` header) and return 400 if it throws.`,
        `3. Use only the verified event from then on, and handle each event once even if Stripe sends it again.`,
        `4. Add STRIPE_WEBHOOK_SECRET (empty) to .env.example and tell me where to get it: the Stripe dashboard (Developers → Webhooks → the endpoint → Signing secret), or \`stripe listen\` when testing locally.`,
      ].join('\n'),
    });
  }

  // ---------- servers that let any website call them (CORS) ----------
  const cors = [];
  for (const f of scan.files) if (live(f.path)) for (const x of findings(f.path)) if (x.k === 'cors-any') cors.push({ file: f.path, ...x });
  if (cors.length) {
    const cred = cors.filter((c) => c.credentials);
    const filesC = [...new Set(cors.map((c) => c.file))];
    const items = [], notes = {};
    for (const c of cors) {
      const it = itemFor(c.file);
      if (!it) continue;
      if (!items.includes(it)) items.push(it);
      notes[it] = (notes[it] ? notes[it] + ' · ' : '') + `line ${c.line}: ${c.how}${c.credentials ? ', with login cookies' : ''}`;
    }
    issues.push({
      id: 'cors', kind: 'cors', severity: cred.length ? 'medium' : 'low',
      title: cred.length ? 'Any website could act as your signed-in users' : 'Any website can call your server from a visitor’s browser',
      detail: cred.length
        ? `${cred[0].file.split('/').pop()} lets any website call this server from a visitor’s browser and send along their login cookies. So a site a signed-in user happens to visit could quietly read their data or act as them. Allow only your own app’s address instead.`
        : `${filesC.length === 1 ? filesC[0].split('/').pop() : `${filesC.length} files`} tell browsers that any website may call this server. That’s fine for a public API that doesn’t use login cookies (for example one that checks a token in the Authorization header); otherwise, allow only your own app’s address.`,
      items, notes,
      locations: cors.map((c) => ({ file: c.file, line: c.line })),
      fix: [
        `Security review: CORS settings that allow every website:`,
        ...cors.map((c) => `- ${c.file}:${c.line}: ${c.how}${c.credentials ? ' (with credentials)' : ''}`),
        ``,
        `First tell me in plain words whether this server uses login cookies or sessions, and which websites legitimately call it. Then replace the allow-everything setting with an explicit list of allowed origins read from an environment variable (for example ALLOWED_ORIGINS=https://myapp.com,http://localhost:3000). Keep credentials only if the app logs in with cookies, and never combine them with "*" or with echoing back whatever origin asks. Show me the change before making it, and change nothing else.`,
      ].join('\n'),
    });
  }

  // ---------- endpoints anyone can call ----------
  const routeFinding = new Map(); // `${file}|${line}|${method}` -> finding
  const globalGuards = new Map(); // repo -> [{framework, name, file}]
  const guardDefs = new Map();    // name -> [{ file, wrapper }]
  for (const f of scan.files) for (const x of findings(f.path)) {
    if (x.k === 'route') routeFinding.set(`${f.path}|${x.line}|${x.method}`, x);
    // app-wide checks count only from the app itself, not from scripts or tests that spin up their own
    if (x.k === 'global-guard' && !TEST_FILE.test(f.path) && !/(^|\/)(scripts?|tools|bin|examples?)\//.test(f.path) && !(fileByPath.has(f.path) && kinds(fileByPath.get(f.path).n).some((k) => NOT_USED_KINDS.has(k)))) { const k = f.repo ?? ''; if (!globalGuards.has(k)) globalGuards.set(k, []); globalGuards.get(k).push({ ...x, file: f.path }); }
    if (x.k === 'guard-def' && !TEST_FILE.test(f.path)) { if (!guardDefs.has(x.name)) guardDefs.set(x.name, []); guardDefs.get(x.name).push({ file: f.path, wrapper: !!x.wrapper }); }
  }
  const verifiedHelpers = new Map();
  for (const f of scan.files) {
    if (TEST_FILE.test(f.path)) continue;
    for (const x of findings(f.path)) {
      if (x.k !== 'py-verified-helper') continue;
      const repo = f.repo ?? '';
      if (!verifiedHelpers.has(repo)) verifiedHelpers.set(repo, new Map());
      const byName = verifiedHelpers.get(repo);
      if (!byName.has(x.name)) byName.set(x.name, []);
      byName.get(x.name).push(f.path);
    }
  }
  const routeImports = new Map();
  const helperImported = (file, helper, name) => {
    if (file === helper) return true;
    let src = routeImports.get(file);
    if (src === undefined) {
      try { src = fs.readFileSync(path.join(root, file), 'utf8'); }
      catch { src = ''; }
      routeImports.set(file, src);
    }
    const moduleName = helper.replace(/\.py$/, '').replace(/\//g, '.');
    const mod = moduleName.replaceAll('.', '\\.');
    return new RegExp('^\\s*from\\s+' + mod + '\\s+import\\s+[^\\n]*\\b' + name + '\\b', 'm').test(src);
  };
  const aliasGuards = pyAliasGuards(scan.files.filter((f) => !TEST_FILE.test(f.path)), findings);
  for (const [repo, aliases] of aliasGuards) for (const [name, file] of aliases) {
    if (!guardDefs.has(name)) guardDefs.set(name, []);
    guardDefs.get(name).push({ file, alias: true, repo });
  }
  // a sign-in check applied where the route's router is mounted: app.use('/admin', requireStaff, adminRouter),
  // or app.include_router(admin.router, dependencies=[Depends(require_admin)]) (a database session isn't one)
  const mountGuard = new Map((scan.routes || []).filter((r) => r.mountMw?.some(isGuardDep)).map((r) => [`${r.file}|${r.line}|${r.method}`, r.mountMw.find(isGuardDep)]));
  const sourceOf = new Map();
  const readSource = (p) => {
    if (!sourceOf.has(p)) { let src = ''; try { src = readHead(path.join(root, p), 262144); } catch { /* unreadable: nothing to go on */ } sourceOf.set(p, src); }
    return sourceOf.get(p);
  };
  const published = new Map(); // repo -> addresses it lists for crawlers and AI tools
  for (const f of scan.files) {
    if (!LISTING_FILE.test(f.path) || TEST_FILE.test(f.path) || EXAMPLE_FILE.test(f.path)) continue;
    const k = f.repo ?? '';
    if (!published.has(k)) published.set(k, new Set());
    for (const p of listedPaths(f.path, readSource(f.path))) published.get(k).add(p);
  }
  const isListed = (repo, p) => {
    const listed = published.get(repo);
    if (!listed) return false;
    if (listed.has(p)) return true;
    if (!/\[\.\.\./.test(p)) return false; // a catch-all route covers what's listed under it
    const prefix = p.split('[')[0];
    return prefix.length > 1 && [...listed].some((x) => x.startsWith(prefix));
  };
  const importsOf = new Map();
  for (const l of graph.links) if (l.a !== l.b && l.a.startsWith('f:') && l.b.startsWith('f:')) { const a = l.a.slice(2); if (!importsOf.has(a)) importsOf.set(a, new Set()); importsOf.get(a).add(l.b.slice(2)); }
  const PROJECT_IMPORT = /\bfrom\s+['"](?:\.{1,2}\/|@\/|~\/|#)|\bimport\s*\(\s*['"](?:\.{1,2}\/|@\/|~\/|#)|\brequire\(\s*['"](?:\.{1,2}\/|@\/|~\/|#)/g;
  /** A Next.js route file whose code, and everything it imports, shows no data store, session or server secret. */
  const readsNothingPrivate = (file, dynamic) => {
    const seen = new Set([file]), queue = [file];
    while (queue.length) {
      const p = queue.pop();
      const src = readSource(p);
      if (READS_PRIVATE.test(src) || (dynamic && READS_FILES.test(src))) return false;
      const next = [...(importsOf.get(p) || [])];
      // an import we couldn't follow could hold anything
      if ((src.match(PROJECT_IMPORT) || []).length > next.length) return false;
      for (const n of next) if (!seen.has(n) && !NOT_ITS_DATA.test(n)) { seen.add(n); queue.push(n); }
      if (seen.size > 200) return false;
    }
    return true;
  };
  const marksPublic = (file) => {
    const src = readSource(file);
    if (PUBLIC_RESPONSE.test(src) || NEXT_STATIC.test(src)) return true;
    return [...(importsOf.get(file) || [])].some((p) => { const h = readSource(p); return PUBLIC_RESPONSE.test(h) && !PRIVATE_RESPONSE.test(h); });
  };
  /** A reading endpoint that's open on purpose: its address, the project's own listing, its response, or having nothing private to give. */
  const publicByDesign = (r, fnd, repo) => {
    if (r.m !== 'GET') return false;
    if (PUBLIC_FILE_PATH.test(r.p) || isListed(repo, r.p) || fnd.publicResponse) return true;
    return !!fnd.nextGet && (marksPublic(r.f) || readsNothingPrivate(r.f, /\[/.test(r.p)));
  };
  const perRepo = new Map(); // repo -> { guarded, open: [], guardCounts }
  graph.routes.forEach((r, i) => {
    const fnd = routeFinding.get(`${r.f}|${r.l}|${r.m}`);
    if (!fnd) return; // framework we don't analyse: say nothing
    const gf = fileByPath.get(r.f);
    if (!gf || kinds(gf.n).some((k) => NOT_USED_KINDS.has(k)) || TEST_FILE.test(r.f)) return;
    const repo = gf.r ?? '';
    if (!perRepo.has(repo)) perRepo.set(repo, { guarded: 0, total: 0, open: [], misplaced: [], guardCounts: new Map(), fileGuards: new Map(), guardedIn: new Map() });
    const pr = perRepo.get(repo);
    pr.total++;
    const global = (globalGuards.get(repo) || []).find((g) => g.framework === 'flask' || g.framework === 'express' || (g.framework === 'next' && fnd.fn === r.m));
    // an unrecognised decorator that turns out to be an auth wrapper defined elsewhere in the project
    const viaWrapper = !fnd.via && fnd.decos?.find((d) => guardDefs.get(d)?.some((g) => (g.file.split('/')[0] === r.f.split('/')[0])));
    const mounted = !fnd.via && mountGuard.get(`${r.f}|${r.l}|${r.m}`);
    // a parameter typed with a dependency alias that checks the caller: `user: AdminUser`
    const viaAlias = !fnd.via && fnd.types?.find((t) => aliasGuards.get(repo)?.has(t));
    const viaSignatureHelper = !fnd.via && fnd.calls?.find((name) =>
      (verifiedHelpers.get(repo)?.get(name) || []).some((helper) => helperImported(r.f, helper, name)));
    if (fnd.via || global || viaWrapper || mounted || viaAlias || viaSignatureHelper) {
      pr.guarded++; pr.guardedIn.set(r.f, (pr.guardedIn.get(r.f) || 0) + 1);
      const name = fnd.guard || viaWrapper || mounted || viaAlias;
      if (name) {
        pr.guardCounts.set(name, (pr.guardCounts.get(name) || 0) + 1);
        if (!pr.fileGuards.has(r.f)) pr.fileGuards.set(r.f, new Map());
        pr.fileGuards.get(r.f).set(name, (pr.fileGuards.get(r.f).get(name) || 0) + 1);
      }
      return;
    }
    if (r.m === 'OPTIONS' || r.m === 'HEAD' || fnd.notAllowed) return;
    // webhook receivers: by URL, or a webhook-ish handler in a webhook file (not that file's admin endpoints)
    const webhook = (WEBHOOK_PATH.test(r.p) && !WEBHOOK_ADMIN.test(r.p)) || (/webhook|hooks?\//i.test(r.f) && /webhook|hook|notify|event|ingress|pubsub|callback|receive|inbound/i.test(r.h || '') && !/create|list|manage|register|delete|test|setup|sync/i.test((r.h || '') + r.p));
    if (webhook && fnd.signed) return;
    // a Stripe webhook that doesn't check Stripe's signature has its own, more specific issue
    if (stripeFiles.has(r.f) && (webhook || /stripe|payment|hook/i.test(r.p) || graph.routes.filter((x) => x.f === r.f && x.m !== 'GET').length === 1)) return;
    if (!webhook && PUBLIC_PATH.test(r.p.replace(/<[^>]*>|\{[^}]*\}|:\w+|\[[^\]]*\]/g, 'x'))) return;
    if (r.p === '/' && r.m === 'GET') return;
    if (!webhook && publicByDesign(r, fnd, repo)) return;
    const entry = { i, r, fnd, write: !['GET', 'ANY'].includes(r.m), webhook };
    if (fnd.misplaced) pr.misplaced.push(entry); else pr.open.push(entry);
  });
  for (const [repo, pr] of perRepo) {
    const top = (m) => m && [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    // prefer what this file already uses, then the project's most common real (non-wrapper) check
    const guardHint = (file, lang) => {
      const local = top(pr.fileGuards.get(file));
      const name = local || top(new Map([...pr.guardCounts].filter(([n]) => !guardDefs.get(n)?.every((g) => g.wrapper))));
      if (!name) return `the project's existing login check (find how other protected endpoints verify the user; if there is none, ask me before adding one)`;
      const defs = guardDefs.get(name) || [];
      const where = defs.find((g) => g.file === file) ? 'defined in this file' : defs.length ? `defined in ${defs[0].file}` : '';
      const how = defs.some((g) => g.alias) ? `a parameter typed ${name}` : `${lang === 'python' ? '@' : ''}${name}`;
      return `the same check ${local ? 'the other endpoints in this file' : 'the protected endpoints'} already use (${how}${where ? ', ' + where : ''})`;
    };
    const routeLine = (e) => `- ${e.r.m} ${e.r.p} — ${e.r.f}:${e.r.l}${e.fnd.fn && !/^[A-Z]+$/.test(e.fnd.fn) ? ` (${e.fnd.fn})` : ''}`;
    if (pr.misplaced.length) {
      const list = pr.misplaced;
      issues.push({
        id: 'misplaced-guard:' + repo, kind: 'unprotected-endpoint', severity: 'high',
        title: 'A login check is in the wrong place, so it does nothing',
        detail: `On ${plural(list.length, 'endpoint')} the login check (@${list[0].fnd.misplaced}) is written above the route line instead of below it. Flask only sees what's below, so ${list.length === 1 ? 'it is' : 'they are'} open to anyone even though ${list.length === 1 ? 'it looks' : 'they look'} protected.`,
        items: list.slice(0, 24).map((e) => 'r:' + e.i),
        notes: Object.fromEntries(list.slice(0, 24).map((e) => ['r:' + e.i, `@${e.fnd.misplaced} sits above the route line, so it is skipped`])),
        locations: list.map((e) => ({ file: e.r.f, line: e.r.l })),
        fix: [`Security fix: these endpoints have their auth decorator above the route decorator, so the framework registers the unprotected function:`, ...list.map(routeLine), ``, `Move each auth decorator directly below the @…route(...) line (route decorator first, then the auth decorator, then def). Change nothing else, then run the tests that cover these endpoints.`].join('\n'),
      });
    }
    if (!pr.open.length) continue;
    // Nothing in this repo checks the caller: probably protected elsewhere (gateway, private network) or not at all.
    if (pr.guarded === 0) {
      const list = pr.open.sort((a, b) => b.write - a.write);
      issues.push({
        id: 'no-auth:' + repo, kind: 'unprotected-endpoint', severity: 'medium',
        title: `None of ${repo ? `${repo}’s` : 'your'} endpoints check who is calling`,
        detail: `${plural(list.length, 'endpoint')} answer anyone who knows the address, with no login check in the code. That's fine only if this server is private (for example behind a company network or a gateway that checks logins); otherwise anyone could read or change its data.`,
        items: list.slice(0, 24).map((e) => 'r:' + e.i),
        notes: Object.fromEntries(list.slice(0, 24).map((e) => ['r:' + e.i, e.write ? 'Changes data, no login check' : 'No login check'])),
        locations: list.map((e) => ({ file: e.r.f, line: e.r.l })),
        fix: [`Review access control${repo ? ` in ${repo}` : ''}. None of these endpoints verify the caller in code:`, ...list.slice(0, 40).map(routeLine), list.length > 40 ? `- …and ${list.length - 40} more` : null, ``, `First tell me in plain words whether this server is reachable from the internet and whether anything in front of it (gateway, network rules) checks logins. If it is public, propose the smallest safe way to require login for the data-changing endpoints (POST/PUT/PATCH/DELETE) first, show me the plan, and wait for my OK before changing code.`].filter((x) => x !== null).join('\n'),
      });
      continue;
    }
    // One issue per route file
    const byFile = new Map();
    for (const e of pr.open) { if (!byFile.has(e.r.f)) byFile.set(e.r.f, []); byFile.get(e.r.f).push(e); }
    for (const [file, list] of byFile) {
      list.sort((a, b) => b.write - a.write || a.r.l - b.r.l);
      const writes = list.filter((e) => e.write && !e.webhook), hooks = list.filter((e) => e.webhook), reads = list.filter((e) => !e.write && !e.webhook);
      // many providers can't sign webhooks at all, so an unsigned one alone stays low
      const sev = writes.length ? 'high' : reads.length > 2 ? 'medium' : 'low';
      const lang = scanByPath.get(file)?.lang;
      const fileGuarded = pr.guardedIn.get(file) || 0;
      const sv = (n, one, many) => `${n} ${n === 1 ? one : many}`;
      const parts = [];
      if (writes.length) parts.push(sv(writes.length, 'endpoint that changes data (create, update or delete)', 'endpoints that change data (create, update or delete)'));
      if (reads.length) parts.push(sv(reads.length, 'endpoint that returns data', 'endpoints that return data'));
      const nOpen = writes.length + reads.length;
      const hookText = hooks.length ? `${sv(hooks.length, 'webhook (an automatic message from another service) is', 'webhooks (automatic messages from another service) are')} accepted without checking that ${hooks.length === 1 ? 'it really comes' : 'they really come'} from that service, so anyone could send fake ones. Some providers can't sign their messages; if so, that's expected.` : '';
      issues.push({
        id: 'open-endpoints:' + file, kind: 'unprotected-endpoint', severity: sev,
        title: writes.length ? `Anyone could change data through ${nameOf(file)}` : hooks.length ? `Anyone could send fake events to ${nameOf(file)}` : `Anyone could read data from ${nameOf(file)}`,
        detail: [
          parts.length ? `${file.split('/').pop()} has ${parts.join(' and ')} with no login check, so anyone who finds the address can use ${nOpen === 1 ? 'it' : 'them'}${fileGuarded > 0 ? ` (${sv(fileGuarded, 'other endpoint', 'other endpoints')} in the same file ${fileGuarded === 1 ? 'is' : 'are'} protected)` : ''}. If ${nOpen === 1 ? 'it is' : 'some are'} meant to be public, that's fine; otherwise ${nOpen === 1 ? 'it needs' : 'they need'} a login check.` : '',
          parts.length && hooks.length ? `It also accepts ${sv(hooks.length, 'webhook', 'webhooks')} without checking who sent ${hooks.length === 1 ? 'it' : 'them'}.` : hookText,
        ].filter(Boolean).join(' '),
        items: list.slice(0, 24).map((e) => 'r:' + e.i),
        notes: Object.fromEntries(list.slice(0, 24).map((e) => ['r:' + e.i, e.webhook ? 'Webhook with no visible signature check' : e.write ? 'Changes data, no login check' : 'Returns data, no login check'])),
        locations: list.map((e) => ({ file: e.r.f, line: e.r.l })),
        fix: [
          `Security fix in ${file}: these endpoints don't check who is calling:`,
          ...list.map((e) => routeLine(e) + (e.webhook ? ' [webhook]' : '')),
          ``,
          `For each endpoint that isn't meant to be public, add ${guardHint(file, lang)}.`,
          hooks.length ? `For webhooks, verify the provider's signature (using its signing secret from an environment variable) before doing anything, and reject requests that fail.` : null,
          `If an endpoint is intentionally public (for example a public page or a health check), leave it and tell me why. Don't change anything else; afterwards list exactly which endpoints you protected and run the related tests.`,
        ].filter((x) => x !== null).join('\n'),
      });
    }
  }

  // ---------- unused files ----------
  const incoming = new Set();
  for (const l of graph.links) if (l.a !== l.b && l.b.startsWith('f:')) incoming.add(l.b.slice(2));
  const entry = new Set(graph.project?.entrypoints || []);
  const routeFiles = new Set(graph.routes.map((r) => r.f));
  for (const fl of graph.flows || []) for (const s of fl.steps || []) if (s.ref?.startsWith('f:')) entry.add(s.ref.slice(2));
  const candidates = graph.files.filter((f) => {
    if (incoming.has(f.p) || entry.has(f.p) || routeFiles.has(f.p) || !USED_LANGS.has(f.l)) return false;
    if (TEST_FILE.test(f.p) || SPECIAL_FILE.test(f.p) || /(^|\/)app\/.*\/(page|layout|route|loading|error|template|default)\.[jt]sx?$/.test(f.p)) return false;
    if (/(^|\/)src\/routes\//.test(f.p) && /\+|\$|\[/.test(f.p.split('/').pop())) return false;
    if (kinds(f.n).some((k) => NOT_USED_KINDS.has(k))) return false;
    if (findings(f.p).some((x) => x.k === 'runnable' || x.k === 'route')) return false;
    return true;
  });
  // Safety net for dynamic loading: skip a file whose name appears in any other source file.
  if (candidates.length) {
    const want = new Map(candidates.map((f) => [stemOf(f.p), f.p]));
    const mentioned = new Set();
    for (const f of scan.files) {
      if (!['code', 'config', 'docs'].includes(f.category) || f.tooLarge) continue;
      let src;
      try { src = fs.readFileSync(path.join(root, f.path), 'utf8'); } catch { continue; }
      for (const tok of new Set(src.match(/[\w$-]+/g) || [])) { const p = want.get(tok); if (p && p !== f.path) mentioned.add(p); }
    }
    const unused = candidates.filter((f) => !mentioned.has(f.p) && !LOADED_BY_NAME.test(readSource(f.p).split('\n', 20).join('\n')));
    // A module where most files look unused is more likely loaded in a way we can't see; stay quiet.
    const byNode = new Map();
    for (const f of unused) { if (!byNode.has(f.n)) byNode.set(f.n, []); byNode.get(f.n).push(f); }
    const groups = [...byNode.entries()].filter(([n, list]) => { const total = graph.files.filter((f) => f.n === n).length; return n === 'unassigned' || list.length <= 3 || list.length / total <= 0.6; }).sort((a, b) => b[1].length - a[1].length);
    const MAX = 5;
    const merged = groups.length > MAX ? [...groups.slice(0, MAX - 1), ['', groups.slice(MAX - 1).flatMap(([, l]) => l)]] : groups;
    for (const [nid, list] of merged) {
      list.sort((a, b) => b.loc - a.loc);
      const where = nid ? label(nid) : 'other areas';
      const lines = list.reduce((s, f) => s + f.loc, 0);
      issues.push({
        id: 'unused:' + (nid || 'other'), kind: 'unused-file', severity: 'low',
        title: list.length === 1 ? `A file in ${where} looks unused` : `${list.length} files in ${where} look unused`,
        detail: `Nothing in the app imports or calls ${list.length === 1 ? 'this file' : 'these files'} (${lines.toLocaleString('en-US')} lines). Leftover code confuses AI assistants, which may edit or copy the wrong version. Double-check before deleting: some files are loaded in ways the map can't see.`,
        items: list.slice(0, 24).map((f) => 'f:' + f.p),
        notes: Object.fromEntries(list.slice(0, 24).map((f) => ['f:' + f.p, `Nothing uses this file (${f.loc.toLocaleString('en-US')} lines)`])),
        locations: list.map((f) => ({ file: f.p, line: 1 })),
        fix: [`Cleanup check: these files look unused (nothing imports or calls them):`, ...list.slice(0, 40).map((f) => `- ${f.p}`), list.length > 40 ? `- …and ${list.length - 40} more` : null, ``, `For each file, search the codebase (including configs, scripts, HTML templates and dynamic imports) to confirm nothing uses it. Then tell me which ones are safe to delete and which are actually used, with one line of evidence each. Don't delete anything until I confirm.`].filter((x) => x !== null).join('\n'),
      });
    }
  }

  // ---------- very large files ----------
  const big = graph.files.filter((f) => f.loc > 1000 && USED_LANGS.has(f.l) && !TEST_FILE.test(f.p) && !/(^|\/)(migrations|alembic|versions|fixtures?|seeds?|generated|__generated__)\//i.test(f.p) && !/\.d\.ts$/.test(f.p)).sort((a, b) => b.loc - a.loc);
  if (big.length) {
    const huge = big.filter((f) => f.loc >= 2000);
    issues.push({
      id: 'large-files', kind: 'large-file', severity: huge.length ? 'medium' : 'low',
      title: big.length === 1 ? 'One file is very large' : `${big.length} files are very large`,
      detail: `${big.length === 1 ? 'This file has' : 'These files each have'} over 1,000 lines${huge.length ? ` (the biggest has ${big[0].loc.toLocaleString('en-US')})` : ''}. AI assistants read and edit big files less reliably: they lose track of what's where and can break one part while fixing another. Splitting them into smaller files by job makes future changes safer.`,
      items: big.slice(0, 24).map((f) => 'f:' + f.p),
      notes: Object.fromEntries(big.slice(0, 24).map((f) => ['f:' + f.p, `${f.loc.toLocaleString('en-US')} lines${f.tooLarge ? ': too big for Floorplan to read, so what it connects to and any secrets in it weren’t checked' : ''}`])),
      locations: big.map((f) => ({ file: f.p, line: 1 })),
      fix: [`Refactor plan: these files are very large:`, ...big.slice(0, 15).map((f) => `- ${f.p} (${f.loc.toLocaleString('en-US')} lines)`), ``, `Start with ${big[0].p}. Read it and propose how to split it into smaller files, each with one clear job (for example by feature or by type of work), keeping every public function name and behaviour the same. Show me the plan first. After I approve, move code in small steps, update the imports, and run the tests after each step. Don't change behaviour.`].join('\n'),
    });
  }

  // ---------- frontend hard-coded to localhost ----------
  const local = [];
  for (const f of graph.files) if (isFrontend(f.p)) for (const x of findings(f.p)) if (x.k === 'localhost') local.push({ file: f.p, line: x.line });
  if (local.length) {
    const filesL = [...new Set(local.map((x) => x.file))];
    issues.push({
      id: 'localhost-url', kind: 'hardcoded-url', severity: 'low',
      title: 'The app points at your own computer’s address',
      detail: `${filesL.length === 1 ? 'A frontend file' : `${filesL.length} frontend files`} call${filesL.length === 1 ? 's' : ''} a fixed “localhost” address. That only works on your machine; once the app is online those calls will fail for everyone else.`,
      items: filesL.slice(0, 24).map((p) => 'f:' + p),
      notes: Object.fromEntries(filesL.slice(0, 24).map((p) => ['f:' + p, `localhost address on line ${local.filter((x) => x.file === p).map((x) => x.line).join(', ')}`])),
      locations: local,
      fix: [`These frontend lines use a hard-coded localhost URL:`, ...local.map((x) => `- ${x.file}:${x.line}`), ``, `Replace each with the project's existing API base URL setting (or add one read from a public environment variable such as NEXT_PUBLIC_API_URL / VITE_API_URL, with the localhost value only in .env.development). Don't change anything else.`].join('\n'),
    });
  }

  const KIND_ORDER = ['secret', 'public-env-secret', 'database-rules', 'stripe-webhook', 'env-file', 'unprotected-endpoint', 'cors', 'large-file', 'hardcoded-url', 'unused-file'];
  issues.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (b.locations?.length || 0) - (a.locations?.length || 0));
  const kept = issues.slice(0, 40);
  const summary = { high: 0, medium: 0, low: 0 };
  for (const i of kept) summary[i.severity]++;
  return { summary, issues: kept };
}

// ---------- "not a problem": issues people dismissed from the Health panel ----------
// serve.mjs saves them to floorplan/health-dismissed.json as { dismissed: [{ id, locations: ['file:line'], reason, at }] }.
// A dismissal covers the issue as it was: it shows again if it gets more or less serious, or finds something new
// in a file. It counts per file, not per line, so an edit higher up the file doesn't bring it back.
// (assets/ui/20-health.js has the same rule for the page.)
export function dismissalFor(issue, list) {
  const d = (list || []).find((x) => x && x.id === issue.id);
  if (!d || (d.severity && d.severity !== issue.severity)) return null;
  const left = new Map();
  for (const loc of d.locations || []) { const f = String(loc).replace(/:[^:]*$/, ''); left.set(f, (left.get(f) || 0) + 1); }
  for (const l of issue.locations || []) { const n = left.get(l.file) || 0; if (!n) return null; left.set(l.file, n - 1); }
  return d;
}
/** Folds a dismissal list into a built health result: keeps the list, recounts the summary without them. */
export function withDismissed(health, list) {
  const dismissed = (Array.isArray(list) ? list : []).filter((x) => x && typeof x.id === 'string');
  const summary = { high: 0, medium: 0, low: 0 };
  for (const i of health.issues) if (!dismissalFor(i, dismissed)) summary[i.severity]++;
  return { ...health, summary, ...(dismissed.length ? { dismissed } : {}) };
}

/** Test mode, in Firestore/Storage rules (request.time < timestamp.date(Y, M, D)) or Realtime Database rules (now < ms). */
const testModeEnd = (cond) => {
  const d = /^request\.time\s*<\s*timestamp\.date\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)$/.exec(cond);
  if (d) return new Date(Date.UTC(+d[1], +d[2] - 1, +d[3]));
  const ms = /^now\s*<\s*(\d{12,14})$/.exec(cond);
  return ms ? new Date(+ms[1]) : null;
};

/** Firestore / Storage rules that let anyone in: `allow …: if true`, `allow …;` (no condition) and test mode. */
function firebaseRules(src, now) {
  const s = src.replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
  const at = lineIndex(s);
  const matches = [...s.matchAll(/\bmatch\s+(\/\S*)\s*\{/g)].map((m) => ({ i: m.index, path: m[1] }));
  const out = [];
  for (const m of s.matchAll(/\ballow\s+([a-z][a-z,\s]*?)\s*(?::\s*if\s+([^;]+?))?\s*;/g)) {
    const ops = m[1].split(/[\s,]+/).filter(Boolean);
    const cond = (m[2] || 'true').trim().replace(/\s+/g, ' ');
    const end = cond === 'true' ? null : testModeEnd(cond);
    if (cond !== 'true' && !end) continue;
    const where = matches.filter((x) => x.i < m.index).pop()?.path || '/';
    const writeOps = ops.filter((o) => /^(write|create|update|delete)$/.test(o));
    out.push({
      line: at(m.index), text: `allow ${ops.join(', ')}${m[2] ? `: if ${cond}` : ' (no condition)'} at ${where}`,
      read: ops.some((o) => /^(read|get|list)$/.test(o)), write: writeOps.length > 0, createOnly: writeOps.length > 0 && writeOps.every((o) => o === 'create'),
      open: !end ? 'always' : end > now ? 'until' : 'expired', until: end, where,
      wide: /=\*\*\}/.test(where) || /\/documents$/.test(where) || where === '/',
    });
  }
  return out;
}

/** Realtime Database rules (database.rules.json) with ".read" / ".write" set to true or test mode. */
function firebaseRtdbRules(src, now) {
  const s = src.replace(/(^|[^:"])\/\/[^\n]*/g, (m, pre) => pre + ' '.repeat(m.length - pre.length));
  const at = lineIndex(s);
  const out = [];
  for (const m of s.matchAll(/"\.(read|write)"\s*:\s*(true\b|"([^"]*)")/g)) {
    const cond = m[2] === 'true' ? 'true' : (m[3] || '').trim();
    const end = cond === 'true' ? null : testModeEnd(cond);
    if (cond !== 'true' && !end) continue;
    // how deep it sits: { "rules": { ".read": … } } is the whole database
    let depth = 0;
    for (let i = 0; i < m.index; i++) { if (s[i] === '{') depth++; else if (s[i] === '}') depth--; }
    const keys = [...s.slice(0, m.index).matchAll(/"([^".][^"]*)"\s*:\s*\{/g)].map((k) => k[1]);
    const where = depth <= 2 ? 'the whole database' : '/' + keys.slice(-(depth - 2)).join('/');
    out.push({
      line: at(m.index), text: `"${m[1] === 'read' ? '.read' : '.write'}": ${m[2]} for ${where}`,
      read: m[1] === 'read', write: m[1] === 'write', createOnly: false,
      open: !end ? 'always' : end > now ? 'until' : 'expired', until: end, where, wide: depth <= 2, root: depth <= 2,
    });
  }
  return out;
}

function readHead(file, max) {
  const fd = fs.openSync(file, 'r');
  try { const buf = Buffer.alloc(max); const n = fs.readSync(fd, buf, 0, max, 0); return buf.subarray(0, n).toString('utf8'); } finally { fs.closeSync(fd); }
}
function stemOf(p) {
  const base = p.split('/').pop().replace(/\.[^.]+$/, '');
  return base === 'index' ? p.split('/').slice(-2, -1)[0] : base;
}

`


# scripts/lib/names.mjs

`javascript
// Fallback human-readable names, used until Antigravity writes real ones in floorplan/descriptions/.
import path from 'node:path';

const P = path.posix;
const ACRONYMS = /\b(api|ui|ux|id|ids|sku|skus|csv|url|urls|http|db|sql|bc|mcp|pos|gcs|s3|aws|gcp|jwt|pdf|ai|llm|cli|css|html|json|xml|oauth|sso|cdn|dns|ip|io|qa|ci|cd|crud|rpc|grpc|sdk|ttl|uuid|mtg)\b/g;
const GENERIC = /^(index|page|layout|route|routes|__init__|__main__|main|mod|lib|app|server|loading|error|not-found|template|default|handler|handlers|views?|urls|models?|schemas?|types?|constants?|utils?|helpers?|config|settings)$/i;

export function humanize(id) {
  let s = String(id)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-.\s]+/g, ' ')
    .trim()
    .toLowerCase();
  s = s.replace(ACRONYMS, (m) => m.toUpperCase());
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : String(id);
}

const cleanSeg = (seg) => seg.replace(/^\((.*)\)$/, '$1').replace(/^\[\.{0,3}(.*)\]$/, '$1 detail');

export function fallbackFileName(p) {
  const base = P.basename(p);
  const stem = base.replace(/\.(test|spec)(?=\.)/, '').replace(/\.[^.]+$/, '');
  const isTest = /\.(test|spec)\.[a-z]+$/i.test(base) || /^test_/.test(base) || /_test\.(py|go)$/.test(base);
  const core = stem.replace(/^test_/, '').replace(/_test$/, '');
  let name;
  if (GENERIC.test(core)) {
    const dirs = P.dirname(p).split('/').filter((d) => d && !/^(src|app|lib|pkg|internal)$/.test(d)).map(cleanSeg);
    const parent = dirs.slice(-1)[0] || '';
    const role = { page: 'page', layout: 'layout', route: 'route handler', __init__: 'package', index: '', loading: 'loading state', error: 'error state' }[core.toLowerCase()];
    name = parent ? `${humanize(parent)}${role ? ' ' + role : role === '' ? '' : ' ' + humanize(core).toLowerCase()}` : humanize(core);
  } else name = humanize(core);
  return isTest ? `${name} tests` : name;
}

export function fallbackRouteName(r) {
  if (r.handler && !/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|ANY)$/.test(r.handler)) return humanize(r.handler);
  const segs = r.path.split('/').filter((s) => s && !/[<{:[*]/.test(s));
  const verb = { GET: 'Get', POST: 'Create', PUT: 'Replace', PATCH: 'Update', DELETE: 'Delete' }[r.method] || r.method;
  return `${verb} ${humanize(segs.slice(-2).join(' ') || 'root').toLowerCase()}`;
}

export const routeKey = (r) => `${r.method} ${r.path}`;

`


# scripts/lib/resolve.mjs

`javascript
// Resolve import specifiers to files in the codebase, or to named external packages.
import fs from 'node:fs';
import path from 'node:path';
import { readJsonLoose } from './common.mjs';

const P = path.posix;

const NODE_BUILTINS = new Set(['assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib', 'test']);
const PY_STDLIB = new Set('__future__ abc argparse array ast asyncio atexit base64 bisect builtins bz2 calendar cgi cmath codecs collections colorsys concurrent configparser contextlib contextvars copy csv ctypes curses dataclasses datetime decimal difflib dis email encodings enum errno faulthandler fcntl filecmp fileinput fnmatch fractions ftplib functools gc getopt getpass gettext glob graphlib gzip hashlib heapq hmac html http imaplib importlib inspect io ipaddress itertools json keyword linecache locale logging lzma mailbox math mimetypes mmap multiprocessing netrc numbers operator optparse os pathlib pdb pickle pkgutil platform plistlib poplib posixpath pprint profile pstats pty queue quopri random re readline reprlib resource rlcompleter runpy sched secrets select selectors shelve shlex shutil signal site smtplib socket socketserver sqlite3 ssl stat statistics string stringprep struct subprocess sys sysconfig syslog tarfile tempfile termios textwrap threading time timeit tkinter token tokenize tomllib trace traceback tracemalloc tty turtle types typing typing_extensions unicodedata unittest urllib uuid venv warnings wave weakref webbrowser winreg wsgiref xml xmlrpc zipfile zipimport zlib zoneinfo'.split(' '));
const RUST_STD = new Set(['std', 'core', 'alloc', 'crate', 'self', 'super']);

const JS_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.vue', '.svelte', '.d.ts', '.json'];

export function createResolver(root, files) {
  const fileSet = new Set(files.map((f) => f.path));
  const byPath = new Map(files.map((f) => [f.path, f]));
  const dirsWith = (name) => files.filter((f) => P.basename(f.path) === name).map((f) => P.dirname(f.path));

  // ---- JS: tsconfig/jsconfig paths + workspace packages ----
  const tsconfigCache = new Map();
  const loadTsconfig = (file) => {
    if (tsconfigCache.has(file)) return tsconfigCache.get(file);
    let cfg = null;
    const json = readJsonLoose(path.join(root, file));
    if (json) {
      const dir = P.dirname(file);
      let opts = json.compilerOptions || {};
      let optsDir = dir;
      if ((!opts.paths && !opts.baseUrl) && typeof json.extends === 'string' && json.extends.startsWith('.')) {
        const extFile = P.normalize(P.join(dir, json.extends.endsWith('.json') ? json.extends : json.extends + '.json'));
        const base = fileSet.has(extFile) ? loadTsconfig(extFile) : null;
        if (base) { opts = base.raw; optsDir = base.optsDir; }
      }
      const baseDir = opts.baseUrl ? P.normalize(P.join(optsDir, opts.baseUrl)) : optsDir;
      cfg = { raw: opts, optsDir, baseDir, hasBaseUrl: !!opts.baseUrl, paths: Object.entries(opts.paths || {}) };
    }
    tsconfigCache.set(file, cfg);
    return cfg;
  };
  const nearestCache = new Map();
  const nearestTsconfig = (dir) => {
    if (nearestCache.has(dir)) return nearestCache.get(dir);
    let found = null;
    for (const name of ['tsconfig.json', 'jsconfig.json']) {
      const f = dir === '.' ? name : `${dir}/${name}`;
      if (fileSet.has(f)) { found = loadTsconfig(f); if (found) break; }
    }
    if (!found && dir !== '.' && dir !== '') found = nearestTsconfig(P.dirname(dir));
    nearestCache.set(dir, found);
    return found;
  };
  const workspacePkgs = new Map();
  for (const dir of dirsWith('package.json')) {
    const pj = readJsonLoose(path.join(root, dir, 'package.json'));
    if (pj?.name) workspacePkgs.set(pj.name, { dir, pj });
  }

  const tryJsFile = (p) => {
    p = P.normalize(p);
    if (fileSet.has(p) && !p.endsWith('/')) return p;
    for (const ext of JS_EXTS) if (fileSet.has(p + ext)) return p + ext;
    const jsToTs = p.replace(/\.(m|c)?jsx?$/, '');
    if (jsToTs !== p) for (const ext of ['.ts', '.tsx', '.mts', '.cts']) if (fileSet.has(jsToTs + ext)) return jsToTs + ext;
    for (const ext of JS_EXTS) if (fileSet.has(`${p}/index${ext}`)) return `${p}/index${ext}`;
    return null;
  };

  const resolveJs = (from, spec) => {
    if (spec.startsWith('.')) {
      const hit = tryJsFile(P.join(P.dirname(from), spec));
      return hit ? { file: hit } : { unresolved: true };
    }
    const cfg = nearestTsconfig(P.dirname(from));
    if (cfg) {
      for (const [pattern, targets] of cfg.paths) {
        const star = pattern.indexOf('*');
        const matched = star === -1 ? (spec === pattern ? '' : null)
          : (spec.startsWith(pattern.slice(0, star)) && spec.endsWith(pattern.slice(star + 1)) ? spec.slice(star, spec.length - (pattern.length - star - 1)) : null);
        if (matched === null) continue;
        for (const t of targets) {
          const hit = tryJsFile(P.join(cfg.baseDir, t.split('*').join(matched)));
          if (hit) return { file: hit };
        }
      }
      if (cfg.hasBaseUrl) { const hit = tryJsFile(P.join(cfg.baseDir, spec)); if (hit) return { file: hit }; }
    }
    if (spec.startsWith('node:')) return { builtin: true };
    const parts = spec.split('/');
    const pkgName = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    const sub = parts.slice(spec.startsWith('@') ? 2 : 1).join('/');
    const ws = workspacePkgs.get(pkgName);
    if (ws) {
      if (sub) { const hit = tryJsFile(P.join(ws.dir, sub)) || tryJsFile(P.join(ws.dir, 'src', sub)); if (hit) return { file: hit }; }
      const exp = ws.pj.exports;
      const entries = [ws.pj.source, typeof exp === 'string' ? exp : exp?.['.']?.import || exp?.['.']?.default || (typeof exp?.['.'] === 'string' ? exp['.'] : null), ws.pj.module, ws.pj.main, 'src/index', 'index'];
      for (const e of entries) { if (typeof e !== 'string') continue; const hit = tryJsFile(P.join(ws.dir, e)); if (hit) return { file: hit }; }
    }
    if (NODE_BUILTINS.has(pkgName)) return { builtin: true };
    if (/^[@a-z0-9]/i.test(pkgName)) return { external: pkgName, eco: 'npm' };
    return { unresolved: true };
  };

  // ---- Python ----
  const pyRootsCache = new Map();
  const pyRootsFor = (from, repoPath) => {
    const dir = P.dirname(from);
    const key = dir + '|' + repoPath;
    if (pyRootsCache.has(key)) return pyRootsCache.get(key);
    const roots = [];
    const repoRoot = repoPath === '.' ? '' : repoPath;
    let d = dir;
    while (true) {
      roots.push(d === '.' ? '' : d);
      if (d === repoRoot || d === '.' || d === '') break;
      d = P.dirname(d);
    }
    roots.push(repoRoot ? repoRoot + '/src' : 'src');
    pyRootsCache.set(key, roots);
    return roots;
  };
  const tryPyModule = (base) => {
    const b = base.replace(/^\/+/, '');
    if (fileSet.has(b + '.py')) return b + '.py';
    if (fileSet.has(b + '/__init__.py')) return b + '/__init__.py';
    if (fileSet.has(b + '.pyi')) return b + '.pyi';
    return null;
  };
  const resolvePy = (from, imp, repoPath) => {
    const spec = imp.spec;
    const targets = [];
    if (spec.startsWith('.')) {
      const dots = spec.match(/^\.+/)[0].length;
      let base = P.dirname(from);
      for (let i = 1; i < dots; i++) base = P.dirname(base);
      const rest = spec.slice(dots).replace(/\./g, '/');
      const modBase = rest ? P.join(base, rest) : base;
      const mod = rest ? tryPyModule(modBase) : null;
      const subs = (imp.names || []).map((n) => tryPyModule(P.join(modBase, n))).filter(Boolean);
      if (subs.length) return { files: subs, names: imp.names, module: mod };
      if (mod) return { file: mod };
      if (!rest) { const init = tryPyModule(base); if (init) return { file: init }; }
      return { unresolved: true };
    }
    const top = spec.split('.')[0];
    const modPath = spec.replace(/\./g, '/');
    for (const r of pyRootsFor(from, repoPath)) {
      const base = r ? `${r}/${modPath}` : modPath;
      if (imp.from && imp.names?.length) {
        const subs = imp.names.map((n) => tryPyModule(`${base}/${n}`)).filter(Boolean);
        if (subs.length) return { files: subs, names: imp.names, module: tryPyModule(base) };
      }
      const hit = tryPyModule(base);
      if (hit) return { file: hit };
      // `import a.b.c` where only a/b exists
      const parts = modPath.split('/');
      for (let k = parts.length - 1; k >= 1; k--) {
        const h = tryPyModule((r ? r + '/' : '') + parts.slice(0, k).join('/'));
        if (h && targets.length === 0) { targets.push(h); break; }
      }
      if (targets.length) return { file: targets[0] };
    }
    if (PY_STDLIB.has(top)) return { builtin: true };
    return { external: top, eco: 'pypi' };
  };

  // ---- Go ----
  const goMods = dirsWith('go.mod').map((dir) => {
    const txt = fs.readFileSync(path.join(root, dir, 'go.mod'), 'utf8');
    return { dir, module: /^module\s+(\S+)/m.exec(txt)?.[1] };
  }).filter((m) => m.module).sort((a, b) => b.module.length - a.module.length);
  const goDirFiles = new Map();
  for (const f of files) if (f.path.endsWith('.go') && !f.path.endsWith('_test.go')) {
    const d = P.dirname(f.path);
    if (!goDirFiles.has(d)) goDirFiles.set(d, []);
    goDirFiles.get(d).push(f.path);
  }
  const resolveGo = (from, spec) => {
    for (const m of goMods) {
      if (spec === m.module || spec.startsWith(m.module + '/')) {
        const dir = P.normalize(P.join(m.dir, spec.slice(m.module.length)));
        const list = goDirFiles.get(dir === '' ? '.' : dir);
        if (list?.length) {
          const pref = list.find((p) => P.basename(p, '.go') === P.basename(dir)) || list.sort()[0];
          return { file: pref };
        }
        return { unresolved: true };
      }
    }
    if (!spec.split('/')[0].includes('.')) return { builtin: true };
    return { external: spec.split('/').slice(0, 3).join('/'), eco: 'go' };
  };

  // ---- Rust ----
  const crateRoots = dirsWith('Cargo.toml').map((d) => (d === '.' ? 'src' : `${d}/src`)).sort((a, b) => b.length - a.length);
  const resolveRust = (from, imp) => {
    const dir = P.dirname(from);
    const stem = P.basename(from, '.rs');
    if (imp.kind === 'mod') {
      const base = ['mod', 'lib', 'main'].includes(stem) ? dir : `${dir}/${stem}`;
      for (const c of [`${base}/${imp.spec}.rs`, `${base}/${imp.spec}/mod.rs`]) if (fileSet.has(c)) return { file: c };
      return { unresolved: true };
    }
    const segs = imp.spec.split('::');
    if (segs[0] === 'crate') {
      const cr = crateRoots.find((r) => from.startsWith(r + '/'));
      if (!cr) return { unresolved: true };
      const rest = segs.slice(1);
      for (let k = rest.length; k >= 1; k--) {
        const b = `${cr}/${rest.slice(0, k).join('/')}`;
        for (const c of [b + '.rs', b + '/mod.rs']) if (fileSet.has(c)) return { file: c };
      }
      return { unresolved: true };
    }
    if (RUST_STD.has(segs[0])) return { builtin: true };
    return { external: segs[0], eco: 'cargo' };
  };

  // ---- JVM ----
  const jvmIndex = new Map();
  for (const f of files) if (f.pkg) jvmIndex.set(`${f.pkg}.${P.basename(f.path).replace(/\.\w+$/, '')}`, f.path);
  const resolveJvm = (from, spec) => {
    if (jvmIndex.has(spec)) return { file: jvmIndex.get(spec) };
    if (/^(java|javax|kotlin|scala|jdk|sun)\./.test(spec)) return { builtin: true };
    const parts = spec.split('.');
    for (let k = parts.length - 1; k >= 2; k--) if (jvmIndex.has(parts.slice(0, k).join('.'))) return { file: jvmIndex.get(parts.slice(0, k).join('.')) };
    return { external: parts.slice(0, Math.min(3, parts.length - 1)).join('.'), eco: 'maven' };
  };

  // ---- generic relative (C, Ruby, PHP, CSS) ----
  const byBasename = new Map();
  for (const f of files) { const b = P.basename(f.path); byBasename.set(b, byBasename.has(b) ? null : f.path); }
  const resolveRelative = (from, spec, exts) => {
    const base = P.normalize(P.join(P.dirname(from), spec));
    for (const e of ['', ...exts]) if (fileSet.has(base + e)) return { file: base + e };
    const uniq = byBasename.get(P.basename(spec));
    if (uniq) return { file: uniq };
    return { unresolved: true };
  };

  return function resolve(file, imp) {
    const lang = file.lang;
    switch (lang) {
      case 'typescript': case 'javascript': case 'vue': case 'svelte': case 'astro': return resolveJs(file.path, imp.spec);
      case 'python': return resolvePy(file.path, imp, file.repo);
      case 'go': return resolveGo(file.path, imp.spec);
      case 'rust': return resolveRust(file.path, imp);
      case 'java': case 'kotlin': case 'scala': case 'groovy': return resolveJvm(file.path, imp.spec);
      case 'ruby': return resolveRelative(file.path, imp.spec, ['.rb']);
      case 'php': return resolveRelative(file.path, imp.spec, ['.php']);
      case 'css': return resolveRelative(file.path, imp.spec, ['.css', '.scss', '.sass', '.less']).file ? resolveRelative(file.path, imp.spec, ['.css', '.scss']) : resolveRelative(file.path, P.join(P.dirname(imp.spec), '_' + P.basename(imp.spec)), ['.scss', '.sass']);
      default: return resolveRelative(file.path, imp.spec, []);
    }
  };
}

`


# scripts/lib/routes.mjs

`javascript
// Turn per-file route definitions + mounts into full paths, then match HTTP call literals to them.
// This is what links a frontend repo to a backend repo when no import connects them.

export const routeSegments = (p) => p.split('/').filter(Boolean).map((s) =>
  /^(<[^>]*>|\{[^}]*\}|:\w+|\[\.{0,3}[^\]]*\]|\*{1,2}|\$\{[^}]*\})$/.test(s) || /\$\{|\{[^}]*\}/.test(s) ? '*' : s);

const TEST_FILE = /(^|\/)(tests?|__tests__|spec|specs|e2e|fixtures?)\/|\.(test|spec)\.[a-z]+$|(^|\/)test_[^/]*\.py$|_test\.(py|go)$|(^|\/)conftest\.py$/;

const joinPath =(...parts) => '/' + parts.map((p) => (p || '').replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');

/**
 * @param files      scanned files: { path, lang, routes, mounts, routers, imports:[{names, aliases, alias, files[]}] }
 * @returns routes   [{ file, method, path, line }]
 */
/** The file (and router variable, '*' = all) a mount statement points at. */
function mountTarget(f, mount) {
  const imports = (f.imports || []).filter((i) => i.files?.length);
  if (mount.spec) { const imp = imports.find((i) => i.spec === mount.spec); return imp ? { file: imp.files[0], v: '*' } : null; }
  const [head, attr] = mount.var.split('.');
  if (f.lang !== 'python') {
    // JS: match the mounted name to the local binding of an import or require (every router can be called `router`)
    const imp = imports.find((i) => i.locals && Object.hasOwn(i.locals, head));
    return { file: imp ? imp.files[0] : f.path, v: '*' };
  }
  // First the import that binds the mounted name in this file: `from app.routes import campaigns as
  // campaign_routes` binds campaign_routes (not campaigns), and wins over `from app.platform import pricing`
  // whose module merely ends in a router's name (platform).
  const bound = imports.find((imp) => imp.from
    ? Object.hasOwn(imp.aliases || {}, head) || (imp.names?.includes(head) && !Object.values(imp.aliases || {}).includes(head))
    : (imp.alias || imp.spec?.split('.')[0]) === head);
  if (bound && (attr || bound.from)) {
    const orig = bound.aliases?.[head] || head;
    const file = (bound.from && bound.files.length > 1 && bound.files[bound.names.indexOf(orig)]) || bound.files[0];
    return { file, v: attr || orig };
  }
  for (const imp of imports) {
    if (attr && (imp.alias === head || imp.spec?.split('.').pop() === head || imp.names?.includes(head))) {
      return { file: imp.files[imp.names?.indexOf(head) ?? 0] || imp.files[0], v: attr };
    }
    if (!attr) {
      const orig = imp.aliases?.[head] || head;
      if (imp.names?.includes(orig)) return { file: imp.files.length === 1 ? imp.files[0] : imp.files[imp.names.indexOf(orig)] || imp.files[0], v: orig };
    }
  }
  return { file: f.path, v: head }; // defined in the same file
}

export function resolveRoutes(files) {
  // mountsTo[file] = [{ from, v, prefix }]   (v === '*' applies to every route in the file)
  const mountsTo = new Map();
  for (const f of files) for (const mount of TEST_FILE.test(f.path) ? [] : f.mounts || []) {
    const t = mountTarget(f, mount);
    if (!t) continue;
    if (!mountsTo.has(t.file)) mountsTo.set(t.file, []);
    mountsTo.get(t.file).push({ from: f.path, v: t.v, prefix: mount.prefix, mw: mount.mw || [] });
  }
  // Every prefix a file's routes live under, composing nested mounts (a router mounted into a router
  // that is itself mounted), e.g. app.use('/api', api) + api.use('/users', users) → /api/users.
  const outerPrefixes = (file, v, seen = new Set()) => {
    const ms = (mountsTo.get(file) || []).filter((m) => v == null || m.v === '*' || m.v === v);
    if (!ms.length || seen.has(file)) return [''];
    const next = new Set(seen).add(file);
    const out = [];
    for (const m of ms) for (const p of m.from === file ? [''] : outerPrefixes(m.from, null, next)) out.push(joinPath(p, m.prefix));
    return [...new Set(out)];
  };

  // Middleware applied where a file's routers are mounted, all the way up: app.use('/admin', requireStaff, admin)
  // then admin.use('/orders', orders) puts requireStaff in front of every route in orders.
  const mountMw = (file, v, seen = new Set()) => {
    const ms = (mountsTo.get(file) || []).filter((m) => v == null || m.v === '*' || m.v === v);
    if (!ms.length || seen.has(file)) return [];
    const next = new Set(seen).add(file);
    // a route is only as protected as its least-protected mount
    const each = ms.map((m) => [...m.mw, ...(m.from === file ? [] : mountMw(m.from, null, next))]);
    return each.reduce((a, b) => a.filter((x) => b.includes(x)));
  };

  // Firebase deploys a function under the name the functions entry file exports it as, so
  // `export { approveItem as approve } from './items'` renames it: `${file}|approveItem` -> ['approve']
  const exportedAs = new Map();
  for (const f of files) for (const imp of f.imports || []) {
    if (!imp.exported || !imp.files?.length) continue;
    for (const [as, orig] of Object.entries(imp.exported)) {
      if (as === orig) continue;
      const k = `${imp.files[0]}|${orig}`;
      exportedAs.set(k, [...(exportedAs.get(k) || []), as]);
    }
  }

  // onRequest(app) serves an Express app under the function's name; its own routes are the endpoints
  const byPath = new Map(files.map((f) => [f.path, f]));
  const wrapsApp = (file, prefix) => [...mountsTo].some(([to, ms]) => ms.some((m) => m.from === file && m.prefix === prefix) && byPath.get(to)?.routes?.some((r) => r.framework !== 'firebase'));

  const routes = [];
  for (const f of files) {
    // Test files define throwaway apps and stub servers; their routes aren't part of the system.
    if (!f.routes?.length || TEST_FILE.test(f.path)) continue;
    for (const r of f.routes) {
      if (r.framework === 'firebase') {
        if (r.method === 'ANY' && wrapsApp(f.path, r.path)) continue;
        // served at its own name, whatever the file's routers are mounted under
        for (const name of exportedAs.get(`${f.path}|${r.handler}`) || [r.handler]) routes.push({ file: f.path, method: r.method, path: '/' + name, line: r.line, handler: name, framework: 'firebase', ...(r.doc ? { doc: r.doc } : {}) });
        continue;
      }
      const defPrefix = (r.var && f.routers?.[r.var]) || '';
      const mw = mountMw(f.path, r.var);
      for (const mp of outerPrefixes(f.path, r.var)) routes.push({ file: f.path, method: r.method, path: joinPath(mp, defPrefix, r.path), line: r.line, ...(r.handler ? { handler: r.handler } : {}), ...(r.doc ? { doc: r.doc } : {}), ...(mw.length ? { mountMw: mw } : {}) });
    }
  }
  return dedupe(routes, (r) => `${r.file}|${r.method}|${r.path}`);
}

function dedupe(list, key) {
  const seen = new Set();
  return list.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; });
}

/** Score how well a call path matches a route path; null when they can't match. */
function score(c, r) {
  const n = Math.min(c.length, r.length);
  if (n === 0) return null;
  let literal = 0, wild = 0, loose = 0;
  for (let i = 1; i <= n; i++) {
    const a = c[c.length - i], b = r[r.length - i];
    if (a === b && a !== '*') literal++;
    else if (b === '*') wild++;           // route parameter: matches anything
    else if (a === '*') loose++;          // call interpolation vs a fixed route segment: possible, less likely
    else return null;
  }
  wild += loose;
  const extra = Math.max(c.length, r.length) - n;
  if (literal === 0) return null;
  // thin evidence (one literal segment under an unknown prefix): only kept if the prefix matches
  // what this caller is known to use, see matchCalls
  const weak = (literal === 1 && wild === 0 && extra > 2) || (literal === 1 && wild > 0 && extra > 0);
  // the part of the route the call didn't spell out, usually the client's base URL ("api/store")
  const prefix = r.length > c.length ? r.slice(0, r.length - n).join('/') : '';
  return { s: literal * 3 + wild - loose * 0.8 - extra * 0.5 + (extra === 0 ? 1 : 0) - (weak ? 100 : 0), literal, prefix, weak };
}

/**
 * Match call literals against resolved routes.
 * Ties are broken by the caller's learned base prefix: if a client's unambiguous calls all land
 * under /api/store, its ambiguous `/orders` means /api/store/orders, not /api/admin/orders.
 * @returns [{ from, to, method, path, call, line }]
 */
export function matchCalls(files, routes) {
  const rs = routes.map((r) => ({ ...r, segs: routeSegments(r.path) }));
  const pending = [];
  const learned = new Map(); // caller file or dir -> Map(prefix -> count)
  const learn = (key, prefix) => { if (!learned.has(key)) learned.set(key, new Map()); const m = learned.get(key); m.set(prefix, (m.get(prefix) || 0) + 1); };
  for (const f of files) {
    for (const call of f.calls || []) {
      const cs = routeSegments(call.path);
      let best = -Infinity, hits = [];
      for (const r of rs) {
        if (r.file === f.path) continue;
        // a Firebase callable (CALL) is only ever reached through httpsCallable, and only reaches callables
        if ((call.method === 'CALL') !== (r.method === 'CALL')) continue;
        if (call.method && r.method !== 'ANY' && r.method !== call.method) continue;
        const sc = score(cs, r.segs);
        if (!sc) continue;
        if (sc.s > best) { best = sc.s; hits = [{ r, ...sc }]; } else if (sc.s === best) hits.push({ r, ...sc });
      }
      if (!hits.length) continue;
      pending.push({ f, call, hits });
      if (!hits[0].weak && new Set(hits.map((h) => h.r.file)).size === 1) { learn(f.path, hits[0].prefix); learn(dir(f.path), hits[0].prefix); }
    }
  }
  const top = (key) => { const m = learned.get(key); return m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0][0] : null; };
  const out = [];
  for (const { f, call, hits } of pending) {
    let keep = hits;
    const pref = top(f.path) ?? top(dir(f.path));
    // weak matches need the caller's own track record, not a neighbour's
    if (hits[0].weak) { const own = top(f.path); keep = own == null ? [] : hits.filter((h) => h.prefix === own); if (!keep.length) continue; }
    // no method visible at the call site: fetch's default is GET
    if (!call.method && keep.some((h) => h.r.method === 'GET') && new Set(keep.map((h) => h.r.method)).size > 1) keep = keep.filter((h) => h.r.method === 'GET' || h.r.method === 'ANY');
    if (new Set(keep.map((h) => h.r.file)).size > 1) {
      const narrowed = pref == null ? [] : keep.filter((h) => h.prefix === pref);
      if (narrowed.length) keep = narrowed;
    }
    if (new Set(keep.map((h) => h.r.file)).size > 3) continue;
    for (const { r } of keep) out.push({ from: f.path, to: r.file, method: r.method, path: r.path, call: call.path, line: call.line, routeLine: r.line });
  }
  return dedupe(out, (e) => `${e.from}|${e.to}|${e.method}|${e.path}`);
}
const dir = (p) => p.split('/').slice(0, -1).join('/');

`


# scripts/lib/screens.mjs

`javascript
// Screens: the pages a person can open in the app (Next.js routes, React Router routes, …), so the
// map can be entered from what people recognise ("the checkout page") instead of code layers.
//
// findScreens(src, file) — called by scan.mjs for every code/config/docs file with its source.
//                          Returns raw screen hints for that file, stored in scan.json files[].screens:
//                            { fw, url }                        the file itself is the screen (file-based routers)
//                            { fw, url, comp, spec, files }     a router entry pointing at a component (resolved by import)
//                            { fw, url, target }                a router config naming the screen's file path
// buildScreens(ctx)      — called by build.mjs with { graph, scan, arch, root } after the graph is built.
//                          Returns graph.screens: [{ id, url, file, app, fw, name, description, behind: [{ id, note, kind }] }]
//                          kind: screen | part | request | server | data | outside (in that order, ~16 items).
//
// Supported: Next.js (app + pages router), React Router (JSX <Route> and route objects, v5–v7 incl.
// routes.ts config), Vue Router, Angular routes, TanStack Router (createFileRoute), SvelteKit, Remix
// (flat + nested routes), Nuxt, Astro, Expo Router.

import fs from 'node:fs';
import path from 'node:path';

const P = path.posix;
const JS_LANGS = new Set(['typescript', 'javascript', 'vue', 'svelte', 'astro']);

// ======================= scan side =======================

export function findScreens(src, file) {
  if (file.category !== 'code' || !JS_LANGS.has(file.lang)) return [];
  const p = file.path;
  const out = [];
  const page = fileBasedScreen(p, src);
  if (page) out.push(page);
  if (file.lang === 'typescript' || file.lang === 'javascript' || file.lang === 'vue') {
    for (const r of routerScreens(src, file)) out.push(r);
  }
  // de-dupe within a file
  const seen = new Set();
  return out.filter((s) => { const k = `${s.url}|${s.comp || ''}|${s.spec || ''}|${s.target || ''}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

/** Turn file-router segments into a URL. Returns null when the file isn't routable (private folders, intercepts). */
function segmentsToUrl(segs, { indexName = null } = {}) {
  const out = [];
  for (let s of segs) {
    if (!s) continue;
    if (/^\(\.+\)/.test(s)) return null;                 // Next intercepting routes: (.)photo
    if (/^\(.*\)$/.test(s) || s.startsWith('@')) continue; // route groups, parallel slots
    if (s.startsWith('_')) return null;                  // Next private folders
    if (indexName && s === indexName) continue;
    s = s.replace(/^\[\[\.\.\.(.+)\]\]$/, '*').replace(/^\[\.\.\.(.+)\]$/, '*').replace(/^\[\[(.+)\]\]$/, ':$1?').replace(/^\[(.+)\]$/, ':$1');
    out.push(s);
  }
  return '/' + out.join('/');
}

function fileBasedScreen(p, src) {
  let m;
  // Next.js app router: app/**/page.tsx
  if ((m = /(?:^|\/)app\/((?:[^/]+\/)*)page\.(?:tsx|jsx|ts|js|mdx)$/.exec(p))) {
    const url = segmentsToUrl(m[1].split('/'));
    return url && { fw: 'next-app', url };
  }
  // SvelteKit: src/routes/**/+page.svelte
  if ((m = /(?:^|\/)routes\/((?:[^/]+\/)*)\+page\.svelte$/.exec(p))) {
    const url = segmentsToUrl(m[1].split('/').map((s) => s.replace(/^\[(\.\.\.)?([^\]=]+)(=[^\]]+)?\]$/, (_, rest, name) => rest ? '[...x]' : `[${name}]`)));
    return url && { fw: 'sveltekit', url };
  }
  // TanStack Router file routes: createFileRoute('/products/$id')
  if ((m = /\bcreateFileRoute\(\s*["'`]([^"'`]*)["'`]\s*\)/.exec(src)) && !/__root/.test(p)) {
    const url = normalizeUrl(m[1].replace(/\/_[^/]+/g, '').replace(/\$([A-Za-z_]\w*)/g, ':$1').replace(/\/\$$/, '/*'));
    return url && { fw: 'tanstack', url };
  }
  // Remix / React Router v7 file routes: app/routes/*
  if ((m = /(?:^|\/)app\/routes\/(.+)\.(?:tsx|jsx|ts|js|mdx)$/.exec(p)) && !/react-native/.test(src)) {
    if (!/\bexport\s+default\b/.test(src)) return null; // resource routes (loader/action only) aren't screens
    let rel = m[1];
    if (/(^|\/)route$/.test(rel)) rel = rel.replace(/\/?route$/, '');            // folder routes: products.$id/route.tsx
    const segs = [];
    for (const part of rel.split('/')) for (const raw of part.split(/\.(?![^[]*\])/)) {
      let s = raw.replace(/\[(.*?)\]/g, '$1');
      if (s === '_index' || s === 'index') continue;
      if (s.startsWith('_')) continue;                   // pathless layout
      s = s.replace(/_$/, '');
      if (s === '$') s = '*';
      else if (/^\(\$(\w+)\)$/.test(s)) s = ':' + s.slice(2, -1) + '?';
      else if (/^\((.+)\)$/.test(s)) s = s.slice(1, -1);
      else if (s.startsWith('$')) s = ':' + s.slice(1);
      if (s) segs.push(s);
    }
    return { fw: 'remix', url: '/' + segs.join('/') };
  }
  // Expo Router: app/**/*.tsx that renders React Native
  if ((m = /(?:^|\/)app\/((?:[^/]+\/)*)([^/]+)\.(?:tsx|jsx|ts|js)$/.exec(p)) && /from\s+["'](react-native|expo-router)["']/.test(src)) {
    const base = m[2];
    if (base.startsWith('_') || base.startsWith('+') || /\+api$/.test(base) || /^(page|layout|route)$/.test(base)) return null;
    const url = segmentsToUrl([...m[1].split('/'), base], { indexName: 'index' });
    return url && { fw: 'expo', url };
  }
  // Pages routers: Next.js (pages/**.tsx), Nuxt (pages/**.vue), Astro (src/pages/**.astro)
  if ((m = /(?:^|\/)pages\/((?:[^/]+\/)*)([^/]+)\.(tsx|jsx|ts|js|vue|astro|mdx?)$/.exec(p))) {
    const [, dir, base, ext] = m;
    if (/^api\//.test(dir) || base.startsWith('_') || /\.(test|spec|stories)$/.test(base) || /(^|\/)(components?|_[^/]*)\//.test(dir)) return null;
    if ((ext === 'ts' || ext === 'js') && !/\bexport\s+default\b/.test(src)) return null;
    const fw = ext === 'vue' ? 'nuxt' : ext === 'astro' ? 'astro' : 'next-pages';
    const url = segmentsToUrl([...dir.split('/'), base], { indexName: 'index' });
    return url && { fw, url };
  }
  return null;
}

function normalizeUrl(u) {
  if (u == null) return null;
  let s = String(u).trim().split(/[?#]/)[0];
  s = s.replace(/\(([^()]*)\)/g, (m0, inner) => (/^[\w-]+$/.test(inner) ? m0 : '')); // vue param regexes :id(\\d+)
  s = ('/' + s).replace(/\/{2,}/g, '/');
  if (s.length > 1) s = s.replace(/\/$/, '');
  return s;
}
const joinUrl = (parent, child) => {
  if (child == null) return parent;
  if (child.startsWith('/')) return normalizeUrl(child);
  return normalizeUrl((parent || '') + '/' + child);
};
const isCatchAll = (u) => /^\/?(\*\*?|:pathMatch.*|:catchAll.*)$/.test(u);

const WRAPPER = /^(Route|Routes|Switch|Navigate|Redirect|Outlet|Suspense|React\.Suspense|Fragment|React\.Fragment|ErrorBoundary|\w*(Guard|Protected|Private|Require\w*|Auth\w*|Provider|Boundary|Layout|Wrapper|Shell))$/;
const pickComponent = (names) => names.filter((n) => !WRAPPER.test(n)).pop() || null;

/** local name -> import spec, including default imports and lazy(() => import('...')) bindings. */
function importBindings(code) {
  const map = new Map();
  for (const m of code.matchAll(/\bimport\s+(?:type\s+)?([A-Za-z_$][\w$]*)?\s*,?\s*(?:\{([^}]*)\})?\s*(?:\*\s+as\s+([A-Za-z_$][\w$]*))?\s*from\s*["']([^"']+)["']/g)) {
    if (m[1]) map.set(m[1], m[4]);
    if (m[3]) map.set(m[3], m[4]);
    for (const part of (m[2] || '').split(',')) {
      const [orig, alias] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (orig) map.set((alias || orig).trim(), m[4]);
    }
  }
  for (const m of code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:React\.)?(?:lazy|loadable|lazyWithRetry|defineAsyncComponent|dynamic)\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*import\(\s*["']([^"']+)["']/g)) map.set(m[1], m[2]);
  return map;
}

const ROUTER_SIGNAL = /createBrowserRouter|createHashRouter|createMemoryRouter|createRoutesFromElements|useRoutes|RouterProvider|createRouter|new\s+(?:Vue)?Router\s*\(|RouteRecordRaw|RouteObject|provideRouter|RouterModule|Routes\s*=\s*\[|\broutes\s*(?::\s*[\w<>[\]\s]+)?=\s*\[/;

function routerScreens(src, file) {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, pre) => pre + ' '.repeat(m.length - pre.length));
  const out = [];
  const bindings = importBindings(code);
  const nests = new Map(); // hint -> nesting depth; a layout and its index child share a URL, the child wins
  const make = (fw, url, comp, spec, nest = 0) => {
    if (!url || isCatchAll(url.replace(/^\//, ''))) return;
    spec = spec || (comp ? bindings.get(comp.split('.')[0]) : null) || null;
    if (!comp && !spec) return;
    const hint = { fw, url, ...(comp ? { comp } : {}), ...(spec ? { spec } : {}) };
    // the scanner resolves this file's imports after the hooks run; read them lazily when scan.json is written
    if (spec) Object.defineProperty(hint, 'files', { enumerable: true, get: () => (file.imports || []).find((i) => i.spec === spec && i.files?.length)?.files });
    nests.set(hint, nest);
    out.push(hint);
  };

  // React Router v7 config: app/routes.ts with route("path", "routes/file.tsx") / index("routes/home.tsx")
  if (/(^|\/)routes\.(ts|js|mjs)$/.test(file.path) && /@react-router\/dev\/routes|\b(route|index)\(\s*["']/.test(code)) {
    const calls = [];
    for (const m of code.matchAll(/\b(route|index|layout|prefix)\(\s*/g)) {
      const end = matchClose(code, m.index + m[0].length - 1, '(', ')');
      if (end < 0) continue;
      const args = [...code.slice(m.index, end).matchAll(/["'`]([^"'`]*)["'`]/g)].map((x) => x[1]);
      calls.push({ type: m[1], start: m.index, end, args });
    }
    for (const c of calls) {
      const parents = calls.filter((o) => o !== c && o.start < c.start && o.end > c.end && (o.type === 'route' || o.type === 'prefix')).sort((a, b) => a.start - b.start);
      let base = '';
      for (const o of parents) base = joinUrl(base, o.args[0]);
      const dir = P.dirname(file.path);
      if (c.type === 'route' && c.args.length >= 2) out.push({ fw: 'react-router', url: joinUrl(base, c.args[0]), target: P.normalize(P.join(dir, c.args[1])) });
      if (c.type === 'index' && c.args.length >= 1) out.push({ fw: 'react-router', url: base || '/', target: P.normalize(P.join(dir, c.args[0])) });
    }
    if (out.length) return out;
  }

  // JSX: <Route path="x" element={<X/>} />, nested routes join paths
  if (/<Route\b/.test(code)) {
    const stack = [];
    for (const m of code.matchAll(/<Route\b|<\/Route\s*>/g)) {
      if (m[0].startsWith('</')) {
        const top = stack.pop();
        if (top && top.pendingAt != null && !top.done) {
          const inner = code.slice(top.pendingAt, m.index);
          if (!/<Route\b/.test(inner)) make('react-router', top.url, pickComponent([...inner.matchAll(/<([A-Z][\w.]*)/g)].map((x) => x[1])), null, stack.length + 1);
        }
        continue;
      }
      const end = tagEnd(code, m.index + 6);
      if (end < 0) continue;
      const attrs = code.slice(m.index + 6, end);
      const selfClosing = /\/\s*$/.test(attrs);
      const parent = stack.length ? stack[stack.length - 1].url : '';
      const pathAttr = /\bpath\s*=\s*(?:["']([^"']*)["']|\{\s*["'`]([^"'`]*)["'`]\s*\})/.exec(attrs);
      const isIndex = /(^|\s)index(\s|=\{?true|\/|$)/.test(attrs);
      const url = pathAttr ? joinUrl(parent, pathAttr[1] ?? pathAttr[2]) : (parent || '/');
      const el = /\belement\s*=\s*\{/.exec(attrs);
      let comp = null;
      if (el) { const close = matchClose(attrs, el.index + el[0].length - 1, '{', '}'); comp = pickComponent([...attrs.slice(el.index, close > 0 ? close : undefined).matchAll(/<([A-Z][\w.]*)/g)].map((x) => x[1])); }
      comp = comp || /\b[Cc]omponent\s*=\s*\{\s*([A-Z][\w$.]*)\s*\}/.exec(attrs)?.[1] || null;
      if (!comp) { const r = /\brender\s*=\s*\{/.exec(attrs); if (r) comp = pickComponent([...attrs.slice(r.index).matchAll(/<([A-Z][\w.]*)/g)].map((x) => x[1])); }
      const lazySpec = /\blazy\s*=\s*\{[^}]*import\(\s*["']([^"']+)["']/.exec(attrs)?.[1];
      if ((pathAttr || isIndex) && (comp || lazySpec)) make('react-router', url, comp, lazySpec, stack.length);
      if (!selfClosing) stack.push({ url: pathAttr ? url : parent, pendingAt: (pathAttr || isIndex) && !comp && !lazySpec ? end + 1 : null, done: !!comp });
    }
  }

  // Route objects: { path: 'x', element: <X/> | component: X | component: () => import('./X.vue'), children: [...] }
  if (ROUTER_SIGNAL.test(code)) {
    const recs = [];
    for (const m of code.matchAll(/\bpath\s*:\s*(["'`])([^"'`]*)\1|\bindex\s*:\s*true\b/g)) {
      const open = enclosingBrace(code, m.index);
      if (open < 0) continue;
      const close = matchClose(code, open, '{', '}');
      if (close < 0) continue;
      if (recs.some((r) => r.open === open)) { const r = recs.find((x) => x.open === open); if (m[2] != null) r.path = m[2]; continue; }
      recs.push({ open, close, path: m[2] ?? null, index: m[2] == null });
    }
    for (const r of recs) {
      const own = maskNested(code.slice(r.open + 1, r.close));
      if (/\bredirect(To)?\s*:/.test(own) && !/\b(element|component|Component)\s*:/.test(own)) continue;
      const parents = recs.filter((o) => o !== r && o.open < r.open && o.close > r.close).sort((a, b) => a.open - b.open);
      let base = '';
      for (const o of parents) if (o.path != null) base = joinUrl(base, o.path);
      const url = r.path != null ? joinUrl(base, r.path) : (base || '/');
      const raw = code.slice(r.open + 1, r.close);
      let comp = null, spec = null;
      const el = /\belement\s*:\s*</.exec(own);
      if (el) comp = pickComponent([...own.slice(el.index).split(/,\s*\n/)[0].matchAll(/<([A-Z][\w.]*)/g)].map((x) => x[1]));
      comp = comp || /\b(?:component|Component)\s*:\s*([A-Z][\w$.]*)/.exec(own)?.[1] || null;
      if (!comp) spec = /\b(?:component|Component|lazy|loadComponent|element)\s*:[^,\n]*?import\(\s*["']([^"']+)["']/.exec(raw.replace(/\bchildren\s*:\s*\[[\s\S]*$/, ''))?.[1] || null;
      if (comp || spec) make(/\.vue["']|createRouter|VueRouter|RouteRecordRaw/.test(code) ? 'vue-router' : /RouterModule|provideRouter|loadComponent/.test(code) ? 'angular' : 'react-router', url, comp, spec, parents.length);
    }
  }
  const best = new Map();
  for (const h of out) if (!best.has(h.url) || (nests.get(h) || 0) > (nests.get(best.get(h.url)) || 0)) best.set(h.url, h);
  return out.filter((h) => best.get(h.url) === h);
}

/** Index of the '>' that closes a JSX opening tag starting at i (skips braces and strings). */
function tagEnd(s, i) {
  let depth = 0, q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return i;
  }
  return -1;
}
function matchClose(s, i, open, close) {
  let depth = 0, q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}
function enclosingBrace(s, i) {
  let depth = 0;
  for (let j = i - 1; j >= 0; j--) {
    const c = s[j];
    if (c === '}' || c === ']') depth++;
    else if (c === '{' || c === '[') { if (depth === 0) return c === '{' ? j : -1; depth--; }
  }
  return -1;
}
/** Blank out nested {...} and [...] so only an object's own keys remain (children arrays disappear). */
function maskNested(s) {
  let out = '', depth = 0;
  for (const c of s) {
    if (c === '{' || c === '[') { depth++; out += depth === 1 ? c : ' '; continue; }
    if (c === '}' || c === ']') { out += depth === 1 ? c : ' '; depth = Math.max(0, depth - 1); continue; }
    out += depth ? (c === '\n' ? '\n' : ' ') : c;
  }
  return out;
}

// ======================= build side =======================

const UI_KIT = /(^|\/)(components\/(ui|common|shared|primitives|base|icons?|layout)|ui|primitives)\//i;
const UTILITY = /(^|\/)(utils?|helpers?|constants?|types?|typings|styles?|theme|icons?|config|i18n|locales?)(\/|\.[a-z]+$)|\.d\.ts$|(^|\/)(index|globals?)\.(css|scss)$/i;
const TESTY = /(^|\/)(tests?|__tests__|spec|e2e|cypress|playwright|__mocks__|fixtures|stories)(\/|$)|\.(test|spec|stories)\.[a-z]+$|(^|\/)test_[^/]+\.py$|_test\.(py|go)$/i;
const DATA_PATH = /(^|\/)(models?|schemas?|entities|entity|db|database|repositor(y|ies)|dao|tables?|prisma|orm)(\/|\.[a-z]+$|_)/i;
const DB_LABEL = /postgres|mysql|maria|sqlite|mongo|redis|\bdatabase\b(?!s)|\bdb\b|supabase|firebase|firestore|dynamo|prisma|planetscale|cockroach|\bsql\b/i;
const GET_VERBS = /^(list|get|fetch|load|search|find|look|lookup|check|export|download|preview|calculate|compute|count|show|view|read|poll|ping|generate|validate|verify|resolve|suggest|autocomplete)s?$/;
const DB_PKG =/sqlalchemy|psycopg|\bpg\b|postgres|mysql|mongo|prisma|redis|sqlite|knex|typeorm|sequelize|drizzle|supabase|firebase|dynamo|gorm|diesel|activerecord/i;
const AUTHY = /(^|\/)(auth|middlewares?|decorators?|permissions?|security|extensions)(\/|\.[a-z]+$|_)/i;
const VERBS = new Set('place book reserve claim view read write post put rename renew rotate revoke grant request notify email share attach detach link unlink accept reject decline finalize lock unlock release hold quote estimate count tag untag filter sort report track subscribe unsubscribe join leave follow rate review comment reply flag block activate deactivate suspend resume pause poll ping backfill seed migrate map match swap replace convert recalculate rerun reprocess regenerate recount reorder restock return exchange weigh label fulfill dispatch deliver build deploy upsert insert fill clear flush purge expire invalidate trigger handle ack list get fetch load create add update edit save delete remove search find look check send start stop run mark apply approve cancel set reset preview calculate compute generate refresh submit record adjust issue redeem void close open print scan sync import export upload download move transfer assign archive restore publish unpublish toggle enable disable confirm complete process verify validate log sign register login logout invite connect disconnect wake retry resend bulk merge split duplicate clone schedule queue push pull test rebuild reprice receive pick pack ship refund charge pay collect capture authorize'.split(' '));

export function buildScreens({ graph, scan, root }) {
  const files = new Map(graph.files.map((f) => [f.p, f]));
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  const routes = graph.routes || [];
  const topOf = (id) => { let n = nodes.get(id), guard = 0; while (n?.parent && guard++ < 50) n = nodes.get(n.parent); return n?.id || id; };
  const kindsOf = (id) => { const ks = new Set(); let n = nodes.get(id), guard = 0; while (n && guard++ < 50) { ks.add(n.kind); n = nodes.get(n.parent); } return ks; };
  const appOf = (p) => topOf(files.get(p)?.n);
  const isTest = (p) => TESTY.test(p) || kindsOf(files.get(p)?.n).has('test');
  const isData = (p) => kindsOf(files.get(p)?.n).has('data') || DATA_PATH.test(p);

  // ---------- collect screen hints ----------
  const scanFiles = scan.files || [];
  const pathsByStem = new Map();
  const stemOf = (p) => p.replace(/\.(d\.)?[a-z0-9]+$/i, '').replace(/\/index$/, '');
  for (const f of graph.files) pathsByStem.set(stemOf(f.p), f.p);
  // which folders use Next.js (to tell a Next pages/ router from a React app's pages/ folder of components)
  const nextFiles = new Set((scan.extEdges || []).filter((e) => e.pkg === 'npm:next').map((e) => e.from));
  const usesNext = (p) => { const base = p.replace(/(^|\/)(src\/)?pages\/.*$/, '$1'); for (const f of nextFiles) if (f.startsWith(base)) return true; return false; };
  const edgesFrom = new Map();
  for (const e of scan.edges || []) { if (!edgesFrom.has(e.from)) edgesFrom.set(e.from, []); edgesFrom.get(e.from).push(e.to); }
  const resolveHint = (from, h) => {
    if (h.target) {
      if (files.has(h.target)) return h.target;
      return pathsByStem.get(stemOf(h.target)) || null;
    }
    const resolved = (h.files || []).filter((x) => files.has(x) && !/\.d\.ts$/.test(x));
    if (resolved.length) return resolved[0];
    if (h.spec) {
      const tail = h.spec.replace(/^(\.\.?\/)+|^[@~#]\//, '').replace(/\.(tsx|jsx|ts|js|vue|svelte)$/, '');
      const hit = (edgesFrom.get(from) || []).find((to) => stemOf(to).endsWith(tail));
      if (hit && files.has(hit)) return hit;
      return null;
    }
    return h.comp ? from : null; // component defined in the router file itself
  };
  const routed = []; // router entries: { url, file, fw }
  const pageHints = [];
  for (const f of scanFiles) for (const h of f.screens || []) {
    if (!h || typeof h.url !== 'string') continue;
    if (h.comp || h.spec || h.target) { const file = resolveHint(f.path, h); if (file) routed.push({ url: h.url, file, fw: h.fw }); }
    else pageHints.push({ url: h.url, file: f.path, fw: h.fw });
  }
  const routedFiles = new Set(routed.map((r) => r.file));
  const candidates = [...routed];
  for (const h of pageHints) {
    if (h.fw === 'next-pages' && (routedFiles.has(h.file) || !usesNext(h.file))) continue;
    if (h.fw === 'nuxt' && routedFiles.has(h.file)) continue;
    candidates.push(h);
  }

  // ---------- link indexes ----------
  const out = new Map(), indeg = new Map();
  for (const l of graph.links || []) {
    if (!out.has(l.a)) out.set(l.a, []);
    out.get(l.a).push(l);
    if (l.k === 'import' && l.a.startsWith('f:') && l.b.startsWith('f:')) indeg.set(l.b, (indeg.get(l.b) || 0) + 1);
  }
  const appSize = new Map();
  for (const f of graph.files) { const a = topOf(f.n); appSize.set(a, (appSize.get(a) || 0) + 1); }
  const noiseFront = (p) => UI_KIT.test(p) || UTILITY.test(p) || (indeg.get('f:' + p) || 0) >= Math.max(6, Math.round((appSize.get(appOf(p)) || 0) * 0.05));
  const isDb = (n) => DB_PKG.test((n.packages || []).join(' ')) || DB_LABEL.test(n.label);
  const noiseBack = (p) => !isData(p) && (UTILITY.test(p) || AUTHY.test(p) || (indeg.get('f:' + p) || 0) >= Math.max(10, Math.round((appSize.get(appOf(p)) || 0) * 0.08)));

  // ---------- source regions (to follow only what a screen / an endpoint really uses) ----------
  const srcCache = new Map();
  const lines = (p) => {
    if (srcCache.has(p)) return srcCache.get(p);
    let v = null;
    try { if (root) v = fs.readFileSync(path.join(root, p), 'utf8').split('\n'); } catch {}
    srcCache.set(p, v);
    return v;
  };
  const symRanges = (p) => {
    const s = (files.get(p)?.s || []).map((x) => ({ name: x[0], line: x[2] })).sort((a, b) => a.line - b.line);
    return s.map((x, i) => ({ ...x, end: (s[i + 1]?.line || 1e9) - 1 }));
  };
  /** Line ranges of a file covered by a focus (null = the whole file). */
  const rangesFor = (p, focus) => {
    if (!focus || !focus.size) return null;
    const rs = symRanges(p).filter((x) => focus.has(x.name)).map((x) => [x.line, x.end]);
    return rs.length ? rs : null;
  };
  const textOf = (p, ranges) => {
    const ls = lines(p); if (!ls) return null;
    if (!ranges) return ls.join('\n');
    return ranges.map(([a, b]) => ls.slice(a - 1, Math.min(b, ls.length)).join('\n')).join('\n');
  };
  const inRanges = (line, ranges) => !ranges || ranges.some(([a, b]) => line >= a && line <= b);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stemName = (p) => { const b = P.basename(p).replace(/\.[^.]+$/, ''); return /^(index|__init__|route|page)$/.test(b) ? P.basename(P.dirname(p)) : b; };
  /** Which of a file's outgoing import links are used inside `text`, and what names/members they're used for. */
  const usedImports = (p, text, filter) => {
    const res = [];
    for (const l of out.get('f:' + p) || []) {
      if (l.k !== 'import' || !l.b.startsWith('f:')) continue;
      const to = l.b.slice(2);
      if (filter && !filter(to)) continue;
      if (text == null) { res.push({ to, focus: namedFocus(l.names) }); continue; }
      const names = (l.names || []).filter((n) => n !== 'default' && n !== '*');
      if (names.length) {
        const hit = names.filter((n) => new RegExp(`(^|[^\\w$.])${esc(n)}\\b`).test(text));
        if (!hit.length) continue;
        const members = new Set(), pos = new Map(); // pos: where each member is first used (earlier ranks first)
        for (const n of hit) for (const m of text.matchAll(new RegExp(`\\b${esc(n)}\\.(\\w+)`, 'g'))) {
          const k = `${n}.${m[1]}`;
          members.add(k);
          if (!pos.has(k)) pos.set(k, m.index / text.length);
        }
        res.push({ to, focus: new Set(hit), members: members.size ? members : null, pos });
      } else {
        // module import (python `from pkg import module [as alias]`, `import * as alias`): the module's
        // name or alias in the text means it's used, and what's called on it narrows the focus
        const stem = stemName(to);
        const whole = (lines(p) || []).join('\n');
        const aliases = [stem, ...[...whole.matchAll(new RegExp(`\\b${esc(stem)}["']?\\s+as\\s+([A-Za-z_$][\\w$]*)`, 'g'))].map((m) => m[1]),
          ...[...whole.matchAll(new RegExp(`\\*\\s+as\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+["'][^"']*${esc(stem)}["']`, 'g'))].map((m) => m[1])];
        const used = aliases.some((a) => new RegExp(`\\b${esc(a)}\\b`, a === stem ? 'i' : '').test(text));
        if (!used && !(l.names || []).includes('default')) continue;
        const members = new Set();
        for (const a of aliases) for (const m of text.matchAll(new RegExp(`\\b${esc(a)}\\.(\\w+)`, 'g'))) members.add(m[1]);
        res.push({ to, focus: members.size ? members : null });
      }
    }
    return res;
  };
  const namedFocus = (names) => { const n = (names || []).filter((x) => x !== 'default' && x !== '*'); return n.length ? new Set(n) : null; };
  /** The object member a call line sits in (`productAPI.getAll`), found by walking up to a shallower `key:` line. */
  const memberAt = (p, line, symLine, symName) => {
    const ls = lines(p); if (!ls) return null;
    const ind = (s) => s.match(/^\s*/)[0].length;
    const KEY = /^\s*(?:async\s+)?(?:get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*(?::|\(|=\s*(?:async\s*)?\()/;
    const KEYWORDS = /^(if|for|while|switch|catch|return|function|await|typeof|new|else|do|try|with|const|let|var|throw|yield)$/;
    const keyOf = (s) => { const m = KEY.exec(s); return m && !KEYWORDS.test(m[1]) ? m[1] : null; };
    const own = line > symLine && keyOf(ls[line - 1] || '');
    if (own) return `${symName}.${own}`; // one-line member: `list: () => api.get('/x')`
    // the outermost `key:` / `method(` line above the call, below the symbol's own line
    let min = ind(ls[line - 1] || ''), found = null;
    for (let i = line - 1; i > symLine; i--) {
      const s = ls[i - 1] || ''; if (!s.trim()) continue;
      const d = ind(s);
      if (d < min) { const k = keyOf(s); if (k) { found = k; min = d; } }
    }
    return found && `${symName}.${found}`;
  };
  const symbolAt = (p, line) => { let best = null; for (const r of symRanges(p)) if (r.line <= line) best = r; return best; };

  // ---------- route notes ----------
  const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const routeNote = (r) => {
    const name = String(r.name || '').trim();
    if (!name) return 'Asks the server for something';
    const first = name.split(/\s+/)[0].toLowerCase();
    const keepCase = /^[A-Z0-9]{2,}/.test(name.split(/\s+/)[0]);
    const body = keepCase ? name : lc(name);
    // "Place order" → "Asks the server to place order"; "Product list" → "… for the product list"
    const verb = r.m === 'GET' ? GET_VERBS.test(first) : VERBS.has(first) || VERBS.has(first.replace(/e?s$/, '')) || (!/s$/.test(first) && name.split(/\s+/).length > 1);
    return verb ? `Asks the server to ${body}` : `Asks the server for ${/^(the|a|an)\b/i.test(body) ? body : 'the ' + body}`;
  };
  const humanUrl = (url) => {
    const segs = url.split('/').filter(Boolean);
    if (!segs.length) return 'Home';
    const last = [...segs].reverse().find((s) => !s.startsWith(':') && s !== '*') || 'Page';
    const word = last.replace(/[-_]+/g, ' ');
    return word.charAt(0).toUpperCase() + word.slice(1) + (segs[segs.length - 1].startsWith(':') ? ' (one item)' : '');
  };
  const frontNote = (p, depth, parentName) => {
    const b = P.basename(p);
    if (/^use[A-Z]/.test(b) || /(^|\/)hooks?\//.test(p)) return 'Logic this screen uses';
    if (/(^|\/)(contexts?|stores?|state|atoms)\//i.test(p) || /(Context|Provider|Store|[-_.]store|slice|atoms?)\.[jt]sx?$/.test(b)) return 'Shared state this screen uses';
    if (/^[a-z]/.test(b) && /\.(ts|js|mjs)$/.test(b)) {
      return (out.get('f:' + p) || []).some((l) => l.k === 'http') || /api|client|service|quer(y|ies)|requests?/i.test(b) ? 'Talks to the server for this screen' : 'Helper code this screen uses';
    }
    return depth <= 1 ? 'A component on this screen' : `Part of ${parentName}`;
  };

  // ---------- behind: walk from the screen's file ----------
  function behind(page, app, url) {
    const appKind = (id) => nodes.get(id)?.kind;
    const frontOk = (p) => files.has(p) && !isTest(p) && (appOf(p) === app || ['ui', 'library', 'feature'].includes(appKind(appOf(p))));
    // 1) frontend walk with focus (which exports of each file are actually used)
    const seen = new Map(); // path -> { depth, focus:Set|null(all), members:Set|null, parent }
    const queue = [{ p: page, depth: 0, focus: null, members: null, parent: null }];
    // a file reached twice is used for the union of both reasons; null focus/members means "all of it"
    const union = (a, b) => (a && b ? new Set([...a, ...b]) : null);
    const merge = (cur, nx) => {
      const focus = union(cur.focus, nx.focus), members = union(cur.members, nx.members);
      const changed = (focus?.size ?? -1) !== (cur.focus?.size ?? -1) || (members?.size ?? -1) !== (cur.members?.size ?? -1) || nx.depth < cur.depth;
      return changed ? { ...cur, focus, members, depth: Math.min(cur.depth, nx.depth) } : null;
    };
    let guard = 0;
    while (queue.length && guard++ < 400) {
      const it = queue.shift();
      const prev = seen.get(it.p);
      // how close to the screen each member is used (the page's own calls rank above a child's)
      const md = prev?.md || new Map();
      for (const x of it.members || []) md.set(x, Math.min(md.get(x) ?? 9, it.depth - 1 + (it.pos?.get(x) ?? 0.99) * 0.5));
      const m = prev ? merge(prev, it) : it;
      if (prev) prev.md = md;
      if (m) m.md = md;
      if (!m) continue;
      seen.set(it.p, m);
      const noisy = it.p !== page && noiseFront(it.p);
      if (noisy || m.depth >= 3) continue; // shared building blocks: we only read their calls
      const text = textOf(it.p, rangesFor(it.p, m.focus));
      for (const u of usedImports(it.p, text, frontOk)) {
        if (u.to === page) continue;
        queue.push({ p: u.to, depth: m.depth + 1, focus: u.focus, members: u.members || null, pos: u.pos, parent: it.p });
      }
    }
    // 2) requests: HTTP calls from the visited files, inside the parts this screen uses
    const reqs = new Map(); // routeIndex -> { order, from }
    let order = 0;
    const byDepth = [...seen.entries()].sort((a, b) => a[1].depth - b[1].depth);
    for (const [p, v] of byDepth) {
      const ranges = rangesFor(p, v.focus);
      for (const l of out.get('f:' + p) || []) {
        if (l.k !== 'http' || !l.calls) continue;
        for (const [ri, line] of l.calls) {
          if (ri == null || !routes[ri] || !inRanges(line, ranges)) continue;
          let rank = v.depth + 0.5;
          const sym = v.focus ? symbolAt(p, line) : null;
          const mem = sym && memberAt(p, line, sym.line, sym.name);
          if (mem && v.members && !v.members.has(mem) && [...v.members].some((x) => x.startsWith(sym.name + '.'))) continue;
          if (mem && v.md?.has(mem)) rank = v.md.get(mem);
          const prev = reqs.get(ri);
          if (!prev) reqs.set(ri, { order: order++, from: p, rank });
          else prev.rank = Math.min(prev.rank, rank);
        }
      }
    }
    const reqList = [...reqs.entries()].sort((a, b) => a[1].rank - b[1].rank || a[1].order - b[1].order).map(([ri]) => ri);

    // ---------- rank the screen's own parts ----------
    const urlWords = new Set(url.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3));
    const frontData = [...seen.keys()].filter((p) => p !== page && kindsOf(files.get(p)?.n).has('data'));
    const comps = [...seen.entries()].filter(([p]) => p !== page && !noiseFront(p) && !frontData.includes(p)).map(([p, v]) => {
      const f = files.get(p);
      const related = p.toLowerCase().split(/[^a-z0-9]+/).some((w) => w.length > 3 && urlWords.has(w));
      const calls = (out.get('f:' + p) || []).some((l) => l.k === 'http');
      const score = (v.depth === 1 ? 3 : v.depth === 2 ? 1.5 : 0) + Math.min(3, Math.log10((f?.loc || 1) + 1)) + (related ? 1.5 : 0) + (calls ? 1 : 0) - Math.min(2, Math.max(0, (indeg.get('f:' + p) || 0) - 2) / 4);
      return { p, v, score };
    }).sort((a, b) => b.score - a.score);
    const BUDGET = 15; // plus the screen itself
    const nComp = Math.min(4, comps.length);
    const nReq = Math.min(reqList.length, 4 + Math.min(2, 4 - nComp));
    const shownReqs = reqList.slice(0, nReq);

    // 3) server side: the handler of each shown request, what its body uses, a few levels down
    const server = new Map(); // path -> { score, routes:[ri], role:'handler'|'logic', depth }
    const dataHits = new Map(); // path -> Set(names)
    const extHits = new Map(); // nodeId -> { count, via }
    const addExt = (id, via) => { const n = nodes.get(id); if (!n || n.kind !== 'external') return; const e = extHits.get(id) || { count: 0, via }; e.count++; extHits.set(id, e); };
    const extsOf = (p) => { for (const l of out.get('f:' + p) || []) if (l.b.startsWith('n:')) addExt(l.b.slice(2), p); };
    const backOk = (p) => files.has(p) && !isTest(p);
    for (const ri of shownReqs) {
      const r = routes[ri];
      const h = r.f;
      if (!files.has(h)) continue;
      const hs = server.get(h) || { score: 0, routes: [], role: 'handler', depth: 0 };
      hs.score += 3; hs.routes.push(ri); server.set(h, hs);
      const nextRoute = routes.filter((x) => x.f === h && x.l > r.l).reduce((m, x) => Math.min(m, x.l), Infinity);
      const body = textOf(h, [[r.l, Math.min(nextRoute - 1, r.l + 400)]]);
      extsOf(h);
      const q = usedImports(h, body, backOk).map((u) => ({ ...u, depth: 1, via: ri }));
      const visited = new Set([h]);
      while (q.length) {
        const u = q.shift();
        if (visited.has(u.to)) continue;
        visited.add(u.to);
        if (isData(u.to)) {
          const set = dataHits.get(u.to) || new Set();
          for (const n of u.focus || []) set.add(n);
          dataHits.set(u.to, set);
          extsOf(u.to);
          continue;
        }
        if (noiseBack(u.to)) continue;
        const s = server.get(u.to) || { score: 0, routes: [], role: 'logic', depth: u.depth };
        s.score += 2 / u.depth; if (!s.routes.includes(u.via)) s.routes.push(u.via); s.depth = Math.min(s.depth, u.depth);
        server.set(u.to, s);
        extsOf(u.to);
        if (u.depth >= 3) continue;
        const text = textOf(u.to, rangesFor(u.to, u.focus));
        for (const v of usedImports(u.to, text, backOk)) q.push({ ...v, depth: u.depth + 1, via: u.via });
      }
    }
    // outside services the screen itself talks to (payment SDKs, hosted APIs), and data it reads
    // directly (full-stack frameworks: a page or server action that queries the database)
    for (const p of seen.keys()) extsOf(p);
    for (const p of frontData) if (!dataHits.has(p)) dataHits.set(p, new Set());

    const servers = [...server.entries()].sort((a, b) => (a[1].role === 'handler' ? 0 : 1) - (b[1].role === 'handler' ? 0 : 1) || b[1].score - a[1].score);
    const datas = [...dataHits.entries()].sort((a, b) => b[1].size - a[1].size);
    const exts = [...extHits.entries()].sort((a, b) => b[1].count - a[1].count);

    // ---------- cap: screen → components → requests → server → data → outside ----------
    const caps = { comp: nComp, server: Math.min(3, servers.length), data: Math.min(2, datas.length), ext: Math.min(2, exts.length) };
    let spare = BUDGET - nReq - caps.comp - caps.server - caps.data - caps.ext;
    const most = { comp: 6, server: 5, ext: 3, data: 3 };
    const avail = { comp: comps.length, server: servers.length, ext: exts.length, data: datas.length };
    for (const k of ['comp', 'server', 'ext', 'data']) { const extra = Math.max(0, Math.min(spare, Math.min(most[k], avail[k]) - caps[k])); caps[k] += extra; spare -= extra; }

    const name = (p) => files.get(p)?.name || stemName(p);
    const items = [{ id: 'f:' + page, note: 'The screen itself', kind: 'screen' }];
    for (const c of comps.slice(0, caps.comp)) items.push({ id: 'f:' + c.p, note: frontNote(c.p, c.v.depth, name(c.v.parent || page)), kind: 'part' });
    for (const ri of shownReqs) items.push({ id: 'r:' + ri, note: routeNote(routes[ri]), kind: 'request' });
    for (const [p, s] of servers.slice(0, caps.server)) {
      const rn = s.routes.map((ri) => routes[ri]?.name).filter(Boolean);
      const first = rn[0] ? `“${rn[0]}”` : 'these requests';
      const more = rn.length > 1 ? ` and ${rn.length - 1} more` : '';
      items.push({ id: 'f:' + p, note: s.role === 'handler' ? `Server code that handles ${first}${more}` : `Does the work behind ${first}${more}`, kind: 'server' });
    }
    for (const [p, names] of datas.slice(0, caps.data)) {
      const ns = [...names].filter((n) => /^[A-Z][a-z]/.test(n)).sort((a, b) => a.length - b.length).slice(0, 2).map((n) => n.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
      items.push({ id: 'f:' + p, note: ns.length ? `Keeps the ${ns.join(' and ')} records` : 'Saved data this reads or changes', kind: 'data' });
    }
    for (const [id, e] of exts.slice(0, caps.ext)) {
      const n = nodes.get(id);
      items.push({ id: 'n:' + id, note: isDb(n) ? 'Where the data is kept' : `Outside service, used by ${name(e.via)}`, kind: 'outside' });
    }
    return items;
  }

  // ---------- assemble ----------
  const screens = new Map();
  for (const c of candidates) {
    if (!files.has(c.file) || isTest(c.file)) continue;
    const app = appOf(c.file);
    const url = normalizeUrl(c.url) || '/';
    const id = `screen:${app}:${url}`;
    if (screens.has(id)) continue;
    const f = files.get(c.file);
    screens.set(id, { id, url, file: c.file, app, fw: c.fw, name: f.auto && /\b(page|index|route)\b/i.test(f.name) ? humanUrl(url) : f.name || humanUrl(url), description: f.d || '' });
  }
  const list = [...screens.values()].sort((a, b) => a.app.localeCompare(b.app) || a.url.localeCompare(b.url));
  for (const s of list) {
    try { s.behind = behind(s.file, s.app, s.url); } catch (e) { s.behind = [{ id: 'f:' + s.file, note: 'The screen itself', kind: 'screen' }]; }
  }
  return list;
}

`


# references/schema.md

`markdown
# architecture.json schema

`floorplan/architecture.json` describes the structure: subsystems, modules, external services, flows. Names and descriptions for individual files and routes go in `floorplan/descriptions/*.json` instead (see [writing-descriptions.md](writing-descriptions.md)). They're kept separate so parallel agents can write them without conflicts. `build.mjs` checks both against the scan and reports problems by field.

Contents: [Top level](#top-level) · [nodes](#nodes) · [Assignment rules](#how-files-get-assigned) · [edges](#edges) · [annotations](#annotations) · [flows](#flows) · [Recent work](#recent-work) · [Full example](#full-example)

## Top level

| field | type | required | meaning |
|---|---|---|---|
| `$schema` | `"floorplan/architecture@1"` | no | marker |
| `project` | object | yes | `name` (string, required), `summary` (1–3 sentences), `entrypoints` (file paths) |
| `nodes` | array | yes | subsystems and modules. See below |
| `edges` | array | no | connections the scanner can't see |
| `annotations` | array | no | notes pinned to specific files |
| `flows` | array | no | guided walkthroughs through the board |
| `tour` | array | no | the "Start here" tour shown on first open: 3–8 stops `{ "node": "<node id or file path>", "title": "…", "note": "…" }`, in plain language, in the order a newcomer should see them. The first flow is appended automatically |
| `audience` | `"everyone"` \| `"developers"` | no | who names and descriptions are written for. Default `"everyone"`: plain language a non-technical owner understands (what it does for the business, in everyday words). `"developers"`: technical style for engineers |
| `include` | string[] | no | file categories to map. Default `["code"]`. Others: `config`, `docs` |
| `ignore` | string[] | no | globs for files to leave off the board entirely (generated code, vendored libs, fixtures) |

## nodes

Each node is a chip on the board. Hierarchy comes from `parent`. A node with no parent sits on the top-level board.

| field | type | meaning |
|---|---|---|
| `id` | string | unique; letters, digits, `_ - .`. Convention: dotted by parent (`api.orders`) |
| `label` | string | short display name ("Orders API") |
| `kind` | enum | `ui` `service` `worker` `library` `feature` `data` `config` `test` `script` `infra` `external` |
| `parent` | string | id of the enclosing node |
| `summary` | string | one sentence: what it's responsible for |
| `details` | string | optional longer notes; blank lines separate paragraphs |
| `paths` | string[] | globs claiming files (see below) |
| `exclude` | string[] | globs to carve files back out of `paths`. **Inherited by all descendants**, e.g. `"exclude": ["**/*.test.tsx"]` on a frontend node keeps co-located tests out of every child, so a separate Tests node can claim them |
| `packages` | string[] | **external nodes:** package names this node stands for, e.g. `"stripe"`, `"npm:@stripe/*"`, `"pypi:sqlalchemy"`. Imports of them become edges to this node |
| `hosts` | string[] | **external nodes:** hostnames called from code, e.g. `"api.stripe.com"`, `"*.squareup.com"`. Calls become `http` edges |
| `tags` | string[] | free-form, shown in the panel |

Kinds, briefly:
- `ui`: frontends and apps
- `service`: a deployable server
- `worker`: background jobs and queues
- `library`: shared code
- `feature`: a vertical slice inside a service or UI
- `data`: models, migrations, the DB layer
- `config`
- `test`
- `script`: one-off and ops scripts
- `infra`: deploy, CI, IaC
- `external`: databases and third-party APIs. These own no files.

### Glob syntax
- `**` matches any number of directories, `*` stays within one path segment, `?` matches one character, `{a,b}` is alternation.
- A whole folder name in brackets, like `[id]`, `[...slug]` or `[[...slug]]` (Next.js, SvelteKit), matches that folder literally: `app/orders/[id]/**`. Elsewhere, `[abc]` matches one of those characters.
- A pattern with no wildcard also matches as a directory: `backend/app` equals `backend/app/**`.
- Paths are relative to the codebase root. In a multi-repo root they start with the repo folder.

### How files get assigned
Every included file goes to exactly one node:
1. Collect the nodes whose `paths` match the file and whose `exclude` doesn't.
2. The **deepest** node wins, so a child beats its parent. You can give a parent a broad glob (`web/**`) and children narrower ones; files no child claims stay on the parent.
3. Between nodes at the same depth, the glob with the longer literal prefix wins. Real ties are warned about.
4. Files no node claims go to an automatic **Unassigned** chip. Keep it under ~10%.

In the viewer, a node with more than ~24 files of its own groups them into folder chips automatically, so you don't need a node for every directory. Make a node when it means something.

## edges

Only add what static analysis can't find. Imports (`import`) and HTTP calls matched to routes (`http`) are already in the scan.

| field | type | meaning |
|---|---|---|
| `from`, `to` | string | node id **or** file path |
| `kind` | enum | `import` `call` `http` `rpc` `event` `queue` `data` `config` |
| `label` | string | short, e.g. `"POST /orders"`, `"order.paid"`, `"reads/writes"` |
| `description` | string | optional sentence shown when the trace is clicked |

Good candidates:
- service → database (`data`)
- publisher → queue → consumer (`queue` / `event`)
- webhooks coming in from third parties (`http`, from the external node to the handler)
- cron/scheduler → job (`call`)
- Firebase background functions (schedules, Firestore/Storage/Pub/Sub triggers, from the scan's FIREBASE FUNCTIONS list) → a `worker` node; link the collection or topic that triggers them (`event`)
- calls through env-configured base URLs that the matcher missed (`http`)

## annotations

`{ "path": "<file>", "note": "…", "tags": ["hotspot"] }` pins a note to a file. The file's chip gets an accent outline. Use these sparingly, for god-files, tricky invariants, or deprecated code still in use.

## flows

```json
{ "id": "checkout", "title": "Checkout", "description": "optional",
  "steps": [ { "node": "web.cart", "note": "User clicks Pay" }, { "node": "api.orders", "note": "Creates the order" } ] }
```
- Each step's `node` is a node id or a file path. There must be at least 2 steps.
- The viewer moves to the board where each pair of consecutive steps is visible and animates a signal between them.
- Write the notes as a narration a new engineer would want.

## recent work

`floorplan/recent-work.json` is a separate file, rewritten on every make and update. It holds what was just worked on, framed against what the user asked for. The viewer gives those cards a green "Changed"/"New" tag, shows "N changed" on the parts containing them, adds each `note` to the card's hover, and lists the tasks under a **Recent work** button and in the overview panel.

```json
{
  "updatedAt": "2026-10-27T10:30:00Z",
  "tasks": [
    {
      "title": "Refunds from the order page",
      "request": "Let staff refund an order straight from its order page",
      "summary": "Staff can now refund all or part of an order from its page. The money goes back to the customer's card through Stripe, and they get an email. Refunds over $500 need a manager.",
      "items": [
        { "ref": "shop-api/app/services/refunds.py", "change": "new", "note": "New: works out how much to refund, sends it back through Stripe and records it on the order. This is the heart of what was asked." },
        { "ref": "POST /api/orders/<int:order_id>/refund", "change": "new", "note": "The request the Refund button sends; it checks the manager limit before anything is refunded." }
      ]
    }
  ]
}
```

| field | meaning |
|---|---|
| `tasks[].title` | 2–5 words, shown on hover and as the board title |
| `tasks[].request` | what the user asked for, in their words (shortened). Shown as "You asked: …" |
| `tasks[].summary` | 1–2 sentences: what was done toward it, and where it stands. Mention deletions here; deleted files aren't on the map |
| `items[].ref` | a file path, a node id, or `"METHOD /path"` exactly as on the map. Refs that aren't on the map are left out with a warning |
| `items[].change` | `"new"` or `"changed"` (default) |
| `items[].note` | 1–2 plain sentences: what changed on this card, and how it serves the request |

`{ "tasks": [] }` clears all highlights.

## Full example

A frontend repo and a backend repo side by side:

```json
{
  "$schema": "floorplan/architecture@1",
  "project": {
    "name": "Acme Shop",
    "summary": "Next.js storefront talking to a Flask API over REST; Postgres for storage; Stripe for payments.",
    "entrypoints": ["shop-api/app.py", "shop-web/src/app/page.tsx"]
  },
  "ignore": ["shop-api/migrations/versions/**"],
  "nodes": [
    { "id": "web", "label": "Storefront", "kind": "ui", "summary": "Next.js app router UI.", "paths": ["shop-web/src"] },
    { "id": "web.pages", "parent": "web", "label": "Pages", "kind": "feature", "paths": ["shop-web/src/app"] },
    { "id": "web.api", "parent": "web", "label": "API client", "kind": "library", "summary": "Typed fetch wrapper for every backend call.", "paths": ["shop-web/src/lib/api*"] },
    { "id": "api", "label": "Shop API", "kind": "service", "summary": "Flask REST API.", "paths": ["shop-api/app.py", "shop-api/app"] },
    { "id": "api.routes", "parent": "api", "label": "Routes", "kind": "feature", "paths": ["shop-api/app/routes"] },
    { "id": "api.models", "parent": "api", "label": "Models", "kind": "data", "paths": ["shop-api/app/models"] },
    { "id": "tests", "label": "Tests", "kind": "test", "paths": ["shop-api/tests", "shop-web/**/*.test.{ts,tsx}"] },
    { "id": "pg", "label": "Postgres", "kind": "external", "packages": ["pypi:sqlalchemy", "pypi:psycopg2"] },
    { "id": "stripe", "label": "Stripe", "kind": "external", "packages": ["stripe"], "hosts": ["api.stripe.com"] }
  ],
  "edges": [
    { "from": "stripe", "to": "api.routes", "kind": "http", "label": "webhooks", "description": "payment_intent.succeeded marks orders paid." }
  ],
  "annotations": [
    { "path": "shop-api/app/routes/orders.py", "note": "All order state transitions live here.", "tags": ["hotspot"] }
  ],
  "flows": [
    { "id": "checkout", "title": "Checkout", "steps": [
      { "node": "web.pages", "note": "Cart page submits the order" },
      { "node": "web.api", "note": "POST /api/orders" },
      { "node": "api.routes", "note": "Validates and creates the order" },
      { "node": "stripe", "note": "Creates a PaymentIntent" }
    ]}
  ]
}
```

`


# references/blueprint.md

`markdown
# Blueprints: a floorplan of a system that isn't built yet

A blueprint is the same map, drawn from a plan instead of code. Someone has a PRD, a spec or just a long description of what they want to build, and the map shows every piece they'd need, how the pieces connect, what each screen relies on, and what still has to be decided.

You write two files in `floorplan/`:
- `plan.json`: the files, endpoints and connections the system would have (this file).
- `architecture.json`: the parts, outside services, flows and tour, exactly as for a code map ([schema.md](schema.md)).

`plan.mjs` turns `plan.json` into the scan `build.mjs` expects, so everything after that works as for real code. Cards are drawn with dashed outlines and a **Blueprint** label, Health becomes a **design review** of the plan, and every part has a **Build this with Antigravity** button with a ready request to build it.

Contents: [Planning well](#planning-well) · [plan.json](#planjson) · [Checks](#what-the-design-review-checks)

## Planning well

- **Plan to the level of files and endpoints**, not just boxes. Screens, the design review and the build prompts all depend on it. A small product is typically 15–60 files and 10–40 endpoints. Don't plan every helper: one file per page, per group of endpoints, per outside service and per kind of saved data is about right. Where the stack puts one handler per URL (Next.js `route.ts`, SvelteKit `+server.ts`), plan it that way; more files is fine.
- **Pick a sensible, common stack** unless the PRD names one, and list it in `stack`. Prefer what a solo builder working with AI would choose: a Next.js or React website, a Node or Python server, Postgres, Stripe, a hosted email service. Use real, conventional paths for that stack (`web/app/checkout/page.tsx`, `api/src/routes/orders.ts`).
- **Every screen the PRD describes is a file with a `screen` URL.** Give each screen `calls` for the endpoints it uses and `uses` for the parts it's built from.
- **Every endpoint gets `access`**, and `who` when only some signed-in people may use it ("managers of that location", "the account owner"). Decide it from the PRD. If the PRD is silent and it matters, leave it out (the review will flag it) or add a question. An endpoint that must be open to anyone and changes data (sign-in codes, sign-up, guest checkout) gets `publicBecause`: why, and what stops abuse.
- **Don't invent requirements.** Where the PRD doesn't say and you had to choose, write the choice in `assumptions`. Where the answer changes what gets built and you can't reasonably choose, add it to `questions` with the parts it affects. Carry every open question the PRD lists into `questions` unless the PRD settles it elsewhere; if you planned around the likely answer, say so in `assumptions` too. Ask the user 2–3 questions up front only if the PRD leaves something fundamental open (who uses it, web or mobile, does anyone sign in, does money change hands).
- **Outside services and data stores are `external` nodes** in architecture.json (Stripe, the database, an email service). Files reach them through `services` and `data` in plan.json. Put `data` on the files that talk to the database directly (a database helper, or each data-access file), not on every file that uses them: Screens follow `uses` down to them.
- **Background work** (scheduled emails, nightly jobs, queue workers) gets its own files and a `worker` node.

## plan.json

```json
{
  "$schema": "floorplan/plan@1",
  "source": "docs/prd.md",
  "stack": ["Next.js website", "Node.js + Express server", "Postgres", "Stripe"],
  "assumptions": ["Staff and customers share one sign-in, with staff marked as such."],
  "questions": [{ "question": "Can customers cancel for free?", "about": ["POST /api/orders/:id/cancel"] }],
  "files": [ { "path": "web/app/checkout/page.tsx", "name": "Checkout page", "description": "…", "screen": "/checkout", "uses": ["web/lib/api.ts"], "calls": ["POST /api/orders"] } ],
  "endpoints": [ { "method": "POST", "path": "/api/orders", "file": "api/src/routes/orders.ts", "name": "Place an order", "description": "…", "access": "signed-in" } ]
}
```

| field | meaning |
|---|---|
| `source` | what it was planned from: the PRD's path in the project, or a few words such as "a description in chat" |
| `stack` | the technology choices, in plain words |
| `assumptions` | choices you made where the PRD didn't say. Shown on the map's overview |
| `questions` | `{ question, about }`: decisions the PRD leaves open. `about` lists node ids, file paths or `"METHOD /path"`. Each one shows in the design review until it's answered and removed |
| `files` | every planned file (see below) |
| `endpoints` | every planned endpoint (see below) |

**files[]**

| field | meaning |
|---|---|
| `path` | where it would live, relative to the project folder. Required, unique |
| `name`, `description` | a human name and one plain sentence, written like a description of real code ([writing-descriptions.md](writing-descriptions.md)) |
| `screen` | for a page people open: its URL (`/checkout`, `/orders/:id`). Makes it a screen in **Screens** |
| `uses` | other planned files it is built from or calls directly (becomes "uses" connections) |
| `calls` | endpoints it calls, as `"METHOD /path"`, exactly as in `endpoints` |
| `services` | ids of `external` nodes it talks to (Stripe, an email service) |
| `data` | ids of nodes for the data stores it reads or writes (usually the database) |

**endpoints[]**

| field | meaning |
|---|---|
| `method` | GET, POST, PUT, PATCH, DELETE, or CALL for a callable function (for example Firebase `onCall`) |
| `path` | the URL, starting with `/`. Use `:name` for parts that change (`/api/orders/:id`) |
| `file` | the planned file that handles it. Required |
| `name`, `description` | as for files |
| `access` | who may use it: `public` (anyone), `signed-in`, `team` (only the people who run the service, for its own admin pages, not the app's users), `webhook` (another company's service, which must prove it's them) or `internal` (only your own services) |
| `who` | with `signed-in`: which signed-in people, in a few words ("managers of that location", "the account owner"). Leave it out when any signed-in user may |
| `publicBecause` | with `public`: why it has to be open, and what limits abuse ("sign-in has to work before anyone is signed in; 5 codes per number per hour"). The design review stops flagging an open endpoint that has one |

Node `paths` globs in architecture.json assign planned files to parts, the same as for code. Aim for no unassigned files. Folder names in brackets (`app/orders/[id]/**`) match literally.

plan.mjs's "calls to planned endpoints" counts each call; the build's "http" links count each caller-to-file connection plus links to outside services, so the two numbers differ.

## Changes from the map

When the map is open through its server (open.mjs), the Ask bar has an **Ask / Change** switch. A change request ("also plan out refunds", "drop the admin page") goes to the same agent, read-only. It replies with the complete updated plan.json and architecture.json, and the server checks them with plan.mjs and build.mjs. If the checks fail, or new files fall under no part, it sends the problems back once. Then it saves the files, redraws the map (open tabs reload), and highlights the new and changed cards as recent work, with **Undo**. The replaced files are kept in `floorplan/.cache/history/`. Each design review item has **Resolve on the map**, which puts a ready request in Change mode: an open question's request ends with "My answer:" for the person to finish, and the agent then removes the question and builds the answer into the plan. Changes you make by hand or through this skill work the same way: edit the files and run refresh.mjs.

## What the design review checks

- endpoints that change data and are open to anyone, unless `publicBecause` explains why;
- endpoints with no `access` decided;
- every open question, pointing at the parts it affects;
- endpoints no planned screen or service calls;
- planned files connected to nothing.

Each has **Resolve on the map** when the map is served (see above), and otherwise **Resolve with Antigravity**, a request to paste into the agent.

`


# references/choosing-boundaries.md

`markdown
# Choosing boundaries

The board is useful when each chip is something a person would name in a whiteboard conversation. It's useless when it just mirrors the folder tree. Use these heuristics to get there.

## The top-level board (3–9 chips)

Ask: *what are the deployable or ownable things, and what do they talk to?*

- **Multi-repo codebase.** Usually one chip per deployable (frontend, API, worker, a second app like an admin panel or a mobile app), plus shared libraries, plus externals. The repo is not always the unit: a backend repo might hold an API *and* a worker *and* an MCP connector, so give each its own chip.
- **Monorepo** (`apps/*`, `packages/*`, `services/*`). Apps and services become top-level chips. Group packages as one `Shared libraries` chip with children, unless a package is big and central.
- **Single monolith.** Use layers or domains as the top level (`Web layer`, `Domain services`, `Data`, `Jobs`), or the 4–8 biggest domains if the code is organized by feature. Choose the one the code actually follows.
- **Externals.** Add the database(s) and each third-party API the code meaningfully depends on. Use the scan's EXTERNAL PACKAGES and EXTERNAL HOSTS lists; `packages` and `hosts` on external nodes connect them automatically. Skip utility libraries (react, lodash, pytest). They're dependencies, not architecture.
- **Tests, scripts, migrations.** Give them their own top-level chips (`kind: test`, `script`, `data`) rather than mixing them into the service. Otherwise they bury the real dependency structure: tests import everything.

## Second level (3–12 per chip)

- Prefer **responsibility** over **file type**. "Orders", "Inventory" and "Auth" beat "routes", "services" and "models" when the code is organized that way. But if the code really is layered (routes/ → services/ → models/), mirror the layers. A layered board that shows routes → services → models is honest and readable.
- A child is worth making when it has a clear one-sentence purpose and enough files (roughly 3+) or importance (a central API client) to matter.
- Large UI component trees: group by feature area (`products`, `orders`, `checkout`), and keep a `UI kit` chip for shared primitives (`components/ui`). The kit will have many incoming traces. That's correct and useful to see.
- Don't go deeper than three levels of nodes. The viewer already gives you folder, file and symbol levels below your nodes.

## Covering the files

- Write broad globs on parents (`backend/app/**`), then narrower ones on children. The deepest match wins, so you never need `exclude` just to stop a parent stealing a child's files.
- After building, look at `unassigned, by directory`, and give each sizeable directory a home or an `ignore` entry.
- `ignore` is for things that aren't the system: generated clients, vendored copies, snapshot fixtures, one-off data dumps. It's not for tests or scripts, which belong on their own chips.

## Summaries

One sentence, about responsibility, in the codebase's own vocabulary. "Syncs product catalog and inventory with Shopify" beats "Contains Shopify-related services". Mention the framework only at the top level.

## Flows

Pick the 1–3 things the system exists to do (take an order, sync inventory, run a nightly job). Trace them across the board in 3–7 steps from the user or trigger to the final side effect. Check that consecutive steps are actually connected by an import, HTTP or explicit edge; if not, add the missing edge. The flow should make the system's main path obvious to someone seeing it for the first time.

## Sanity checks before you finish

- Does the top-level board, read left to right, tell the system's story (UI → API → services → data/externals)?
- Is any chip connected to almost everything? That's either a shared kit (fine, label it) or a sign the boundary is wrong.
- Are there traces you didn't expect, like the frontend importing backend code, or tests that are imported by production code? Mention them to the user; they're often the most valuable finding.

`


# references/writing-descriptions.md

`markdown
# Writing names and descriptions

Every card on the map shows a **name** and a **description**. The file path and route path are still shown, but in small type underneath. The goal is that someone who has never seen the code can read the board like a system diagram.

This guide covers the names and descriptions in `descriptions/*.json` and the `label` / `summary` of nodes and `project.summary` in `architecture.json`.

## Who you're writing for: `audience`

`architecture.json` has an optional top-level `"audience"`. Each worksheet header repeats it.

- **`"everyone"` (default).** Assume the reader is the owner of the app, not an engineer. Often they built it with AI and don't know how it works inside. Write in **plain language**: what the thing does for the business or its users, in everyday words. Stay specific and accurate. See [Plain language](#plain-language) below.
- **`"developers"`.** The reader is an engineer joining the codebase. Naming frameworks, patterns and mechanics is fine and often useful ("Flask blueprint", "SQLAlchemy model", "Pub/Sub consumer").

Use `"developers"` only when the user asks for it, or the map is plainly for an engineering team (a library, an SDK, infrastructure code). If you're unsure, use `"everyone"`.

## Where they go

`describe.mjs` writes one worksheet per module (`floorplan/.cache/worksheets/<key>.md`) and a matching skeleton (`floorplan/descriptions/<key>.json`):

```json
{
  "files": {
    "api/app/services/inventory_bulk_service.py": { "name": "Bulk stock updates", "description": "Applies stock changes from an uploaded spreadsheet in the background, checking every row before anything changes." }
  },
  "routes": {
    "GET /api/products/<int:product_id>/activity": { "name": "Product history", "description": "Shows who changed a product and when, most recent first." }
  }
}
```

Fill in every `description` and improve every `name`. **Don't change, add or remove keys.** The keys are how `build.mjs` matches entries to files and routes. Keep the JSON valid.

## Names

- 2–5 words in sentence case, naming what the thing *is* or *does* in the business's own words. Short and concrete: "Staff app", "Main server", "Gift cards", "Refunds".
- Don't just restate the filename. `inventory_bulk_service.py` becomes "Bulk stock updates", not "Inventory bulk service". `page.tsx` under `dashboard/products/` becomes "Products page".
- UI components get the name a user would recognise: "Product photo editor", "Discount rules table".
- Tests: "<subject> tests", e.g. "Bulk stock update tests".
- Migrations and scripts say what they do: "Add gift-card balances", "Backfill Stripe customer links".
- Routes are named from the caller's point of view: "Product history", "Mark orders shipped", "Stripe payment alerts".
- Product names stay as they are (Stripe, Shopify, Postgres, SendGrid). People know them, and the glossary in the viewer explains the technical ones.

## Descriptions

- **One sentence, ideally under 140 characters**, present tense, starting with a verb: "Keeps…", "Shows…", "Sends…", "Checks…".
- Say what it's responsible for and anything notable: a side effect (changes prices on Shopify, emails the customer), a constraint (staff only, safe to retry), or a role (the one place X is decided).
- Use concrete domain nouns: "gift card", "pick list", "Shopify listing", not "data", "items", "stuff".
- Don't say "This file…", don't hedge, and don't repeat the name.
- For routes, describe the effect, not the HTTP mechanics. "Marks an order as shipped and emails the customer their tracking link" beats "POST endpoint for shipping".

## Plain language

The default audience is `"everyone"`. Write as if explaining the app to its owner over coffee: they know the business inside out, but not the code.

**You don't need to carry the technical identity.** The real path is printed under every card, and endpoint cards show the method and URL (`POST /api/orders/<id>/ship`). "Show technical detail" in the viewer reveals exports, line counts and developer terms. So the description is free to say only what the thing is *for*.

### Rules

1. **Lead with the job, not the mechanism.** What does it do for staff, customers or the business? "Takes card payments at checkout", not "Stripe Payments API wrapper".
2. **Everyday words.** Swap jargon for the plain phrase in the table below. If a technical word really is the clearest (a "database", a "login"), it's fine. The viewer underlines common terms and explains them on hover.
3. **Keep it specific.** Plain doesn't mean vague. "Handles orders" is plain *and* useless. "Holds an online order's stock while payment is checked, then releases or ships it" is plain and tells you something.
4. **Name the outside services.** "Sends new prices to Shopify and Amazon" beats "Syncs with external channels".
5. **No framework or library names in descriptions** (Flask, SQLAlchemy, React, Radix, Pydantic…) unless the thing exists *because* of that tool. Labels can keep a product name the owner chose and knows (e.g. "Stripe", "Google Cloud").
6. **No counts of code, file names or code identifiers** ("~6.7k lines", "product_routes.py", `ApiClient`) in summaries. Those belong in `annotations` or are shown elsewhere.
7. **Warnings in plain terms.** "Run by hand against live data; double-check before using" rather than "non-idempotent prod script".

### Jargon → plain

| Instead of | Say |
|---|---|
| API | the way programs talk to each other; for your own, "the main server" (e.g. "asks Shippo for shipping rates") |
| endpoint, route (backend) | a request the app can receive (e.g. "the request that marks an order shipped") |
| page, route (frontend) | a screen / page |
| webhook | a message another service sends your app when something happens ("Stripe tells us a payment went through") |
| REST, HTTP, GET/POST | (leave out; the method and URL are already on the card) |
| frontend / client | the app people use / the screens |
| backend / server / service | the main server, the part that does the work behind the screens |
| monolith | one main server that does everything |
| blueprint, router, controller | a group of related requests (e.g. "order requests") |
| middleware | a check every request passes through (e.g. "makes sure you're signed in") |
| ORM model, schema, entity | how a kind of record is stored (e.g. "how an order is stored") |
| table, row | a list of records / a record |
| query | a lookup / a search of the records |
| database (Postgres, MySQL, RDS, Cloud SQL) | the database, where all the records are kept |
| migration | a change to how records are stored (e.g. "adds a place to store gift-card numbers") |
| seed, fixture | sample data for testing |
| worker, background job | a task that runs on its own in the background |
| queue, outbox, Pub/Sub, message bus | a waiting line of tasks / a way to hand work to background tasks |
| cron, scheduler, scheduled job | runs automatically on a timetable (e.g. "every night at 2am") |
| cache, snapshot | a saved copy kept so things load faster |
| SDK, client library, API client | ready-made code for talking to a service (e.g. "talks to Stripe") |
| integration, sync | keeps X and Y in step / copies changes between X and Y |
| env var, config | settings (e.g. "which store and password to use") |
| secret, API key, token | a password for a service / a sign-in pass |
| auth, authentication | sign-in |
| authorization, roles, permissions, RBAC | who is allowed to do what |
| session | staying signed in |
| hook, context, provider (React) | shared screen logic / keeps the screens in step |
| component, UI kit, primitives | a building block of the screens (button, table, dialog) |
| state | what the screen currently remembers |
| deploy, CI/CD | putting a new version live |
| container, Docker, Cloud Run, serverless | where the server runs in the cloud |
| storage bucket, S3, GCS, blob | file storage in the cloud (images, uploads, exports) |
| CDN | a fast delivery network for images and files |
| idempotent | safe to run twice |
| rate limit | a cap on how often something can be asked |
| reconcile | compares two records of the same thing and fixes differences |
| refactor, tech debt | (leave out) |
| MCP server | a connection that lets AI assistants (like Antigravity) look things up in your app |
| unit tests, test suite | automatic checks that the code still works |

### Examples

**Modules / subsystems (`architecture.json` `summary`)**

| | |
|---|---|
| ✗ | "Flask monolith with route blueprints over a growing service layer and SQLAlchemy models." |
| ✓ | "The main server: the storefront and the admin app both talk to it, and it keeps stock, prices, orders and gift cards in step across Shopify, Stripe and the warehouse." |
| ✗ | "Radix-based primitives (components/ui) and the dashboard shell." |
| ✓ | "The shared building blocks of every screen: buttons, tables, dialogs, and the menu and frame around the staff app." |
| ✗ | "Long-running Cloud Run workers: bulk inventory, pricing, abandoned-cart emails, Stripe reconcile." |
| ✓ | "Tasks that run on their own in the background or on a timetable: big stock uploads, price changes, abandoned-cart emails and the nightly Stripe payout check." |

**Files (`descriptions/*.json`)**

| | |
|---|---|
| ✗ | name "Stripe gift card service", "Wraps the Stripe customer balance API for ledger projection." |
| ✓ | name "Gift card balances", "Keeps each customer's gift-card balance in Stripe matching the balance the shop shows them." |
| ✗ | name "useAuth context", "React context provider exposing auth state and token refresh." |
| ✓ | name "Staff sign-in", "Remembers which staff member is signed in, keeps them signed in, and hides the dashboard from everyone else." |
| ✗ | name "Order lock", "Postgres advisory lock keyed by Shopify order id." |
| ✓ | name "One order at a time", "Stops the same online order being processed twice when Shopify sends duplicate alerts." |

**Routes (endpoints)**

| | |
|---|---|
| ✗ | name "POST ship", "POST endpoint that transitions an order to shipped." |
| ✓ | name "Mark order shipped", "Marks an order as shipped and emails the customer their tracking link." |
| ✗ | name "Stripe webhook", "Receives and signature-checks Stripe webhook payloads." |
| ✓ | name "Stripe alerts", "Stripe calls this when a payment, refund or dispute changes; it checks the message is genuine and queues it." |

For `"developers"`, the ✗ column is closer to right (minus the filler). Same rules otherwise: one sentence, verb first, specific.

## How to work

1. Read the worksheet. It lists each file's definitions, docstrings, what it uses and what uses it, and each route's handler. That's enough for most files.
2. Open the file (the top ~80 lines, or the specific handler) only when the digest leaves the purpose unclear. Generic names (`utils.py`, `index.ts`, `common.py`) and big files usually need a look.
3. Write the JSON in one go per worksheet, in the style the worksheet's `Audience:` line asks for.
4. Be consistent within a module: sibling files should read as a set.

## Quality bar

A good description lets someone pick the right file to open without opening the others. If two siblings end up with nearly identical descriptions, find what actually distinguishes them and say that. For `"everyone"`, also check: would the owner understand every word without asking?

`


# assets/serve.mjs

`javascript
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

`


# assets/graph-query.js

`javascript
// floorplan graph queries, shared by the viewer and by floorplan/query.mjs. Plain script: no imports, no exports.
// Item ids: n:<node id>  f:<file path>  r:<route index>  s:<file path>#<export index>

function createGraphQuery(G) {
  const nodes = new Map(G.nodes.map((n) => [n.id, n]));
  const files = new Map(G.files.map((f) => [f.p, f]));
  const routes = G.routes || [];
  const routesByFile = new Map();
  routes.forEach((r, i) => { if (!routesByFile.has(r.f)) routesByFile.set(r.f, []); routesByFile.get(r.f).push(i); });
  const kidsOf = new Map();
  for (const n of G.nodes) if (n.parent) { if (!kidsOf.has(n.parent)) kidsOf.set(n.parent, []); kidsOf.get(n.parent).push(n.id); }

  const nodeChain = (id) => { const out = []; let n = nodes.get(id); while (n) { out.push(n.id); n = n.parent ? nodes.get(n.parent) : null; } return out; };
  /** The node ids an item lives under, deepest first. */
  function owners(id) {
    if (id.startsWith('n:')) return nodeChain(id.slice(2));
    if (id.startsWith('f:')) { const f = files.get(id.slice(2)); return f ? nodeChain(f.n) : []; }
    if (id.startsWith('r:')) { const r = routes[+id.slice(2)]; return r ? owners('f:' + r.f) : []; }
    if (id.startsWith('s:')) return owners('f:' + id.slice(2).replace(/#\d+$/, ''));
    return [];
  }
  function brief(id) {
    if (id.startsWith('n:')) { const n = nodes.get(id.slice(2)); return n && { id, type: n.kind === 'external' ? 'external' : 'module', name: n.label, description: n.summary || '' }; }
    if (id.startsWith('f:')) { const f = files.get(id.slice(2)); return f && { id, type: 'file', name: f.name, description: f.d || '', path: f.p }; }
    if (id.startsWith('r:')) { const r = routes[+id.slice(2)]; return r && { id, type: 'endpoint', name: r.name, description: r.d || '', path: `${r.m} ${r.p}` }; }
    if (id.startsWith('s:')) {
      const m = /^s:(.*)#(\d+)$/.exec(id); const f = m && files.get(m[1]); const s = f?.s?.[+m[2]];
      return s && { id, type: s[1], name: s[0], description: s[4] || '', path: `${f.p}:${s[2]}` };
    }
    return null;
  }
  const exists = (id) => !!brief(id);
  const inside = (x, container) => x === container || (container.startsWith('n:') && owners(x).includes(container.slice(2))) || (container.startsWith('f:') && (x.startsWith('r:') ? 'f:' + routes[+x.slice(2)].f === container : x.startsWith('s:') ? 'f:' + x.slice(2).replace(/#\d+$/, '') === container : false));
  const ownerItem = (endpoint) => endpoint.startsWith('f:') ? 'n:' + (files.get(endpoint.slice(2))?.n || '') : endpoint;

  /** Accepts an id, or what people naturally pass: a file path, a module id, or "GET /path". */
  function normId(id) {
    id = String(id || '').trim().replace(/^\.\//, '').replace(/\\/g, '/');
    if (brief(id)) return id;
    if (files.has(id)) return 'f:' + id;
    if (nodes.has(id)) return 'n:' + id;
    const m = /^([A-Z]+)\s+(\/\S*)$/i.exec(id);
    if (m) { const ri = routes.findIndex((r) => r.m === m[1].toUpperCase() && r.p === m[2]); if (ri >= 0) return 'r:' + ri; }
    return id;
  }

  const FILLER = new Set(['how', 'does', 'do', 'did', 'the', 'a', 'an', 'is', 'are', 'where', 'what', 'which', 'who', 'of', 'to', 'for', 'in', 'on', 'and', 'or', 'we', 'i', 'my', 'our', 'it', 'work', 'works', 'happen', 'happens', 'get', 'gets', 'with']);
  function find(query, kind, limit = 15) {
    const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    const terms = words.filter((t) => !FILLER.has(t)).length ? words.filter((t) => !FILLER.has(t)) : words;
    if (!terms.length) return [];
    const pool = [];
    if (!kind || kind === 'module') for (const n of G.nodes) pool.push(['n:' + n.id, n.label, n.summary || '', n.id, 4]);
    if (!kind || kind === 'file') for (const f of G.files) pool.push(['f:' + f.p, f.name, f.d || '', f.p, 3]);
    if (!kind || kind === 'endpoint') routes.forEach((r, i) => pool.push(['r:' + i, r.name, r.d || '', `${r.m} ${r.p}`, 3]));
    if (!kind || kind === 'symbol') for (const f of G.files) (f.s || []).forEach((s, i) => pool.push([`s:${f.p}#${i}`, s[0], s[4] || '', f.p, 1]));
    // everything matching every word; if nothing does, the best partial matches
    const scored = [];
    for (const [id, name, desc, p, w] of pool) {
      const n = name.toLowerCase(), d = desc.toLowerCase(), pp = p.toLowerCase();
      let s = 0, hit = 0;
      for (const t of terms) {
        const sc = n === t ? 30 : n.startsWith(t) ? 20 : n.includes(t) ? 12 : pp.includes(t) ? 7 : d.includes(t) ? 5 : 0;
        if (sc) { s += sc; hit++; }
      }
      if (hit) scored.push([hit, s + w * 2 - n.length * 0.02, id]);
    }
    const best = Math.max(0, ...scored.map((x) => x[0]));
    const floor = best === terms.length ? best : Math.max(1, Math.ceil(terms.length / 2));
    return scored.filter((x) => x[0] >= floor).sort((a, b) => b[0] - a[0] || b[1] - a[1])
      .slice(0, Math.min(Number(limit) || 15, 40)).map(([, , id]) => brief(id));
  }

  function connections(id, max = 15) {
    const out = new Map(), inn = new Map();
    for (const l of G.links) {
      const ia = inside(l.a, id), ib = inside(l.b, id);
      if (ia === ib) continue;
      const other = ia ? l.b : l.a;
      const key = (id.startsWith('n:') ? ownerItem(other) : other) + '|' + l.k;
      const m = ia ? out : inn;
      const cur = m.get(key) || { id: key.split('|')[0], via: l.k, weight: 0, endpoints: new Set() };
      cur.weight += l.w;
      for (const [ri] of l.calls || []) if (ri != null) cur.endpoints.add(ri);
      m.set(key, cur);
    }
    const fmt = (m) => [...m.values()].sort((a, b) => b.weight - a.weight).slice(0, max).map((c) => ({
      ...brief(c.id), via: c.via, weight: c.weight,
      ...(c.endpoints.size ? { endpoints: [...c.endpoints].slice(0, 6).map((ri) => `r:${ri} ${routes[ri].m} ${routes[ri].p}`) } : {}),
    })).filter((x) => x.id);
    return { dependsOn: fmt(out), usedBy: fmt(inn) };
  }

  function show(id) {
    id = normId(id);
    const b = brief(id);
    if (!b) throw new Error(`Unknown id "${id}". Use find first; ids look like n:api, f:src/app.ts, r:12, s:src/app.ts#3.`);
    const parent = owners(id)[id.startsWith('n:') ? 1 : 0];
    const res = { ...b, ...(parent ? { partOf: brief('n:' + parent) && { id: 'n:' + parent, name: nodes.get(parent).label } } : {}) };
    const recent = (G.recent?.items || []).filter((x) => x.id === id);
    if (recent.length) res.recentWork = recent.map((x) => `${G.recent.tasks[x.task]?.title}: ${x.note}`);
    if (id.startsWith('n:')) {
      const n = nodes.get(id.slice(2));
      if (n.details) res.details = n.details;
      res.size = { files: n.stats.files, loc: n.stats.loc };
      res.children = (kidsOf.get(n.id) || []).map((k) => ({ id: 'n:' + k, name: nodes.get(k).label, description: nodes.get(k).summary || '' }));
      const fl = G.files.filter((f) => owners('f:' + f.p).includes(n.id)).sort((a, z) => z.loc - a.loc);
      res.files = fl.slice(0, 12).map((f) => ({ id: 'f:' + f.p, name: f.name, description: f.d || '' }));
      if (fl.length > 12) res.moreFiles = fl.length - 12;
      res.endpoints = routes.filter((r) => owners('f:' + r.f).includes(n.id)).length;
      Object.assign(res, connections(id));
    } else if (id.startsWith('f:')) {
      const f = files.get(id.slice(2));
      Object.assign(res, { loc: f.loc, module: { id: 'n:' + f.n, name: nodes.get(f.n)?.label }, ...(f.note ? { note: f.note } : {}) });
      const rs = routesByFile.get(f.p) || [];
      if (rs.length) res.endpoints = rs.slice(0, 40).map((ri) => ({ id: 'r:' + ri, method: routes[ri].m, path: routes[ri].p, name: routes[ri].name }));
      const handlers = new Set(rs.map((ri) => routes[ri].h));
      const ex = (f.s || []).map((s, i) => [s, i]).filter(([s]) => !handlers.has(s[0]));
      if (ex.length) res.exports = ex.slice(0, 30).map(([s, i]) => `s:${f.p}#${i} ${s[0]} (${s[1]})`);
      Object.assign(res, connections(id, 20));
    } else if (id.startsWith('r:')) {
      const ri = +id.slice(2), r = routes[ri];
      Object.assign(res, { method: r.m, routePath: r.p, handler: r.h, line: r.l, file: { id: 'f:' + r.f, name: files.get(r.f)?.name } });
      const callers = new Map();
      for (const l of G.links) { const n = (l.calls || []).filter(([x]) => x === ri).length; if (n) callers.set(l.a, (callers.get(l.a) || 0) + n); }
      res.calledFrom = [...callers.entries()].map(([a, n]) => ({ ...brief(a), calls: n }));
    } else {
      const m = /^s:(.*)#(\d+)$/.exec(id); const f = files.get(m[1]); const s = f.s[+m[2]];
      res.file = { id: 'f:' + f.p, name: f.name };
      res.importedBy = G.links.filter((l) => l.b === 'f:' + f.p && (l.names || []).some((nm) => nm === s[0] || (nm === 'default' && s[3]))).slice(0, 25).map((l) => brief(l.a));
    }
    return res;
  }

  /** Shortest dependency chain from anything inside `from` to anything inside `to`. */
  function path(from, to) {
    from = normId(from); to = normId(to);
    if (!exists(from) || !exists(to)) throw new Error('Unknown id; use find first.');
    const adj = new Map();
    const add = (a, b, l) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push([b, l]); };
    for (const l of G.links) add(l.a, l.b, l);
    const starts = [...new Set([...G.links.map((l) => l.a), ...G.links.map((l) => l.b)])].filter((x) => inside(x, from));
    const isGoal = (x) => inside(x, to);
    const prev = new Map(starts.map((s) => [s, null]));
    const queue = [...starts];
    let goal = null;
    while (queue.length && !goal) {
      const x = queue.shift();
      for (const [y, l] of adj.get(x) || []) {
        if (prev.has(y)) continue;
        prev.set(y, [x, l]);
        if (isGoal(y)) { goal = y; break; }
        queue.push(y);
      }
    }
    if (!goal) return { found: false, note: `No chain of imports/calls leads from ${from} to ${to}. Try the reverse direction, or the two may only meet through a shared dependency.` };
    const hops = [];
    for (let x = goal; prev.get(x); x = prev.get(x)[0]) {
      const [p, l] = prev.get(x);
      hops.unshift({ from: brief(p), to: brief(x), via: l.k, ...(l.calls?.length ? { endpoints: l.calls.slice(0, 3).map(([ri]) => ri != null ? `r:${ri} ${routes[ri].m} ${routes[ri].p}` : '').filter(Boolean) } : {}) });
    }
    return { found: true, hops: hops.slice(0, 15) };
  }

  function overview() {
    return {
      project: G.project.name, summary: G.project.summary || '',
      systems: G.nodes.filter((n) => !n.parent).map((n) => ({ id: 'n:' + n.id, name: n.label, kind: n.kind, description: n.summary || '', modules: (kidsOf.get(n.id) || []).map((k) => `n:${k} ${nodes.get(k).label}`) })),
      flows: (G.flows || []).map((f) => ({ title: f.title, steps: f.steps.map((s) => `${s.ref} ${s.note}`) })),
      counts: { files: G.files.length, endpoints: routes.length },
      ...(G.recent ? { recentWork: (G.recent.tasks || []).map((t, ti) => ({ title: t.title, request: t.request, summary: t.summary, changed: G.recent.items.filter((x) => x.task === ti).map((x) => `${x.id} ${x.note}`) })) } : {}),
    };
  }

  return { find, show, path, overview, exists, brief };
}

// What an answer looks like, for both engines (JSON Schema).
const FLOORPLAN_ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Short title for the answer view, at most 6 words.' },
    answer: { type: 'string', description: 'The answer in Markdown, at most ~180 words. Mention map items inline as [[id]].' },
    items: { type: 'array', description: '3-14 map items most relevant to the answer, most important first.', items: { type: 'object', properties: { id: { type: 'string' }, note: { type: 'string', description: 'Why this item matters here, at most 15 words.' } }, required: ['id', 'note'] } },
    steps: { type: 'array', description: 'Optional ordered walkthrough when the answer is a sequence (a request path, a data flow). Empty otherwise.', items: { type: 'object', properties: { id: { type: 'string' }, note: { type: 'string' } }, required: ['id', 'note'] } },
    followups: { type: 'array', description: '2-3 short follow-up questions the person might ask next.', items: { type: 'string' } },
  },
  required: ['title', 'answer', 'items'],
};

// A requested flow: an ordered walkthrough of map items (JSON Schema).
const FLOORPLAN_FLOW_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Short flow title, at most 6 words, e.g. "Checkout to Stripe payment".' },
    description: { type: 'string', description: 'One sentence on what the flow shows.' },
    steps: { type: 'array', description: '3-9 steps in the order things happen, each a map item and what happens there.', items: { type: 'object', properties: { id: { type: 'string' }, note: { type: 'string', description: 'What happens at this step, at most 18 words.' } }, required: ['id', 'note'] } },
  },
  required: ['title', 'steps'],
};

// A requested change to a blueprint: the whole updated plan.json and architecture.json, and what changed
// (JSON Schema). The documents travel as JSON text so the schema stays the same for every engine.
const FLOORPLAN_CHANGE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'What changed, 2-6 words, e.g. "Planned out payments".' },
    summary: { type: 'string', description: 'Markdown, at most ~150 words, plain words: what you added, changed or removed and why, plus any new assumptions or open questions.' },
    plan: { type: 'string', description: 'The complete updated floorplan/plan.json, as JSON text.' },
    architecture: { type: 'string', description: 'The complete updated floorplan/architecture.json, as JSON text.' },
    changes: { type: 'array', description: 'Every new or changed card: a file path, node id or "METHOD /path".', items: { type: 'object', properties: { ref: { type: 'string' }, change: { type: 'string', enum: ['new', 'changed'] }, note: { type: 'string', description: 'How this card serves the request, one plain sentence.' } }, required: ['ref', 'change', 'note'] } },
    followups: { type: 'array', description: '2-3 short changes the person might ask for next.', items: { type: 'string' } },
  },
  required: ['title', 'summary', 'plan', 'architecture', 'changes'],
};

function floorplanChangeInstructions(G) {
  const src = G.meta?.blueprint?.source;
  return [
    `You change a blueprint: an interactive map of "${G.project.name}", a system that is planned but not built yet. The person looking at it asks for a change, addition or removal ("also plan out payments", "drop the admin page", "staff should sign in with Google"), and you update the plan.`,
    `Read floorplan/plan.json and floorplan/architecture.json first${src ? `, and ${src} (the PRD it was planned from) when the request touches what the PRD says` : ''}. You can look things up on the map with \`node floorplan/query.mjs find "<words>"\` and \`show <id>\`.`,
    'plan.json format: { source, stack[], assumptions[], questions[{question, about[]}], files[{path, name, description, screen?, uses[], calls["METHOD /path"], services[node ids], data[node ids]}], endpoints[{method, path, file, name, description, access: public|signed-in|team|webhook|internal, who?, publicBecause?}] }. Every endpoint\'s file is a planned file, every call matches a planned endpoint exactly, and services/data name nodes in architecture.json.',
    'architecture.json: { project, nodes[{id, label, kind, parent?, summary, paths[globs]}], edges[], flows[{id, title, steps[{node, note}]}], tour[] }. Kinds: ui service worker library feature data config test script infra external. External nodes (outside services, the database) own no files. Every planned file must fall under some node\'s paths, so add or widen globs for new folders. Flow and tour steps point at node ids or planned file paths.',
    'Change only what the request needs, the way the rest of the plan is written: same stack and conventions, plain language for everyone, real file paths. Keep every other file, endpoint, id and description exactly as it is. If the PRD or plan already decided something, follow it; record a new choice in assumptions and a real open decision in questions. If the request removes something, remove everything that only it used. If it answers one of plan.json\'s questions, remove that question, build the answer into the plan, and record it in assumptions; if it settles who may use an endpoint, set access (and who or publicBecause). Many requests come from the map\'s design review: settle exactly what it names.',
    'Reply with JSON only: {"title", "summary", "plan", "architecture", "changes", "followups"}. plan and architecture are the complete updated files as JSON text, not just the changed parts. changes lists every new or changed file, endpoint ("METHOD /path") or node id with a note on how it serves the request.',
    'Do not edit any files yourself: the map server checks your JSON, saves it and redraws the map.',
  ].join('\n');
}

function floorplanFlowInstructions(G, engine) {
  return [
    `You build guided flows for an interactive architecture map of the codebase "${G.project.name}". A flow is an ordered walkthrough: each step is one map item (module n:..., file f:..., endpoint r:..., or export s:...) and a note on what happens there.`,
    engine === 'cli'
      ? 'Find the items with `node floorplan/query.mjs find "<words>"`, `show <id>` and `path <fromId> <toId>`; read source files when you need to confirm the order of events.'
      : 'Find the items with the tools find_items, get_item and dependency_path.',
    'Trace what the person asks for from its trigger (a user action, webhook, cron job) to its final effect (database write, external call, response).',
    'Use 3-9 steps. Prefer the most specific item that tells the story (an endpoint over its file, a file over its module), and make consecutive steps things that really call or import each other.',
    'Reply with JSON only: {"title", "description", "steps": [{"id", "note"}]}. Only use ids the map gave you.',
  ].join('\n');
}

function floorplanAskInstructions(G, engine) {
  const tools = engine === 'cli'
    ? `Query the map from the shell: \`node floorplan/query.mjs overview\`, \`node floorplan/query.mjs find "<words>" [--kind module|file|endpoint|symbol]\`, \`node floorplan/query.mjs show <id>\`, \`node floorplan/query.mjs path <fromId> <toId>\`. Every result is JSON with ids. Start with the map; read or grep source files when you need specifics the map does not have.`
    : `Use the tools find_items, get_item and dependency_path to explore the map. You cannot read source files, so answer from the map's names, descriptions, endpoints and connections, and say so when a question needs the code itself.`;
  const bp = G.meta?.blueprint;
  return [
    `You answer questions about the codebase "${G.project.name}" for someone exploring an interactive architecture map of it.`,
    `The map has cards for modules (ids n:...), files (f:<path>), HTTP endpoints (r:<number>) and exported symbols (s:<path>#<number>), each with a human-readable name and description, connected by imports and HTTP calls.`,
    tools,
    bp ? `This map is a blueprint: a plan of a system that hasn't been built yet, so its files don't exist.${engine === 'cli' ? ` Instead of source files, read floorplan/plan.json${bp.source ? ` and ${bp.source} (what it was planned from)` : ''} when you need more than the map.` : ''} Answer about what would be built and why, and say plainly when the plan doesn't cover something.` : '',
    'Use a few lookups, not dozens. Then reply with JSON only: {"title", "answer", "items", "steps", "followups"}.',
    '- answer: Markdown, at most ~180 words, plain and specific. Refer to map items inline as [[id]] (they become clickable).',
    '- items: the 3-14 cards that best show the answer, most important first, each with a note (at most 15 words) on its role.',
    '- steps: an ordered walkthrough when the answer is a sequence (a request path, a data flow); otherwise [].',
    '- followups: 2-3 short follow-up questions.',
    'Only use ids that the map gave you.',
  ].filter(Boolean).join('\n');
}

`


# assets/query-cli.mjs

`javascript
// floorplan/query.mjs: look things up in this folder's graph.json. Generated by build.mjs.
// usage: node floorplan/query.mjs overview
//        node floorplan/query.mjs find "<words>" [--kind module|file|endpoint|symbol] [--limit 15]
//        node floorplan/query.mjs show <id>
//        node floorplan/query.mjs path <fromId> <toId>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const G = JSON.parse(fs.readFileSync(path.join(here, 'graph.json'), 'utf8'));
const q = createGraphQuery(G);
const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf('--' + name); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const kind = flag('kind'), limit = flag('limit');
const [cmd, ...rest] = argv;
try {
  let out;
  if (cmd === 'overview') out = q.overview();
  else if (cmd === 'find') out = q.find(rest.join(' '), kind, limit);
  else if (cmd === 'show') out = q.show(rest[0]);
  else if (cmd === 'path') out = q.path(rest[0], rest[1]);
  else { console.log('commands: overview | find "<words>" [--kind module|file|endpoint|symbol] | show <id> | path <fromId> <toId>'); process.exit(cmd ? 1 : 0); }
  console.log(JSON.stringify(out, null, 1));
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
  process.exit(1);
}

`


# assets/ui/05-theme.js

`javascript
// The Theme button: Auto (follows your device) -> Light -> Dark -> Auto. The choice is remembered on this
// device. The theme itself is picked by a tiny script at the top of viewer.html, before anything is drawn,
// so the page never flashes the wrong colours; this file only adds the button and keeps it in step.
(() => {
  const SC = window.Floorplan;
  const T = window.floorplanTheme;
  if (!SC || !T) return;

  const ICON = {
    auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    dark: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  };
  const NAME = { auto: 'Auto (follows your device)', light: 'Light', dark: 'Dark' };
  const WORD = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  const NEXT = { auto: 'light', light: 'dark', dark: 'auto' };

  const style = document.createElement('style');
  style.textContent = `
    /* a 44 px target; the round hover shape stays 36 px like the buttons beside it */
    #theme-toggle { position: relative; flex: none; width: 44px; height: 44px; padding: 0; background: none; }
    #theme-toggle::before { content: ""; position: absolute; inset: 4px; border-radius: 999px; transition: background .2s var(--ease); }
    #theme-toggle:hover { background: none; }
    #theme-toggle:hover::before { background: rgba(var(--ink), .07); }
    #theme-toggle svg { position: relative; width: 18px; height: 18px; }
    #theme-toggle:focus-visible { outline: 2px solid var(--ring); outline-offset: -3px; }
    .theme-status { position: fixed; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    @media (prefers-reduced-motion: reduce) { #theme-toggle, #theme-toggle::before { transition: none; } #theme-toggle:active { transform: none; } }`;
  document.head.appendChild(style);

  // read out by screen readers when the theme changes
  const status = document.createElement('span');
  status.className = 'theme-status';
  status.setAttribute('role', 'status');
  document.body.appendChild(status);

  const btn = SC.addHeaderButton({ id: 'theme-toggle', svg: ICON.auto, onClick: () => {
    const next = NEXT[T.get()];
    T.set(next);
    status.textContent = `Theme is now ${next === 'auto' ? 'Auto, following your device' : WORD[next]}.`;
  } });

  const show = () => {
    const c = T.get();
    btn.querySelector('svg').innerHTML = ICON[c];
    const text = `Theme: ${NAME[c]}. Press for ${WORD[NEXT[c]]}.`;
    btn.title = text;
    btn.setAttribute('aria-label', text);
  };
  // Enter and Space press this button; they must not also run the page's own "open the selected box" key
  btn.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') ev.stopPropagation(); });
  window.addEventListener('floorplan-theme-change', show);
  show();
})();

`


# assets/ui/06-blueprint.js

`javascript
// Blueprints: a map planned from a PRD or a description, before any code exists (graph.meta.blueprint,
// from scripts/plan.mjs). Cards get a dashed outline and the project name a "Blueprint" pill, the
// overview says what it was planned from, and every planned part offers "Build this with Antigravity": a
// ready prompt to build just that part, following the plan. Talks to the viewer only through window.Floorplan.
(() => {
  const SC = window.Floorplan;
  const BP = SC && SC.graph.meta.blueprint;
  if (!BP) return;
  const { h } = SC;
  const Cap = (t) => t[0].toUpperCase() + t.slice(1);
  const A = SC.agent || { name: 'Antigravity', app: 'Antigravity IDE' };
  const G = SC.graph;

  document.documentElement.classList.add('blueprint');
  const style = document.createElement('style');
  style.textContent = `
    /* planned, not built: a dashed outline on every card */
    html.blueprint .card:not(.connector)::after { content: ""; position: absolute; inset: 0; border-radius: inherit; border: 2.5px dashed rgba(var(--ink), .32); pointer-events: none; }
    .bp-pill { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; margin-left: 8px; border-radius: 999px; font-size: 11px; font-weight: 500; letter-spacing: .02em; color: var(--text-2); border: 1px dashed rgba(var(--ink), .35); flex: none; }
    .bp-list { margin: 8px 0 0; padding-left: 18px; color: var(--text-2); font-size: 13px; line-height: 1.55; }
    .bp-list li + li { margin-top: 4px; }
  `;
  document.head.appendChild(style);

  // a "Blueprint" pill beside the board's title, which is redrawn on every move
  const addPill = () => {
    const k = document.querySelector('#context .k');
    if (!k || k.querySelector('.bp-pill')) return;
    k.insertAdjacentHTML('beforeend', '<span class="bp-pill" title="Planned, not built yet: every card is a part the system would need.">Blueprint</span>');
  };
  SC.on('render', addPill);
  SC.on('ready', addPill);

  const ACCESS = { public: 'anyone', 'signed-in': 'signed-in users', team: 'only the team that runs the service', webhook: 'the service that sends it, which must prove it', internal: 'only our own services' };
  /** "for signed-in users: managers of that location", or the open question when nobody decided. */
  const whoMay = (r) => !r.access ? 'who may use it isn’t decided yet: ask me'
    : `for ${r.access === 'signed-in' && r.who ? r.who : ACCESS[r.access] || r.access}${r.publicBecause ? `, because ${r.publicBecause.replace(/\.$/, '')}` : ''}`;

  SC.addPanelSection('overview', () => ({
    html: `<div class="sec"><h3>Blueprint</h3>
      <p class="pd">Planned${BP.source ? ` from <b>${h(BP.source)}</b>` : ''}, not built yet. Every dashed card is a part the system would need.${SC.exported ? '' : ` Pick one and choose <b>Build this with ${h(A.name)}</b> to start on it.`}</p>
      ${BP.stack?.length ? `<div class="tags" style="margin-top:10px">${BP.stack.map((s) => `<span class="tag">${h(s)}</span>`).join('')}</div>` : ''}
      ${BP.assumptions?.length ? `<h3 style="margin-top:14px">Assumptions</h3><ul class="bp-list">${BP.assumptions.map((a) => `<li>${h(a)}</li>`).join('')}</ul>` : ''}
    </div>`,
  }));

  /** The planned files inside an item (a part, a folder or one file). */
  const filesIn = (id) => G.files.filter((f) => id === 'f:' + f.p || SC.chain('f:' + f.p).includes(id));
  function buildPrompt(id) {
    const i = SC.info(id);
    const fl = filesIn(id);
    const paths = new Set(fl.map((f) => 'f:' + f.p));
    const eps = SC.routes.filter((r) => paths.has('f:' + r.f));
    const deps = new Map();
    for (const l of G.links) {
      if (!paths.has(l.a) || paths.has(l.b)) continue;
      const o = SC.info(l.b);
      if (o) deps.set(l.b, `${o.name}${l.b.startsWith('f:') ? ` (${l.b.slice(2)})` : ''}`);
    }
    // open questions from the PRD that touch this part
    const inside = (x) => x === id || paths.has(x) || (x.startsWith('r:') && paths.has('f:' + SC.routes[+x.slice(2)]?.f)) || (SC.exists(x) && SC.chain(x).includes(id));
    const questions = (G.health?.issues || []).filter((q) => q.kind === 'question' && (q.items || []).some(inside)).map((q) => q.title);
    return [
      `Build "${i.name}" from the ${G.project.name} blueprint: floorplan/plan.json and floorplan/architecture.json${BP.source ? `, planned from ${BP.source}` : ''}.`,
      i.desc ? `\nWhat it's for: ${i.desc}` : '',
      BP.stack?.length ? `\nStack: ${BP.stack.join('; ')}.` : '',
      `\nFiles to create:`,
      ...fl.map((f) => `- ${f.p}: ${f.name}${f.d ? `. ${f.d}` : ''}`),
      eps.length ? `\nEndpoints to create (keep the method, path and who may use them exactly as planned):` : '',
      ...eps.map((r) => `- ${r.m} ${r.p} (${whoMay(r)}): ${r.name}${r.d ? `. ${r.d}` : ''}`),
      deps.size ? `\nIt relies on: ${[...deps.values()].join('; ')}.` : '',
      questions.length ? `\nStill undecided (ask me before building what depends on it):\n${questions.map((q) => `- ${q}`).join('\n')}` : '',
      `\nBefore writing code, read these parts of plan.json, and check which of the things it relies on exist yet; if some don't, tell me and suggest what to build first. Keep the plan's file paths and names. If the plan looks wrong or incomplete for this part, tell me before changing it. When it's done, run it or its tests and tell me how to try it.`,
    ].filter((x) => x !== '').join('\n');
  }

  SC.addPanelSection('item', (id) => {
    if (!id || typeof id !== 'string') return '';
    // an endpoint: who the plan lets use it
    if (id.startsWith('r:')) {
      const r = SC.routes[+id.slice(2)];
      if (!r) return '';
      const text = !r.access ? `Not decided yet.${SC.graph.health ? ' The design review lists it.' : ''}` : `${Cap(r.access === 'signed-in' && r.who ? r.who : ACCESS[r.access] || r.access)}.${r.publicBecause ? ` Open on purpose: ${r.publicBecause}` : ''}`;
      return `<div class="sec"><h3>Who may use it</h3><p class="pd">${h(text)}</p></div>`;
    }
    const i = SC.info(id);
    if (SC.exported || !i || (i.type === 'node' && i.n.kind === 'external') || !filesIn(id).length) return '';
    return {
      html: `<div class="sec"><h3>Build it</h3><p class="pd">A ready request for ${h(A.app)} to build ${i.type === 'file' ? 'this file' : 'this part'} the way the plan describes.</p>
        <div class="actions"><button class="btn soft" data-bp-build>${SC.iconI('spark')}Build this with ${h(A.name)}</button></div></div>`,
      bind: (el) => el.querySelector('[data-bp-build]')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const prompt = buildPrompt(id);
        SC.modal({
          title: `Build this with ${A.name}`,
          html: `<p class="hc-hint">Copy this request and paste it into <b>${h(A.app)}</b>, opened in your project folder.</p><pre>${h(prompt)}</pre>`,
          actions: [{ label: 'Copy prompt', primary: true, icon: 'copy', onClick: () => { SC.copy(prompt); SC.toast(`Copied. Paste it into ${A.app}.`); } }],
        });
      }),
    };
  });
})();

`


# assets/ui/10-glossary.js

`javascript
// floorplan glossary: explains the technical words a non-developer meets on the map.
// The first time a known term appears in a description (details panel, board title area), it gets a
// dotted underline; hovering or focusing it shows a one-sentence explanation. Off while
// "Show technical detail" is on. Talks to the viewer only through window.Floorplan.
(() => {
  const SC = window.Floorplan;
  if (!SC) return;

  // [display name, plain explanation, aliases...]. Aliases are matched as whole words, ignoring case,
  // except those marked with a leading "=" (matched exactly, so "REST" doesn't fire on "the rest").
  const TERMS = [
    ['API', 'The way programs talk to each other: one asks for something (prices, an order) and the other answers.', 'API', 'APIs', 'API client'],
    ['Endpoint', 'One specific request the app can receive, like "mark this order shipped"; each has its own web address.', 'endpoint', 'endpoints'],
    ['Webhook', 'A message another service sends your app automatically when something happens there, like "a payment went through".', 'webhook', 'webhooks'],
    ['Server', 'A computer in the cloud that runs your app\'s behind-the-scenes work and answers requests from the screens.', 'server', 'servers', 'main server'],
    ['Frontend', 'The part of the app people see and click: the screens, buttons and forms in the browser.', 'frontend', 'front end', 'front-end'],
    ['Backend', 'The behind-the-scenes part of the app that stores the records, applies the rules and talks to other services.', 'backend', 'back end', 'back-end'],
    ['Database', 'Where the app keeps its records (products, orders, customers) so nothing is lost when it restarts.', 'database', 'databases', 'DB'],
    ['Record', 'One saved entry in the database, like a single order or customer; a table is the list of all records of one kind.', 'database record', 'database records', 'database table', 'database tables'],
    ['Model', 'In code, a model describes how one kind of record (an order, a customer) is stored in the database.', 'model', 'models', 'ORM', 'ORM model', 'ORM models', 'data model'],
    ['Query', 'A question the app asks the database, like "all orders from today that haven\'t shipped".', 'query', 'queries'],
    ['Queue', 'A waiting line of tasks; work is dropped in and handled one by one in the background so nothing gets lost.', 'queue', 'queues', 'queued', 'outbox', 'message queue'],
    ['Background job', 'A task that runs on its own behind the scenes, so people don\'t have to wait for it on screen.', 'background job', 'background jobs', 'background task', 'background tasks', 'worker', 'workers'],
    ['Scheduled job', 'A task that runs automatically on a timetable, like every hour or every night.', 'cron', 'cron job', 'cron jobs', 'scheduled job', 'scheduled jobs', 'scheduler'],
    ['Environment variable', 'A setting stored outside the code, such as which database or account to use, so it can differ between test and live.', 'environment variable', 'environment variables', 'env var', 'env vars', '.env'],
    ['Secret', 'A password or key the app uses to sign in to another service; it must never be shared or put in the code.', 'secret', 'secrets', 'API key', 'API keys', 'credentials'],
    ['Deploy', 'Putting a new version of the app live so people start using it.', 'deploy', 'deploys', 'deployed', 'deployment', 'deployments'],
    ['Migration', 'A one-time change to how records are stored, like adding a new field to every order.', 'migration', 'migrations'],
    ['Cache', 'A saved copy of something kept close by so it loads faster instead of being worked out again.', 'cache', 'cached', 'caching'],
    ['Sign-in', 'Checking who someone is (usually with a password) before letting them in.', 'auth', 'authentication', 'login', 'log in', 'sign-in', 'sign in'],
    ['Permissions', 'The rules for who is allowed to do what, like only managers issuing refunds.', 'permissions', 'authorization', 'roles', 'RBAC'],
    ['Session', 'How the app remembers you are signed in, so you don\'t have to type your password on every screen.', 'session', 'sessions'],
    ['Token', 'A temporary digital pass the app hands out after sign-in and checks on every request.', 'token', 'tokens', 'bearer token', 'access token'],
    ['SDK', 'A ready-made kit of code a company provides so apps can talk to its service more easily.', 'SDK', 'SDKs'],
    ['Repository', 'The folder that holds all of a project\'s code and its full history of changes.', 'repository', 'repositories', 'repo', 'repos'],
    ['Component', 'A reusable building block of the screens, like a button, a table or a whole product editor.', 'component', 'components'],
    ['Route', 'A web address the app answers: on the screens it\'s a page, on the server it\'s a kind of request.', 'route', 'routes', 'routing', 'App Router'],
    ['Request', 'A message asking the server to do or fetch something; the server sends back a response with the result.', 'request', 'requests', 'response', 'responses'],
    ['JSON', 'A simple text format programs use to send data to each other, like a labelled list.', 'JSON'],
    ['REST', 'A common style for building APIs, where each web address stands for a kind of thing (orders, products).', '=REST', '=RESTful'],
    ['HTTP method', 'The kind of request: GET reads something, POST creates, PUT or PATCH changes, DELETE removes.', 'HTTP method', 'HTTP methods', '=GET', '=POST', '=PUT', '=PATCH', '=DELETE'],
    ['HTTP', 'The language browsers and servers use to talk over the web; HTTPS is the encrypted version.', 'HTTP', 'HTTPS'],
    ['CDN', 'A network of servers around the world that delivers images and files quickly from somewhere near the visitor.', 'CDN', 'CDNs'],
    ['Storage bucket', 'Cloud file storage for things like product images, uploads and exports.', 'storage bucket', 'bucket', 'buckets', 'S3', 'GCS', 'Cloud Storage'],
    ['Pub/Sub', 'Google\'s message service: one part of the app posts an event and others pick it up to handle in the background.', 'Pub/Sub', 'PubSub'],
    ['MCP', 'A standard way to connect AI assistants (like Antigravity or Gemini) to an app so they can look things up in it.', 'MCP', 'MCP server', 'Model Context Protocol'],
    ['Next.js', 'A popular toolkit for building websites and web apps with React.', 'Next.js', 'NextJS'],
    ['React', 'A popular library for building interactive screens out of reusable pieces.', '=React'],
    ['Flask', 'A Python toolkit for building web servers.', 'Flask'],
    ['SQLAlchemy', 'A Python toolkit that lets the code read and save database records without writing raw database commands.', 'SQLAlchemy'],
    ['Postgres', 'A widely used database; RDS and Cloud SQL are Amazon\'s and Google\'s hosted versions of it.', 'Postgres', 'PostgreSQL', 'RDS', 'Cloud SQL'],
    ['Docker', 'A way to package an app with everything it needs so it runs the same on any computer or cloud.', 'Docker', 'container', 'containers'],
    ['Cloud Run', 'Google\'s service for running an app\'s servers and background jobs in the cloud without managing machines.', 'Cloud Run'],
    ['Middleware', 'A check every request passes through on its way in, such as "is this person signed in?".', 'middleware'],
    ['Blueprint', 'In Flask, a group of related requests bundled together, like all the order requests.', 'blueprint', 'blueprints'],
    ['Tests', 'Automatic checks that the code still does what it should, run before changes go live.', 'test suite', 'unit test', 'unit tests', 'pytest', 'Vitest'],
    ['Script', 'A small program run by hand for a one-off job, like fixing or importing data.', 'script', 'scripts'],
    ['OAuth', 'The standard behind "Sign in with…" buttons: it lets one app use another on your behalf without sharing your password.', 'OAuth'],
  ];

  const exact = new Map(), loose = new Map(), alts = [];
  TERMS.forEach(([name, text, ...aliases], i) => {
    for (let a of aliases) {
      const strict = a.startsWith('=');
      if (strict) a = a.slice(1);
      (strict ? exact : loose).set(strict ? a : a.toLowerCase(), i);
      alts.push(a);
    }
  });
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  alts.sort((a, b) => b.length - a.length);
  const RE = new RegExp(`(?<![\\w./-])(?:${alts.map(esc).join('|')})(?![\\w/]|-\\w|\\.\\w)`, 'gi');
  const termOf = (m) => exact.has(m) ? exact.get(m) : loose.has(m.toLowerCase()) ? loose.get(m.toLowerCase()) : -1;

  // Where to look, and what to leave alone.
  const TARGETS = '.pd, .rd, .callout';
  const SKIP = 'a[href], button, code, pre, kbd, samp, input, textarea, select, [contenteditable], .tag, .rp, .pp, .method, .kbd, .sc-term, [data-noglossary]';
  const CLICKABLE = 'a, [data-go], [data-sel], [data-flow], [data-open], [role="button"]';
  const isMono = (el) => /mono|monospace/i.test(el.style?.fontFamily || '');

  function annotate(scope, targets) {
    if (!scope || SC.technical()) return;
    const used = new Set([...scope.querySelectorAll('.sc-term')].map((s) => +s.dataset.term)); // max one per term per scope
    const skipped = (from, stop) => { for (let p = from; p && p !== stop; p = p.parentElement) if (p.matches(SKIP) || isMono(p)) return true; return false; };
    for (const el of targets) {
      if (skipped(el, scope)) continue;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (t) => !t.nodeValue.trim() || skipped(t.parentElement, el) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      const texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);
      for (const t of texts) wrapIn(t, used);
    }
  }
  function wrapIn(textNode, used) {
    let node = textNode;
    while (node) {
      RE.lastIndex = 0;
      let m, hit = null;
      while ((m = RE.exec(node.nodeValue))) {
        const i = termOf(m[0]);
        if (i >= 0 && !used.has(i)) { hit = { m, i }; break; }
      }
      if (!hit) return;
      used.add(hit.i);
      const word = node.splitText(hit.m.index);
      const rest = word.splitText(hit.m[0].length);
      const span = document.createElement('span');
      span.className = 'sc-term';
      span.dataset.term = String(hit.i);
      if (!word.parentElement.closest(CLICKABLE)) span.tabIndex = 0; // inside clickable rows: hover only, clicks pass through
      word.replaceWith(span);
      span.appendChild(word);
      node = rest;
    }
  }
  function strip(scope) {
    if (!scope) return;
    for (const s of scope.querySelectorAll('.sc-term')) s.replaceWith(...s.childNodes);
    scope.normalize();
  }

  const panelEl = () => document.getElementById('panel');
  const contextEl = () => document.getElementById('context');
  const doPanel = () => { const p = panelEl(); if (p) annotate(p, p.querySelectorAll(TARGETS)); };
  const doContext = () => { const c = contextEl(); if (c) annotate(c, c.querySelectorAll('p, .callout')); };

  // Run after the viewer and any other extension listeners have finished filling the DOM.
  SC.on('panel', () => { hide(true); queueMicrotask(doPanel); });
  SC.on('render', () => { hide(true); queueMicrotask(doContext); });
  SC.on('technical', (on) => {
    hide(true);
    if (on) { strip(panelEl()); strip(contextEl()); }
    else { queueMicrotask(() => { strip(panelEl()); strip(contextEl()); doPanel(); doContext(); }); }
  });

  // ---------- popover ----------
  const style = document.createElement('style');
  style.textContent = `
.sc-term { pointer-events: auto; cursor: help; border-radius: 4px; text-decoration-line: underline; text-decoration-style: dotted; text-decoration-thickness: 1px; text-underline-offset: 3px;
  text-decoration-color: rgba(var(--ink), .32); text-decoration-color: color-mix(in srgb, currentColor 45%, transparent); transition: text-decoration-color .2s var(--ease), color .2s var(--ease); }
.sc-term:hover, .sc-term.on { text-decoration-color: currentColor; color: var(--text); }
.callout .sc-term:hover, .callout .sc-term.on { color: inherit; }
.sc-term:focus { outline: none; }
.sc-term:focus-visible { box-shadow: 0 0 0 2px var(--focus); }
#sc-gloss { position: fixed; left: 0; top: 0; z-index: 55; max-width: 280px; padding: 11px 13px; border-radius: 14px; font-size: 12.5px; line-height: 1.5; color: var(--text-2);
  pointer-events: none; opacity: 0; transform: translateY(3px); transition: opacity .15s var(--ease), transform .25s var(--ease); }
#sc-gloss.on { opacity: 1; transform: none; }
#sc-gloss b { display: block; color: var(--text); font-weight: 600; margin-bottom: 2px; }`;
  document.head.appendChild(style);

  const pop = document.createElement('div');
  pop.id = 'sc-gloss';
  pop.className = 'glass';
  pop.setAttribute('role', 'tooltip');
  document.body.appendChild(pop);

  let current = null, showT = 0, hideT = 0;
  function show(el) {
    clearTimeout(hideT);
    if (current === el) return;
    const term = TERMS[+el.dataset.term];
    if (!term) return;
    current?.classList.remove('on'); current?.removeAttribute('aria-describedby');
    current = el;
    el.classList.add('on');
    el.setAttribute('aria-describedby', 'sc-gloss');
    pop.innerHTML = `<b>${SC.h(term[0])}</b>${SC.h(term[1])}`;
    const r = el.getClientRects()[0] || el.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 8;
    const x = Math.max(12, Math.min(r.left, innerWidth - pw - 12));
    const below = r.bottom + gap + ph <= innerHeight - 12;
    const y = below ? r.bottom + gap : Math.max(12, r.top - gap - ph);
    pop.style.left = `${Math.round(x)}px`;
    pop.style.top = `${Math.round(y)}px`;
    pop.classList.add('on');
  }
  function hide(now) {
    clearTimeout(showT); clearTimeout(hideT);
    const go = () => { pop.classList.remove('on'); current?.classList.remove('on'); current?.removeAttribute('aria-describedby'); current = null; };
    if (now === true) go(); else hideT = setTimeout(go, 90);
  }
  const termAt = (ev) => ev.target instanceof Element ? ev.target.closest('.sc-term') : null;
  document.addEventListener('mouseover', (ev) => { const t = termAt(ev); if (!t) return; clearTimeout(showT); showT = setTimeout(() => show(t), current ? 0 : 140); });
  document.addEventListener('mouseout', (ev) => { const t = termAt(ev); if (t && !t.contains(ev.relatedTarget)) { clearTimeout(showT); hide(); } });
  document.addEventListener('focusin', (ev) => { const t = termAt(ev); if (t) show(t); });
  document.addEventListener('focusout', (ev) => { if (termAt(ev)) hide(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && current) hide(true); });
  document.addEventListener('scroll', () => { if (current) hide(true); }, true);
  addEventListener('resize', () => { if (current) hide(true); });

  // initial pass, in case the first render/panel happened before this script ran
  if (document.readyState !== 'loading') queueMicrotask(() => { doPanel(); doContext(); });
})();

`


# assets/ui/20-health.js

`javascript
// Health check panel: plain-language warnings from graph.health (lib/health.mjs) — leaked keys,
// endpoints anyone can call, unused and oversized files — each with "Show on map" and a ready
// prompt to paste into Antigravity. Talks to the viewer only through window.Floorplan.
(() => {
  const SC = window.Floorplan;
  // an exported copy without Health leaves the button out: an empty list would read as "all clear"
  if (!SC || (SC.exported && !SC.graph.health)) return;
  const { h } = SC;
  const A = SC.agent || { name: 'Antigravity', app: 'Antigravity IDE' };
  const issues = (SC.graph.health && SC.graph.health.issues) || [];
  // a blueprint (planned, not built) gets a design review of the plan instead of a code check
  const PLAN = !!SC.graph.meta.blueprint;
  const FIX = PLAN ? 'Resolve' : 'Fix';
  const CHECK = PLAN ? 'design review' : 'health check';
  const ISSUES_URL = 'https://github.com/haydenschmitty/floorplan/issues/new';

  // ---------- "not a problem" ----------
  // Saved by serve.mjs to floorplan/health-dismissed.json (build folds it into graph.health.dismissed);
  // a map opened without the server keeps them in this browser. A dismissal covers the issue as it was: it
  // shows again if it gets more or less serious or finds something new in a file (counted per file, so an
  // edit higher up doesn't bring it back; the same rule as dismissalFor in lib/health.mjs).
  const SERVER = window.FLOORPLAN_SERVER;
  const STORE_KEY = 'health-dismissed:' + (SC.graph.meta.rootName || '');
  const built = (SC.graph.health && SC.graph.health.dismissed) || [];
  let dismissed = SC.exported || SERVER ? built : SC.store.get(STORE_KEY, built);
  const locsOf = (issue) => (issue.locations || []).map((l) => `${l.file}:${l.line}`);
  const dismissalOf = (issue) => {
    const d = dismissed.find((x) => x.id === issue.id);
    if (!d || (d.severity && d.severity !== issue.severity)) return null;
    const left = new Map();
    for (const loc of d.locations || []) { const f = String(loc).replace(/:[^:]*$/, ''); left.set(f, (left.get(f) || 0) + 1); }
    for (const l of issue.locations || []) { const n = left.get(l.file) || 0; if (!n) return null; left.set(l.file, n - 1); }
    return d;
  };
  const canDismiss = !SC.exported;
  async function saveDismissal(issue, reason) {
    const rec = { id: issue.id, severity: issue.severity, locations: locsOf(issue), ...(reason ? { reason } : {}) };
    if (SERVER) {
      const r = await fetch('/api/health/dismissed', { method: 'POST', headers: { 'content-type': 'application/json', 'x-floorplan-token': SERVER.token }, body: JSON.stringify(rec) }).then((x) => x.json()).catch(() => null);
      if (!r) { SC.toast('Couldn’t reach the map server, so this wasn’t saved.'); return false; }
      dismissed = r.dismissed;
    } else {
      dismissed = [...dismissed.filter((x) => x.id !== issue.id), { ...rec, at: new Date().toISOString() }];
      SC.store.set(STORE_KEY, dismissed);
    }
    return true;
  }
  async function undoDismissal(issue) {
    if (SERVER) {
      const r = await fetch('/api/health/dismissed', { method: 'DELETE', headers: { 'content-type': 'application/json', 'x-floorplan-token': SERVER.token }, body: JSON.stringify({ id: issue.id }) }).then((x) => x.json()).catch(() => null);
      if (!r) { SC.toast('Couldn’t reach the map server.'); return; }
      dismissed = r.dismissed;
    } else {
      dismissed = dismissed.filter((x) => x.id !== issue.id);
      SC.store.set(STORE_KEY, dismissed);
    }
    refresh();
  }

  const SEV = {
    high: { color: 'var(--sev-high)', group: 'Fix these first', word: 'important' },
    medium: { color: 'var(--sev-medium)', group: 'Worth fixing soon', word: 'worth fixing' },
    low: { color: 'var(--sev-low)', group: 'Good to tidy up', word: 'minor' },
  };
  const ORDER = ['high', 'medium', 'low'];
  const active = () => issues.filter((i) => !dismissalOf(i));
  const count = (sev) => active().filter((i) => i.severity === sev).length;
  const urgent = () => count('high') + count('medium');

  SC.icons.health = '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>';
  SC.icons.check = '<path d="m5 12.5 4.5 4.5L19 7.5"/>';

  const style = document.createElement('style');
  style.textContent = `
    .hc-issue { padding: 12px 14px; border-radius: 16px; background: rgba(var(--ink), .04); margin-bottom: 8px; }
    .hc-issue:last-child { margin-bottom: 0; }
    .hc-issue.off { background: none; box-shadow: inset 0 0 0 1px rgba(var(--ink), .08); }
    .hc-issue.off .hc-t { color: var(--text-2); }
    .hc-t { display: flex; gap: 9px; align-items: flex-start; font-weight: 500; line-height: 1.4; }
    .hc-t .dot { margin-top: 6px; }
    .hc-d { color: var(--text-2); font-size: 12.5px; line-height: 1.55; margin: 6px 0 0 17px; }
    .hc-n { color: var(--text-3); font-size: 12.5px; line-height: 1.45; margin: 4px 0 0 17px; }
    .hc-w { font-family: var(--mono); font-size: 11px; color: var(--text-3); margin: 6px 0 0 17px; word-break: break-all; line-height: 1.5; }
    .hc-a { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0 0 17px; }
    .hc-a .btn { height: 30px; padding: 0 12px; font-size: 12.5px; gap: 6px; }
    .hc-a .btn svg.i { width: 14px; height: 14px; }
    .hc-calm { margin-top: 14px; padding: 11px 13px; border-radius: 14px; background: var(--ok-bg); color: var(--ok-text); font-size: 13px; line-height: 1.55; }
    .hc-sub { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 12px; font-size: 12px; color: var(--text-2); }
    .hc-sub span { display: inline-flex; align-items: center; gap: 6px; }
    #btn-health .badge { background: var(--hc-badge, var(--on)); color: var(--hc-badge-text, var(--on-text)); }
    #btn-health.calm svg.i { color: var(--ok); }
    #modal .hc-hint { margin: 0; }
    #modal .hc-hint b { color: var(--text); font-weight: 500; }
    #modal .hc-why { width: 100%; min-height: 72px; resize: vertical; margin-top: 12px; background: rgba(var(--ink), .05); border: 0; border-radius: 14px; padding: 11px 13px; color: var(--text); outline: none; font: inherit; font-size: 13px; line-height: 1.5; box-sizing: border-box; }
    #modal .hc-why:focus { background: rgba(var(--ink), .07); box-shadow: 0 0 0 1px rgba(var(--ink), .14); }
    #modal .hc-rep { display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; font-size: 13px; line-height: 1.5; color: var(--text-2); cursor: pointer; }
    #modal .hc-rep input { margin-top: 3px; }
    #modal .hc-prev { margin-top: 8px; display: none; }
    #modal .hc-prev.on { display: block; }
  `;
  document.head.appendChild(style);

  // ---------- actions ----------
  let isOpen = false, openedAt = null;
  const where = () => JSON.stringify([SC.state.selected, SC.state.container]);
  function closeList() { isOpen = false; SC.closePanel(); }
  function showOnMap(issue) {
    const items = (issue.items || []).filter((id) => SC.exists(id)).map((id) => ({ id, note: (issue.notes && issue.notes[id]) || '' }));
    if (!items.length) { SC.toast(`This one isn’t on the map. Use “${FIX} with ${A.name}” instead.`); return; }
    if (isOpen) closeList();
    SC.showBoard({ title: issue.title, question: issue.detail, items });
  }
  // a served blueprint settles review items on the map: the request goes into the Ask bar's Change mode,
  // for the person to finish (an open question needs their answer) or edit, then send
  const here = (issue) => PLAN && !!issue.change && !!SC.canChange?.();
  function resolveHere(issue) {
    if (isOpen) closeList();
    if (!SC.draftChange(issue.change)) { fixWith(issue); return; }
    SC.toast(issue.kind === 'question' ? 'Type your answer, then press Enter' : 'Edit the request if you like, then press Enter');
  }
  function fixWith(issue) {
    SC.modal({
      title: `${FIX} with ${A.name}`,
      html: `<p class="hc-hint">Copy this request and paste it into <b>${A.app}</b>, opened in your project folder. It explains what to change and asks before anything risky.</p><pre>${h(issue.fix)}</pre>`,
      actions: [{ label: 'Copy prompt', primary: true, icon: 'copy', onClick: () => { SC.copy(issue.fix); SC.toast(`Copied. Paste it into ${A.app}.`); } }],
    });
  }
  // The report is a GitHub issue the person reads and sends themselves: which check fired, its title (which
  // can name a file or endpoint), the kinds of files involved and their note. Never code, values or the fix prompt.
  const reportText = (issue, reason) => [
    `**Check:** ${issue.kind} (${issue.severity})`,
    `**What Floorplan said:** ${issue.title}`,
    `**File types:** ${[...new Set((issue.locations || []).map((l) => (/\.[^./]+$/.exec(l.file) || [l.file.split('/').pop()])[0]))].slice(0, 6).join(', ') || 'none'}`,
    ``,
    `**Why it's not a problem:**`,
    reason.slice(0, 1500) || '_(no note)_',
  ].join('\n');
  function notAProblem(issue) {
    const m = SC.modal({
      title: 'Not a problem?',
      html: `<p class="hc-hint">Mark “${h(issue.title)}” as a false alarm and it moves to the bottom of the ${CHECK}, out of the count. It comes back if this check finds something new there.</p>
        <textarea class="hc-why" placeholder="Why not? (optional) e.g. that value is a bcrypt hash, not the password" spellcheck="true"></textarea>
        <label class="hc-rep"><input type="checkbox" class="hc-rep-on"><span>Also tell the Floorplan developer, so the check gets better. This opens a GitHub issue you can read and edit before sending. It includes only what’s shown below, never your code or any values.</span></label>
        <pre class="hc-prev"></pre>`,
      actions: [{ label: 'Mark as not a problem', primary: true, icon: 'check', keepOpen: true, onClick: async (close) => {
        const reason = m.el.querySelector('.hc-why').value.trim();
        const report = m.el.querySelector('.hc-rep-on').checked;
        if (report) window.open(`${ISSUES_URL}?title=${encodeURIComponent(`False positive: ${issue.kind}`)}&body=${encodeURIComponent(reportText(issue, reason))}`, '_blank', 'noopener');
        if (!(await saveDismissal(issue, reason))) return;
        close();
        refresh();
        SC.toast(report ? 'Marked as not a problem. Thanks for the report.' : 'Marked as not a problem.');
      } }],
    });
    const why = m.el.querySelector('.hc-why'), on = m.el.querySelector('.hc-rep-on'), prev = m.el.querySelector('.hc-prev');
    const sync = () => { prev.classList.toggle('on', on.checked); prev.textContent = reportText(issue, why.value.trim()); };
    why.addEventListener('input', sync); on.addEventListener('change', sync);
    why.focus();
  }
  const onMap = (issue) => (issue.items || []).some((id) => SC.exists(id));

  // ---------- html ----------
  const locText = (issue) => {
    const locs = issue.locations || [];
    if (!SC.technical() || !locs.length) return '';
    const shown = locs.slice(0, 3).map((l) => `${l.file}${l.line > 1 ? ':' + l.line : ''}`);
    return `<div class="hc-w">${shown.map(h).join('<br>')}${locs.length > 3 ? `<br>+${locs.length - 3} more` : ''}</div>`;
  };
  const issueHtml = (issue, idx, note) => {
    const d = dismissalOf(issue);
    if (d) return `<div class="hc-issue off">
        <div class="hc-t"><span class="dot" style="background:rgba(var(--ink),.2)"></span><span>${h(issue.title)}</span></div>
        <div class="hc-n">Marked as not a problem${d.reason ? `: ${h(d.reason)}` : ''}</div>
        ${canDismiss ? `<div class="hc-a"><button class="btn soft" data-hc-undo="${idx}">Show again</button></div>` : ''}
      </div>`;
    return `<div class="hc-issue">
      <div class="hc-t"><span class="dot" style="background:${SEV[issue.severity].color}"></span><span>${h(issue.title)}</span></div>
      ${note ? `<div class="hc-n">${h(note)}</div>` : `<div class="hc-d">${h(issue.detail)}</div>`}
      ${locText(issue)}
      <div class="hc-a">
        ${onMap(issue) ? `<button class="btn soft" data-hc-show="${idx}">${SC.iconI('search')}Show on map</button>` : ''}
        ${SC.exported ? '' : here(issue) ? `<button class="btn soft" data-hc-here="${idx}">${SC.iconI('spark')}Resolve on the map</button>` : `<button class="btn soft" data-hc-fix="${idx}">${SC.iconI('spark')}${FIX} with ${A.name}</button>`}
        ${canDismiss ? `<button class="btn soft" data-hc-dismiss="${idx}">${SC.iconI('check')}Not a problem</button>` : ''}
      </div>
    </div>`;
  };
  const bindIssues = (el) => {
    const on = (attr, fn) => el.querySelectorAll(`[data-hc-${attr}]`).forEach((b) => b.addEventListener('click', (ev) => { ev.stopPropagation(); fn(issues[+b.getAttribute(`data-hc-${attr}`)]); }));
    on('show', showOnMap); on('fix', fixWith); on('here', resolveHere); on('dismiss', notAProblem); on('undo', undoDismissal);
  };
  const headline = () => urgent() ? `${SC.plural(urgent(), 'thing')} need${urgent() === 1 ? 's' : ''} attention` : active().length ? 'Nothing urgent' : 'No problems found';
  const breakdown = () => `<div class="hc-sub">${ORDER.filter(count).map((s) => `<span><i class="dot" style="background:${SEV[s].color}"></i>${count(s)} ${SEV[s].word}</span>`).join('')}</div>`;
  const headColor = () => urgent() ? SEV[count('high') ? 'high' : 'medium'].color : 'var(--ok)';

  function listHtml() {
    const live = active(), off = issues.filter(dismissalOf);
    const top = `<div class="sec">
        <div class="ph"><span class="ico" style="--c:${headColor()}">${SC.icon('health')}</span><span class="kindlabel">${PLAN ? 'Design review' : 'Health check'}</span></div>
        <h2 class="pt">${h(headline())}</h2>
        <p class="pd">${PLAN ? 'We checked the plan for parts anyone on the internet could use, decisions the PRD leaves open, and pieces nothing connects to. Settling these now is cheaper than after it’s built.' : 'We looked for keys left in the code or sent to the browser, data and parts of your app anyone on the internet can reach (Supabase tables, Firebase rules, Stripe webhooks, endpoints), leftover files and files too big to edit safely. It’s a quick check, not a security audit.'}</p>
        ${live.length ? breakdown() : `<div class="hc-calm">${off.length ? `Nothing left to look at: you marked ${SC.plural(off.length, 'item')} as not a problem.` : `Nothing stood out.`} This is a quick automatic check, not a full ${PLAN ? 'design' : 'security'} review.</div>`}
        <div class="actions"><button class="btn soft" data-hc-back>${SC.iconI('left')}Back</button></div>
      </div>`;
    const groups = ORDER.map((sev) => {
      const list = issues.map((i, idx) => [i, idx]).filter(([i]) => i.severity === sev && !dismissalOf(i));
      return list.length ? `<div class="sec"><h3>${h(SEV[sev].group)} <span class="c">${list.length}</span></h3>${list.map(([i, idx]) => issueHtml(i, idx)).join('')}</div>` : '';
    }).join('');
    const offHtml = off.length ? `<div class="sec"><h3>Marked as not a problem <span class="c">${off.length}</span></h3>${issues.map((i, idx) => [i, idx]).filter(([i]) => dismissalOf(i)).map(([i, idx]) => issueHtml(i, idx)).join('')}</div>` : '';
    const foot = !live.length ? '' : SC.exported ? `<div class="sec" style="color:var(--text-3);font-size:12px;line-height:1.6">These are automatic hints from when this copy was exported.</div>` : `<div class="sec" style="color:var(--text-3);font-size:12px;line-height:1.6">These are automatic hints. ${live.some(here)
      ? `“Resolve on the map” puts a request in the Ask bar’s Change mode: finish or edit it, press Enter, and ${A.name} updates the plan and redraws the map. Undo puts it back.`
      : `“${FIX} with ${A.name}” gives you a request to paste into ${A.app}; ${PLAN ? 'it explains the choice and updates the plan once you decide' : 'it checks the code before changing anything'}.`} If one is wrong, “Not a problem” sets it aside.</div>`;
    return top + groups + offHtml + foot;
  }
  function openList() {
    isOpen = true;
    openedAt = where();
    SC.showPanel(listHtml(), (panel) => {
      panel.querySelector('[data-hc-back]')?.addEventListener('click', closeList);
      bindIssues(panel);
    });
  }

  // ---------- chrome ----------
  const btn = SC.addHeaderButton({
    id: 'btn-health', label: PLAN ? 'Review' : 'Health', icon: 'health',
    onClick: () => (isOpen ? closeList() : openList()),
  });
  const badge = document.createElement('span');
  badge.className = 'badge';
  function updateButton() {
    const n = urgent();
    btn.title = `${PLAN ? 'Design review' : 'Health check'}: ${n ? headline() : 'nothing urgent'}`;
    btn.querySelector('svg.i').innerHTML = SC.icons[n ? 'health' : 'check'];
    if (n) {
      badge.textContent = n > 99 ? '99+' : String(n);
      btn.style.setProperty('--hc-badge', count('high') ? SEV.high.color : SEV.medium.color);
      btn.style.setProperty('--hc-badge-text', 'var(--on-sev-text)');
      btn.appendChild(badge);
    } else badge.remove();
    btn.classList.toggle('calm', !n);
    btn.setAttribute('aria-label', btn.title); // keeps its name, with the count, when only the icon shows
  }
  function refresh() {
    updateButton();
    if (isOpen) openList(); else SC.refreshPanel();
  }
  updateButton();
  // the server's list is the saved one: it may have changed since this map was built
  if (SERVER && canDismiss) fetch('/api/health/dismissed', { headers: { 'x-floorplan-token': SERVER.token } }).then((r) => r.json()).then((r) => { if (Array.isArray(r.dismissed)) { dismissed = r.dismissed; refresh(); } }).catch(() => {});

  // Selecting something else on the map while the list is open shows that item instead.
  SC.on('panel', () => { if (isOpen && openedAt && where() !== openedAt) { isOpen = false; SC.closePanel(); } });

  SC.addPanelSection('overview', () => ({
    html: `<div class="sec"><h3>${PLAN ? 'Design review' : 'Health'}</h3><div class="list"><a class="row" data-hc-open>
        <span class="dot" style="background:${headColor()}"></span>
        <span class="rt"><div class="rn">${h(headline())}</div><div class="rd">${active().length ? ORDER.filter(count).map((s) => `${count(s)} ${SEV[s].word}`).join(' · ') : PLAN ? 'Quick automatic check of the plan' : 'Quick automatic check of secrets, open endpoints and leftover files'}</div></span>
        <span class="rc">${SC.iconI('right')}</span></a></div></div>`,
    bind: (el) => el.querySelector('[data-hc-open]')?.addEventListener('click', (ev) => { ev.preventDefault(); openList(); }),
  }));

  SC.addPanelSection('item', (itemId) => {
    if (!itemId || typeof itemId !== 'string' || !issues.length) return '';
    const hits = [];
    issues.forEach((issue, idx) => {
      if (dismissalOf(issue)) return;
      const inside = (issue.items || []).filter((id) => id === itemId || (SC.exists(id) && SC.chain(id).includes(itemId)));
      if (!inside.length) return;
      const exact = issue.notes && inside.includes(itemId) ? issue.notes[itemId] : '';
      hits.push(issueHtml(issue, idx, exact || (inside.length > 1 || inside[0] !== itemId ? `Affects ${SC.plural(inside.length, 'place')} in here` : '')));
    });
    if (!hits.length) return '';
    return { html: `<div class="sec"><h3>${PLAN ? 'Design review' : 'Health'} <span class="c">${hits.length}</span></h3>${hits.slice(0, 6).join('')}${hits.length > 6 ? `<div class="more" data-hc-open style="cursor:pointer">+${hits.length - 6} more in the ${CHECK}</div>` : ''}</div>`, bind: (el) => { bindIssues(el); el.querySelector('[data-hc-open]')?.addEventListener('click', openList); } };
  });
})();

`


# assets/ui/25-recent.js

`javascript
// Recent work: what was just changed (graph.recent, from floorplan/recent-work.json), framed against
// what the user asked for. Cards carry the green tag and hover note (core viewer); this adds the header
// button that lays the changed cards out on one board, and the panel sections. Talks to the viewer only
// through window.Floorplan.
(() => {
  const SC = window.Floorplan;
  const R = SC && SC.graph.recent;
  if (!R || !R.items || !R.items.length) return;
  const { h } = SC;
  const tasks = R.tasks || [];
  const items = R.items.filter((it) => SC.exists(it.id));
  if (!items.length) return;

  SC.icons.recent = '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>';

  const style = document.createElement('style');
  style.textContent = `
    #btn-recent svg.i { color: var(--recent); }
    #btn-recent .badge { background: var(--recent); color: var(--on-recent-text); }
    .rw-task { padding: 12px 14px; border-radius: 16px; background: color-mix(in srgb, var(--recent) 6%, transparent); margin-bottom: 8px; }
    .rw-task:last-child { margin-bottom: 0; }
    .rw-tt { display: flex; gap: 9px; align-items: center; font-weight: 600; line-height: 1.4; }
    .rw-tt::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--recent); flex: none; }
    .rw-q { color: var(--text-3); font-size: 12.5px; line-height: 1.5; margin: 6px 0 0 16px; }
    .rw-q b { color: var(--text-2); font-weight: 500; }
    .rw-s { color: var(--text-2); font-size: 12.5px; line-height: 1.55; margin: 6px 0 0 16px; }
    .rw-a { display: flex; gap: 6px; margin: 10px 0 0 16px; }
    .rw-a .btn { height: 30px; padding: 0 12px; font-size: 12.5px; gap: 6px; }
    .rw-note { margin-top: 10px; padding: 10px 12px; border-radius: 14px; background: color-mix(in srgb, var(--recent) 9%, transparent); font-size: 13px; line-height: 1.55; }
    .rw-note .rw-h { color: var(--recent); font-size: 11.5px; font-weight: 600; margin-bottom: 3px; }
    .rw-when { color: var(--text-3); font-size: 12px; margin-top: 4px; }
  `;
  document.head.appendChild(style);

  const ago = (iso) => {
    const t = Date.parse(iso); if (!t) return '';
    const m = Math.round((Date.now() - t) / 60000);
    return m < 2 ? 'just now' : m < 60 ? `${m} minutes ago` : m < 48 * 60 ? `${Math.round(m / 60)} hours ago` : `${Math.round(m / 1440)} days ago`;
  };
  const itemsOf = (ti) => items.filter((it) => ti == null || it.task === ti);

  /** One board with just the changed cards (and how they connect), each with its note. */
  function showRecent(ti) {
    const one = ti != null ? tasks[ti] : tasks.length === 1 ? tasks[0] : null;
    SC.showBoard({
      kind: 'Recent work', icon: 'recent',
      title: one ? one.title : 'Recent work',
      question: one ? (one.request ? `You asked: ${one.request}` : '') : tasks.map((t) => t.title).join(' · '),
      answer: one ? one.summary : tasks.map((t) => `**${t.title}.** ${t.summary}`).join('\n\n'),
      items: itemsOf(ti != null ? ti : null).map((it) => ({ id: it.id, note: it.note || (it.change === 'new' ? 'New' : 'Changed') })),
    });
  }

  const btn = SC.addHeaderButton({ id: 'btn-recent', label: 'Recent work', icon: 'recent', title: 'What was just worked on, on one board', onClick: () => showRecent() });
  const b = document.createElement('span');
  b.className = 'badge';
  b.textContent = String(items.length);
  btn.appendChild(b);

  // codebase panel: each task, what was asked, what was done, and a way to see its cards
  SC.addPanelSection('overview', () => ({
    top: true,
    html: `<div class="sec"><h3>Recent work <span class="c">${items.length}</span></h3>${R.updatedAt ? `<div class="rw-when">Updated ${h(ago(R.updatedAt))}</div>` : ''}<div style="margin-top:10px">${tasks.map((t, i) => itemsOf(i).length ? `
      <div class="rw-task"><div class="rw-tt">${h(t.title)}</div>
        ${t.request ? `<div class="rw-q"><b>You asked:</b> ${h(t.request)}</div>` : ''}
        ${t.summary ? `<div class="rw-s">${h(t.summary)}</div>` : ''}
        <div class="rw-a"><button class="btn soft" data-rw="${i}">${SC.iconI('recent')}Show ${SC.plural(itemsOf(i).length, 'card')}</button></div></div>` : '').join('')}</div></div>`,
    bind: (el) => el.querySelectorAll('[data-rw]').forEach((x) => x.addEventListener('click', () => showRecent(+x.dataset.rw))),
  }));

  // a selected card that changed: the full note, and which request it was for. A part that
  // contains changes: what changed inside it, each a click away.
  SC.addPanelSection('item', (id) => {
    const key = id.startsWith('m:') ? 'f:' + id.slice(2) : id;
    const mine = items.filter((it) => it.id === key);
    const inside = items.filter((it) => it.id !== key && SC.chain(it.id).includes(key));
    if (!mine.length && !inside.length) return '';
    if (!mine.length) return { top: true, html: `<div class="sec"><h3>Recent work inside <span class="c">${inside.length}</span></h3><div class="list">${inside.map((it) => {
      const i = SC.info(it.id);
      return `<a class="row" data-go="${h(it.id)}"><span class="dot" style="background:var(--recent)"></span><span class="rt"><div class="rn">${h(i.name)}</div>${it.note ? `<div class="rd">${h(it.note)}</div>` : ''}</span></a>`;
    }).join('')}</div></div>` };
    return { top: true, html: `<div class="sec">${mine.map((it) => {
      const t = tasks[it.task] || {};
      return `<div class="rw-note"><div class="rw-h">${it.change === 'new' ? 'New' : 'Changed'} · ${h(t.title || 'Recent work')}</div>${h(it.note || '')}${t.request ? `<div class="rw-q" style="margin:6px 0 0"><b>You asked:</b> ${h(t.request)}</div>` : ''}</div>`;
    }).join('')}</div>` };
  });

  window.FloorplanRecent = { show: showRecent, items, tasks };
})();

`


# assets/ui/30-screens.js

`javascript
// Screens lens: start from a page people recognise ("the checkout page") and see everything behind it:
// the parts on it, the requests it makes, the server code that answers them, the data and outside
// services involved. Data comes from graph.screens (scripts/lib/screens.mjs).
(() => {
  const SC = window.Floorplan;
  if (!SC) return;
  const G = SC.graph;
  // pages that only bounce you elsewhere have nothing behind them worth a board
  const screens = (G.screens || []).filter((s) => s && s.url && Array.isArray(s.behind) && s.behind.length && !(s.behind.length < 2 && /redirect/i.test(`${s.name} ${s.description}`)));
  if (!screens.length) return;
  const { h } = SC;

  const style = document.createElement('style');
  style.textContent = `
#sc-menu { position: fixed; width: 340px; max-height: min(70vh, 580px); overflow: auto; transform-origin: top right; overscroll-behavior: contain; }
#sc-menu .sc-f { position: sticky; top: -6px; margin: -6px -6px 4px; padding: 10px 10px 6px; background: var(--menu-solid); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 1; border-radius: 18px 18px 0 0; }
#sc-menu .sc-f input { width: 100%; height: 34px; border: 0; border-radius: 12px; padding: 0 12px; background: rgba(var(--ink), .06); color: var(--text); outline: none; transition: background .2s var(--ease), box-shadow .2s var(--ease); }
#sc-menu .sc-f input:focus { background: rgba(var(--ink), .08); box-shadow: 0 0 0 1px rgba(var(--ink), .14); }
#sc-menu .sc-g { padding: 10px 12px 4px; font-size: 12px; color: var(--text-3); }
#sc-menu .sc-r { display: block; width: 100%; text-align: left; border: 0; background: none; color: var(--text); padding: 9px 12px; border-radius: 12px; cursor: pointer; transition: background .15s var(--ease); }
#sc-menu .sc-r:hover, #sc-menu .sc-r.on { background: rgba(var(--ink), .07); }
#sc-menu .sc-r b { font-weight: 500; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#sc-menu .sc-r span { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
#sc-menu .sc-none { padding: 14px 12px; color: var(--text-3); font-size: 12.5px; }
`;
  document.head.appendChild(style);

  // ---------- data ----------
  const topLabel = new Map(G.nodes.filter((n) => !n.parent).map((n) => [n.id, n.label]));
  const appName = (id) => topLabel.get(id) || (id === 'unassigned' ? 'Other' : id);
  const byApp = new Map();
  for (const s of screens) { if (!byApp.has(s.app)) byApp.set(s.app, []); byApp.get(s.app).push(s); }
  const byFile = new Map();
  for (const s of screens) { if (!byFile.has(s.file)) byFile.set(s.file, []); byFile.get(s.file).push(s); }
  // which screens each card shows up behind (for "Shown on these screens" in the details panel)
  const usedBy = new Map();
  for (const s of screens) for (const b of s.behind) {
    if (b.kind === 'screen' || b.id === 'f:' + s.file) continue;
    if (!usedBy.has(b.id)) usedBy.set(b.id, []);
    usedBy.get(b.id).push(s);
  }

  function showScreen(s) {
    closeMenu();
    const items = s.behind.filter((b) => SC.exists(b.id));
    // a short walkthrough: the screen → its first request → the server code → where it ends up
    const firstOf = (kind) => items.find((b) => b.kind === kind);
    const steps = [firstOf('screen'), firstOf('request'), firstOf('server'), firstOf('data') || firstOf('outside')].filter(Boolean);
    SC.showBoard({ kind: 'Screen', icon: 'ui', title: s.name, question: 'Everything behind ' + s.url, items, steps: steps.length >= 3 ? steps : [] });
  }

  // ---------- header menu ----------
  const menu = document.createElement('div');
  menu.id = 'sc-menu';
  menu.className = 'menu glass';
  document.body.appendChild(menu);
  let btn = null;
  const many = screens.length > 8;

  function renderList(q = '') {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hit = (s) => !words.length || words.every((w) => `${s.name} ${s.url} ${appName(s.app)}`.toLowerCase().includes(w));
    let html = '', shown = 0;
    for (const [app, list] of byApp) {
      const rows = list.filter(hit);
      if (!rows.length) continue;
      if (byApp.size > 1) html += `<div class="sc-g">${h(appName(app))}</div>`;
      for (const s of rows) html += `<button class="sc-r" data-sc="${h(s.id)}"><b>${h(s.name)}</b><span>${h(s.url)}</span></button>`;
      shown += rows.length;
    }
    if (!shown) html = `<div class="sc-none">No screen matches “${h(q)}”.</div>`;
    const list = menu.querySelector('.sc-l');
    list.innerHTML = html;
    list.querySelectorAll('[data-sc]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); showScreen(screens.find((s) => s.id === b.dataset.sc)); });
    list.querySelector('.sc-r')?.classList.add('on');
  }
  function renderMenu() {
    menu.innerHTML = `${many ? '<div class="sc-f"><input id="sc-q" placeholder="Find a screen…" spellcheck="false" autocomplete="off"></div>' : ''}<div class="sc-l"></div>`;
    renderList('');
    const input = menu.querySelector('#sc-q');
    if (!input) return;
    input.oninput = () => renderList(input.value);
    input.onkeydown = (ev) => {
      const rows = [...menu.querySelectorAll('.sc-r')];
      const cur = rows.findIndex((r) => r.classList.contains('on'));
      if (ev.key === 'Enter' && rows[cur]) { ev.preventDefault(); rows[cur].click(); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        const next = rows[Math.max(0, Math.min(rows.length - 1, cur + (ev.key === 'ArrowDown' ? 1 : -1)))];
        rows.forEach((r) => r.classList.toggle('on', r === next));
        next?.scrollIntoView({ block: 'nearest' });
      }
    };
  }
  function openMenu() {
    document.body.click(); // let the viewer close its own menus (Flows, filters)
    renderMenu();
    place();
    menu.classList.add('open');
    menu.querySelector('#sc-q')?.focus();
  }
  function place() {
    const r = btn.getBoundingClientRect();
    const w = Math.min(340, innerWidth - 16); // never wider than the screen
    menu.style.top = r.bottom + 8 + 'px';
    menu.style.width = w + 'px';
    menu.style.right = Math.min(Math.max(8, innerWidth - r.right), innerWidth - 8 - w) + 'px';
  }
  function closeMenu() { menu.classList.remove('open'); }
  const isOpen = () => menu.classList.contains('open');

  btn = SC.addHeaderButton({ id: 'screens-btn', label: 'Screens', icon: 'ui', title: 'Pick a screen of the app to see everything behind it', onClick: () => (isOpen() ? closeMenu() : openMenu()) });
  window.addEventListener('pointerdown', (ev) => { if (isOpen() && !menu.contains(ev.target) && !btn.contains(ev.target)) closeMenu(); }, true);
  window.addEventListener('keydown', (ev) => {
    if (!isOpen()) return;
    if (ev.key === 'Escape') { ev.stopImmediatePropagation(); ev.preventDefault(); closeMenu(); }
    else if (ev.target?.id !== 'sc-q') ev.stopPropagation(); // keep viewer shortcuts out of the open menu
  }, true);
  window.addEventListener('resize', () => { if (isOpen()) place(); });

  // ---------- details panel ----------
  const row = (s, label) => `<a class="row" data-sc="${h(s.id)}"><span class="dot" style="background:var(--n-ui)"></span><span class="rt"><div class="rn">${h(label || s.name)}</div><div class="rp">${h(s.url)}</div></span></a>`;
  const bindRows = (el) => el?.querySelectorAll('[data-sc]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); showScreen(screens.find((s) => s.id === a.dataset.sc)); }));
  SC.addPanelSection('item', (id) => {
    if (typeof id !== 'string') return null;
    const own = id.startsWith('f:') ? byFile.get(id.slice(2)) || [] : [];
    const on = (usedBy.get(id) || []).filter((s) => !own.includes(s));
    if (!own.length && !on.length) return null;
    let html = '';
    if (own.length) html += `<div class="sec"><h3>This is a screen</h3><div class="list">${own.map((s) => row(s, 'See everything behind this screen')).join('')}</div></div>`;
    if (on.length) html += `<div class="sec"><h3>Behind these screens <span class="c">${on.length}</span></h3><div class="list">${on.slice(0, 8).map((s) => row(s)).join('')}</div></div>`;
    return { html, bind: bindRows };
  });
  SC.addPanelSection('overview', () => ({
    html: `<div class="sec"><h3>Screens <span class="c">${screens.length}</span></h3><div class="list"><a class="row" data-sc-open><span class="dot" style="background:var(--n-ui)"></span><span class="rt"><div class="rn">Start from a screen</div><div class="rd">Pick a page of the app to see the parts on it, the requests it makes and the server code behind them.</div></span></a></div></div>`,
    bind: (el) => el?.querySelector('[data-sc-open]')?.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); openMenu(); }),
  }));

  // other features (the tour) can open a screen's board
  window.FloorplanScreens = { list: screens, show: showScreen, openMenu };
})();

`


# assets/ui/40-tour.js

`javascript
// "Start here": a calm one-minute tour on first open. What the app is, its main parts, the outside
// services it leans on, then one real path traced end to end. Steps come from graph.tour (written
// in architecture.json) or are built from the map itself.
(() => {
  const SC = window.Floorplan;
  if (!SC) return;
  const G = SC.graph;
  const { h } = SC;
  const SEEN = 'tour-seen:' + (G.project?.name || G.meta?.rootName || 'map');

  const style = document.createElement('style');
  style.textContent = `
#tour { position: fixed; left: 16px; bottom: 76px; width: min(360px, calc(100vw - 32px)); padding: 16px 16px 12px 20px; border-radius: var(--r-panel); z-index: 6; animation: tourIn .4s var(--ease); }
#tour[hidden] { display: none; }
#tour .tk { font-size: 12px; color: var(--text-3); margin-bottom: 4px; display: flex; gap: 6px; align-items: center; }
#tour .tk i { width: 3px; height: 3px; border-radius: 50%; background: var(--text-4); }
#tour .tt { font-size: 16px; font-weight: 600; letter-spacing: -.01em; line-height: 1.35; padding-right: 22px; }
#tour .tn { color: var(--text-2); line-height: 1.55; margin-top: 6px; font-size: 13.5px; }
#tour .tip { color: var(--text-3); font-size: 12px; line-height: 1.5; margin-top: 10px; }
#tour .tf { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
#tour .dots { display: flex; gap: 4px; flex: 1; }
#tour .dots i { width: 14px; height: 3px; border-radius: 2px; background: rgba(var(--ink), .12); transition: background .3s var(--ease); }
#tour .dots i.on { background: var(--on); }
#tour .tf .btn { height: 32px; }
#tour .tf .btn.icon { width: 32px; }
#tour .tx { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; }
@keyframes tourIn { from { opacity: 0; transform: translateY(8px) scale(.98); } }
`;
  document.head.appendChild(style);

  // ---------- steps ----------
  const clip = (s, max = 230) => {
    s = String(s || '').trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
  };
  const listOf = (names) => names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  const tops = G.nodes.filter((n) => !n.parent && n.id !== 'unassigned');
  const bySize = (a, b) => (b.stats?.files || 0) - (a.stats?.files || 0);
  const screensOf = (id) => (G.screens || []).filter((s) => s.app === id).length;

  function flowStep() {
    const f = (G.flows || []).find((x) => !x.custom) || (G.flows || [])[0];
    if (!f || !f.steps?.length) return null;
    return { ref: 'root', flow: f.id, kicker: 'One real path', title: f.title, note: `${f.description ? clip(f.description, 160) + ' ' : ''}Press Play to follow it through the code, one step at a time.` };
  }
  function autoSteps() {
    const p = G.project || {};
    const steps = [{ ref: 'root', kicker: 'The codebase', title: p.name || 'This codebase', note: clip(p.summary) || 'A map of the main parts of this app and how they talk to each other.' }];
    const ui = tops.filter((n) => n.kind === 'ui').sort(bySize).slice(0, 2);
    for (const n of ui) {
      const k = screensOf(n.id);
      steps.push({ ref: 'n:' + n.id, kicker: 'What people use', title: n.label, note: clip(n.summary, 200) + (k > 1 ? ` It has ${k} screens.` : '') });
    }
    let back = tops.filter((n) => n.kind === 'service' || n.kind === 'worker').sort(bySize);
    if (!back.length) back = tops.filter((n) => !['ui', 'external', 'test', 'script', 'config', 'infra', 'misc'].includes(n.kind)).sort(bySize);
    for (const n of back.slice(0, ui.length > 1 ? 1 : 2)) steps.push({ ref: 'n:' + n.id, kicker: 'Behind the scenes', title: n.label, note: clip(n.summary, 200) });
    const data = tops.find((n) => n.kind === 'data' && !back.includes(n));
    if (data && steps.length < 5) steps.push({ ref: 'n:' + data.id, kicker: 'Where the data lives', title: data.label, note: clip(data.summary, 200) });
    const ext = tops.filter((n) => n.kind === 'external');
    if (ext.length) {
      steps.push({
        ref: ext.length === 1 ? 'n:' + ext[0].id : 'root', kicker: 'Outside services', title: ext.length === 1 ? ext[0].label : `${ext.length} outside services`,
        note: ext.length === 1 ? clip(ext[0].summary, 200) : `It also relies on ${listOf(ext.slice(0, 6).map((n) => n.label))}${ext.length > 6 ? ` and ${ext.length - 6} more` : ''}. They sit at the edge of the map; the lines show which parts talk to them.`,
      });
    }
    return steps;
  }
  function buildSteps() {
    const own = (G.tour || []).filter((s) => s && s.ref && (s.ref === 'root' || SC.exists(s.ref))).map((s) => ({ ref: s.ref, title: s.title || SC.info(s.ref).name, note: s.note || SC.info(s.ref).desc || '', kicker: '' }));
    const steps = own.length >= 2 ? own : autoSteps();
    const fl = flowStep();
    if (fl && !steps.some((s) => s.flow) && steps.length < 9) steps.push(fl);
    return steps.filter((s) => s.ref === 'root' || SC.exists(s.ref)).slice(0, 9);
  }

  // ---------- card ----------
  const card = document.createElement('div');
  card.id = 'tour';
  card.className = 'glass';
  card.hidden = true;
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Start here tour');
  document.body.appendChild(card);
  let steps = [], at = -1;
  const active = () => at >= 0;

  function go(s) {
    if (!s.ref || s.ref === 'root') { SC.go('root', { select: null }); return; }
    const parent = SC.parentOf(s.ref) || 'root';
    if (parent === 'root') SC.go('root', { select: s.ref }); // stay on the overview, just highlight the card
    else SC.reveal(s.ref);
  }
  function render() {
    const s = steps[at], last = at === steps.length - 1;
    const tip = last ? `Replay this tour any time from <b>Start here</b> at the top.${window.FloorplanScreens ? ' <b>Screens</b> shows everything behind any page.' : ''}` : '';
    card.innerHTML = `<button class="btn icon tx" data-x title="Close (Esc)">${SC.iconI('x')}</button>
      <div class="tk"><span>Start here</span><i></i><span>${at + 1} of ${steps.length}</span>${s.kicker ? `<i></i><span>${h(s.kicker)}</span>` : ''}</div>
      <div class="tt">${h(s.title)}</div>${s.note ? `<div class="tn">${h(s.note)}</div>` : ''}${tip ? `<div class="tip">${tip}</div>` : ''}
      <div class="tf"><div class="dots">${steps.map((_, k) => `<i class="${k <= at ? 'on' : ''}"></i>`).join('')}</div>
        ${at > 0 ? `<button class="btn icon soft" data-back title="Back (←)">${SC.iconI('left')}</button>` : `<button class="btn" data-x>Skip</button>`}
        ${s.flow ? `<button class="btn primary" data-play>${SC.iconI('right')}Play it</button>${last ? '' : '<button class="btn soft" data-next>Next</button>'}` : `<button class="btn primary" data-next>${last ? 'Done' : 'Next'}</button>`}
      </div>`;
    card.querySelectorAll('[data-x]').forEach((b) => b.onclick = end);
    card.querySelector('[data-back]')?.addEventListener('click', back);
    card.querySelector('[data-next]')?.addEventListener('click', next);
    card.querySelector('[data-play]')?.addEventListener('click', () => { const id = s.flow; end(); SC.startFlow(id); });
  }
  // sit above the zoom controls, and above the Ask bar (and its notices) where they overlap
  function place() {
    let bottom = 76;
    const ask = document.getElementById('ask');
    if (ask) {
      const a = ask.getBoundingClientRect(), c = card.getBoundingClientRect();
      const top = [...ask.children].filter((x) => x.offsetParent && x.getBoundingClientRect().height > 0).reduce((m, x) => Math.min(m, x.getBoundingClientRect().top), a.bottom);
      if (a.width && a.left < 16 + c.width + 12 && top < innerHeight) bottom = Math.max(bottom, innerHeight - top + 12);
    }
    card.style.bottom = Math.min(bottom, Math.max(76, innerHeight - card.offsetHeight - 80)) + 'px';
  }
  window.addEventListener('resize', () => { if (active()) place(); });
  function show(i) {
    at = i;
    card.hidden = false;
    render();
    place();
    go(steps[at]);
    if (at === 0) setTimeout(() => SC.fit(true), 450);
  }
  function next() { if (at >= steps.length - 1) end(); else show(at + 1); }
  function back() { if (at > 0) show(at - 1); }
  function end() {
    if (!active()) return;
    at = -1;
    card.hidden = true;
    SC.store.set(SEEN, true);
    if (SC.state.container === 'root') SC.select(null);
  }
  function start() {
    steps = buildSteps();
    if (steps.length < 2) { SC.toast('There is not enough on this map for a tour yet.'); return; }
    SC.store.set(SEEN, true);
    show(0);
  }

  const tourBtn = SC.addHeaderButton({ id: 'tour-btn', label: 'Start here', icon: 'home', title: 'A one-minute tour of this codebase', onClick: () => (active() ? end() : start()) });
  const ic = tourBtn.querySelector('svg');
  if (ic) ic.innerHTML = '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>'; // compass
  window.addEventListener('keydown', (ev) => {
    if (!active() || ev.target?.tagName === 'INPUT' || ev.target?.tagName === 'TEXTAREA') return;
    if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); end(); }
    else if (!SC.state.flow && ev.key === 'ArrowRight') { ev.stopPropagation(); ev.preventDefault(); next(); }
    else if (!SC.state.flow && ev.key === 'ArrowLeft') { ev.stopPropagation(); ev.preventDefault(); back(); }
  }, true);
  // a guided flow takes over the canvas: step aside
  SC.on('render', () => { if (active() && SC.state.flow) end(); });

  // first visit: start on its own, unless the link points somewhere specific
  let auto = false;
  const maybeAuto = () => {
    if (auto) return;
    auto = true;
    if (SC.store.get(SEEN, false) || location.hash.length > 1) return;
    setTimeout(() => { if (!active() && !SC.state.flow && SC.state.container === 'root') start(); }, 700);
  };
  SC.on('ready', maybeAuto);
  if (SC.state.layout) maybeAuto();

  window.FloorplanTour = { start, end, active };
})();

`


# assets/viewer.html

`html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>
/* Theme: runs before anything is drawn so the page never flashes the wrong colours. "auto" follows the device. */
(() => {
  const KEY = 'floorplan-theme', root = document.documentElement, mq = matchMedia('(prefers-color-scheme: light)');
  let mem = 'auto';
  const valid = (v) => v === 'auto' || v === 'light' || v === 'dark';
  const get = () => { try { const v = localStorage.getItem(KEY); if (valid(v)) return v; } catch (e) {} return mem; };
  const apply = () => {
    const c = get();
    root.setAttribute('data-theme', c === 'auto' ? (mq.matches ? 'light' : 'dark') : c);
    window.dispatchEvent(new Event('floorplan-theme-change'));
  };
  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply); else if (mq.addListener) mq.addListener(apply);
  addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) apply(); }); // changed in another tab
  window.floorplanTheme = { get, set: (c) => {
    if (!valid(c)) return;
    mem = c; try { localStorage.setItem(KEY, c); } catch (e) {}
    root.classList.add('theme-switching'); apply();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  } };
})();
</script>
<title>__FLOORPLAN_TITLE__</title>
<link rel="icon" type="image/png" href="__FLOORPLAN_FAVICON__">
<style>/*__FONTS__*/</style>
<style>
:root {
  --sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "Cascadia Code", "SF Mono", Consolas, monospace;
  --bg: #0f0f0f; --bg-rgb: 15, 15, 15; --grid: #1f1f1f;
  --ink: 255, 255, 255; /* the colour the page tints with: white on dark, black on light */
  --surface: #191919; --surface-hover: #1e1e1e; --raise: #232323; --raise-2: #2b2b2b;
  --elev: rgba(26, 26, 26, .86); --hair: rgba(var(--ink), .06); --hair-2: rgba(var(--ink), .1);
  --text: #ececec; --text-2: #b4b4b4; --text-3: #8b8b8b; --text-4: #5c5c5c;
  --recent: #4ade80; --on-recent-text: #0b1f12;
  --on: #ececec; --on-hover: #fff; --on-text: #0f0f0f; /* solid buttons, badges and dots */
  --on-sev-text: #0f0f0f; /* text on a red or amber chip */
  --ok: #6fd7a8; --sev-high: #f28b8b; --sev-medium: #f0c36b; --sev-low: #8b8b8b;
  --warn-bg: rgba(240, 195, 107, .08); --warn-text: #f3d79b; --warn-sheet: rgba(46, 38, 18, .9);
  --ok-bg: rgba(111, 215, 168, .08); --ok-text: #a9e5c9; --err-text: #f6a5a5;
  --dir-bg: rgba(25, 25, 25, .7); --menu-solid: rgba(26, 26, 26, .94); --well: rgba(0, 0, 0, .3);
  --palette-bg: rgba(30, 30, 30, .96); --modal-bg: rgba(30, 30, 30, .97);
  --scrim: rgba(0, 0, 0, .45); --scrim-2: rgba(0, 0, 0, .5);
  --shadow-lift: 0 18px 40px -20px rgba(0, 0, 0, 1);
  --shadow-deep: 0 24px 64px -24px rgba(0, 0, 0, .9);
  --ring: rgba(var(--ink), .88); --focus: rgba(var(--ink), .16);
  --r-card: 20px; --r-panel: 24px; --r-ctl: 12px;
  --ease: cubic-bezier(.16, 1, .3, 1); --ease-io: cubic-bezier(.65, 0, .35, 1);
  --shadow-card: 0 1px 0 rgba(var(--ink), .035) inset, 0 12px 32px -20px rgba(0, 0, 0, .95);
  --shadow-float: 0 0 0 1px rgba(var(--ink), .05), 0 24px 64px -24px rgba(0, 0, 0, .9);
  --k-import: #6e6e6e; --k-http: #7aa7ff; --k-call: #b49cff; --k-rpc: #8f9bff; --k-event: #f19ac7; --k-queue: #f0c36b; --k-data: #63d2b8; --k-config: #6b7280; --k-contains: #4a4a4a;
  --n-ui: #7cc4ff; --n-service: #b49cff; --n-worker: #f0c36b; --n-library: #6fd7a8; --n-feature: #8fb4ff; --n-data: #63d2b8; --n-config: #a3a3a3;
  --n-test: #f19ac7; --n-script: #f5a66b; --n-infra: #f28b8b; --n-external: #e3a6f0; --n-misc: #8b8b8b; --n-dir: #a3a3a3; --n-file: #a3a3a3;
  --n-module: #a3a3a3; --n-symbol: #c7b8ff; --n-route: #7aa7ff; --n-connector: #8b8b8b;
  --m-GET: #6fd7a8; --m-POST: #7aa7ff; --m-PUT: #f0c36b; --m-PATCH: #c7a3ff; --m-DELETE: #f28b8b; --m-CALL: #6fcfd9; --m-ANY: #a3a3a3;
  --panel-w: 360px; --pw: calc(var(--panel-w) + 32px); --gutter: 28px;
  color-scheme: dark;
}
/* ---------- light theme: same variables, new values. Chosen by the Theme button (see ui/05-theme.js) ---------- */
:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f3f3f1; --bg-rgb: 243, 243, 241; --grid: #d2d2ce; --ink: 0, 0, 0;
  --surface: #ffffff; --surface-hover: #fbfbfa; --raise: #ebebe8; --raise-2: #e0e0dc;
  --elev: rgba(255, 255, 255, .92); --hair: rgba(0, 0, 0, .09); --hair-2: rgba(0, 0, 0, .15);
  --text: #161616; --text-2: #3f3f3f; --text-3: #595959; --text-4: #666666;
  --recent: #157a3a; --on-recent-text: #fff;
  --on: #161616; --on-hover: #000; --on-text: #fff; --on-sev-text: #fff;
  --ok: #1a8a5b; --sev-high: #c94a4a; --sev-medium: #946000; --sev-low: #666666;
  --warn-bg: rgba(217, 160, 40, .16); --warn-text: #6b4500; --warn-sheet: rgba(255, 244, 214, .97);
  --ok-bg: rgba(26, 138, 91, .12); --ok-text: #14603f; --err-text: #b42323;
  --dir-bg: rgba(255, 255, 255, .7); --menu-solid: rgba(255, 255, 255, .96); --well: rgba(0, 0, 0, .06);
  --palette-bg: rgba(255, 255, 255, .98); --modal-bg: rgba(255, 255, 255, .98);
  --scrim: rgba(20, 20, 20, .32); --scrim-2: rgba(20, 20, 20, .38);
  --ring: rgba(0, 0, 0, .85); --focus: rgba(0, 0, 0, .14);
  --shadow-card: 0 0 0 1px rgba(0, 0, 0, .1), 0 1px 2px rgba(0, 0, 0, .06), 0 12px 28px -18px rgba(0, 0, 0, .3);
  --shadow-float: 0 0 0 1px rgba(0, 0, 0, .1), 0 20px 48px -22px rgba(0, 0, 0, .4);
  --shadow-lift: 0 16px 32px -18px rgba(0, 0, 0, .4);
  --shadow-deep: 0 20px 48px -22px rgba(0, 0, 0, .4);
  --k-import: #50555c; --k-http: #1f5fd6; --k-call: #6a45d6; --k-rpc: #4450cf; --k-event: #c43a85; --k-queue: #a8710c; --k-data: #0b7f6b; --k-config: #4f5661; --k-contains: #8d8d8d;
  --n-ui: #1f7ac4; --n-service: #7a5ad8; --n-worker: #a8710c; --n-library: #1a8a5b; --n-feature: #3b6fd1; --n-data: #0f8a76; --n-config: #666666;
  --n-test: #c43c86; --n-script: #c06a1d; --n-infra: #c94a4a; --n-external: #a24dbb; --n-misc: #666666; --n-dir: #666666; --n-file: #666666;
  --n-module: #666666; --n-symbol: #6a55c4; --n-route: #2f6fe0; --n-connector: #666666;
  --m-GET: #1a8a5b; --m-POST: #2f6fe0; --m-PUT: #a8710c; --m-PATCH: #7a4fd0; --m-DELETE: #c94a4a; --m-CALL: #0d7f8c; --m-ANY: #666666;
}
:root[data-theme="light"] .mark { filter: invert(1); } /* the logo image is white, so it is inverted to black */
:root[data-theme="light"] #search::placeholder { color: var(--text-3); } /* the browser's default grey is too faint on white */
html.theme-switching *, html.theme-switching *::before, html.theme-switching *::after { transition: none !important; } /* a change of theme is instant, never animated */
body.no-panel { --pw: 0px; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 13.5px; overflow: hidden; -webkit-font-smoothing: antialiased; }
button, input, textarea { font: inherit; color: inherit; }
input, textarea { caret-color: var(--on); }
button { -webkit-tap-highlight-color: transparent; }
button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
::selection { background: rgba(var(--ink), .22); }
* { scrollbar-color: rgba(var(--ink), .16) transparent; scrollbar-width: thin; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(var(--ink), .14); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(var(--ink), .24); }
svg.i { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; flex: none; }
.glass { background: var(--elev); backdrop-filter: blur(20px) saturate(1.2); -webkit-backdrop-filter: blur(20px) saturate(1.2); box-shadow: var(--shadow-float); }
.kbd { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); background: rgba(var(--ink), .06); border-radius: 6px; padding: 1px 6px; line-height: 17px; }

/* ---------- top bar: brand + path left, search centered, actions right ---------- */
header { position: fixed; inset: 0 0 auto 0; height: 64px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; padding: 0 16px; z-index: 10; pointer-events: none;
  background: linear-gradient(to bottom, rgba(var(--bg-rgb), .96) 35%, rgba(var(--bg-rgb), 0)); }
header > * { pointer-events: auto; }
.hl { display: flex; align-items: center; gap: 4px; min-width: 0; }
.hc { display: flex; justify-content: center; }
.hr { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; padding-right: 6px; }
.mark { height: 22px; width: auto; display: block; flex: none; }
#crumbs { display: flex; align-items: center; min-width: 0; overflow: hidden; }
#crumbs .sep { color: var(--text-4); padding: 0 1px; }
#crumbs button { background: none; border: 0; padding: 6px 10px; border-radius: 999px; cursor: pointer; color: var(--text-3); white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; transition: background .2s var(--ease), color .2s var(--ease); }
#crumbs button:hover { background: rgba(var(--ink), .06); color: var(--text); }
#crumbs button.cur { color: var(--text); }
.btn { height: 36px; display: inline-flex; align-items: center; gap: 8px; padding: 0 14px; border-radius: 999px; border: 0; background: transparent; color: var(--text-2); cursor: pointer; white-space: nowrap; text-decoration: none; font-size: 13px;
  transition: background .2s var(--ease), color .2s var(--ease), transform .2s var(--ease); }
.btn:hover { background: rgba(var(--ink), .07); color: var(--text); }
.btn:active { transform: scale(.97); }
.btn.icon { width: 36px; padding: 0; justify-content: center; }
.btn.soft { background: rgba(var(--ink), .06); color: var(--text); }
.btn.soft:hover { background: rgba(var(--ink), .1); }
.btn.primary { background: var(--on); color: var(--on-text); }
.btn.primary:hover { background: var(--on-hover); }
.btn:disabled { opacity: .35; cursor: default; }
.btn .badge { min-width: 17px; height: 17px; border-radius: 999px; background: var(--on); color: var(--on-text); font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; display: grid; place-items: center; padding: 0 4px; }
#btn-up[hidden] { display: none; }
#search-btn { width: min(460px, 36vw); height: 40px; justify-content: flex-start; gap: 10px; padding: 0 8px 0 16px; background: var(--raise); color: var(--text-3); }
/* the Theme button adds 48px (44px and a gap) to the right side, so the search box gives up the same, and the project name and buttons fit as before. Under 701px the bar is the phone layout's job and is left as it was. */
@media (min-width: 701px) { #search-btn { width: min(460px, max(calc(36vw - 48px), 250px)); } }
#search-btn:hover { background: var(--raise-2); color: var(--text-2); }
#search-btn .kbd { margin-left: auto; }
.rel { position: relative; }

/* ---------- canvas ---------- */
#stage { position: fixed; inset: 0; overflow: hidden; background-color: var(--bg); background-image: radial-gradient(var(--grid) 1px, transparent 1px); background-size: 24px 24px; }
#svg { width: 100%; height: 100%; display: block; cursor: grab; user-select: none; }
#svg.panning { cursor: grabbing; }
#svg { touch-action: none; } /* a finger drags the map instead of the browser taking the touch; only affects touch */
@media (pointer: coarse) { html, body { overscroll-behavior: none; } } /* no bounce of the page under the map */
#viewport { transform-origin: 0 0; }
#viewport.anim { transition: transform .5s var(--ease), opacity .35s var(--ease); }
#context { position: absolute; left: 24px; top: calc(var(--hh, 64px) + 8px); max-width: min(520px, calc(100% - var(--pw) - 64px)); pointer-events: none; transition: opacity .3s var(--ease); }
/* the flow bar takes the heading's place while a flow plays */
body.in-flow #context { opacity: 0; }
#context .k { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-3); }
#context .k .ico { width: 20px; height: 20px; border-radius: 7px; }
#context::before { content: ""; position: absolute; inset: -28px -60px -28px -40px; background: radial-gradient(closest-side, rgba(var(--bg-rgb), .9), rgba(var(--bg-rgb), 0)); z-index: -1; }
#context h1 { margin: 6px 0 4px; font-size: 24px; font-weight: 600; letter-spacing: -.025em; }
#context p { margin: 0; color: var(--text-2); line-height: 1.55; font-size: 14px; }
.ctx-more { display: none; } /* the More / Less toggle under the description is for phones */
#ask-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* ---------- cards ---------- */
.node foreignObject { pointer-events: none; overflow: visible; }
.node .card { pointer-events: auto; cursor: pointer; }
.fo-pad { width: 100%; height: 100%; padding: var(--gutter); }
.card { width: 100%; height: 100%; border-radius: var(--r-card); background: var(--surface); padding: 16px 18px; display: flex; flex-direction: column; gap: 7px; overflow: hidden; position: relative;
  box-shadow: var(--shadow-card); transition: background .25s var(--ease), box-shadow .25s var(--ease), transform .3s var(--ease);
  animation: cardIn .55s var(--ease) both; animation-delay: var(--d, 0ms); }
@keyframes cardIn { from { opacity: 0; transform: translateY(8px) scale(.985); } }
.card > * { flex-shrink: 0; }
.node:hover .card { background: var(--surface-hover); transform: translateY(-2px); box-shadow: 0 1px 0 rgba(var(--ink), .05) inset, var(--shadow-lift); }
/* selected: a soft ring that follows the card's radius, plus a faint halo */
.node.sel .card { background: var(--surface-hover); box-shadow: 0 0 0 1.5px rgba(var(--ink), .5), 0 0 0 6px rgba(var(--ink), .05), var(--shadow-lift); }
.node.sel .card.external { box-shadow: inset 0 0 0 1.5px rgba(var(--ink), .1), 0 0 0 1.5px rgba(var(--ink), .5), 0 0 0 6px rgba(var(--ink), .05); }
.node.flash .card { animation: flash 1.2s var(--ease) 2; }
@keyframes flash { 50% { box-shadow: 0 0 0 1.5px rgba(var(--ink), .6), 0 0 0 10px rgba(var(--ink), .08); } }
.head { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ico { width: 30px; height: 30px; border-radius: 10px; display: grid; place-items: center; flex: none; color: var(--c); background: color-mix(in srgb, var(--c) 13%, transparent); }
.ico svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.title { font-size: 15px; font-weight: 600; letter-spacing: -.015em; line-height: 1.3; overflow: hidden; min-width: 0; flex: 1; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow-wrap: anywhere; }
.card > .title { flex: none; } /* an endpoint's name, on its own row under the method and path */
/* footer: size on the left, recent-work pill on the right, pinned to the bottom of the card */
.foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 23px; }
.foot .meta { align-self: center; }
svg.lod-low .foot .meta { visibility: hidden; }
.title.mono { font-family: var(--mono); font-size: 13px; font-weight: 500; }
.meta { font-size: 11.5px; color: var(--text-3); white-space: nowrap; font-variant-numeric: tabular-nums; background: rgba(var(--ink), .05); border-radius: 999px; padding: 2px 8px; }
.desc { color: var(--text-2); font-size: 13px; line-height: 19px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: var(--lines, 2); overflow: hidden; max-height: calc(var(--lines, 2) * 19px); }
.desc[style*="--lines:1"] { -webkit-line-clamp: 1; } .desc[style*="--lines:2"] { -webkit-line-clamp: 2; } .desc[style*="--lines:3"] { -webkit-line-clamp: 3; }
.desc.empty { color: var(--text-4); }
.method { font-family: var(--mono); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 8px; color: var(--m); background: color-mix(in srgb, var(--m) 14%, transparent); letter-spacing: .02em; flex: none; }
.rpath { font-family: var(--mono); font-size: 12px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.card.external { background: transparent; box-shadow: inset 0 0 0 1.5px rgba(var(--ink), .1); }
.node:hover .card.external { background: rgba(var(--ink), .03); }
.card.dir { background: var(--dir-bg); box-shadow: inset 0 0 0 1px rgba(var(--ink), .05); }
.card.module { background: var(--raise); }
/* recent work: cards just changed (green ring + tag), and the parts that contain them (soft ring + count) */
.card.recent { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--recent) 62%, transparent), var(--shadow-card); }
.node:hover .card.recent { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--recent) 85%, transparent), var(--shadow-lift); }
.card.recent-in { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--recent) 30%, transparent), var(--shadow-card); }
.rw { flex: none; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1; color: var(--recent); background: color-mix(in srgb, var(--recent) 13%, transparent); border-radius: 999px; padding: 4px 8px 4px 7px; white-space: nowrap; }
.rw::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.rw.soft { font-weight: 500; }
body.no-recent .rw { display: none; }
body.no-recent .card.recent, body.no-recent .card.recent-in { box-shadow: var(--shadow-card); }
svg.lod-low .rw { font-size: 18px; padding: 6px 12px; }
.card.has-note .title::after { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--sev-medium); margin-left: 8px; vertical-align: middle; }
.card.connector { flex-direction: row; align-items: center; gap: 10px; padding: 0 14px 0 10px; border-radius: var(--r-card); background: var(--raise); }
.card.connector .ico { width: 26px; height: 26px; border-radius: 9px; }
.card.connector .lbl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-2); font-weight: 500; font-size: 13px; flex: 1; }
.card.connector .dir-ico { color: var(--text-4); display: grid; }
.card.connector .dir-ico svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.anote { margin-top: 4px; display: flex; gap: 9px; align-items: flex-start; padding: 9px 11px; border-radius: 14px; background: rgba(var(--ink), .05); font-size: 12.5px; line-height: 1.45; color: var(--text); }
.anote b { flex: none; width: 19px; height: 19px; border-radius: 999px; background: var(--on); color: var(--on-text); display: grid; place-items: center; font-size: 11px; font-weight: 700; }
.anote span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
svg.lod-mid .desc { -webkit-line-clamp: 1 !important; max-height: 19px; }
svg.lod-low .meta, svg.lod-low .anote { visibility: hidden; }
/* far out, the big title and the footer pill are what's readable: drop the description so they fit */
svg.lod-low .desc { display: none; }
svg.lod-low .title { font-size: 22px; white-space: normal; }
svg.dim .node:not(.hl) .card { box-shadow: none; }
svg.dim .node:not(.hl) .card > * { opacity: .28; transition: opacity .3s var(--ease); }

/* ---------- edges ---------- */
.edges { animation: fadeIn .7s var(--ease) .12s both; }
/* column brackets over a view: what uses this part · what's inside it · what it uses */
.cols { animation: fadeIn .7s var(--ease) .2s both; pointer-events: none; }
.cols path { fill: none; stroke: rgba(var(--ink), .16); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.cols text { fill: var(--text-3); font: 500 13px Inter, system-ui, sans-serif; letter-spacing: -.005em; dominant-baseline: central; text-anchor: middle; }
@keyframes fadeIn { from { opacity: 0; } }
.edge { color: var(--k-import); }
.edge .trace { fill: none; stroke: currentColor; stroke-opacity: .5; stroke-linecap: round; stroke-linejoin: round; transition: stroke-opacity .25s var(--ease), stroke-width .25s var(--ease); }
.edge .flow { fill: none; stroke: currentColor; stroke-width: 2; stroke-dasharray: 2 10; stroke-linecap: round; opacity: 0; transition: opacity .25s var(--ease); }
.edge .hit { fill: none; stroke: transparent; stroke-width: 16; cursor: pointer; }
.edge .port { fill: var(--bg); stroke: currentColor; stroke-width: 1.5; transition: opacity .25s var(--ease); }
.edge.k-config .trace { stroke-dasharray: 5 5; }
.edge.k-contains .trace { stroke-dasharray: 2 6; stroke-opacity: .9; }
.edge:hover .trace, .edge.hl .trace { stroke-opacity: 1; }
.edge:hover .flow, .edge.hl .flow { opacity: .95; animation: flow 1.1s linear infinite; }
@keyframes flow { to { stroke-dashoffset: -24; } }
svg.dim .edge:not(.hl) { opacity: .1; }
.edge { transition: opacity .3s var(--ease); }
.pulse { fill: var(--on-hover); filter: drop-shadow(0 0 6px rgba(var(--ink), .8)); }
.flowlink { fill: none; stroke: var(--on); stroke-opacity: .7; stroke-width: 2; stroke-dasharray: 5 7; animation: flow 1.1s linear infinite; }

/* ---------- floating chrome ---------- */
#zoom { position: absolute; left: 16px; bottom: 16px; display: flex; padding: 4px; gap: 2px; border-radius: 999px; }
#zoom button { width: 34px; height: 34px; border: 0; background: none; color: var(--text-2); border-radius: 999px; cursor: pointer; display: grid; place-items: center; transition: background .2s var(--ease), color .2s var(--ease); }
#zoom button:hover { background: rgba(var(--ink), .08); color: var(--text); }
.menu { position: absolute; z-index: 30; min-width: 230px; padding: 6px; border-radius: 18px; display: none; transform-origin: top right; }
.menu.open { display: block; animation: menuIn .22s var(--ease); }
@keyframes menuIn { from { opacity: 0; transform: translateY(-4px) scale(.97); } }
#flowmenu, #legend { top: 44px; right: 0; width: 320px; }
#flowmenu .r { padding: 10px 12px; border-radius: 12px; cursor: pointer; transition: background .15s var(--ease); }
#flowmenu .r:hover { background: rgba(var(--ink), .07); }
#flowmenu .r b { font-weight: 500; display: block; }
#flowmenu .r span { color: var(--text-3); font-size: 12.5px; }
#flowmenu .r.custom { display: flex; gap: 8px; align-items: flex-start; }
#flowmenu .r.custom .rt { flex: 1; min-width: 0; }
#flowmenu .r .del { border: 0; background: none; color: var(--text-4); border-radius: 999px; width: 26px; height: 26px; display: grid; place-items: center; cursor: pointer; opacity: 0; transition: opacity .15s var(--ease), background .15s var(--ease); flex: none; }
#flowmenu .r:hover .del { opacity: 1; }
#flowmenu .r .del:hover { background: rgba(var(--ink), .1); color: var(--text); }
#flowmenu .yours { font-size: 11px; color: var(--text-3); background: rgba(var(--ink), .06); border-radius: 999px; padding: 1px 7px; margin-left: 6px; font-weight: 400; }
#flowmenu .new { display: flex; align-items: center; gap: 10px; color: var(--text); }
#flowmenu .new svg { color: var(--text-3); }
.ff { padding: 8px 6px 6px; }
.ff label { display: block; font-size: 12.5px; color: var(--text-3); padding: 2px 6px 8px; }
.ff textarea { width: 100%; min-height: 84px; resize: none; background: rgba(var(--ink), .05); border: 0; border-radius: 14px; padding: 11px 13px; color: var(--text); outline: none; font: inherit; line-height: 1.5; transition: background .2s var(--ease), box-shadow .2s var(--ease); }
.ff textarea:focus { background: rgba(var(--ink), .07); box-shadow: 0 0 0 1px rgba(var(--ink), .14); }
.ff .ffa { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
.ff .ffa .btn { height: 34px; }
.ff .note { font-size: 12px; color: var(--text-4); padding: 8px 6px 0; }
#legend { width: 250px; }
#legend .lh { padding: 8px 12px 6px; font-size: 12px; color: var(--text-3); }
#legend label { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; cursor: pointer; color: var(--text); user-select: none; transition: background .15s var(--ease); }
#legend label:hover { background: rgba(var(--ink), .07); }
#legend label.off { color: var(--text-4); }
#legend label.off .sw { opacity: .25; }
#legend input { display: none; }
#legend .sw { width: 16px; height: 3px; border-radius: 2px; }
#legend .n { margin-left: auto; color: var(--text-3); font-variant-numeric: tabular-nums; font-size: 12px; }
#legend .tog { width: 28px; height: 16px; border-radius: 999px; background: rgba(var(--ink), .12); position: relative; transition: background .2s var(--ease); flex: none; }
#legend .tog::after { content: ""; position: absolute; left: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--text-3); transition: transform .25s var(--ease), background .2s var(--ease); }
#legend label:not(.off) .tog { background: rgba(var(--ink), .28); }
#legend label:not(.off) .tog::after { transform: translateX(12px); background: var(--on-hover); }
#ctxmenu { position: fixed; display: block; transform-origin: top left; }
#ctxmenu[hidden] { display: none; }
#ctxmenu:not([hidden]) { animation: menuIn .18s var(--ease); }
.mi { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border: 0; border-radius: 12px; background: none; cursor: pointer; color: var(--text); text-align: left; font-size: 13px; transition: background .15s var(--ease); }
.mi:hover { background: rgba(var(--ink), .08); }
.mi svg { color: var(--text-3); }
.mi .hint { margin-left: auto; color: var(--text-4); font-size: 12px; }
.mi-sep { height: 1px; background: var(--hair); margin: 5px 8px; }
.mi-title { padding: 8px 12px 6px; font-size: 12px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
#flowbar { position: absolute; left: calc((100% - var(--pw)) / 2); top: calc(var(--hh, 64px) + 12px); transform: translateX(-50%); width: min(680px, calc(100% - var(--pw) - 48px)); padding: 14px 14px 14px 20px; display: flex; gap: 12px; align-items: center; z-index: 3; border-radius: var(--r-panel); animation: sheetIn .4s var(--ease); transition: left .45s var(--ease); }
#flowbar[hidden] { display: none; }
#flowbar .fk { font-size: 12px; color: var(--text-3); margin-bottom: 2px; }
#flowbar .ft { flex: 1; min-width: 0; line-height: 1.5; }
#flowbar .ft b { font-weight: 600; }
#flowbar .ft span { color: var(--text-2); }
#flowbar .dots { display: flex; gap: 4px; margin-top: 8px; }
#flowbar .dots i { width: 18px; height: 3px; border-radius: 2px; background: rgba(var(--ink), .12); transition: background .3s var(--ease); }
#flowbar .dots i.on { background: var(--on); }
#tooltip { position: absolute; pointer-events: none; padding: 11px 13px; max-width: 320px; z-index: 6; font-size: 12.5px; line-height: 1.5; border-radius: 16px; animation: tipIn .2s var(--ease); }
@keyframes tipIn { from { opacity: 0; transform: translateY(3px); } }
#tooltip[hidden] { display: none; }
#tooltip .tt { font-weight: 600; }
#tooltip .td { color: var(--text-2); }
#tooltip .tp { color: var(--text-3); font-family: var(--mono); font-size: 11.5px; margin-top: 4px; word-break: break-all; white-space: pre-line; }
#tooltip .th { display: flex; gap: 10px; margin-top: 8px; color: var(--text-3); font-size: 11.5px; }
#tooltip .trw { margin-top: 9px; padding: 8px 10px; border-radius: 11px; background: color-mix(in srgb, var(--recent) 9%, transparent); }
#tooltip .trh { display: flex; align-items: center; gap: 6px; color: var(--recent); font-size: 11.5px; font-weight: 600; }
#tooltip .trh::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
#tooltip .trn { color: var(--text); margin-top: 3px; }
#tooltip .th span { display: inline-flex; gap: 5px; align-items: center; }
#loading { position: absolute; left: calc((100% - var(--pw)) / 2); top: 50%; transform: translate(-50%, -50%); padding: 10px 16px; border-radius: 999px; font-size: 12.5px; color: var(--text-2); opacity: 0; transition: opacity .3s var(--ease); pointer-events: none; }
#loading.on { opacity: 1; }
#empty { position: absolute; inset: 0; display: grid; place-items: center; color: var(--text-3); pointer-events: none; }

/* ---------- inspector (floating) ---------- */
#panel { position: fixed; top: calc(var(--hh, 64px) + 4px); right: 16px; bottom: 16px; width: var(--panel-w); border-radius: var(--r-panel); overflow: auto; z-index: 5;
  background: var(--elev); backdrop-filter: blur(24px) saturate(1.2); -webkit-backdrop-filter: blur(24px) saturate(1.2); box-shadow: var(--shadow-float);
  transition: transform .45s var(--ease), opacity .3s var(--ease); }
body.no-panel #panel { transform: translateX(24px) scale(.98); opacity: 0; pointer-events: none; }
#panel-resize { position: fixed; top: calc(var(--hh, 64px) + 20px); bottom: 32px; right: calc(var(--panel-w) + 16px - 6px); width: 12px; cursor: ew-resize; z-index: 6; display: grid; place-items: center; transition: opacity .3s var(--ease); }
#panel-resize::after { content: ""; width: 4px; height: 40px; border-radius: 999px; background: rgba(var(--ink), .14); opacity: 0; transition: opacity .2s var(--ease), height .25s var(--ease), background .2s var(--ease); }
#panel-resize:hover::after, body.resizing #panel-resize::after { opacity: 1; height: 64px; }
body.resizing #panel-resize::after { background: rgba(var(--ink), .4); }
body.resizing, body.resizing * { cursor: ew-resize !important; user-select: none; }
body.resizing #panel, body.resizing #ask, body.resizing #flowbar { transition: none; }
body.exported #ask { display: none; }
#madewith { position: absolute; left: calc((100% - var(--pw)) / 2); bottom: 20px; transform: translateX(-50%); z-index: 4; display: inline-flex; align-items: center; gap: 8px; padding: 8px 15px 8px 12px; border-radius: 999px; font-size: 12.5px; color: var(--text-3); text-decoration: none; white-space: nowrap; transition: left .45s var(--ease), color .15s var(--ease); }
#madewith .mark { height: 13px; }
#madewith b { color: var(--text); font-weight: 600; }
#madewith:hover { color: var(--text); }
@media (max-width: 700px) { #madewith .x { display: none; } }
.xtag { font-size: 11.5px; font-weight: 500; color: var(--text-3); background: rgba(var(--ink), .06); border-radius: 999px; padding: 3px 9px; margin-left: 8px; white-space: nowrap; cursor: default; }
body.no-panel #panel-resize { opacity: 0; pointer-events: none; }
#panel::-webkit-scrollbar { width: 12px; } #panel::-webkit-scrollbar-thumb { background: rgba(var(--ink), .1); border-radius: 10px; border: 4px solid transparent; background-clip: padding-box; }
#panel > * { animation: panelIn .4s var(--ease) both; }
@keyframes panelIn { from { opacity: 0; transform: translateY(6px); } }
.sec { padding: 18px 20px 6px; }
.sec:first-child { padding-top: 22px; }
.sec:last-child { padding-bottom: 22px; }
.sec h3 { margin: 0 0 8px; font-size: 12.5px; font-weight: 500; color: var(--text-3); display: flex; align-items: center; gap: 6px; }
.sec h3 .c { color: var(--text-4); }
.ph { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ph .kindlabel { font-size: 12.5px; color: var(--text-3); text-transform: capitalize; }
.pt { margin: 0 0 6px; font-size: 20px; font-weight: 600; letter-spacing: -.02em; line-height: 1.3; word-break: break-word; }
.pd { margin: 0; color: var(--text-2); line-height: 1.6; }
.pd.empty { color: var(--text-4); }
.pp { display: flex; align-items: center; gap: 6px; margin-top: 14px; font-family: var(--mono); font-size: 11.5px; color: var(--text-3); background: rgba(var(--ink), .04); border-radius: 12px; padding: 8px 10px 8px 12px; word-break: break-all; }
.pp button { margin-left: auto; background: none; border: 0; color: var(--text-3); cursor: pointer; padding: 4px; display: grid; border-radius: 8px; transition: background .2s var(--ease), color .2s var(--ease); }
.pp button:hover { color: var(--text); background: rgba(var(--ink), .08); }
.actions { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
.actions .btn { height: 34px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stats div { background: rgba(var(--ink), .04); border-radius: 14px; padding: 10px 12px; }
.stats b { display: block; font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.stats span { font-size: 12px; color: var(--text-3); }
.bar { display: flex; height: 6px; border-radius: 999px; overflow: hidden; margin: 14px 0 10px; gap: 3px; }
.bar span { border-radius: 999px; }
.legend-row { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--text-2); }
.legend-row span { display: inline-flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; flex: none; }
.list { display: flex; flex-direction: column; gap: 2px; margin: 0 -10px; }
.row { display: flex; align-items: flex-start; gap: 12px; padding: 9px 10px; border-radius: 14px; cursor: pointer; text-decoration: none; color: inherit; transition: background .15s var(--ease); }
.row:hover { background: rgba(var(--ink), .06); }
.row .dot { margin-top: 6px; }
.row .rt { flex: 1; min-width: 0; }
.row .rn { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row .rd { color: var(--text-3); font-size: 12.5px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 1px; }
.row .rp { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row .rc { font-size: 12px; color: var(--text-3); white-space: nowrap; font-variant-numeric: tabular-nums; }
.more { color: var(--text-4); font-size: 12.5px; padding: 6px 10px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-family: var(--mono); font-size: 11.5px; color: var(--text-2); background: rgba(var(--ink), .05); border-radius: 999px; padding: 3px 10px; }
.callout { margin-top: 14px; padding: 11px 13px; border-radius: 14px; background: var(--warn-bg); color: var(--warn-text); font-size: 13px; line-height: 1.55; }

/* ---------- command palette ---------- */
#palette { position: fixed; inset: 0; z-index: 40; background: var(--scrim); backdrop-filter: blur(4px); display: none; align-items: flex-start; justify-content: center; padding-top: 14vh; }
#palette.open { display: flex; animation: fadeIn .2s var(--ease); }
#palette .box { width: min(640px, calc(100% - 32px)); overflow: hidden; border-radius: var(--r-panel); animation: menuIn .3s var(--ease); background: var(--palette-bg); }
#palette .in { display: flex; align-items: center; gap: 12px; padding: 0 20px; color: var(--text-3); }
#palette input { flex: 1; height: 58px; background: none; border: 0; outline: none; font-size: 16px; color: var(--text); }
#results { max-height: 52vh; overflow: auto; padding: 0 8px 8px; }
#results .r { display: flex; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 14px; cursor: pointer; }
#results .r.active { background: rgba(var(--ink), .07); }
#results .r .rt { flex: 1; min-width: 0; }
#results .r .rn { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#results .r .rd { color: var(--text-3); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#results .r .rk { font-size: 12px; color: var(--text-4); white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
#results .empty { padding: 22px; color: var(--text-3); text-align: center; }
#palette .hint { display: flex; gap: 16px; padding: 12px 20px; color: var(--text-4); font-size: 12px; background: rgba(var(--ink), .02); }

/* ---------- ask ---------- */
#ask { position: absolute; left: calc((100% - var(--pw)) / 2); bottom: 20px; transform: translateX(-50%); width: min(700px, calc(100% - var(--pw) - 320px)); min-width: 320px; z-index: 4; display: flex; flex-direction: column; gap: 10px; transition: left .45s var(--ease), width .45s var(--ease); }
#ask-form { display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 18px; border-radius: 28px; transition: box-shadow .25s var(--ease); flex-wrap: wrap; }
#ask-form:focus-within { box-shadow: 0 0 0 1px rgba(var(--ink), .16), var(--shadow-deep); }
#ask-chips { display: contents; }
.chip { display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 6px 0 8px; border-radius: 999px; background: rgba(var(--ink), .08); font-size: 12.5px; max-width: 220px; animation: chipIn .3s var(--ease); }
@keyframes chipIn { from { opacity: 0; transform: scale(.9); } }
.chip .ico { width: 20px; height: 20px; border-radius: 999px; }
.chip .ico svg { width: 11px; height: 11px; }
.chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip button { border: 0; background: none; color: var(--text-3); cursor: pointer; width: 20px; height: 20px; border-radius: 999px; display: grid; place-items: center; flex: none; }
.chip button:hover { background: rgba(var(--ink), .1); color: var(--text); }
/* a blueprint's Ask / Change switch */
#ask-mode { display: inline-flex; flex: none; gap: 2px; padding: 3px; margin-left: -10px; border-radius: 999px; background: rgba(var(--ink), .06); }
#ask-mode button { border: 0; background: none; color: var(--text-3); font: inherit; font-size: 12.5px; font-weight: 500; height: 28px; padding: 0 12px; border-radius: 999px; cursor: pointer; transition: background .15s var(--ease), color .15s var(--ease); }
#ask-mode button:hover { color: var(--text); }
#ask-mode button.on { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(0, 0, 0, .18); }
#ask-mode button:focus-visible { outline: 2px solid var(--ring); outline-offset: 1px; }
#ask-input { flex: 1; min-width: 160px; height: 38px; background: none; border: 0; outline: none; font-size: 15px; color: var(--text); }
#ask-input::placeholder { color: var(--text-3); }
#ask-input:disabled { cursor: not-allowed; }
.engine { font-size: 12px; color: var(--text-3); background: rgba(var(--ink), .05); border-radius: 999px; padding: 4px 10px; white-space: nowrap; display: inline-flex; align-items: center; gap: 7px; }
.engine i { width: 6px; height: 6px; border-radius: 50%; background: var(--text-4); }
.engine.ok i { background: var(--ok); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ok) 25%, transparent); }
.engine.warn { color: var(--warn-text); background: var(--warn-bg); }
.engine.warn i { background: var(--sev-medium); }
.einfo { background: none; border: 0; padding: 0; margin-left: 1px; color: var(--text-3); cursor: pointer; display: grid; }
.einfo:hover { color: var(--text); }
.einfo svg { width: 14px; height: 14px; }
#ask-send { width: 38px; height: 38px; border-radius: 999px; border: 0; background: var(--on); color: var(--on-text); cursor: pointer; display: grid; place-items: center; flex: none; transition: transform .2s var(--ease), background .2s var(--ease), opacity .2s; }
#ask-send:hover:not(:disabled) { transform: scale(1.06); background: var(--on-hover); }
#ask-send:disabled { background: rgba(var(--ink), .1); color: var(--text-4); cursor: default; }
#ask-send.stop { background: rgba(var(--ink), .14); color: var(--text); }
#ask-warn { display: flex; align-items: center; gap: 12px; padding: 12px 14px 12px 16px; border-radius: 20px; font-size: 13px; line-height: 1.5; color: var(--warn-text); background: var(--warn-sheet); backdrop-filter: blur(16px); animation: sheetIn .35s var(--ease); }
#ask-warn[hidden] { display: none; }
#ask-warn.info { color: var(--text-2); background: var(--elev); box-shadow: var(--shadow-float); }
#ask-warn code { font-family: var(--mono); font-size: 12px; background: var(--well); padding: 1px 7px; border-radius: 7px; color: var(--text); }
#ask-warn.info code { background: rgba(var(--ink), .07); }
#ask-warn a { color: inherit; text-underline-offset: 3px; }
#ask-warn.info a { color: var(--text); }
#ask-warn button { margin-left: auto; background: rgba(var(--ink), .08); border: 0; color: inherit; border-radius: 999px; padding: 6px 12px; cursor: pointer; font-size: 12.5px; white-space: nowrap; }
#ask-warn button:hover { background: rgba(var(--ink), .14); }
#ask-sheet { max-height: min(46vh, 480px); display: flex; flex-direction: column; overflow: hidden; border-radius: var(--r-panel); animation: sheetIn .45s var(--ease); }
@keyframes sheetIn { from { opacity: 0; transform: translateY(12px) scale(.985); } }
#ask-sheet[hidden] { display: none; }
#ask-sheet .sh { display: flex; align-items: center; gap: 6px; padding: 12px 12px 4px 20px; }
#ask-sheet .sh .q { flex: 1; min-width: 0; color: var(--text-3); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#ask-sheet .sh .btn { height: 32px; }
#ask-sheet .sb { padding: 6px 20px 18px; overflow: auto; line-height: 1.65; color: var(--text); font-size: 14px; }
#ask-sheet .sb p { margin: 0 0 10px; }
#ask-sheet .sb ul, #ask-sheet .sb ol { margin: 0 0 10px; padding-left: 20px; }
#ask-sheet .sb li { margin: 3px 0; }
#ask-sheet .sb code { font-family: var(--mono); font-size: 12.5px; background: rgba(var(--ink), .07); padding: 1px 6px; border-radius: 6px; }
#ask-sheet .sb strong { font-weight: 600; }
.ref { display: inline-flex; align-items: center; gap: 6px; padding: 0 9px 0 7px; border-radius: 999px; background: rgba(var(--ink), .08); color: var(--text); cursor: pointer; font-weight: 500; font-size: 13px; line-height: 23px; white-space: nowrap; vertical-align: 1px; transition: background .2s var(--ease); }
.ref:hover { background: rgba(var(--ink), .15); }
.ref i { width: 7px; height: 7px; border-radius: 999px; background: var(--c); }
.progress { display: flex; flex-direction: column; gap: 7px; font-size: 13px; color: var(--text-3); }
.progress div { display: flex; align-items: center; gap: 10px; animation: chipIn .3s var(--ease); }
.progress div:last-child { color: var(--text); }
.spin { width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(var(--ink), .15); border-top-color: var(--on); animation: spin .8s linear infinite; flex: none; }
@keyframes spin { to { transform: rotate(360deg); } }
.followups { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.followups button { background: rgba(var(--ink), .06); border: 0; color: var(--text-2); border-radius: 999px; padding: 7px 13px; cursor: pointer; font-size: 12.5px; text-align: left; transition: background .2s var(--ease), color .2s var(--ease); }
.followups button:hover { background: rgba(var(--ink), .11); color: var(--text); }
.sheet-actions { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.err { color: var(--err-text); }

/* ---------- extension chrome: header slot, modal, toast, grouped lists ---------- */
.hr-ext { display: contents; }
#modal { position: fixed; inset: 0; z-index: 45; background: var(--scrim-2); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; padding: 24px; }
#modal.open { display: flex; animation: fadeIn .2s var(--ease); }
#modal .box { width: min(620px, 100%); max-height: min(80vh, 760px); overflow: auto; border-radius: var(--r-panel); background: var(--modal-bg); animation: menuIn .3s var(--ease); padding: 22px 24px 20px; }
#modal h2 { margin: 0 0 8px; font-size: 18px; font-weight: 600; letter-spacing: -.015em; }
#modal .mb { color: var(--text-2); line-height: 1.6; }
#modal pre { white-space: pre-wrap; word-break: break-word; font-family: var(--mono); font-size: 12px; line-height: 1.55; background: rgba(var(--ink), .05); border-radius: 14px; padding: 14px 16px; color: var(--text); margin: 12px 0 0; max-height: 46vh; overflow: auto; }
#modal .ma { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
#toast { position: fixed; left: calc((100% - var(--pw)) / 2); bottom: 96px; transform: translateX(-50%); z-index: 50; padding: 10px 16px; border-radius: 999px; font-size: 13px; pointer-events: none; opacity: 0; transition: opacity .25s var(--ease), transform .3s var(--ease); }
#toast.on { opacity: 1; transform: translateX(-50%) translateY(-4px); }
.group-h { display: flex; align-items: baseline; gap: 8px; margin: 14px 0 4px; font-size: 12.5px; color: var(--text-2); font-weight: 500; }
.group-h:first-of-type { margin-top: 2px; }
.group-h .gd { color: var(--text-4); font-weight: 400; font-size: 12px; }
#legend .tech { border-top: 1px solid var(--hair); margin-top: 4px; padding-top: 4px; }
/* Safari/WebKit: HTML inside <foreignObject> that gets its own render layer (position, overflow clip,
   transform, opacity, animation) is painted at the page origin, ignoring the SVG transform. Keep cards layer-free there. */
html.wk .node foreignObject { overflow: hidden; }
html.wk .card, html.wk .card * { position: static !important; transform: none !important; animation: none !important; transition: none !important; will-change: auto !important; }
html.wk .card { overflow: visible; }
html.wk svg.dim .node:not(.hl) .card > * { opacity: 1; }
html.wk svg.dim .node:not(.hl) foreignObject { opacity: .28; }
/* ---------- phones and tablets: windows under 1000 px and touch screens under 1280 px (a mouse at 1000 px and wider is untouched) ---------- */
@media (max-width: 999px), (max-width: 1279px) and (pointer: coarse) {
  #btn-up, .brand { flex: none; }
  header .btn:focus-visible, #zoom button:focus-visible { outline: 2px solid var(--ring); outline-offset: -2px; }
  /* one flowing row that wraps to a second row, so nothing runs off the edge; buttons keep their icons and lose their words */
  header { display: flex; flex-wrap: wrap; align-items: center; height: auto; min-height: 56px; padding: 6px 12px; gap: 0 8px; }
  .hl { flex: 1 1 240px; }
  .hc { flex: 2 3 min(460px, 24vw); max-width: 460px; min-width: 44px; justify-content: stretch; }
  #search-btn { width: 100%; min-width: 44px; }
  #search-btn .st { overflow: hidden; text-overflow: ellipsis; }
  .hr { flex: 0 0 auto; flex-wrap: wrap; }
  .brand #proj-name { display: none; }
  header .rel { position: static; } /* Flows and Filters open under the bar, inside the screen, wherever the bar wrapped */
  #flowmenu, #legend { position: fixed; top: calc(var(--hh, 56px) + 4px); left: 8px; right: auto; width: min(320px, calc(100% - 16px)); max-height: 60vh; overflow: auto; }
  .hr .btn { position: relative; padding: 0; justify-content: center; }
  .hr .btn .bl { display: none; }
  .hr .btn .badge { position: absolute; }
}
@media (max-width: 999px), (pointer: coarse) {
  /* every control in the bar, and the zoom buttons, are at least 44 px */
  header .btn, #search-btn { height: 44px; min-width: 44px; }
  header .btn.icon { width: 44px; }
  #ask-mode button { height: 44px; }
  #crumbs button { min-height: 44px; }
  #zoom button { width: 44px; height: 44px; }
}
@media (max-width: 999px), (max-width: 1279px) and (pointer: coarse) {
  header .hr .btn { width: 44px; }
  header .hr .btn .badge { top: 4px; right: 2px; }
  /* the zoom buttons move to the top of the map, left of the details panel, so the ask bar can't cover them */
  #zoom { left: auto; right: calc(var(--pw) + 16px); bottom: auto; top: calc(var(--hh, 56px) + 8px); flex-direction: column; border-radius: 26px; }
  #context { max-width: min(520px, calc(100% - var(--pw) - 104px)); } /* stops short of the zoom buttons */
}
@media (max-width: 700px) {
  :root { --gutter: 20px; }
  body, body.no-panel { --pw: 0px; }
  header { padding: 6px 8px; gap: 0 4px; }
  .hl { flex-basis: 120px; }
  .hr { flex: 1 1 100%; justify-content: space-between; }
  .brand { padding-right: 0; }
  .hc { flex: 0 0 44px; }
  #search-btn { padding: 0; justify-content: center; gap: 0; }
  #search-btn .st, #search-btn .kbd { display: none; }
  #crumbs button { padding: 6px 8px; max-width: 160px; }
  #crumbs button:not(.cur), #crumbs .sep { display: none; } /* only where you are; the Up arrow goes back */
  #context { left: 16px; right: 16px; max-width: none; }
  #context h1 { font-size: 20px; }
  /* the description folds to one line with a More / Less toggle, so it doesn't fill the screen */
  #context.folded .cd { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden; }
  #context.folded .cx { display: none; }
  #context .ctx-more:not([hidden]) { display: inline-flex; align-items: center; min-height: 44px; margin: -8px 0 -12px -10px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--text); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; pointer-events: auto; }
  #context .ctx-more:focus-visible { outline: 2px solid var(--ring); outline-offset: -2px; }
  /* the warning about connecting an AI tool shows only while someone is using the ask bar */
  #ask:not(.asking) #ask-warn { display: none; }
  /* the details panel becomes a sheet at the bottom: closed until a box is tapped */
  #panel { top: auto; left: 8px; right: 8px; bottom: 8px; width: auto; max-height: min(56vh, 480px); }
  body.no-panel #panel { transform: translateY(24px) scale(.98); visibility: hidden; transition: transform .45s var(--ease), opacity .3s var(--ease), visibility 0s linear .45s; } /* closed: out of the tab order and the screen reader's reach */
  #panel-resize { display: none; }
  body:not(.no-panel) #ask { display: none; }
  #ask { left: 50%; bottom: 8px; width: calc(100% - 16px); min-width: 0; }
  #ask-input { min-width: 0; }
  #ask-form { padding-left: 14px; }
  #flowbar { left: 50%; width: calc(100% - 16px); }
  #toast { left: 50%; max-width: calc(100% - 16px); }
  #loading { left: 50%; }
  header #zoom { position: static; flex: none; flex-direction: row; padding: 0; gap: 0; border-radius: 22px; } /* moved into the top row, left of the search icon */
  /* menus open as full-width cards under the bar */
  #flowmenu, #legend { position: fixed; top: calc(var(--hh, 56px) + 4px); left: 8px; right: 8px; width: auto; max-height: 60vh; overflow: auto; }
  body #tour, body #cloud-card { left: 8px; right: 8px; width: auto; }
}
@media (prefers-reduced-motion: reduce) and (max-width: 999px), (prefers-reduced-motion: reduce) and (pointer: coarse) {
  #panel, body.no-panel #panel, #viewport.anim, #ask, #flowbar, #zoom button { transition: none; }
  #panel > *, #ask-warn { animation: none; }
}
</style>
</head>
<body>
<script>if (matchMedia('(max-width: 700px)').matches && !/[#&]s=/.test(location.hash)) document.body.classList.add('no-panel'); // a phone starts with the details closed, so the panel doesn't flash open and shut</script>
<div id="stage">
  <svg id="svg" xmlns="http://www.w3.org/2000/svg"><g id="viewport"></g></svg>
  <div id="context"></div>
  <div id="zoom" class="glass">
    <button id="z-out" title="Zoom out (−)"><svg class="i" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>
    <button id="z-fit" title="Fit to screen (F)"><svg class="i" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
    <button id="z-in" title="Zoom in (+)"><svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
  </div>
  <div id="flowbar" class="glass" hidden></div>
  <div id="ask">
    <div id="ask-sheet" class="glass" hidden></div>
    <div id="ask-warn" hidden></div>
    <div id="ask-live" role="status" aria-live="polite"></div>
    <form id="ask-form" class="glass" autocomplete="off">
      <span id="ask-chips"></span>
      <input id="ask-input" placeholder="Ask anything about this codebase…" spellcheck="false">
      <span class="engine" id="ask-engine"><i></i>checking…</span>
      <button id="ask-send" type="submit" title="Ask" disabled><svg class="i" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
    </form>
  </div>
  <div id="tooltip" class="glass" hidden></div>
  <div id="loading" class="glass">Laying out…</div>
  <div id="empty" hidden></div>
</div>
<header>
  <div class="hl">
    <div class="brand"><img class="mark" src="__FLOORPLAN_LOGO__" alt="Floorplan" title="Floorplan"><span id="proj-name"></span></div>
    <button class="btn icon" id="btn-up" title="Up one level (Backspace)" aria-label="Up one level" hidden><svg class="i" viewBox="0 0 24 24"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></button>
    <nav id="crumbs"></nav>
  </div>
  <div class="hc">
    <button class="btn" id="search-btn" aria-label="Search files, routes, modules"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="st">Search files, routes, modules</span><span class="kbd">/</span></button>
  </div>
  <div class="hr">
    <div id="hdr-ext" class="hr-ext"></div>
    <div class="rel"><button class="btn" id="flows-btn" aria-label="Flows"><svg class="i" viewBox="0 0 24 24"><path d="M7 5v14l11-7z"/></svg><span class="bl">Flows</span></button><div id="flowmenu" class="menu glass"></div></div>
    <div class="rel"><button class="btn icon" id="filters-btn" title="Connection types" aria-label="Connection types"><svg class="i" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg></button><div id="legend" class="menu glass"></div></div>
    <button class="btn icon" id="btn-panel" title="Toggle details (P)" aria-label="Toggle details" aria-expanded="true"><svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16"/></svg></button>
  </div>
</header>
<aside id="panel"></aside>
<div id="panel-resize" title="Drag to resize"></div>
<div id="ctxmenu" class="menu glass" hidden></div>
<div id="modal"><div class="box glass"></div></div>
<div id="toast" class="glass"></div>
<div id="palette"><div class="box glass">
  <div class="in"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="search" placeholder="Search by name, description, path or route…" autocomplete="off" spellcheck="false"></div>
  <div id="results"></div>
  <div class="hint"><span><span class="kbd">↑↓</span> navigate</span><span><span class="kbd">↵</span> open</span><span><span class="kbd">esc</span> close</span></div>
</div></div>
<!--__ELK_SCRIPT__-->
<script>if (/AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg|OPR/.test(navigator.userAgent)) document.documentElement.classList.add('wk');</script>
<script>window.FLOORPLAN = /*__FLOORPLAN_DATA__*/null;</script>
<script>/*__GRAPH_QUERY__*/</script>
<script>
(() => {
'use strict';
const G = window.FLOORPLAN;
const AGENT = {
  id: 'antigravity', name: 'Antigravity', app: 'Antigravity IDE', cli: 'Antigravity', docs: 'https://antigravity.google',
  signIn: 'Open Antigravity IDE.'
};
const Cap = (t) => t[0].toUpperCase() + t.slice(1);
if (!G) { document.body.innerHTML = '<p style="padding:2rem">No data. Run build.mjs.</p>'; return; }
// a blueprint: planned from a PRD, so its files don't exist yet (no line counts, nothing to open in an editor)
const PLAN = !!G.meta.blueprint;
// an exported copy (serve.mjs --export, or the Export button): read-only
const EXPORTED = G.meta.exported || null;
if (typeof ELK === 'undefined') { document.body.innerHTML = '<p style="padding:2rem">Could not load the ELK layout engine. Rebuild the map with build.mjs.</p>'; return; }

const NS = 'http://www.w3.org/2000/svg';
const $ = (s) => document.querySelector(s);
const svg = $('#svg'), vp = $('#viewport'), panel = $('#panel');
const elk = new ELK();
const KINDS = ['import', 'http', 'call', 'rpc', 'event', 'queue', 'data', 'config'];
// connection names: plain by default, developer terms when "Show technical detail" is on
const KIND_TECH = { contains: 'Contains', import: 'Imports', http: 'HTTP', call: 'Calls', rpc: 'RPC', event: 'Events', queue: 'Queues', data: 'Data', config: 'Config' };
const KIND_PLAIN = { contains: 'Contains', import: 'Uses', http: 'Web requests', call: 'Calls', rpc: 'Calls', event: 'Events', queue: 'Background jobs', data: 'Reads & writes data', config: 'Settings' };
const KIND_LABEL = new Proxy({}, { get: (_, k) => (technical() ? KIND_TECH : KIND_PLAIN)[k] || k });
let technicalFlag = false;
const technical = () => technicalFlag;
const METHODS = { GET: 1, POST: 1, PUT: 1, PATCH: 1, DELETE: 1, CALL: 1 };
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem('floorplan:' + k) ?? localStorage.getItem('show-code:' + k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('floorplan:' + k, JSON.stringify(v)); } catch {} } };
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n >= 10000 ? Math.round(n / 1000) + 'k' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
const dirname = (p) => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

// ---------- icons ----------
const P = {
  ui: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  service: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  worker: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  library: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  feature: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  config: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  test: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  script: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  infra: '<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z"/>',
  external: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9z"/>',
  misc: '<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>',
  dir: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M10 13l-2 2 2 2M14 13l2 2-2 2"/>',
  module: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  function: '<path d="M10 20c2 0 2.5-1.5 3-4l2-9c.5-2.5 1-4 3-4M8 10h8"/>',
  class: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M14.5 9.5a3.5 3.5 0 1 0 0 5"/>',
  route: '<path d="M4 12h12M12 6l6 6-6 6"/><path d="M20 5v14"/>',
  in: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
  out: '<path d="M7 17 17 7M8 7h9v9"/>',
  open: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  drill: '<path d="M9 18l6-6-6-6"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="3"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  spark: '<path d="M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2l5.5 1.8-5.5 1.8a2 2 0 0 0-1.2 1.2L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9z"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24">${P[k] || P.file}</svg>`;
const iconI = (k) => `<svg class="i" viewBox="0 0 24 24">${P[k] || P.file}</svg>`;
const symIcon = (kind) => (['class', 'interface', 'struct', 'type', 'enum', 'record', 'trait', 'object'].includes(kind) ? 'class' : 'function');

// ======================= model =======================
const nodes = new Map(G.nodes.map((n) => [n.id, n]));
const files = new Map(G.files.map((f) => [f.p, f]));
const routes = G.routes || [];
const parentOf = new Map();
const kids = new Map();
const addChild = (p, item) => { parentOf.set(item, p); if (!kids.has(p)) kids.set(p, []); kids.get(p).push(item); };
const dirs = new Map();

for (const n of G.nodes) addChild(n.parent ? 'n:' + n.parent : 'root', 'n:' + n.id);
const filesByNode = new Map();
for (const f of G.files) { if (!filesByNode.has(f.n)) filesByNode.set(f.n, []); filesByNode.get(f.n).push(f); }
const GROUP_AT = 24;
for (const [nid, list] of filesByNode) {
  const parent = 'n:' + nid;
  if (list.length <= GROUP_AT) { list.forEach((f) => addChild(parent, 'f:' + f.p)); continue; }
  const dirsOf = list.map((f) => dirname(f.p).split('/'));
  let common = dirsOf[0].slice();
  for (const d of dirsOf) { let i = 0; while (i < common.length && d[i] === common[i]) i++; common = common.slice(0, i); }
  const groups = new Map();
  list.forEach((f, i) => {
    const seg = dirsOf[i][common.length];
    const key = seg === undefined ? '' : [...common, seg].join('/');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  });
  for (const [key, fs] of groups) {
    if (!key || fs.length < 2) { fs.forEach((f) => addChild(parent, 'f:' + f.p)); continue; }
    const did = `d:${nid}|${key}`;
    dirs.set(did, { node: nid, path: key, files: fs });
    addChild(parent, did);
    fs.forEach((f) => addChild(did, 'f:' + f.p));
  }
}
// inside a file: its endpoints, then the exports that aren't route handlers
const routesByFile = new Map();
routes.forEach((r, i) => { if (!routesByFile.has(r.f)) routesByFile.set(r.f, []); routesByFile.get(r.f).push(i); });
for (const f of G.files) {
  const rs = routesByFile.get(f.p) || [];
  const handlers = new Set(rs.map((i) => routes[i].h));
  rs.forEach((i) => addChild('f:' + f.p, 'r:' + i));
  (f.s || []).forEach((s, i) => { if (!handlers.has(s[0])) addChild('f:' + f.p, `s:${f.p}#${i}`); });
}

const chainCache = new Map();
function chain(item) {
  if (chainCache.has(item)) return chainCache.get(item);
  const out = [item];
  let p = parentOf.get(item);
  while (p && p !== 'root') { out.push(p); p = parentOf.get(p); }
  if (item !== 'root') out.push('root');
  chainCache.set(item, out);
  return out;
}
// Recent work (G.recent): the cards just changed, and how many changes sit inside each part
const recentTasks = G.recent?.tasks || [];
const recentBy = new Map();
for (const it of G.recent?.items || []) { if (!parentOf.has(it.id)) continue; if (!recentBy.has(it.id)) recentBy.set(it.id, []); recentBy.get(it.id).push(it); }
const recentIn = new Map();
for (const id of recentBy.keys()) for (const a of chain(id).slice(1)) if (a !== 'root') { if (!recentIn.has(a)) recentIn.set(a, []); recentIn.get(a).push(id); }
const recentOf = (item) => recentBy.get(item.startsWith('m:') ? 'f:' + item.slice(2) : item);
const recentLabel = (list) => (list.some((x) => x.change === 'new') ? 'New' : 'Changed');
let recentShown = !!store.get('recent-hl', true);
const setRecentShown = (on) => { recentShown = on; store.set('recent-hl', on); document.body.classList.toggle('no-recent', !on); };
document.body.classList.toggle('no-recent', !recentShown);
const symOf = (item) => { const m = /^s:(.*)#(\d+)$/.exec(item); const f = files.get(m[1]); return { f, s: f.s[+m[2]] }; };
function humanize(s) { s = s.replace(/[_\-.]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim(); return s.charAt(0).toUpperCase() + s.slice(1); }

function info(item) {
  if (item === 'root') return { type: 'root', name: G.project.name, desc: G.project.summary || '', kind: 'root' };
  if (item === 'q:answer') return { type: 'answer', name: state.answer?.title || 'Answer', desc: state.answer?.question || '', kind: 'answer' };
  const t = item.slice(0, 2);
  if (t === 'n:') { const n = nodes.get(item.slice(2)); return { type: 'node', name: n.label, desc: n.summary, kind: n.kind, n }; }
  if (t === 'd:') { const d = dirs.get(item); return { type: 'dir', name: humanize(d.path.split('/').pop()), desc: `${plural(d.files.length, 'file')} in ${d.path}/`, kind: 'dir', d, path: d.path + '/' }; }
  if (t === 'f:') { const f = files.get(item.slice(2)); return { type: 'file', name: f.name, desc: f.d, kind: 'file', f, path: f.p }; }
  if (t === 'm:') { const f = files.get(item.slice(2)); return { type: 'module', name: f.name, desc: f.d, kind: 'module', f, path: f.p }; }
  if (t === 'r:') { const r = routes[+item.slice(2)]; return { type: 'route', name: r.name, desc: r.d, kind: 'route', r, f: files.get(r.f), path: `${r.m} ${r.p}` }; }
  if (t === 's:') { const { f, s } = symOf(item); return { type: 'symbol', name: s[0], desc: s[4] || '', kind: symIcon(s[1]), symKind: s[1], f, s, path: `${f.p}:${s[2]}` }; }
  return { type: 'unknown', name: item, desc: '', kind: 'misc' };
}
const connEntity = (id) => id.replace(/^x:(in|out):/, '');
const nameOf = (item) => info(item.startsWith('x:') ? connEntity(item) : item).name;
// in plain mode a file opens only when it has endpoints to show (its exports are developer detail)
const visibleKids = (item) => (kids.get(item) || []).filter((k) => technical() || !k.startsWith('s:'));
const drillable = (item) => /^(n:|d:|f:)/.test(item) && visibleKids(item).length > 0;
const methodVar = (m) => `var(--m-${m in METHODS ? m : 'ANY'})`;
const colorOf = (i) => i.type === 'route' ? methodVar(i.r.m) : `var(--n-${i.type === 'node' ? i.kind : i.type === 'symbol' ? 'symbol' : i.type})`;
const iconKey = (i) => i.type === 'node' ? i.kind : i.type === 'symbol' ? i.kind : i.type;

function statsOf(item) {
  const i = info(item);
  if (i.type === 'node') return i.n.stats;
  if (i.type === 'dir') return { files: i.d.files.length, loc: i.d.files.reduce((s, f) => s + f.loc, 0) };
  if (i.type === 'file' || i.type === 'module') return { files: 1, loc: i.f.loc };
  return null;
}
const nodePaths = (n) => n.paths?.length ? n.paths[0].replace(/\/\*\*$/, '') + (n.paths.length > 1 ? `  +${n.paths.length - 1}` : '') : n.hosts?.[0] || n.packages?.[0] || '';

// ======================= view projection =======================
const state = { container: 'root', selected: null, kinds: Object.fromEntries(KINDS.map((k) => [k, true])), t: { x: 0, y: 0, k: 1 }, layout: null, flow: null };

function project(item, ctx) {
  const ch = chain(item);
  for (const x of ch) { if (ctx.vis.has(x)) return { item: x }; if (x === ctx.container) return null; }
  if (ctx.cchain.has(item)) return null;
  const idx = ch.findIndex((x) => ctx.cchain.has(x));
  return { outside: ch[idx - 1] };
}
/** The visible export whose definition most closely precedes a line (the caller of an HTTP request). */
function enclosingSymbol(f, line) {
  let best = null;
  (f.s || []).forEach((s, i) => { if (s[2] <= line && (!best || s[2] > best.line)) best = { line: s[2], id: `s:${f.p}#${i}` }; });
  return best && parentOf.has(best.id) ? best.id : null;
}

/** An answer's ad-hoc board: just the cards picked, and every connection among them. */
function buildAnswerView() {
  const visible = state.answer.items.map((x) => x.id);
  const vis = new Set(visible);
  const up = (x) => { for (const y of chain(x)) if (vis.has(y)) return y; return null; };
  // a file that isn't on the board but some of its endpoints/exports are: route to those instead
  const down = (x, names) => {
    if (!x.startsWith('f:')) return [];
    const inside = visible.filter((v) => v !== x && chain(v).includes(x));
    if (!names?.length) return inside;
    const f = files.get(x.slice(2));
    const byName = inside.filter((v) => v.startsWith('s:') && names.some((nm) => { const s = symOf(v).s; return nm === s[0] || (nm === 'default' && s[3]); }));
    return byName.length ? byName : inside;
  };
  const proj = (x, names) => { const u = up(x); return u ? [u] : down(x, names); };
  // one hidden hop: a screen that reaches a request through an API-client file that isn't on the board
  const importersOf = new Map();
  for (const l of G.links) if (l.k === 'import' && l.b.startsWith('f:')) { if (!importersOf.has(l.b)) importersOf.set(l.b, []); importersOf.get(l.b).push(l.a); }
  const viaHidden = (x) => [...new Set((importersOf.get(x) || []).map(up).filter(Boolean))];
  const agg = new Map();
  const add = (a, b, l, w) => {
    const key = `${a}>${b}>${l.k}`;
    let e = agg.get(key);
    if (!e) { e = { id: 'e' + agg.size, a, b, k: l.k, w: 0, links: [] }; agg.set(key, e); }
    e.w += w; if (!e.links.includes(l)) e.links.push(l);
  };
  for (const l of G.links) {
    if (!state.kinds[l.k]) continue;
    let srcs = proj(l.a), dsts = proj(l.b, l.names);
    if (!srcs.length && l.k === 'http' && l.a.startsWith('f:') && dsts.length) srcs = viaHidden(l.a);
    if (l.calls?.length) {
      const rs = [...new Set(l.calls.map(([ri]) => ri))].filter((ri) => ri != null && vis.has('r:' + ri)).map((ri) => 'r:' + ri);
      if (rs.length) dsts = rs;
      const f = l.a.startsWith('f:') ? files.get(l.a.slice(2)) : null;
      const syms = f ? [...new Set(l.calls.map(([, line]) => enclosingSymbol(f, line)).filter((s) => s && vis.has(s)))] : [];
      if (syms.length) srcs = syms;
    }
    for (const s of srcs) for (const d of dsts) if (s !== d && !chain(d).includes(s) && !chain(s).includes(d)) add(s, d, l, l.calls?.length ? l.calls.length : l.w);
  }
  // show containment (a file and its endpoint both on the board) as a faint line
  const containsLink = { k: 'contains', w: 1, a: '', b: '' };
  for (const v of visible) { const p = chain(v).slice(1).find((y) => vis.has(y)); if (p) add(p, v, containsLink, 1); }
  return { container: 'q:answer', visible, connectors: [], edges: [...agg.values()], hidden: 0 };
}
const answerNote = (item) => {
  if (state.container !== 'q:answer' || !state.answer) return null;
  const i = state.answer.items.findIndex((x) => x.id === item);
  return i < 0 || !state.answer.items[i].note ? null : { n: i + 1, text: state.answer.items[i].note };
};

function buildView(container) {
  if (container === 'q:answer') return buildAnswerView();
  const isFile = container.startsWith('f:');
  const visible = visibleKids(container).slice();
  if (isFile) visible.unshift('m:' + container.slice(2));
  const ctx = { container, vis: new Set(visible), cchain: new Set(chain(container)) };
  const agg = new Map(), connectors = new Map();
  const add = (a, b, l, w = l.w) => {
    const key = `${a}>${b}>${l.k}`;
    let e = agg.get(key);
    if (!e) { e = { id: 'e' + agg.size, a, b, k: l.k, w: 0, links: [] }; agg.set(key, e); }
    e.w += w; if (!e.links.includes(l)) e.links.push(l);
  };
  const conn = (side, entity) => { const id = `x:${side}:${entity}`; if (!connectors.has(id)) connectors.set(id, { id, side, entity }); return id; };

  for (const l of G.links) {
    if (!state.kinds[l.k]) continue;
    if (isFile) {
      const fid = container, f = files.get(fid.slice(2));
      if (l.b === fid && l.a !== fid) {
        const pa = project(l.a, ctx); if (!pa?.outside) continue;
        const src = conn('in', pa.outside);
        if (l.calls?.length) { let hit = false; for (const [ri] of l.calls) if (ri != null && ctx.vis.has('r:' + ri)) { add(src, 'r:' + ri, l, 1); hit = true; } if (!hit) add(src, 'm:' + f.p, l); continue; }
        const targets = new Set();
        for (const nm of l.names || []) { const i = (f.s || []).findIndex((s) => nm === 'default' ? s[3] : s[0] === nm); if (i >= 0 && ctx.vis.has(`s:${f.p}#${i}`)) targets.add(`s:${f.p}#${i}`); }
        if (!targets.size) targets.add('m:' + f.p);
        for (const t of targets) add(src, t, l);
      } else if (l.a === fid && l.b !== fid) {
        const pb = project(l.b, ctx); if (!pb?.outside) continue;
        const dst = conn('out', pb.outside);
        if (l.calls?.length) { for (const [, line] of l.calls) add(enclosingSymbol(f, line) || 'm:' + f.p, dst, l, 1); continue; }
        add('m:' + f.p, dst, l);
      }
      continue;
    }
    const pa = project(l.a, ctx), pb = project(l.b, ctx);
    if (!pa || !pb) continue;
    if (pa.item && pb.item) { if (pa.item !== pb.item) add(pa.item, pb.item, l); }
    else if (pa.item && pb.outside) add(pa.item, conn('out', pb.outside), l);
    else if (pa.outside && pb.item) add(conn('in', pa.outside), pb.item, l);
  }
  const edges = [...agg.values()];
  let hidden = 0;
  if (isFile && visible.length > 22) {
    const used = new Set(edges.flatMap((e) => [e.a, e.b]));
    const keep = visible.filter((v) => v.startsWith('m:') || used.has(v));
    hidden = visible.length - keep.length;
    visible.length = 0; visible.push(...keep);
  }
  return { container, visible, connectors: [...connectors.values()], edges, hidden };
}

// ======================= cards =======================
// Cards carry only what you read at a glance: icon, name, description, one count. Paths, kinds and
// sizes live in the hover tooltip and the details panel.
// [width, min height]
const SIZES = { node: [300, 128], dir: [272, 110], file: [284, 110], module: [284, 110], route: [300, 128], symbol: [260, 100] };
const NOTE_H = 64;
const FOOT_H = 30;   // the footer row: size on the left, recent-work pill on the right
const TITLE2_H = 10; // a title that wraps onto a second line
const GUTTER = 28; // room around each card for its shadow, selection ring and hover lift (matches --gutter)
/** Footer pieces: the card's size (modules / files / endpoints) and its recent-work pill. Empty when neither applies. */
function cardFoot(item) {
  const i = info(item);
  let size = '';
  if (i.type === 'node' && i.n.kind !== 'external') { const sub = (kids.get(item) || []).filter((k) => k.startsWith('n:')).length; size = sub ? plural(sub, 'module') : plural(statsOf(item).files, 'file'); }
  else if (i.type === 'dir') size = plural(statsOf(item).files, 'file');
  else if (i.type === 'module') size = 'this file';
  else if (i.type === 'file') { const nr = (routesByFile.get(i.f.p) || []).length; size = nr ? plural(nr, 'endpoint') : ''; }
  const rec = recentOf(item), inside = recentIn.get(item.startsWith('m:') ? 'f:' + item.slice(2) : item);
  const pill = rec ? `<span class="rw">${recentLabel(rec)}</span>` : inside ? `<span class="rw soft">${inside.length} changed</span>` : '';
  return size || pill ? `<div class="foot">${size ? `<span class="meta">${size}</span>` : '<span></span>'}${pill}</div>` : '';
}
/** Extra height a card needs beyond its base size: a footer, and a title long enough to wrap. */
function cardExtraH(item) {
  const i = info(item);
  const [w] = SIZES[i.type] || SIZES.file;
  const name = i.type === 'route' ? i.r.name : i.type === 'symbol' ? i.s[0] : i.name;
  const room = w - 36 - (i.type === 'route' ? 0 : 40); // padding, and the icon beside the title
  return (cardFoot(item) ? FOOT_H : 0) + (textW(name, 15, 600) > room ? TITLE2_H : 0);
}
function cardHTML(item) {
  const i = info(item);
  let head = '', title = '', desc = '', cls = i.type;
  const dsc = (t, lines = 2) => t ? `<div class="desc" style="--lines:${lines}">${h(t)}</div>` : `<div class="desc empty">No description yet</div>`;
  if (i.type === 'node') {
    const n = i.n;
    if (n.kind === 'external') cls += ' external';
    head = `<span class="ico">${icon(n.kind)}</span><div class="title">${h(n.label)}</div>`;
    desc = dsc(n.summary, 3);
  } else if (i.type === 'dir') {
    head = `<span class="ico">${icon('dir')}</span><div class="title">${h(i.name)}</div>`;
    desc = dsc(i.d.files.slice().sort((a, b) => b.loc - a.loc).slice(0, 4).map((f) => f.name).join(', ') + (i.d.files.length > 4 ? ', …' : ''), 2);
  } else if (i.type === 'file' || i.type === 'module') {
    const f = i.f;
    if (f.note) cls += ' has-note';
    head = `<span class="ico">${icon(i.type)}</span><div class="title">${h(f.name)}</div>`;
    desc = dsc(f.d, 2);
  } else if (i.type === 'route') {
    const r = i.r;
    head = `<span class="method" style="--m:${methodVar(r.m)}">${h(r.m)}</span><span class="rpath">${h(r.p)}</span>`;
    title = `<div class="title">${h(r.name)}</div>`;
    desc = dsc(r.d, 2);
  } else if (i.type === 'symbol') {
    head = `<span class="ico">${icon(i.kind)}</span><div class="title mono">${h(i.s[0])}</div>`;
    desc = i.desc ? dsc(i.desc, 2) : '';
  }
  const note = answerNote(item);
  const noteHTML = note ? `<div class="anote"><b>${note.n}</b><span>${h(note.text)}</span></div>` : '';
  if (recentOf(item)) cls += ' recent';
  else if (recentIn.get(item.startsWith('m:') ? 'f:' + item.slice(2) : item)) cls += ' recent-in';
  return `<div class="card ${cls}" style="--c:${colorOf(i)}"><div class="head">${head}</div>${title}${desc}${noteHTML}${cardFoot(item)}</div>`;
}
function connectorHTML(c) {
  const i = info(c.entity);
  return `<div class="card connector" style="--c:${colorOf(i)}"><span class="ico">${icon(iconKey(i))}</span><span class="lbl">${h(i.name)}</span><span class="dir-ico">${icon(c.side === 'in' ? 'in' : 'out')}</span></div>`;
}
/** Hover tooltip for a card: what it is, where it lives, and what you can do with it. */
function cardTip(id) {
  if (id.startsWith('x:')) {
    const i = info(connEntity(id));
    return `<div class="tt">${id.startsWith('x:in') ? 'From' : 'To'} ${h(i.name)}</div>${i.desc ? `<div class="td">${h(i.desc)}</div>` : ''}<div class="th"><span><span class="kbd">2×click</span> go there</span><span><span class="kbd">right-click</span> more</span></div>`;
  }
  const i = info(id);
  const st = statsOf(id);
  const kind = i.type === 'node' ? i.kind : i.type === 'route' ? 'endpoint' : i.type === 'symbol' ? i.symKind : i.type === 'module' ? 'file' : i.type;
  const where = i.type === 'node' ? (i.n.paths || []).join('\n') : i.type === 'route' ? `${i.f.p}${i.r.h ? ` · ${i.r.h}()` : ''}` : i.path || '';
  const size = !st?.files ? '' : PLAN ? (i.type === 'file' || i.type === 'module' ? 'planned' : plural(st.files, 'planned file')) : i.type === 'file' || i.type === 'module' ? `${fmt(st.loc)} lines` : `${plural(st.files, 'file')} · ${fmt(st.loc)} lines`;
  const hints = [drillable(id) && state.container !== id ? '<span><span class="kbd">2×click</span> open</span>' : '', '<span><span class="kbd">right-click</span> more</span>'].join('');
  return `<div class="tt">${h(i.name)}</div><div class="td" style="text-transform:capitalize">${h(kind)}${size ? ` · ${size}` : ''}</div>${where ? `<div class="tp">${h(where)}</div>` : ''}${recentTip(id)}<div class="th">${hints}</div>`;
}
/** Hover lines for recent work: what changed on this card and how it serves the request, or what changed inside it. */
function recentTip(id) {
  if (!recentShown) return '';
  const key = id.startsWith('m:') ? 'f:' + id.slice(2) : id;
  const task = (t) => h(recentTasks[t]?.title || 'Recent work');
  const rec = recentBy.get(key);
  if (rec) return rec.map((x) => `<div class="trw"><div class="trh">${x.change === 'new' ? 'New' : 'Changed'} · ${task(x.task)}</div>${x.note ? `<div class="trn">${h(x.note)}</div>` : ''}</div>`).join('');
  const inside = recentIn.get(key);
  if (!inside) return '';
  const tasks = [...new Set(inside.flatMap((x) => recentBy.get(x).map((r) => r.task)))];
  const names = inside.slice(0, 3).map((x) => info(x).name);
  return `<div class="trw"><div class="trh">${inside.length} changed inside · ${tasks.map(task).join(', ')}</div><div class="trn">${h(names.join(', '))}${inside.length > 3 ? ` and ${inside.length - 3} more` : ''}</div></div>`;
}

// ======================= layout =======================
const measure = document.createElement('canvas').getContext('2d');
const textW = (s, px = 12, w = 500) => { measure.font = `${w} ${px}px Inter, system-ui, sans-serif`; return measure.measureText(s).width; };

async function layout(view) {
  const deg = new Map();
  const bump = (id) => deg.set(id, (deg.get(id) || 0) + 1);
  for (const e of view.edges) { bump(e.a); bump(e.b); }
  const children = [];
  for (const item of view.visible) {
    const [w, hh] = SIZES[info(item).type] || SIZES.file;
    const ext = item.startsWith('n:') && nodes.get(item.slice(2)).kind === 'external';
    children.push({ id: item, width: w, height: Math.max(hh + cardExtraH(item) + (answerNote(item) ? NOTE_H : 0), (deg.get(item) || 0) * 7 + 28), ...(ext ? { layoutOptions: { 'elk.layered.layering.layerConstraint': 'LAST' } } : {}) });
  }
  for (const c of view.connectors) {
    children.push({ id: c.id, width: clamp(textW(info(c.entity).name, 13) + 84, 150, 320), height: Math.max(42, (deg.get(c.id) || 0) * 7 + 14),
      layoutOptions: { 'elk.layered.layering.layerConstraint': c.side === 'in' ? 'FIRST_SEPARATE' : 'LAST_SEPARATE' } });
  }
  return elk.layout({
    id: 'g', children,
    edges: view.edges.map((e) => ({ id: e.id, sources: [e.a], targets: [e.b] })),
    layoutOptions: {
      'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.spacing.nodeNodeBetweenLayers': '130', 'elk.spacing.nodeNode': '32',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '8', 'elk.spacing.edgeEdge': '8', 'elk.layered.spacing.edgeNodeBetweenLayers': '24',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX', 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.thoroughness': '12', 'elk.separateConnectedComponents': 'true', 'elk.spacing.componentComponent': '80',
      'elk.padding': '[top=40,left=40,bottom=40,right=40]',
    },
  });
}

// ======================= render =======================
function roundedPath(pts, r = 10) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const d1 = Math.hypot(b.x - a.x, b.y - a.y), d2 = Math.hypot(c.x - b.x, c.y - b.y);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    if (!rr) { d += `L${b.x},${b.y}`; continue; }
    const p1 = { x: b.x + ((a.x - b.x) * rr) / d1, y: b.y + ((a.y - b.y) * rr) / d1 };
    const p2 = { x: b.x + ((c.x - b.x) * rr) / d2, y: b.y + ((c.y - b.y) * rr) / d2 };
    d += `L${p1.x.toFixed(1)},${p1.y.toFixed(1)}Q${b.x},${b.y} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return d + `L${z.x},${z.y}`;
}

let renderToken = 0;
async function render(opts = {}) {
  const token = ++renderToken;
  const view = buildView(state.container);
  const loading = setTimeout(() => $('#loading').classList.add('on'), 160);
  let res;
  try { res = await layout(view); }
  catch (e) { console.error(e); clearTimeout(loading); $('#loading').classList.remove('on'); $('#empty').hidden = false; $('#empty').textContent = 'Layout failed: ' + e.message; return; }
  clearTimeout(loading);
  $('#loading').classList.remove('on');
  if (token !== renderToken) return;
  state.view = view; state.layout = res;
  queueMicrotask(() => emit('render', { container: state.container, view }));
  draw(view, res);
  renderContext(); renderCrumbs(); renderLegend(view);
  $('#empty').hidden = view.visible.length > 0;
  $('#empty').textContent = view.visible.length ? '' : 'Nothing inside.';
  if (opts.keepTransform) applyTransform(); else fit(false);
  applySelection();
  if (opts.after) opts.after();
}

function draw(view, res) {
  vp.innerHTML = '';
  state.bounds = { x: 0, y: 0, w: res.width, h: res.height };
  const edgeById = new Map(view.edges.map((e) => [e.id, e]));
  // layers, bottom to top: traces, flow effects (walkthrough line + pulse), cards, port dots
  const gCols = el('g', { class: 'cols' }, vp);
  const gEdges = el('g', { class: 'edges' }, vp), gFx = el('g', {}, vp), gNodes = el('g', {}, vp), gPorts = el('g', { class: 'edges' }, vp);
  state.fxLayer = gFx;
  drawColumns(gCols, view, res);
  state.edgeEls = new Map(); state.chipEls = new Map();
  for (const re of res.edges || []) {
    const e = edgeById.get(re.id), s = re.sections?.[0];
    if (!s) continue;
    const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint];
    const d = roundedPath(pts, 14);
    const g = el('g', { class: `edge k-${e.k}`, style: `color:var(--k-${e.k})` }, gEdges);
    const width = 1.3 + Math.min(4, Math.log2(e.w + 1)) * 0.5;
    el('path', { class: 'trace', d, 'stroke-width': width.toFixed(2) }, g);
    el('path', { class: 'flow', d }, g);
    el('path', { class: 'hit', d }, g);
    const pg = el('g', { class: `edge k-${e.k}`, style: `color:var(--k-${e.k})` }, gPorts);
    el('circle', { class: 'port', cx: s.startPoint.x, cy: s.startPoint.y, r: 3.4 }, pg);
    el('circle', { class: 'port', cx: s.endPoint.x, cy: s.endPoint.y, r: 3.4 }, pg);
    g.addEventListener('mouseenter', (ev) => showTip(ev, edgeTip(e)));
    g.addEventListener('mousemove', moveTip);
    g.addEventListener('mouseleave', hideTip);
    g.addEventListener('click', (ev) => { ev.stopPropagation(); select({ edge: e.id }); });
    g.addEventListener('contextmenu', (ev) => { ev.preventDefault(); ev.stopPropagation(); hideTip(); openMenu(ev, edgeMenu(e)); });
    state.edgeEls.set(e.id, { g, pg, d, e });
  }
  // cards rise in left-to-right, a few ms apart
  const order = res.children.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const delay = new Map(order.map((c, i) => [c.id, Math.min(i * 18, 360)]));
  for (const c of res.children) {
    const g = el('g', { class: 'node', transform: `translate(${c.x},${c.y})` }, gNodes);
    const fo = el('foreignObject', { x: -GUTTER, y: -GUTTER, width: c.width + GUTTER * 2, height: c.height + GUTTER * 2 }, g);
    fo.innerHTML = `<div class="fo-pad">${c.id.startsWith('x:') ? connectorHTML(view.connectors.find((x) => x.id === c.id)) : cardHTML(c.id)}</div>`;
    fo.querySelector('.card')?.style.setProperty('--d', `${delay.get(c.id)}ms`);
    g.addEventListener('click', (ev) => { ev.stopPropagation(); select(c.id); });
    g.addEventListener('dblclick', (ev) => { ev.stopPropagation(); if (ev.button !== 0) return; hideTip(); open(c.id); });
    g.addEventListener('contextmenu', (ev) => { ev.preventDefault(); ev.stopPropagation(); hideTip(); openMenu(ev, itemMenu(c.id)); });
    g.addEventListener('mouseenter', (ev) => tipSoon(ev, () => cardTip(c.id)));
    g.addEventListener('mousemove', moveTip);
    g.addEventListener('mouseleave', hideTip);
    state.chipEls.set(c.id, g);
  }
}

/** Brackets over the three columns of a view that has outside connections: what uses this part (left),
 *  what's inside it (middle), and what it uses (right). Drawn in map space so they pan and zoom with it. */
function drawColumns(g, view, res) {
  if (!view.connectors?.length || state.container === 'root' || state.container === 'q:answer') return;
  const span = (cs) => cs.length ? [Math.min(...cs.map((c) => c.x)), Math.max(...cs.map((c) => c.x + c.width))] : null;
  const ins = res.children.filter((c) => c.id.startsWith('x:in:'));
  const outs = res.children.filter((c) => c.id.startsWith('x:out:'));
  const mid = res.children.filter((c) => !c.id.startsWith('x:'));
  const y = Math.min(...res.children.map((c) => c.y)) - 26;
  const cols = [[span(ins), 'Used by'], [span(mid), `Inside ${info(state.container).name}`], [span(outs), 'Uses']];
  for (const [s, label] of cols) {
    if (!s) continue;
    const [x0, x1] = s, cx = (x0 + x1) / 2;
    const half = Math.min(textW(label, 13, 500) / 2 + 10, (x1 - x0) / 2 - 12);
    // ⌐—— label ——¬ : end ticks curl down toward the cards, with a gap in the line for the label
    el('path', { d: `M${x0},${y + 9} v-5 q0,-4 4,-4 H${cx - half} M${cx + half},${y} H${x1 - 4} q4,0 4,4 v5` }, g);
    el('text', { x: cx, y }, g).textContent = label;
  }
}

// ======================= tooltips =======================
const tip = $('#tooltip');
let tipTimer = null, lastPointer = null;
// a tap also sends mouseenter, so remember whether the last pointer was a finger: hover tooltips are for a mouse
let touching = false;
['pointerdown', 'pointermove'].forEach((t) => window.addEventListener(t, (ev) => { touching = ev.pointerType === 'touch'; }, { capture: true, passive: true }));
function showTip(ev, html) { clearTimeout(tipTimer); if (!html || touching || drag?.moved || !$('#ctxmenu').hidden) return; tip.innerHTML = html; tip.hidden = false; moveTip(ev); }
/** Cards explain themselves after a short hover, so passing over them doesn't flicker tooltips. */
function tipSoon(ev, make) { clearTimeout(tipTimer); lastPointer = ev; tipTimer = setTimeout(() => showTip(lastPointer, make()), 420); }
function moveTip(ev) {
  lastPointer = ev;
  if (tip.hidden) return;
  const r = $('#stage').getBoundingClientRect();
  let x = ev.clientX - r.left + 18, y = ev.clientY - r.top + 18;
  if (x + tip.offsetWidth + 12 > r.width) x = ev.clientX - r.left - tip.offsetWidth - 14;
  if (y + tip.offsetHeight + 12 > r.height) y = ev.clientY - r.top - tip.offsetHeight - 14;
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px'; // flipped on a narrow screen, it still stays on it
}
function hideTip() { clearTimeout(tipTimer); tip.hidden = true; }
function endpointsOf(e) {
  const m = new Map();
  for (const l of e.links) for (const [ri] of l.calls || []) if (ri != null) m.set(ri, (m.get(ri) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([ri, n]) => ({ r: routes[ri], i: ri, n }));
}
function edgeTip(e) {
  if (e.k === 'contains') return `<div class="tt">${h(nameOf(e.a))} contains ${h(nameOf(e.b))}</div>`;
  const eps = endpointsOf(e);
  const names = [...new Set(e.links.flatMap((l) => l.names || []))];
  const labels = [...new Set(e.links.flatMap((l) => l.labels || []))].filter((x) => !/^[A-Z]+ \//.test(x));
  const desc = e.links.map((l) => l.desc).find(Boolean);
  const meta = eps.length ? eps.slice(0, 4).map((x) => `${x.r.m} ${x.r.p}`).join('\n') + (eps.length > 4 ? `\n+${eps.length - 4} more` : '')
    : names.length ? 'uses ' + names.slice(0, 8).join(', ') + (names.length > 8 ? '…' : '') : labels.slice(0, 4).join('\n');
  return `<div class="tt">${h(nameOf(e.a))} → ${h(nameOf(e.b))}</div><div class="td">${h(KIND_LABEL[e.k])} · ${plural(e.w, 'connection')}${eps.length ? ` · ${plural(eps.length, 'endpoint')}` : ''}</div>${desc ? `<div class="td">${h(desc)}</div>` : ''}${meta ? `<div class="tp">${h(meta)}</div>` : ''}<div class="th"><span><span class="kbd">click</span> details</span><span><span class="kbd">right-click</span> more</span></div>`;
}

// ======================= right-click menus =======================
const ctxEl = $('#ctxmenu');
function openMenu(ev, items) {
  const acts = [];
  ctxEl.innerHTML = items.filter(Boolean).map((it) => {
    if (it === '-') return '<div class="mi-sep"></div>';
    if (it.title) return `<div class="mi-title">${h(it.title)}</div>`;
    acts.push(it.run);
    return `<button class="mi" data-k="${acts.length - 1}">${iconI(it.icon || 'right')}<span>${h(it.label)}</span>${it.hint ? `<span class="hint">${h(it.hint)}</span>` : ''}</button>`;
  }).join('').replace(/^(<div class="mi-sep"><\/div>)+|(<div class="mi-sep"><\/div>)+$/g, '');
  ctxEl.querySelectorAll('.mi').forEach((b) => b.onclick = (e) => { e.stopPropagation(); closeMenu(); acts[+b.dataset.k](); });
  ctxEl.hidden = false;
  const w = ctxEl.offsetWidth, hgt = ctxEl.offsetHeight;
  const x = Math.min(ev.clientX, innerWidth - w - 8), y = Math.min(ev.clientY, innerHeight - hgt - 8);
  ctxEl.style.left = x + 'px'; ctxEl.style.top = y + 'px';
  ctxEl.style.transformOrigin = `${ev.clientX - x}px ${ev.clientY - y}px`;
}
function closeMenu() { ctxEl.hidden = true; }
const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {});
function itemMenu(id) {
  const real = id.startsWith('x:') ? connEntity(id) : id.startsWith('m:') ? 'f:' + id.slice(2) : id;
  const i = info(real);
  const path = i.type === 'route' ? `${i.r.m} ${i.r.p}` : i.type === 'node' ? (i.n.paths || []).join(' ') : i.path;
  const fileForEditor = i.type === 'file' ? [i.f.p, 1] : i.type === 'route' ? [i.r.f, i.r.l] : i.type === 'symbol' ? [i.f.p, i.s[2]] : null;
  const url = fileForEditor && editorUrl(...fileForEditor);
  return [
    { title: i.name },
    id.startsWith('x:') ? { label: `Go to ${i.name}`, icon: 'right', hint: '2×click', run: () => reveal(real) }
      : drillable(real) && state.container !== real ? { label: 'Open', icon: 'drill', hint: '2×click', run: () => open(real) } : null,
    state.container === 'q:answer' && !id.startsWith('x:') ? { label: 'Show on the map', icon: 'external', run: () => reveal(real) } : null,
    EXPORTED ? null : { label: 'Ask about this', icon: 'spark', run: () => addAskContext(real) },
    { label: 'Show details', icon: 'panel', run: () => { setPanel(true); if (id.startsWith('x:')) reveal(real); else select(id); } },
    '-',
    path ? { label: i.type === 'route' ? 'Copy endpoint' : 'Copy path', icon: 'copy', run: () => copy(path) } : null,
    { label: 'Copy name', icon: 'copy', run: () => copy(i.name) },
    url ? { label: 'Open in editor', icon: 'open', run: () => { location.href = url; } } : null,
  ];
}
function edgeMenu(e) {
  const ep = (x) => x.startsWith('x:') ? connEntity(x) : x.startsWith('m:') ? 'f:' + x.slice(2) : x;
  return [
    { title: `${nameOf(e.a)} → ${nameOf(e.b)}` },
    EXPORTED ? null : { label: 'Ask about this connection', icon: 'spark', run: () => { addAskContext(ep(e.a)); addAskContext(ep(e.b)); } },
    { label: 'Show details', icon: 'panel', run: () => { setPanel(true); select({ edge: e.id }); } },
    '-',
    { label: `Go to ${nameOf(e.a)}`, icon: 'left', run: () => reveal(ep(e.a)) },
    { label: `Go to ${nameOf(e.b)}`, icon: 'right', run: () => reveal(ep(e.b)) },
  ];
}
function canvasMenu() {
  return [
    { label: 'Fit to screen', icon: 'fit', hint: 'F', run: () => fit(true) },
    state.container !== 'root' ? { label: 'Up one level', icon: 'left', hint: '⌫', run: up } : null,
    state.container !== 'root' ? { label: 'Back to overview', icon: 'home', run: () => go('root') } : null,
    '-',
    { label: 'Search', icon: 'search', hint: '/', run: openPalette },
    EXPORTED ? null : { label: 'Ask about this view', icon: 'spark', run: () => { if (state.container !== 'root' && state.container !== 'q:answer') addAskContext(state.container); askInput.focus(); } },
  ];
}
svg.addEventListener('contextmenu', (ev) => { ev.preventDefault(); hideTip(); openMenu(ev, canvasMenu()); });
window.addEventListener('pointerdown', (ev) => { if (!ctxEl.hidden && !ctxEl.contains(ev.target)) closeMenu(); }, true);
window.addEventListener('blur', closeMenu);

// ======================= pan / zoom =======================
function applyTransform() {
  const { x, y, k } = state.t;
  vp.style.transform = `translate(${x}px,${y}px) scale(${k})`;
  svg.classList.toggle('lod-low', k < 0.42);
  svg.classList.toggle('lod-mid', k >= 0.42 && k < 0.65);
}
const stageRect = () => svg.getBoundingClientRect();
function setT(t, animate) {
  state.t = t;
  if (animate) { vp.classList.add('anim'); requestAnimationFrame(applyTransform); setTimeout(() => vp.classList.remove('anim'), 520); } else applyTransform();
}
/** The canvas area not covered by the header, context title, details panel and ask bar. */
function freeArea() {
  const r = stageRect();
  const open = !document.body.classList.contains('no-panel');
  const sheet = isPhone(); // on a phone the details panel is a sheet at the bottom, not a column at the side
  const panelW = open && !sheet ? $('#panel').offsetWidth + 32 : 0;
  const top = ($('header').offsetHeight || 64) + 8 + Math.min(130, $('#context').offsetHeight);
  const bottom = open && sheet ? $('#panel').offsetHeight + 24 : $('#ask').offsetHeight + 36;
  return { x: 16, y: top, w: Math.max(200, r.width - panelW - 32), h: Math.max(140, r.height - top - bottom) };
}
function fit(animate) {
  const b = state.bounds; if (!b) return;
  const a = freeArea();
  const k = Math.min(a.w / (b.w + 40), a.h / (b.h + 20), 1.1);
  setT({ k, x: a.x + (a.w - b.w * k) / 2 - b.x * k, y: a.y + Math.max(0, (a.h - b.h * k) / 2) - b.y * k }, animate);
}
function zoomBy(f, cx, cy) {
  const r = stageRect();
  cx ??= r.width / 2; cy ??= r.height / 2;
  const k = clamp(state.t.k * f, 0.08, 2.5);
  setT({ k, x: cx - (cx - state.t.x) * (k / state.t.k), y: cy - (cy - state.t.y) * (k / state.t.k) }, false);
}
// wheel/pinch zooms around the cursor; two-finger trackpad scroll pans
svg.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const r = stageRect();
  const trackpadPan = !ev.ctrlKey && ev.deltaMode === 0 && (Math.abs(ev.deltaX) > 0 || Math.abs(ev.deltaY) < 40);
  if (trackpadPan) setT({ ...state.t, x: state.t.x - ev.deltaX, y: state.t.y - ev.deltaY }, false);
  else zoomBy(Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0018)), ev.clientX - r.left, ev.clientY - r.top);
}, { passive: false });
let drag = null;
const fingers = new Map(); let pinch = null; // touch only: the fingers on the map, and the pinch they make
let swallowClick = false; // touch screens don't reliably send a click after a drag or pinch, so a flag (cleared at the next touch) stops the end of a gesture selecting a box
svg.addEventListener('click', (e) => { if (swallowClick) { swallowClick = false; e.stopPropagation(); } }, true);
svg.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  if (ev.pointerType === 'touch') {
    if (fingers.size >= 2) return; // a third finger is ignored
    fingers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); swallowClick = false; vp.classList.remove('anim'); // a glide still running would keep moving the map under the finger
    if (fingers.size === 2) { if (drag?.moved) swallowClick = true; drag = null; svg.classList.remove('panning'); hideTip(); pinch = { ...pinchNow(), t: { ...state.t }, moved: false }; return; }
  }
  drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, tx: state.t.x, ty: state.t.y, moved: false };
});
window.addEventListener('pointermove', (ev) => {
  if (!drag || ev.pointerId !== drag.id) return; // only the finger that started the drag moves the map
  const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  drag.moved = true; svg.classList.add('panning'); hideTip();
  setT({ ...state.t, x: drag.tx + dx, y: drag.ty + dy }, false);
});
const endDrag = (ev) => {
  if (!drag || ev.pointerId !== drag.id) return;
  if (drag.moved) { if (ev.pointerType === 'touch') swallowClick = true; else svg.addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true }); }
  drag = null; svg.classList.remove('panning');
};
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag); // the browser took the touch over: end the drag instead of leaving it stuck
svg.addEventListener('click', () => select(null));
// two fingers: pinch zooms around the point between them, and moving both together pans (one finger still drags)
const pinchNow = () => { const [a, b] = [...fingers.values()]; return { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
window.addEventListener('pointermove', (ev) => {
  if (!fingers.has(ev.pointerId)) return;
  fingers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (!pinch || fingers.size !== 2) return;
  const now = pinchNow(), r = stageRect(), t0 = pinch.t;
  const k = clamp(t0.k * now.d / pinch.d, 0.08, 2.5), f = k / t0.k;
  pinch.moved = true;
  setT({ k, x: (now.x - r.left) - ((pinch.x - r.left) - t0.x) * f, y: (now.y - r.top) - ((pinch.y - r.top) - t0.y) * f }, false);
});
const liftFinger = (ev) => {
  if (!fingers.delete(ev.pointerId)) return;
  if (pinch?.moved) swallowClick = true; // lifting a finger after a pinch isn't a tap
  if (fingers.size < 2) pinch = null;
};
window.addEventListener('pointerup', liftFinger);
window.addEventListener('pointercancel', liftFinger);
// on a touch device the browser's address bar sliding in and out resizes the window by a few pixels, mid-gesture: that must not re-fit the map
let lastWidth = innerWidth;
window.addEventListener('resize', () => {
  const heightOnly = innerWidth === lastWidth; lastWidth = innerWidth;
  if (matchMedia('(pointer: coarse)').matches && (heightOnly || drag || pinch)) return;
  fit(false);
});
$('#z-in').onclick = () => zoomBy(1.25);
$('#z-out').onclick = () => zoomBy(0.8);
$('#z-fit').onclick = () => fit(true);

// ======================= navigation =======================
function setHash(container, sel) {
  if (container.startsWith('q:')) return; // answer views are transient
  const p = new URLSearchParams();
  if (container !== 'root') p.set('v', container);
  if (sel && typeof sel === 'string') p.set('s', sel);
  const s = p.toString();
  try { if (location.hash.slice(1) !== s) history.pushState(null, '', s ? '#' + s : location.pathname + location.search); } catch {}
}
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  let v = p.get('v') || 'root', s = p.get('s');
  if (v !== 'root' && !parentOf.has(v)) v = 'root';
  if (s && !parentOf.has(s) && !s.startsWith('x:') && !s.startsWith('m:')) s = null;
  return { v, s };
}
window.addEventListener('popstate', () => { const { v, s } = readHash(); go(v, { select: s, push: false }); });

async function go(container, { select: sel = null, push = true, zoomFrom = null, after, force = false } = {}) {
  hideTip();
  custom.panel = null;
  const changed = container !== state.container;
  state.container = container; state.selected = sel;
  if (push) setHash(container, sel);
  if (!changed && state.layout && !force) { applySelection(); renderPanel(); if (after) after(); return; }
  const c = zoomFrom && state.layout?.children.find((x) => x.id === zoomFrom);
  if (c) {
    const r = stageRect();
    const k = Math.min(r.width / c.width, r.height / c.height) * 0.6;
    setT({ k, x: r.width / 2 - (c.x + c.width / 2) * k, y: r.height / 2 - (c.y + c.height / 2) * k }, true);
    vp.style.opacity = '0';
    await new Promise((ok) => setTimeout(ok, 260));
  }
  vp.classList.remove('anim'); vp.style.opacity = '0';
  await render({ after: () => { vp.classList.add('anim'); requestAnimationFrame(() => { vp.style.opacity = '1'; }); setTimeout(() => vp.classList.remove('anim'), 340); renderPanel(); if (after) after(); } });
}
function open(item) {
  if (item.startsWith('x:')) { reveal(connEntity(item)); return; }
  if (item.startsWith('m:')) return;
  if (state.container === 'q:answer' && !drillable(item)) { reveal(item); return; }
  if (!drillable(item)) { select(item); return; }
  closeSheet();
  go(item, { zoomFrom: item });
}
function up() { if (state.container === 'root') return; closeSheet(); const from = state.container; go(parentOf.get(from) || 'root', { select: from }); }
function reveal(item) {
  if (item === 'root') return go('root');
  const container = parentOf.get(item) || 'root';
  go(container, { select: item, after: () => { const g = state.chipEls.get(item); if (g) { g.classList.remove('flash'); void g.getBBox(); g.classList.add('flash'); centerOn(item); } } });
}
/** Moves the map just far enough that a box isn't hidden behind the top bar or the sheet; the zoom and everything else stay as they are. */
function bringIntoView(item) {
  const c = state.layout?.children.find((x) => x.id === item); if (!c) return;
  const a = freeArea(), { k, x, y } = state.t;
  const box = { l: c.x * k + x, t: c.y * k + y, w: c.width * k, h: c.height * k };
  let dx = 0, dy = 0;
  if (box.l + box.w > a.x + a.w) dx = a.x + a.w - (box.l + box.w);
  if (box.l + dx < a.x) dx = a.x - box.l;
  if (box.t + box.h > a.y + a.h) dy = a.y + a.h - (box.t + box.h);
  if (box.t + dy < a.y) dy = a.y - box.t;
  if (dx || dy) setT({ k, x: x + dx, y: y + dy }, true);
}
function centerOn(item) {
  const c = state.layout?.children.find((x) => x.id === item); if (!c) return;
  const a = freeArea();
  const k = Math.max(state.t.k, 0.75);
  setT({ k, x: a.x + a.w / 2 - (c.x + c.width / 2) * k, y: a.y + a.h / 2 - (c.y + c.height / 2) * k }, true);
}

// ======================= selection =======================
function select(sel) {
  custom.panel = null; state.selected = sel; if (typeof sel === 'string' || sel === null) setHash(state.container, sel); applySelection(); renderPanel();
  // on a phone, tapping a box shows its details: open the sheet, then bring the box into the part of the screen the sheet leaves free
  if (sel && isPhone() && document.body.classList.contains('no-panel')) { setPanel(true); if (typeof sel === 'string') bringIntoView(sel); }
}
function applySelection() {
  const sel = state.selected;
  svg.classList.remove('dim');
  for (const g of state.chipEls?.values() || []) g.classList.remove('sel', 'hl');
  for (const { g, pg } of state.edgeEls?.values() || []) { g.classList.remove('hl'); pg.classList.remove('hl'); }
  if (!sel) return;
  const mark = (x) => { x.g.classList.add('hl'); x.pg.classList.add('hl'); };
  if (typeof sel === 'object' && sel.edge) {
    const x = state.edgeEls.get(sel.edge); if (!x) return;
    svg.classList.add('dim'); mark(x);
    for (const id of [x.e.a, x.e.b]) state.chipEls.get(id)?.classList.add('hl');
    return;
  }
  const g = state.chipEls?.get(sel); if (!g) return;
  svg.classList.add('dim'); g.classList.add('sel', 'hl');
  for (const x of state.edgeEls.values()) if (x.e.a === sel || x.e.b === sel) { mark(x); state.chipEls.get(x.e.a === sel ? x.e.b : x.e.a)?.classList.add('hl'); }
}

// ======================= chrome: context, crumbs, legend =======================
function renderContext() {
  if (state.container === 'q:answer') {
    $('#context').innerHTML = `<div class="k"><span class="ico" style="--c:var(--on)">${icon(state.answer.icon || 'spark')}</span>${h(state.answer.kind || 'Answer')} · ${plural(state.answer.items.length, 'card')}</div><h1>${h(state.answer.title)}</h1><p>${h(state.answer.question)}</p>`;
    return;
  }
  const i = info(state.container);
  const kind = state.container === 'root' ? 'Overview' : i.type === 'node' ? i.kind.charAt(0).toUpperCase() + i.kind.slice(1) : i.type === 'dir' ? 'Folder' : i.type === 'file' ? 'File' : i.type;
  const badge = state.container === 'root' ? '' : `<span class="ico" style="--c:${colorOf(i)}">${icon(iconKey(i))}</span>`;
  $('#context').innerHTML = `<div class="k">${badge}${h(kind)}</div><h1>${h(i.name)}</h1>${i.desc ? `<p class="cd" id="ctx-desc">${h(i.desc)}</p>` : ''}${state.view?.hidden ? `<p class="cx" style="color:var(--text-3);font-size:12.5px;margin-top:8px">${state.view.hidden} more exports aren't imported by name anywhere; they're listed in the details panel.</p>` : ''}${i.desc ? '<button type="button" class="ctx-more" aria-controls="ctx-desc" hidden></button>' : ''}`;
  foldContext();
}
/** On a phone the description folds to one line; the More / Less toggle shows only when there's more to read, and the choice is remembered on this device. */
function foldContext() {
  const ctx = $('#context'), more = ctx.querySelector('.ctx-more'), desc = ctx.querySelector('.cd');
  if (!more || !desc) return;
  const open = store.get('contextOpen', false);
  ctx.classList.add('folded');
  const long = desc.scrollHeight > desc.clientHeight + 1 || !!ctx.querySelector('.cx');
  ctx.classList.toggle('folded', !open);
  more.hidden = !long;
  desc.inert = isPhone() && long && !open; // folded on a phone: links on the hidden lines can't be tabbed to; More opens it
  more.textContent = open ? 'Less' : 'More';
  more.setAttribute('aria-expanded', String(open));
  more.onclick = () => { store.set('contextOpen', !open); foldContext(); };
}
function renderCrumbs() {
  const c = $('#crumbs'); c.innerHTML = '';
  const path = chain(state.container).slice().reverse();
  path.forEach((item, idx) => {
    if (idx) { const s = document.createElement('span'); s.className = 'sep'; s.textContent = '/'; c.appendChild(s); }
    const b = document.createElement('button');
    b.textContent = item === 'root' ? 'Overview' : item === 'q:answer' ? `${state.answer.kind || 'Answer'}: ${state.answer.title}` : info(item).name;
    if (item === state.container) b.className = 'cur';
    b.onclick = () => go(item, { select: path[idx + 1] || null });
    c.appendChild(b);
  });
  $('#btn-up').hidden = state.container === 'root';
}
function renderLegend(view) {
  const total = {}; for (const l of G.links) total[l.k] = (total[l.k] || 0) + 1;
  const here = {}; for (const e of view.edges) here[e.k] = (here[e.k] || 0) + 1;
  const L = $('#legend'); L.innerHTML = '<div class="lh">Show connections</div>';
  const techRow = () => { const lab = document.createElement('label'); lab.className = 'tech' + (technical() ? '' : ' off'); lab.innerHTML = `<input type="checkbox" ${technical() ? 'checked' : ''}><span>Show technical detail</span><span class="tog" style="margin-left:auto"></span>`; lab.querySelector('input').onchange = (ev) => setTechnical(ev.target.checked); return lab; };
  let off = 0;
  for (const k of KINDS) {
    if (!total[k]) continue;
    if (!state.kinds[k]) off++;
    const lab = document.createElement('label');
    lab.className = state.kinds[k] ? '' : 'off';
    lab.innerHTML = `<input type="checkbox" ${state.kinds[k] ? 'checked' : ''}><span class="sw" style="background:var(--k-${k})"></span>${KIND_LABEL[k]}<span class="n">${here[k] || ''}</span><span class="tog"></span>`;
    lab.querySelector('input').onchange = (ev) => { state.kinds[k] = ev.target.checked; store.set('kinds', state.kinds); render({ keepTransform: true }); };
    L.appendChild(lab);
  }
  L.appendChild(techRow());
  if (recentBy.size) {
    const lab = document.createElement('label'); lab.className = 'tech' + (recentShown ? '' : ' off');
    lab.innerHTML = `<input type="checkbox" ${recentShown ? 'checked' : ''}><span>Highlight recent work</span><span class="tog" style="margin-left:auto"></span>`;
    lab.querySelector('input').onchange = (ev) => { setRecentShown(ev.target.checked); lab.classList.toggle('off', !ev.target.checked); };
    L.appendChild(lab);
  }
  const fb = $('#filters-btn');
  fb.querySelector('.badge')?.remove();
  if (off) fb.insertAdjacentHTML('beforeend', `<span class="badge">${off}</span>`);
  fb.classList.toggle('icon', !off);
}

// ======================= inspector =======================
const editorUrl = (p, line = 1) => G.meta.root && !PLAN ? `vscode://file/${encodeURI(G.meta.root.replace(/\\/g, '/'))}/${encodeURI(p)}:${line}` : null;
const rowFor = (item, extra = '', dotColor) => {
  const i = info(item);
  return `<a class="row" data-go="${h(item)}" title="${h(i.path || '')}"><span class="dot" style="background:${dotColor || colorOf(i)}"></span><span class="rt"><div class="rn">${h(i.name)}</div>${i.desc ? `<div class="rd">${h(i.desc)}</div>` : ''}</span>${extra ? `<span class="rc">${extra}</span>` : ''}</a>`;
};
const routeRow = (ri, extra = '') => {
  const r = routes[ri];
  return `<a class="row" data-go="r:${ri}"><span class="method" style="--m:${methodVar(r.m)};margin-top:1px">${h(r.m)}</span><span class="rt"><div class="rn">${h(r.name)}</div>${r.d ? `<div class="rd">${h(r.d)}</div>` : ''}<div class="rp">${h(r.p)}</div></span>${extra ? `<span class="rc">${extra}</span>` : ''}</a>`;
};
const listSec = (title, rows, count, max = 30) => rows.length ? `<div class="sec"><h3>${h(title)} <span class="c">${count ?? rows.length}</span></h3><div class="list">${rows.slice(0, max).join('')}${rows.length > max ? `<div class="more">+${rows.length - max} more</div>` : ''}</div></div>` : '';
const pathBox = (p) => `<div class="pp"><span>${h(p)}</span><button data-copy="${h(p)}" title="Copy">${iconI('copy')}</button></div>`;
function header(i) {
  const kind = i.type === 'node' ? i.kind : i.type === 'symbol' ? i.symKind : i.type === 'route' ? 'Endpoint' : i.type === 'module' ? 'file' : i.type;
  return `<div class="ph"><span class="ico" style="--c:${colorOf(i)}">${icon(iconKey(i))}</span><span class="kindlabel">${h(kind)}</span></div>
    <h2 class="pt">${h(i.name)}</h2>${i.desc ? `<p class="pd">${h(i.desc)}</p>` : '<p class="pd empty">No description yet.</p>'}`;
}

function renderPanel() {
  const sel = state.selected;
  let html;
  if (sel && typeof sel === 'object' && sel.edge) html = edgePanel(state.edgeEls.get(sel.edge)?.e);
  else if (sel && sel.startsWith('x:')) html = itemPanel(connEntity(sel), true);
  else if (sel && sel.startsWith('m:')) html = itemPanel('f:' + sel.slice(2));
  else if (sel) html = itemPanel(sel);
  else html = state.container === 'root' ? overviewPanel() : state.container === 'q:answer' ? answerPanel() : itemPanel(state.container);
  // extensions add sections: 'overview' on the codebase panel, 'item' on a selected/opened item
  const where = sel && typeof sel === 'object' ? null : sel ? 'item' : state.container === 'root' ? 'overview' : state.container === 'q:answer' ? null : 'item';
  const target = sel && typeof sel === 'string' ? (sel.startsWith('x:') ? connEntity(sel) : sel.startsWith('m:') ? 'f:' + sel.slice(2) : sel) : state.container;
  const extOut = [];
  if (custom.panel) { html = custom.panel.html; extOut.push(...(custom.panel.bind ? [{ bind: custom.panel.bind, whole: true }] : [])); }
  else if (where) for (const fn of ext.sections[where]) {
    try {
      const r = fn(target);
      if (!r) continue;
      const o = typeof r === 'string' ? { html: r } : r;
      extOut.push(o);
      const block = `<div data-ext="${extOut.length - 1}">${o.html || ''}</div>`;
      // { top: true }: right after the panel's header section instead of at the end
      const second = o.top ? html.indexOf('<div class="sec"', 1) : -1;
      html = second > 0 ? html.slice(0, second) + block + html.slice(second) : html + block;
    } catch (e) { console.error('floorplan extension', e); }
  }
  panel.innerHTML = html || '';
  extOut.forEach((o, i) => { try { o.bind?.(o.whole ? panel : panel.querySelector(`[data-ext="${i}"]`)); } catch (e) { console.error('floorplan extension', e); } });
  panel.scrollTop = 0;
  panel.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); reveal(a.dataset.go); }));
  panel.querySelectorAll('[data-open]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); open(a.dataset.open); }));
  panel.querySelectorAll('[data-flow]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); startFlow(a.dataset.flow); }));
  panel.querySelectorAll('[data-sel]').forEach((a) => a.addEventListener('click', (ev) => { ev.preventDefault(); select(a.dataset.sel); centerOn(a.dataset.sel); }));
  panel.querySelector('[data-goroot]')?.addEventListener('click', () => go('root'));
  panel.querySelectorAll('[data-copy]').forEach((a) => a.addEventListener('click', () => { navigator.clipboard?.writeText(a.dataset.copy); a.textContent = '✓'; }));
  emit('panel', { selected: sel, container: state.container });
}

function answerPanel() {
  const a = state.answer;
  return `<div class="sec"><div class="ph"><span class="ico" style="--c:var(--accent)">${icon('feature')}</span><span class="kind">${h(a.kind || 'Answer')}</span></div><h2 class="pt">${h(a.title)}</h2><p class="pd">${h(a.question)}</p>${a.kind && a.answer ? `<div class="pd md">${md(a.answer)}</div>` : ''}
      <div class="actions"><button class="btn soft" data-goroot>Back to map</button></div></div>
    ${listSec('On this board', a.items.map((x, i) => { const ii = info(x.id); return `<a class="row" data-sel="${h(x.id)}"><span class="anote" style="margin:0;padding:0;background:none;border:0"><b>${i + 1}</b></span><span class="rt"><div class="rn">${h(ii.name)}</div>${x.note ? `<div class="rd">${h(x.note)}</div>` : ''}${ii.path ? `<div class="rp">${h(ii.path)}</div>` : ''}</span></a>`; }))}
    ${a.steps?.length >= 2 ? `<div class="sec"><h3>Walkthrough <span class="c">${a.steps.length}</span></h3><div class="list">${a.steps.map((s, i) => `<a class="row" data-sel="${h(s.id)}"><span class="dot" style="background:var(--accent)"></span><span class="rt"><div class="rn">${i + 1}. ${h(info(s.id).name)}</div><div class="rd">${h(s.note)}</div></span></a>`).join('')}</div></div>` : ''}`;
}

// Top-level parts, grouped under names people understand instead of bare colour dots.
const SYSTEM_GROUPS = [
  { label: 'Apps people use', hint: 'what users and staff open', kinds: ['ui'] },
  { label: 'Behind the scenes', hint: 'servers, background work, shared code', kinds: ['service', 'worker', 'library', 'feature', 'data', 'config'] },
  { label: 'Outside services', hint: 'other companies your app relies on', kinds: ['external'] },
  { label: 'Developer tools', hint: 'scripts, tests, deployment', kinds: ['script', 'test', 'infra'] },
];
function systemsSection(tops) {
  const placed = new Set();
  const parts = SYSTEM_GROUPS.map((g) => {
    const items = tops.filter((t) => g.kinds.includes(info(t).kind));
    items.forEach((t) => placed.add(t));
    return items.length ? `<div class="group-h">${h(g.label)}<span class="gd">${h(g.hint)}</span></div><div class="list">${items.map((t) => rowFor(t, info(t).kind === 'external' ? '' : technical() && !PLAN && statsOf(t)?.files ? fmt(statsOf(t).loc) + ' loc' : statsOf(t)?.files ? plural(statsOf(t).files, 'file') : '')).join('')}</div>` : '';
  });
  const rest = tops.filter((t) => !placed.has(t));
  if (rest.length) parts.push(`<div class="group-h">Other</div><div class="list">${rest.map((t) => rowFor(t)).join('')}</div>`);
  return `<div class="sec"><h3>Systems <span class="c">${tops.length}</span></h3>${parts.join('')}</div>`;
}

function overviewPanel() {
  const p = G.project;
  const tops = kids.get('root') || [];
  const undescribed = G.files.filter((f) => f.auto).length + routes.filter((r) => r.auto).length;
  return `<div class="sec"><div class="ph"><span class="ico" style="--c:var(--accent)">${icon('feature')}</span><span class="kind">${PLAN ? 'Blueprint' : 'Codebase'}</span></div><h2 class="pt">${h(p.name)}</h2>${p.summary ? `<p class="pd">${h(p.summary)}</p>` : ''}
      <div class="stats" style="margin-top:14px"><div><b>${fmt(G.meta.counts.files)}</b><span>${PLAN ? 'planned files' : 'files'}</span></div>${PLAN ? `<div><b>${fmt((G.screens || []).length)}</b><span>screens</span></div>` : `<div><b>${fmt(G.meta.counts.loc)}</b><span>lines</span></div>`}<div><b>${fmt(routes.length)}</b><span>endpoints</span></div></div>
      ${undescribed ? `<div class="callout">${undescribed} files and endpoints still use generated names. Run the skill again to describe them.</div>` : ''}</div>
    ${systemsSection(tops)}
    ${listSec('Guided flows', G.flows.map((f) => `<a class="row" data-flow="${h(f.id)}"><span class="dot" style="background:var(--accent)"></span><span class="rt"><div class="rn">${h(f.title)}</div>${f.description ? `<div class="rd">${h(f.description)}</div>` : ''}</span><span class="rc">${f.steps.length} steps</span></a>`))}
    ${listSec('Repositories', G.meta.repos.map((r) => `<div class="row" style="cursor:default"><span class="dot" style="background:var(--text-4)"></span><span class="rt"><div class="rn">${h(r.name)}</div><div class="rp">${h(r.branch || '')} @ ${h((r.head || '').slice(0, 7))}</div></span></div>`))}
    ${p.entrypoints?.length ? listSec('Entrypoints', p.entrypoints.filter((e) => files.has(e)).map((e) => rowFor('f:' + e))) : ''}
    <div class="sec" style="color:var(--text-3);line-height:1.7;font-size:12px">Click a card to inspect it · double-click to open it<br><span class="kbd">/</span> search · <span class="kbd">⌫</span> up · <span class="kbd">F</span> fit · <span class="kbd">P</span> inspector</div>`;
}

function connections(item) {
  const own = new Set(chain(item));
  const inside = (x) => chain(x).includes(item);
  const peerOf = (x) => { const ch = chain(x); const idx = ch.findIndex((y) => own.has(y)); return ch[idx - 1] || x; };
  const out = new Map(), inn = new Map();
  for (const l of G.links) {
    const ia = inside(l.a), ib = inside(l.b);
    if (ia === ib) continue;
    const peer = peerOf(ia ? l.b : l.a);
    const m = ia ? out : inn;
    const key = peer + '|' + l.k;
    const cur = m.get(key) || { peer, k: l.k, w: 0 };
    cur.w += l.w; m.set(key, cur);
  }
  const rows = (m) => [...m.values()].sort((a, b) => b.w - a.w).map((c) => rowFor(c.peer, `${KIND_LABEL[c.k]} · ${c.w}`, `var(--k-${c.k})`));
  return { out: rows(out), inn: rows(inn) };
}

function itemPanel(item, viaConnector) {
  const i = info(item);
  let html = `<div class="sec">${header(i)}`;
  const actions = [];
  if (drillable(item) && state.container !== item) actions.push(`<button class="btn soft" data-open="${h(item)}">${iconI('drill')}Open</button>`);
  if (viaConnector || (parentOf.get(item) !== state.container && state.container !== item)) actions.push(`<button class="btn soft" data-go="${h(item)}">Show on map</button>`);
  if (i.type === 'node' || i.type === 'dir') {
    const n = i.n, s = statsOf(item);
    if (n?.details) html += n.details.split(/\n\n+/).map((p) => `<p class="pd" style="margin-top:8px">${h(p)}</p>`).join('');
    if (n?.paths?.length || i.d) html += pathBox(i.d ? i.d.path + '/' : n.paths.join('  '));
    if (actions.length) html += `<div class="actions">${actions.join('')}</div>`;
    html += '</div>';
    if (s?.files) {
      const langs = Object.entries(n?.stats.langs || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const tot = langs.reduce((a, [, v]) => a + v, 0) || 1;
      const palette = ['#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'];
      const nr = routes.filter((r) => chain('f:' + r.f).includes(item)).length;
      html += `<div class="sec"><div class="stats"><div><b>${fmt(s.files)}</b><span>${PLAN ? 'planned files' : 'files'}</span></div>${PLAN ? '' : `<div><b>${fmt(s.loc)}</b><span>lines</span></div>`}<div><b>${nr}</b><span>endpoints</span></div></div>
        ${langs.length && !PLAN ? `<div class="bar">${langs.map(([, v], k) => `<span style="flex:${v};background:${palette[k]}"></span>`).join('')}</div><div class="legend-row">${langs.map(([l, v], k) => `<span><span class="dot" style="background:${palette[k]}"></span>${h(l)} ${Math.round((v / tot) * 100)}%</span>`).join('')}</div>` : ''}</div>`;
    }
    if (n?.packages?.length || n?.hosts?.length || n?.tags?.length) html += `<div class="sec"><h3>Matched by</h3><div class="tags">${[...n.packages.map((p) => 'pkg ' + p), ...n.hosts.map((p) => 'host ' + p), ...n.tags.map((t) => '#' + t)].map((t) => `<span class="tag">${h(t)}</span>`).join('')}</div></div>`;
    html += listSec('Inside', (kids.get(item) || []).filter((k) => !k.startsWith('f:')).map((k) => rowFor(k)));
    const c = connections(item);
    html += listSec('Used by', c.inn) + listSec('Depends on', c.out);
    const fl = (i.d ? i.d.files : G.files.filter((f) => chain('f:' + f.p).includes(item))).slice().sort((a, b) => b.loc - a.loc);
    html += listSec(PLAN ? 'Planned files' : 'Files', fl.map((f) => rowFor('f:' + f.p, PLAN ? '' : fmt(f.loc))), fl.length, 25);
  } else if (i.type === 'file' || i.type === 'module') {
    const f = i.f, fid = 'f:' + f.p, url = editorUrl(f.p);
    if (f.note) html += `<div class="callout">${h(f.note)}</div>`;
    if (f.tooLarge) html += `<div class="callout">Too big for Floorplan to read, so what it uses, its endpoints and any secrets in it weren’t checked. Ask ${AGENT.name} to update the floorplan with a bigger file limit to include it.</div>`;
    html += pathBox(f.p);
    if (url) actions.push(`<a class="btn soft" href="${url}">${iconI('open')}Open in editor</a>`);
    if (actions.length) html += `<div class="actions">${actions.join('')}</div>`;
    const owner = nodes.get(f.n);
    html += `</div><div class="sec"><div class="stats">${PLAN ? `<div><b>${fmt(G.links.filter((l) => l.a === fid).length)}</b><span>uses</span></div>` : `<div><b>${fmt(f.loc)}</b><span>lines</span></div>`}<div><b>${(routesByFile.get(f.p) || []).length}</b><span>endpoints</span></div><div><b>${technical() ? (f.s || []).length : fmt(G.links.filter((l) => l.b === 'f:' + f.p).length)}</b><span>${technical() ? 'exports' : 'used by'}</span></div></div>
      ${owner ? `<div class="list" style="margin-top:12px">${rowFor('n:' + owner.id, 'module')}</div>` : ''}</div>`;
    html += listSec('Endpoints', (routesByFile.get(f.p) || []).map((ri) => routeRow(ri)), undefined, 60);
    const inL = G.links.filter((l) => l.b === fid), outL = G.links.filter((l) => l.a === fid);
    const rowL = (l, other) => rowFor(other, l.calls?.length ? plural(l.calls.length, 'call') : KIND_LABEL[l.k], `var(--k-${l.k})`);
    html += listSec('Used by', inL.map((l) => rowL(l, l.a)));
    html += listSec('Depends on', outL.map((l) => rowL(l, l.b)));
    const handlers = new Set((routesByFile.get(f.p) || []).map((ri) => routes[ri].h));
    if (technical()) html += listSec('Exports', (f.s || []).map((s, k) => [s, k]).filter(([s]) => !handlers.has(s[0])).map(([s, k]) => `<a class="row" ${parentOf.has(`s:${f.p}#${k}`) ? `data-go="s:${h(f.p)}#${k}"` : ''}><span class="dot" style="background:var(--n-symbol)"></span><span class="rt"><div class="rn" style="font-family:var(--mono);font-size:12px">${h(s[0])}</div>${s[4] ? `<div class="rd">${h(s[4])}</div>` : ''}</span><span class="rc">${h(s[1])} · L${s[2]}</span></a>`), undefined, 60);
  } else if (i.type === 'route') {
    const r = i.r, url = editorUrl(r.f, r.l);
    html += pathBox(`${r.m} ${r.p}`);
    if (url) actions.push(`<a class="btn soft" href="${url}">${iconI('open')}Open handler</a>`);
    html += `<div class="actions">${actions.join('')}</div></div>`;
    html += `<div class="sec"><h3>Handled by</h3><div class="list">${rowFor('f:' + r.f, r.h ? h(r.h) + '()' : '')}</div></div>`;
    const ri = routes.indexOf(r);
    const callers = new Map();
    for (const l of G.links) { const n = (l.calls || []).filter(([x]) => x === ri).length; if (n) callers.set(l.a, (callers.get(l.a) || 0) + n); }
    html += callers.size ? listSec('Called from', [...callers.entries()].map(([a, n]) => rowFor(a, plural(n, 'call'), 'var(--k-http)')))
      : `<div class="sec"><h3>Called from</h3><p class="pd empty">No call sites matched in the scanned code. It may be called by an external system, or through a URL built at runtime.</p></div>`;
  } else if (i.type === 'symbol') {
    const url = editorUrl(i.f.p, i.s[2]);
    html += pathBox(`${i.f.p}:${i.s[2]}`);
    if (url) actions.push(`<a class="btn soft" href="${url}">${iconI('open')}Open in editor</a>`);
    html += `<div class="actions">${actions.join('')}</div></div>`;
    html += `<div class="sec"><h3>Defined in</h3><div class="list">${rowFor('f:' + i.f.p)}</div></div>`;
    const users = G.links.filter((l) => l.b === 'f:' + i.f.p && (l.names || []).some((nm) => nm === i.s[0] || (nm === 'default' && i.s[3])));
    html += listSec('Imported by', users.map((l) => rowFor(l.a)));
  } else html += '</div>';
  return html;
}

function edgePanel(e) {
  if (!e) return '';
  const eps = endpointsOf(e);
  const names = [...new Set(e.links.flatMap((l) => l.names || []))];
  const desc = e.links.map((l) => l.desc).filter(Boolean);
  const ep = (id) => id.startsWith('x:') ? connEntity(id) : id;
  const pairs = e.links.filter((l) => l.a.startsWith('f:') || l.b.startsWith('f:'));
  return `<div class="sec"><div class="ph"><span class="ico" style="--c:var(--k-${e.k})">${icon(e.k === 'http' ? 'route' : 'feature')}</span><span class="kind">${KIND_LABEL[e.k]} connection</span></div>
      <h2 class="pt">${h(nameOf(e.a))} → ${h(nameOf(e.b))}</h2>
      <p class="pd">${desc.length ? h(desc.join(' ')) : `${plural(e.w, 'connection')}${eps.length ? ` across ${plural(eps.length, 'endpoint')}` : ''}${e.k === 'http' && eps.length ? ', matched from call sites to route definitions' : ''}.`}</p>
      <div class="actions"><button class="btn soft" data-go="${h(ep(e.a))}">Go to source</button><button class="btn soft" data-go="${h(ep(e.b))}">Go to target</button></div></div>
    ${listSec('Endpoints', eps.map((x) => routeRow(x.i, plural(x.n, 'call'))), eps.length, 40)}
    ${names.length && technical() ? `<div class="sec"><h3>Imported names <span class="c">${names.length}</span></h3><div class="tags">${names.slice(0, 60).map((x) => `<span class="tag">${h(x)}</span>`).join('')}</div></div>` : ''}
    ${listSec('Files involved', pairs.map((l) => { const a = l.a.startsWith('f:') ? files.get(l.a.slice(2)) : null, b = l.b.startsWith('f:') ? files.get(l.b.slice(2)) : null;
      return `<a class="row" data-go="${h(l.a)}"><span class="dot" style="background:var(--k-${l.k})"></span><span class="rt"><div class="rn">${h(a ? a.name : nameOf(l.a))} → ${h(b ? b.name : nameOf(l.b))}</div><div class="rp">${h(a ? a.p : '')}</div></span><span class="rc">${l.w}</span></a>`; }), pairs.length, 40)}`;
}

// ======================= search (command palette) =======================
const index = [
  ...G.nodes.map((n) => ({ id: 'n:' + n.id, name: n.label, desc: n.summary || '', path: n.id, kind: n.kind, w: 4 })),
  ...G.files.map((f) => ({ id: 'f:' + f.p, name: f.name, desc: f.d || '', path: f.p, kind: 'file', w: 3 })),
  ...routes.map((r, i) => ({ id: 'r:' + i, name: r.name, desc: r.d || '', path: `${r.m} ${r.p}`, kind: 'route', w: 3 })),
  ...G.files.flatMap((f) => (f.s || []).map((s, i) => ({ id: `s:${f.p}#${i}`, name: s[0], desc: s[4] || '', path: f.p, kind: symIcon(s[1]), w: 1 }))).filter((x) => parentOf.has(x.id)),
];
const pal = $('#palette'), sInput = $('#search'), sRes = $('#results');
let sActive = 0, sItems = [];
function openPalette() { pal.classList.add('open'); sInput.value = ''; runSearch(); setTimeout(() => sInput.focus(), 0); }
function closePalette() { pal.classList.remove('open'); }
function runSearch() {
  const terms = sInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let scored = [];
  if (!terms.length) scored = (kids.get('root') || []).map((id) => [1, index.find((x) => x.id === id)]).filter((x) => x[1]);
  else for (const it of index) {
    if (!technical() && (it.kind === 'function' || it.kind === 'class')) continue;
    const n = it.name.toLowerCase(), d = it.desc.toLowerCase(), p = it.path.toLowerCase();
    let s = 0;
    for (const t of terms) {
      const sc = n === t ? 30 : n.startsWith(t) ? 20 : n.includes(t) ? 12 : p.includes(t) ? 6 : d.includes(t) ? 4 : 0;
      if (!sc) { s = 0; break; }
      s += sc;
    }
    if (s) scored.push([s + it.w * 2 - n.length * 0.02, it]);
  }
  sItems = scored.sort((a, b) => b[0] - a[0]).slice(0, 40).map((x) => x[1]);
  sActive = 0;
  sRes.innerHTML = sItems.map((it, i) => {
    const ii = info(it.id);
    const ic = it.kind === 'route' ? `<span class="method" style="--m:${methodVar(ii.r.m)}">${h(ii.r.m)}</span>` : `<span class="ico" style="--c:${colorOf(ii)}">${icon(iconKey(ii))}</span>`;
    return `<div class="r${i === 0 ? ' active' : ''}" data-i="${i}">${ic}<span class="rt"><div class="rn">${h(it.name)}</div><div class="rd">${h(it.desc || it.path)}</div></span><span class="rk">${h(it.kind === 'route' ? ii.r.p : it.kind)}</span></div>`;
  }).join('') || '<div class="empty">No matches</div>';
  sRes.querySelectorAll('.r').forEach((r) => { r.addEventListener('mousedown', (ev) => { ev.preventDefault(); pick(+r.dataset.i); }); r.addEventListener('mousemove', () => setActive(+r.dataset.i)); });
}
function setActive(i) { sActive = i; sRes.querySelectorAll('.r').forEach((r, k) => r.classList.toggle('active', k === i)); sRes.children[i]?.scrollIntoView({ block: 'nearest' }); }
function pick(i) { const it = sItems[i]; if (!it) return; closePalette(); reveal(it.id); }
sInput.addEventListener('input', runSearch);
sInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); setActive(clamp(sActive + (ev.key === 'ArrowDown' ? 1 : -1), 0, sItems.length - 1)); }
  else if (ev.key === 'Enter') pick(sActive);
  else if (ev.key === 'Escape') closePalette();
});
pal.addEventListener('mousedown', (ev) => { if (ev.target === pal) closePalette(); });
$('#search-btn').onclick = openPalette;

// ======================= flows =======================
const fm = $('#flowmenu');
fm.addEventListener('click', (ev) => ev.stopPropagation());
function renderFlowMenu() {
  fm.innerHTML = G.flows.map((f) => f.custom && !EXPORTED
    ? `<div class="r custom" data-flow="${h(f.id)}"><div class="rt"><b>${h(f.title)}<span class="yours">yours</span></b><span>${f.steps.length} steps${f.description ? ' · ' + h(f.description) : ''}</span></div><button class="del" data-del="${h(f.id)}" title="Delete flow">${iconI('x')}</button></div>`
    : `<div class="r" data-flow="${h(f.id)}"><b>${h(f.title)}</b><span>${f.steps.length} steps${f.description ? ' · ' + h(f.description) : ''}</span></div>`).join('')
    + (EXPORTED ? (G.flows.length ? '' : '<div class="r" style="cursor:default"><span>No flows in this copy.</span></div>') : (G.flows.length ? '<div class="mi-sep"></div>' : '')
    + `<div class="r new" data-new>${iconI('spark')}<b>Request a new flow…</b></div>`);
  fm.querySelectorAll('[data-flow]').forEach((r) => r.onclick = () => { fm.classList.remove('open'); startFlow(r.dataset.flow); });
  fm.querySelectorAll('[data-del]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); deleteCustomFlow(b.dataset.del); });
  const nf = fm.querySelector('[data-new]'); if (nf) nf.onclick = showFlowForm;
}
function showFlowForm() {
  fm.innerHTML = `<form class="ff"><label>Describe what to trace, and ${AGENT.name} builds a step-by-step flow through the map.</label>
    <textarea placeholder="e.g. How does an order end up charged through Stripe?" spellcheck="false"></textarea>
    ${askState.engine ? '' : '<div class="note">Ask in your Antigravity chat.</div>'}
    <div class="ffa"><button type="button" class="btn" data-cancel>Cancel</button><button type="submit" class="btn primary" ${askState.engine ? '' : 'disabled'}>Build flow</button></div></form>`;
  const form = fm.querySelector('form'), ta = form.querySelector('textarea');
  setTimeout(() => ta.focus(), 30);
  ta.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); form.requestSubmit(); } if (ev.key === 'Escape') { ev.stopPropagation(); renderFlowMenu(); } });
  form.querySelector('[data-cancel]').onclick = renderFlowMenu;
  form.onsubmit = (ev) => { ev.preventDefault(); const p = ta.value.trim(); if (!p) return; fm.classList.remove('open'); renderFlowMenu(); requestFlow(p); };
}

// Custom flows persist next to the map when served (custom-flows.json, folded in by build.mjs),
// otherwise in this browser. Steps are saved with stable refs so they survive rebuilds.
const FLOWS_KEY = `flows:${G.project.name}`;
const stableRef = (id) => id.startsWith('r:') ? `route:${routes[+id.slice(2)].m} ${routes[+id.slice(2)].p}` : id.startsWith('s:') ? `sym:${symOf(id).f.p}#${symOf(id).s[0]}` : id;
function liveRef(ref) {
  if (ref.startsWith('route:')) { const i = routes.findIndex((r) => `${r.m} ${r.p}` === ref.slice(6)); return i < 0 ? null : 'r:' + i; }
  if (ref.startsWith('sym:')) { const p = ref.slice(4, ref.lastIndexOf('#')), nm = ref.slice(ref.lastIndexOf('#') + 1); const i = files.get(p)?.s?.findIndex((s) => s[0] === nm) ?? -1; return i < 0 ? null : `s:${p}#${i}`; }
  return Q.exists(ref) ? ref : null;
}
const toStored = (fl) => ({ id: fl.id, title: fl.title, description: fl.description, steps: fl.steps.map((s) => ({ ref: stableRef(s.ref), note: s.note })) });
function addFlow(stored) {
  if (G.flows.some((x) => x.id === stored.id)) return null;
  const steps = (stored.steps || []).map((s) => ({ ref: liveRef(s.ref), note: s.note || '' })).filter((s) => s.ref);
  if (steps.length < 2) return null;
  const fl = { id: stored.id, title: stored.title || 'Flow', description: stored.description || '', steps, custom: true };
  G.flows.push(fl);
  return fl;
}
const serverApi = (method, body) => fetch('/api/flows', { method, headers: { 'content-type': 'application/json', 'x-floorplan-token': window.FLOORPLAN_SERVER.token }, ...(body ? { body: JSON.stringify(body) } : {}) }).then((r) => r.json());
async function saveCustomFlow(fl) {
  if (window.FLOORPLAN_SERVER) { try { await serverApi('POST', { flow: toStored(fl) }); return; } catch {} }
  store.set(FLOWS_KEY, [...store.get(FLOWS_KEY, []).filter((x) => x.id !== fl.id), toStored(fl)]);
}
async function deleteCustomFlow(id) {
  G.flows = G.flows.filter((x) => x.id !== id);
  if (state.flow?.f.id === id) stopFlow();
  if (window.FLOORPLAN_SERVER) { try { await serverApi('DELETE', { id }); } catch {} }
  store.set(FLOWS_KEY, store.get(FLOWS_KEY, []).filter((x) => x.id !== id));
  renderFlowMenu();
}
async function loadCustomFlows() {
  for (const s of store.get(FLOWS_KEY, [])) addFlow(s);
  if (window.FLOORPLAN_SERVER) { try { for (const s of (await serverApi('GET')).flows || []) addFlow(s); } catch {} }
  renderFlowMenu();
}

// Served by serve.mjs: reload in place when the map is rebuilt (the view lives in the URL hash). If the
// server restarts, this tab's token is stale and the stream closes for good, so wait for it to come back.
(function liveReload() {
  const S = window.FLOORPLAN_SERVER;
  if (!S || typeof EventSource === 'undefined') return;
  const reload = () => { toast('Map updated'); setTimeout(() => location.reload(), 500); };
  const es = new EventSource('/api/events?token=' + encodeURIComponent(S.token));
  es.addEventListener('reload', reload);
  es.onerror = () => {
    if (es.readyState !== EventSource.CLOSED) return; // a dropped connection retries on its own
    // every second at first (a restart takes about that long), then every 5s, for up to 30 minutes
    const t0 = Date.now();
    const check = () => fetch('/', { cache: 'no-store' }).then((r) => (r.ok ? reload() : next()), next);
    const next = () => { const age = Date.now() - t0; if (age < 30 * 60000) setTimeout(check, age < 30000 ? 1000 : 5000); };
    check();
  };
})();

async function requestFlow(prompt) {
  if (!askState.engine) { setWarning(window.FLOORPLAN_SERVER ? 'cli_missing' : 'no_engine'); return; }
  if (askState.busy) cancelAsk();
  setBusy(true);
  askState.ctl = new AbortController();
  const label = `New flow: ${prompt}`;
  const lines = ['Thinking…'];
  const progress = (t) => { lines.push(t); showProgress(label, lines.slice(-6)); };
  showProgress(label, lines);
  try {
    const raw = await askViaCli(prompt, progress, 'flow');
    const steps = (raw.steps || []).map((s) => ({ ref: String(s.id || ''), note: String(s.note || '') })).filter((s) => Q.exists(s.ref));
    if (steps.length < 2) throw { code: 'flow_empty', message: `${AGENT.name} couldn't find enough connected steps for that. Try naming where it starts or ends.` };
    const fl = { id: 'custom-' + Date.now().toString(36), title: String(raw.title || prompt).slice(0, 80), description: String(raw.description || ''), steps, custom: true };
    G.flows.push(fl);
    await saveCustomFlow(fl);
    renderFlowMenu();
    sheetShell(label, `<p>Added <strong>${h(fl.title)}</strong> to Flows, ${plural(fl.steps.length, 'step')}.${fl.description ? ' ' + h(fl.description) : ''}</p>
      <div class="sheet-actions"><button class="btn soft" data-play="${h(fl.id)}">${iconI('right')}Play again</button></div>`);
    sheet.querySelector('[data-play]').onclick = () => startFlow(fl.id);
    startFlow(fl.id);
  } catch (e) {
    if (e?.name === 'AbortError') showFailure(label, 'cancelled');
    else showFailure(label, e?.code || 'upstream_error', e?.message || String(e));
  } finally { setBusy(false); }
}
const legendEl = $('#legend');
$('#flows-btn').onclick = (ev) => { ev.stopPropagation(); legendEl.classList.remove('open'); fm.classList.toggle('open'); };
$('#filters-btn').onclick = (ev) => { ev.stopPropagation(); fm.classList.remove('open'); legendEl.classList.toggle('open'); };
legendEl.addEventListener('click', (ev) => ev.stopPropagation());
window.addEventListener('click', () => { fm.classList.remove('open'); legendEl.classList.remove('open'); });
function startFlow(id) { const f = G.flows.find((x) => x.id === id); if (!f) return; state.flow = { f, i: 0 }; flowStep(); }
function stopFlow() { state.flow = null; document.body.classList.remove('in-flow'); $('#flowbar').hidden = true; vp.querySelectorAll('.flowfx').forEach((x) => x.remove()); select(null); }
function lcaContainer(a, b) {
  const cb = new Set(chain(b));
  for (const x of chain(a)) if (cb.has(x)) return (x === a || x === b) ? (parentOf.get(x) || 'root') : x;
  return 'root';
}
function flowStep() {
  document.body.classList.add('in-flow'); // answer walkthroughs and the tour play flows too
  const { f, i } = state.flow;
  const a = f.steps[i].ref, b = f.steps[i + 1]?.ref;
  const container = b ? lcaContainer(a, b) : parentOf.get(a) || 'root';
  const bar = $('#flowbar'); bar.hidden = false;
  bar.innerHTML = `<div class="ft"><div class="fk">${h(f.title)} · step ${i + 1} of ${f.steps.length}</div><b>${h(info(a).name)}</b>${b ? ` <span>→</span> <b>${h(info(b).name)}</b>` : ''}<br><span>${h(f.steps[i].note)}</span><div class="dots">${f.steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div></div>
    <button class="btn icon" id="fl-prev" ${i === 0 ? 'disabled' : ''}>${iconI('left')}</button><button class="btn icon" id="fl-next">${iconI(i >= f.steps.length - 1 ? 'x' : 'right')}</button><button class="btn icon" id="fl-x" title="Exit">${iconI('x')}</button>`;
  $('#fl-prev').onclick = () => { state.flow.i--; flowStep(); };
  $('#fl-next').onclick = () => { if (state.flow.i >= f.steps.length - 1) stopFlow(); else { state.flow.i++; flowStep(); } };
  $('#fl-x').onclick = stopFlow;
  // an answer's walkthrough plays on the answer board itself
  if (state.flow.inPlace) { if (state.container === 'q:answer') highlightFlow(a, b); else go('q:answer', { after: () => highlightFlow(a, b) }); }
  else go(container, { after: () => highlightFlow(a, b) });
}
function highlightFlow(a, b) {
  vp.querySelectorAll('.flowfx').forEach((x) => x.remove());
  const ctx = { container: state.container, vis: new Set(state.view.visible), cchain: new Set(chain(state.container)) };
  const pa = project(a, ctx)?.item, pb = b ? project(b, ctx)?.item : null;
  svg.classList.add('dim');
  for (const g of state.chipEls.values()) g.classList.remove('hl', 'sel');
  for (const x of state.edgeEls.values()) { x.g.classList.remove('hl'); x.pg.classList.remove('hl'); }
  if (pa) state.chipEls.get(pa)?.classList.add('hl', 'sel');
  if (pb) state.chipEls.get(pb)?.classList.add('hl');
  if (!pa || !pb) return;
  let path = null;
  for (const x of state.edgeEls.values()) if ((x.e.a === pa && x.e.b === pb) || (x.e.a === pb && x.e.b === pa)) { x.g.classList.add('hl'); x.pg.classList.add('hl'); path = { d: x.d, reverse: x.e.a === pb }; break; }
  if (!path) {
    const A = state.layout.children.find((c) => c.id === pa), B = state.layout.children.find((c) => c.id === pb);
    const x1 = A.x + A.width, y1 = A.y + A.height / 2, x2 = B.x, y2 = B.y + B.height / 2, mx = (x1 + x2) / 2;
    path = { d: roundedPath([{ x: x1, y: y1 }, { x: mx, y: y1 }, { x: mx, y: y2 }, { x: x2, y: y2 }]), reverse: false };
    el('path', { class: 'flowlink flowfx', d: path.d }, state.fxLayer);
  }
  const dot = el('circle', { class: 'pulse flowfx', r: 4.5 }, state.fxLayer);
  const anim = el('animateMotion', { dur: '1.5s', repeatCount: 'indefinite', path: path.d, keyPoints: path.reverse ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear' }, dot);
  anim.beginElement?.();
}

// ======================= ask (Antigravity) =======================
const Q = createGraphQuery(G);
const askState = { engine: null, sample: null, busy: false, ctl: null, session: null, turns: [], last: null };
const askInput = $('#ask-input'), askSend = $('#ask-send'), sheet = $('#ask-sheet'), warn = $('#ask-warn');
const WARNINGS = {
  no_engine: 'Ask in your Antigravity chat, or start the map server with <code>node floorplan/serve.mjs</code>.',
  cli_missing: 'Ask in your Antigravity chat.',
};
function setWarning(code) {
  warn.hidden = !code;
  if (!code) return;
  warn.innerHTML = `<svg class="i" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><span>${WARNINGS[code] || h(code)}</span>${code === 'no_engine' ? '<button type="button" data-copycmd>Copy command</button>' : ''}`;
  warn.querySelector('[data-copycmd]')?.addEventListener('click', (e) => { navigator.clipboard?.writeText('node floorplan/serve.mjs'); e.target.textContent = 'Copied'; });
}
function setEngine(engine, label, warning) {
  askState.engine = engine;
  const tag = $('#ask-engine');
  tag.className = 'engine ' + (engine ? 'ok' : 'warn');
  tag.innerHTML = `<i></i>${h(engine ? label : 'Unavailable')}`;
  tag.title = engine ? 'Answers come from Antigravity' : '';
  askInput.disabled = !engine;
  askSend.disabled = !engine;
  askInput.placeholder = engine ? `Ask anything about ${G.project.name}…` : 'Ask in your Antigravity chat…';
  if (typeof renderChips === 'function' && askState.context) renderChips();
  setWarning(warning || null);
  addModeSwitch();
}
async function detectEngine() {
  const S = window.FLOORPLAN_SERVER;
  if (S) { S.cli ? setEngine('cli', AGENT.app + (S.model ? ' · ' + S.model : '')) : setEngine(null, null, 'cli_missing'); return; }
  setEngine(null, null, 'no_engine');
}

// tiny markdown: paragraphs, lists, **bold**, `code`, [[id]] references
function refChip(id) {
  const b = Q.brief(id);
  if (!b) return h(id);
  const ii = info(id);
  return `<span class="ref" data-ref="${h(id)}" style="--c:${colorOf(ii)}"><i></i>${h(b.name)}</span>`;
}
function md(src) {
  const inline = (s) => h(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[\[([^\]]+)\]\]/g, (_, id) => refChip(id.replace(/&#39;|&quot;/g, '').trim()));
  const out = [];
  let list = null;
  for (const raw of String(src || '').split('\n')) {
    const line = raw.trim();
    const li = /^([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) { const tag = /\d/.test(li[1]) ? 'ol' : 'ul'; if (list !== tag) { if (list) out.push(`</${list}>`); out.push(`<${tag}>`); list = tag; } out.push(`<li>${inline(li[2])}</li>`); continue; }
    if (list) { out.push(`</${list}>`); list = null; }
    if (line) out.push(`<p>${inline(line.replace(/^#+\s*/, ''))}</p>`);
  }
  if (list) out.push(`</${list}>`);
  return out.join('');
}

function sheetShell(question, body) {
  sheet.hidden = false;
  sheet.innerHTML = `<div class="sh"><span class="q" title="${h(question)}">${h(question)}</span>
    ${askState.last && state.container !== 'q:answer' ? '<button class="btn soft" data-act="board">Show answer board</button>' : ''}
    ${state.container === 'q:answer' ? '<button class="btn soft" data-act="map">Back to map</button>' : ''}
    <button class="btn icon" data-act="close" title="Close">${iconI('x')}</button></div><div class="sb">${body}</div>`;
  sheet.querySelector('[data-act="close"]').onclick = () => { if (askState.busy) cancelAsk(); sheet.hidden = true; if (state.container === 'q:answer') go('root'); else fit(true); };
  sheet.querySelector('[data-act="map"]')?.addEventListener('click', () => go('root'));
  sheet.querySelector('[data-act="board"]')?.addEventListener('click', () => go('q:answer'));
  sheet.querySelectorAll('[data-ref]').forEach((r) => r.onclick = () => {
    const id = r.dataset.ref;
    if (state.container === 'q:answer' && state.view.visible.includes(id)) { select(id); centerOn(id); } else reveal(id);
  });
  sheet.querySelectorAll('[data-follow]').forEach((b) => b.onclick = () => { askInput.value = b.dataset.follow; submitAsk(); });
  sheet.querySelector('[data-act="steps"]')?.addEventListener('click', () => {
    const a = askState.last;
    state.flow = { f: { title: a.title, steps: a.steps.map((s) => ({ ref: s.id, note: s.note })) }, i: 0, inPlace: true };
    flowStep();
  });
}
function showProgress(question, lines) {
  sheetShell(question, `<div class="progress">${lines.map((l, i) => `<div>${i === lines.length - 1 ? '<span class="spin"></span>' : '<span style="width:12px;display:inline-block;text-align:center">✓</span>'}${h(l)}</div>`).join('')}</div>`);
}
function renderAnswer(a) {
  const steps = a.steps?.length >= 2;
  sheetShell(a.question, `${md(a.answer)}
    <div class="sheet-actions">${steps ? `<button class="btn soft" data-act="steps">${iconI('right')}Walk through ${a.steps.length} steps</button>` : ''}</div>
    ${a.followups?.length ? `<div class="followups">${a.followups.slice(0, 3).map((f) => `<button data-follow="${h(f)}">${h(f)}</button>`).join('')}</div>` : ''}`);
}
function showAnswer(raw, question) {
  const clean = (arr) => (Array.isArray(arr) ? arr : []).map((x) => typeof x === 'string' ? { id: x, note: '' } : x).filter((x) => x && Q.exists(String(x.id))).map((x) => ({ id: String(x.id), note: String(x.note || '') }));
  const items = clean(raw.items);
  const steps = clean(raw.steps);
  for (const s of steps) if (!items.some((x) => x.id === s.id)) items.push({ id: s.id, note: s.note });
  const a = { title: String(raw.title || 'Answer'), answer: String(raw.answer || ''), items: items.slice(0, 18), steps, followups: (raw.followups || []).map(String), question };
  askState.last = a;
  if (a.items.length) { state.answer = a; go('q:answer', { force: true, after: () => renderAnswer(a) }); }
  else renderAnswer(a);
}
function showFailure(question, code, message, partial) {
  if (code === 'not_logged_in' || code === 'not_granted') setWarning(code);
  if (code === 'not_granted' || code === 'sampling_disabled') setEngine(null, null, code === 'not_granted' ? 'not_granted' : 'app_unavailable');
  if (code === 'cancelled') { sheet.hidden = true; return; }
  const copy = { rate_limited: `${AGENT.name} is busy or you have hit a usage limit. Try again in a bit.`, not_logged_in: `${Cap(AGENT.cli)} needs you to sign in first.`, cli_missing: `${Cap(AGENT.cli)} not found.`, invalid_json: `${AGENT.name}'s answer couldn't be read as a map view. Try rephrasing.`, session_expired: `Your ${AGENT.name} session expired. Sign in again.` }[code];
  sheetShell(question, `<p class="err">${h(copy || message || 'Something went wrong.')}</p>${partial ? md(partial) : ''}${code === 'cli_error' && message ? `<p style="font-family:var(--mono);font-size:11px;color:var(--text-3)">${h(message.slice(0, 400))}</p>` : ''}`);
}
function setBusy(b) {
  askState.busy = b;
  askSend.classList.toggle('stop', b);
  askSend.innerHTML = b ? `<svg class="i" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>` : `<svg class="i" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
  askSend.title = b ? 'Stop' : 'Ask';
}
function cancelAsk() {
  askState.ctl?.abort();
  if (askState.engine === 'cli') fetch('/api/cancel', { method: 'POST', headers: { 'x-floorplan-token': window.FLOORPLAN_SERVER.token } }).catch(() => {});
}

// ---------- changing a blueprint from the map (served by serve.mjs) ----------
// The Ask bar gets an Ask / Change switch. A change goes to the agent, the server checks and saves the
// updated plan and redraws the map, every open tab reloads, and the new and changed cards are highlighted
// as recent work. What changed is kept across that reload in sessionStorage, with an Undo.
const CHANGE_KEY = 'floorplan-change';
// a server whose engine can't be held to the plan's format says change: false
const canChange = () => PLAN && askState.engine === 'cli' && window.FLOORPLAN_SERVER?.change !== false;
function setAskMode(m) {
  askState.mode = canChange() && m === 'change' ? 'change' : 'ask';
  $('#ask-mode')?.querySelectorAll('button').forEach((b) => { b.classList.toggle('on', b.dataset.m === askState.mode); b.setAttribute('aria-pressed', String(b.dataset.m === askState.mode)); });
  if (askState.engine) askInput.placeholder = askState.mode === 'change' ? 'Ask for a change, e.g. “also plan out refunds”…' : `Ask anything about ${G.project.name}…`;
  askSend.title = askState.busy ? 'Stop' : askState.mode === 'change' ? 'Make this change' : 'Ask';
}
function addModeSwitch() {
  if (!canChange() || $('#ask-mode')) return;
  const sw = document.createElement('span');
  sw.id = 'ask-mode';
  sw.innerHTML = '<button type="button" data-m="ask" title="Ask a question about the plan">Ask</button><button type="button" data-m="change" title="Ask for a change, addition or removal, and the map is redrawn">Change</button>';
  sw.querySelectorAll('button').forEach((b) => b.onclick = () => { setAskMode(b.dataset.m); askInput.focus(); });
  $('#ask-form').prepend(sw);
  setAskMode('ask');
}
const stash = { get: () => { try { return JSON.parse(sessionStorage.getItem(CHANGE_KEY) || 'null'); } catch { return null; } }, set: (v) => { try { v ? sessionStorage.setItem(CHANGE_KEY, JSON.stringify(v)) : sessionStorage.removeItem(CHANGE_KEY); } catch {} } };
async function requestChange(question) {
  setBusy(true);
  askState.ctl = new AbortController();
  const lines = ['Reading the plan…'];
  const progress = (t) => { lines.push(t); showProgress(question, lines.slice(-6)); };
  showProgress(question, lines);
  try {
    const r = await askViaCli(question, progress, 'change');
    stash.set({ question, title: r.title, summary: r.summary, followups: r.followups || [], undo: r.undo, at: Date.now() });
    progress('Redrawing the map');
    setTimeout(() => location.reload(), 4000); // in case the reload notice doesn't arrive
  } catch (e) {
    if (e?.name === 'AbortError') showFailure(question, 'cancelled');
    else if (e?.code === 'change_invalid' || e?.code === 'busy') sheetShell(question, `<p class="err">${h(String(e.message).split('\n')[0])}</p>${md(String(e.message).split('\n').slice(1).join('\n'))}`);
    else showFailure(question, e?.code || 'upstream_error', e?.message || String(e));
  } finally { setBusy(false); }
}
/** After the reload a change causes: what changed, with Undo and the changed cards on one board. */
function showChangeResult() {
  const c = stash.get();
  stash.set(null);
  if (!c) return;
  if (c.undone) { toast('Change undone'); return; }
  if (Date.now() - c.at > 120000) return;
  const items = (G.recent?.items || []).filter((x) => parentOf.has(x.id)).map((x) => ({ id: x.id, note: x.note }));
  closeSheet(); // a card in the link opens the details sheet on a phone, and it would sit on top of this summary
  sheetShell(c.question, `<p><strong>${h(c.title || 'Plan updated')}</strong></p>${md(c.summary)}
    <div class="sheet-actions">${items.length ? `<button class="btn soft" data-cr="show">${iconI('search')}Show ${plural(items.length, 'change')}</button>` : ''}<button class="btn soft" data-cr="undo">${iconI('left')}Undo</button></div>
    ${c.followups?.length ? `<div class="followups">${c.followups.slice(0, 3).map((f) => `<button data-cf="${h(f)}">${h(f)}</button>`).join('')}</div>` : ''}`);
  sheet.querySelector('[data-cr="show"]')?.addEventListener('click', () => showBoard({ title: c.title || 'What changed', question: c.question, items }));
  sheet.querySelector('[data-cr="undo"]').addEventListener('click', async (ev) => {
    ev.currentTarget.disabled = true;
    const r = await fetch('/api/plan/undo', { method: 'POST', headers: { 'x-floorplan-token': window.FLOORPLAN_SERVER.token } }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not reach the map server.' }));
    if (!r.ok) { toast(r.error || 'Couldn’t undo'); ev.currentTarget.disabled = false; return; }
    stash.set({ undone: true, at: Date.now() });
    setTimeout(() => location.reload(), 4000);
  });
  sheet.querySelectorAll('[data-cf]').forEach((b) => b.onclick = () => { setAskMode('change'); askInput.value = b.dataset.cf; submitAsk(); });
}

async function askViaCli(question, progress, mode = 'ask') {
  const res = await fetch('/api/ask', {
    method: 'POST', signal: askState.ctl.signal,
    headers: { 'content-type': 'application/json', 'x-floorplan-token': window.FLOORPLAN_SERVER.token },
    body: JSON.stringify({ question, mode, session: mode === 'ask' ? askState.session : undefined }),
  });
  if (!res.ok || !res.body) throw { code: 'cli_error', message: `Server returned ${res.status}` };
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '', answer = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, i); buf = buf.slice(i + 2);
      const ev = /^event: (.*)$/m.exec(block)?.[1], data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] || 'null');
      if (ev === 'progress') progress(data.text);
      else if (ev === 'answer') { answer = data; if (mode === 'ask') askState.session = data.session || askState.session; }
      else if (ev === 'failure') throw data;
    }
  }
  if (!answer) throw { code: 'cli_error', message: 'The CLI ended without an answer.' };
  return answer;
}

askState.context = [];
/** Pin a map item to the next question ("Ask about this"). */
function addAskContext(id) {
  if (!Q.exists(id)) return;
  askState.context = [...askState.context.filter((x) => x !== id), id].slice(-3);
  renderChips();
  askInput.focus();
}
function renderChips() {
  const box = $('#ask-chips');
  box.innerHTML = askState.context.map((id) => { const i = info(id); return `<span class="chip" title="${h(i.path || '')}"><span class="ico" style="--c:${colorOf(i)}">${icon(iconKey(i))}</span><span>${h(i.name)}</span><button type="button" data-rm="${h(id)}" aria-label="Remove">${iconI('x')}</button></span>`; }).join('');
  box.querySelectorAll('[data-rm]').forEach((b) => b.onclick = () => { askState.context = askState.context.filter((x) => x !== b.dataset.rm); renderChips(); askInput.focus(); });
  askInput.placeholder = !askState.engine ? 'Asking is unavailable' : askState.mode === 'change' ? (askState.context.length ? 'What should change here?' : 'Ask for a change, e.g. “also plan out refunds”…') : askState.context.length ? 'Ask about this…' : `Ask anything about ${G.project.name}…`;
  askSend.disabled = !askState.engine;
}
askInput.addEventListener('keydown', (ev) => { if (ev.key === 'Backspace' && !askInput.value && askState.context.length) { askState.context.pop(); renderChips(); } });

async function submitAsk() {
  if (askState.busy) { cancelAsk(); return; }
  const ctxIds = askState.context.slice();
  let question = askInput.value.trim();
  if (!question && ctxIds.length) question = ctxIds.length === 1 ? `What is ${info(ctxIds[0]).name} and how does it fit in?` : `How do ${ctxIds.map((id) => info(id).name).join(' and ')} relate?`;
  if (!question || !askState.engine) return;
  askInput.value = '';
  askState.context = []; renderChips();
  if (askState.mode === 'change') return requestChange(ctxIds.length ? `${question}\n\nThis is about: ${ctxIds.map((id) => `${id} (${info(id).name})`).join(', ')}.` : question);
  const shown = question;
  if (ctxIds.length) question += `\n\nFocus on these map items: ${ctxIds.map((id) => `${id} (${info(id).name})`).join(', ')}.`;
  setBusy(true);
  askState.ctl = new AbortController();
  const lines = ['Thinking…'];
  const progress = (t) => { lines.push(t); showProgress(shown, lines.slice(-6)); };
  showProgress(shown, lines);
  try {
    const raw = await askViaCli(question, progress);
    showAnswer(raw, shown);
  } catch (e) {
    if (e?.name === 'AbortError') showFailure(shown, 'cancelled');
    else showFailure(shown, e?.code || 'upstream_error', e?.message || String(e), e?.text && e.code !== 'invalid_json' ? e.text : '');
  } finally { setBusy(false); }
}
$('#ask-form').addEventListener('submit', (ev) => { ev.preventDefault(); submitAsk(); });
askSend.addEventListener('click', (ev) => { if (askState.busy) { ev.preventDefault(); cancelAsk(); } });
if (!EXPORTED) detectEngine();
renderFlowMenu();
if (!EXPORTED) loadCustomFlows();

// ======================= boot =======================
$('#proj-name').textContent = G.project.name;
if (EXPORTED) {
  document.body.classList.add('exported');
  const at = new Date(EXPORTED.at);
  const tag = document.createElement('span');
  tag.className = 'xtag';
  tag.textContent = isNaN(at) ? 'Exported copy' : `Exported ${at.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  tag.title = `A copy of this map to look around in. Asking questions needs Floorplan with ${AGENT.name}, in the codebase itself.`;
  $('#proj-name').after(tag);
  // whoever receives a copy can find where it came from
  const made = document.createElement('a');
  made.id = 'madewith'; made.className = 'glass';
  made.href = 'https://github.com/haydenschmitty/floorplan'; made.target = '_blank'; made.rel = 'noopener';
  const logo = $('.brand .mark').cloneNode();
  logo.alt = '';
  const name = document.createElement('b'); name.textContent = 'Floorplan';
  const free = document.createElement('span'); free.className = 'x'; free.textContent = '· free and open source';
  made.append('Made with', logo, name, free);
  $('#stage').appendChild(made);
}
document.title = `${G.project.name} map`;
$('#btn-up').onclick = up;
// drag the panel's left edge to resize it; the width sticks between visits
const setPanelWidth = (w) => { document.documentElement.style.setProperty('--panel-w', `${clamp(Math.round(w), 300, Math.min(720, innerWidth - 360))}px`); };
setPanelWidth(store.get('panelWidth', 360));
$('#panel-resize').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  const handle = ev.currentTarget;
  handle.setPointerCapture(ev.pointerId);
  document.body.classList.add('resizing');
  const move = (e) => setPanelWidth(innerWidth - e.clientX - 16);
  const end = () => {
    document.body.classList.remove('resizing');
    handle.removeEventListener('pointermove', move);
    store.set('panelWidth', $('#panel').offsetWidth);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', end, { once: true });
  handle.addEventListener('pointercancel', end, { once: true });
});
$('#panel-resize').addEventListener('dblclick', () => { setPanelWidth(360); store.set('panelWidth', 360); });
// phones: the details open as a sheet and start closed; the choice isn't saved, so it can't close the side panel on a desktop that shares this storage
const phoneQuery = matchMedia('(max-width: 700px)');
const isPhone = () => phoneQuery.matches;
const closeSheet = () => { if (isPhone() && !document.body.classList.contains('no-panel')) setPanel(false); }; // going into or out of a box clears the sheet away so the map shows
svg.addEventListener('click', closeSheet); // tapping empty space puts the sheet away too
// on a phone the warning about connecting an AI tool shows only while someone is using the ask bar: a tap or focus on it shows it, leaving hides it.
// The input may be switched off when nothing is connected, so a tap anywhere on the bar counts. When it appears it is read out once.
const askBox = $('#ask'), askLive = $('#ask-live');
const askOn = (on) => {
  if (askBox.classList.contains('asking') === on) return;
  askBox.classList.toggle('asking', on);
  askLive.textContent = '';
  if (on && isPhone() && !warn.hidden) setTimeout(() => { askLive.textContent = warn.querySelector('span')?.textContent || ''; }, 50);
};
['pointerdown', 'touchstart', 'focusin'].forEach((t) => askBox.addEventListener(t, () => askOn(true), { passive: true }));
window.addEventListener('pointerdown', (ev) => { if (!askBox.contains(ev.target)) askOn(false); }, true);
askBox.addEventListener('focusout', (ev) => { if (!askBox.contains(ev.relatedTarget)) askOn(false); });
window.addEventListener('resize', foldContext); // whether there is more to read depends on the width
// with nothing connected the input is switched off, so on a phone the bar itself takes keyboard focus to show the note
const askForm = $('#ask-form');
const askTab = () => { const on = isPhone() && askInput.disabled && !warn.hidden; if (on) { askForm.tabIndex = 0; askForm.setAttribute('aria-label', 'Ask bar: show why asking is unavailable'); } else { askForm.removeAttribute('tabindex'); askForm.removeAttribute('aria-label'); } };
new MutationObserver(askTab).observe(warn, { attributes: true, attributeFilter: ['hidden'] });
new MutationObserver(askTab).observe(askInput, { attributes: true, attributeFilter: ['disabled'] });
phoneQuery.addEventListener('change', askTab); askTab();
// the sheet is a labelled, non-modal dialog on a phone; keyboard users get focus moved into it and back out when it closes
let keyboardUser = false, sheetReturn = null;
window.addEventListener('keydown', () => { keyboardUser = true; }, true);
window.addEventListener('pointerdown', () => { keyboardUser = false; }, true);
const sheetRole = () => { if (isPhone()) { panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Details'); panel.tabIndex = -1; } else { panel.removeAttribute('role'); panel.removeAttribute('aria-label'); panel.removeAttribute('tabindex'); } };
phoneQuery.addEventListener('change', sheetRole); sheetRole();
const setPanel = (on) => {
  const was = !document.body.classList.contains('no-panel'); document.body.classList.toggle('no-panel', !on); $('#btn-panel').setAttribute('aria-expanded', String(on));
  if (!isPhone()) store.set('panel', on);
  if (was !== on && !isPhone()) fit(true);
  if (was !== on && isPhone()) {
    if (on && keyboardUser) { sheetReturn = document.activeElement; panel.focus({ preventScroll: true }); }
    else if (!on && sheetReturn) { if (panel.contains(document.activeElement) || document.activeElement === document.body) sheetReturn.focus?.({ preventScroll: true }); sheetReturn = null; }
  }
};
document.body.classList.toggle('no-panel', isPhone() || !store.get('panel', true));
$('#btn-panel').setAttribute('aria-expanded', String(!document.body.classList.contains('no-panel')));
// the top bar can be one or two rows tall: everything under it follows its real height
const headerEl = document.querySelector('header');
const syncHeader = () => document.documentElement.style.setProperty('--hh', headerEl.offsetHeight + 'px');
new ResizeObserver(syncHeader).observe(headerEl); syncHeader(); window.addEventListener('resize', syncHeader);
// on a phone the zoom buttons move into the top row, beside the search icon, and back to the map on a wider screen
const zoomEl = $('#zoom'), zoomHome = zoomEl.parentNode, zoomNext = zoomEl.nextSibling;
const placeZoom = () => { if (isPhone()) headerEl.insertBefore(zoomEl, headerEl.querySelector('.hc')); else zoomHome.insertBefore(zoomEl, zoomNext); syncHeader(); };
phoneQuery.addEventListener('change', placeZoom); placeZoom();
$('#btn-panel').onclick = () => setPanel(document.body.classList.contains('no-panel'));
Object.assign(state.kinds, store.get('kinds', {}));
window.addEventListener('keydown', (ev) => {
  if (pal.classList.contains('open') || ev.target.tagName === 'INPUT') return;
  if (ev.key === '/' || (ev.key === 'k' && (ev.metaKey || ev.ctrlKey))) { ev.preventDefault(); openPalette(); }
  else if (ev.key === 'Backspace') { ev.preventDefault(); up(); }
  else if (ev.key === 'Escape') {
    if (!ctxEl.hidden || fm.classList.contains('open') || legendEl.classList.contains('open')) { closeMenu(); fm.classList.remove('open'); legendEl.classList.remove('open'); }
    else if (isPhone() && !document.body.classList.contains('no-panel')) closeSheet(); // on a phone the first Escape puts the details sheet away
    else if (state.flow) stopFlow(); else if (state.selected) select(null); else up();
  }
  else if (ev.key === 'f' || ev.key === 'F') fit(true);
  else if (ev.key === 'p' || ev.key === 'P') $('#btn-panel').click();
  else if (ev.key === 'Enter' && typeof state.selected === 'string') open(state.selected);
  else if (state.flow && ev.key === 'ArrowRight') $('#fl-next')?.click();
  else if (state.flow && ev.key === 'ArrowLeft') $('#fl-prev')?.click();
  else if (ev.key === '=' || ev.key === '+') zoomBy(1.2);
  else if (ev.key === '-') zoomBy(0.83);
});
// ======================= extension API =======================
// Features in assets/ui/*.js are inlined after this script and talk to the viewer only through
// window.Floorplan. Keep this surface small and stable.
function setTechnical(on) {
  technicalFlag = !!on; store.set('technical', technicalFlag);
  chainCache.clear();
  render({ keepTransform: true, after: renderPanel });
  emit('technical', technicalFlag);
}
function showModal({ title = '', html = '', actions = [] } = {}) {
  const m = $('#modal'), box = m.querySelector('.box');
  box.innerHTML = `<h2>${h(title)}</h2><div class="mb">${html}</div><div class="ma">${actions.map((a, i) => `<button class="btn ${a.primary ? 'primary' : 'soft'}" data-mi="${i}">${a.icon ? iconI(a.icon) : ''}${h(a.label)}</button>`).join('')}<button class="btn" data-close>Close</button></div>`;
  const close = () => m.classList.remove('open');
  box.querySelectorAll('[data-mi]').forEach((b) => b.onclick = () => { const a = actions[+b.dataset.mi]; if (a.onClick?.(close) !== false && !a.keepOpen) close(); });
  box.querySelector('[data-close]').onclick = close;
  m.onmousedown = (ev) => { if (ev.target === m) close(); };
  m.classList.add('open');
  return { close, el: box };
}
let toastTimer = null;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200); }
function showBoard({ title, question = '', answer = '', items = [], steps = [], kind = '', icon: ic = '' }) {
  const clean = (arr) => (arr || []).map((x) => typeof x === 'string' ? { id: x, note: '' } : x).filter((x) => x && Q.exists(String(x.id))).map((x) => ({ id: String(x.id), note: String(x.note || '') }));
  const a = { title: title || 'Board', question, answer, items: clean(items).slice(0, 24), steps: clean(steps), followups: [], ...(kind ? { kind } : {}), ...(ic ? { icon: ic } : {}) };
  if (!a.items.length) { toast('Nothing on the map matches that.'); return; }
  state.answer = a; askState.last = a;
  go('q:answer', { force: true });
}
function playFlow({ title = 'Tour', description = '', steps = [], inPlace = false }) {
  const st = steps.map((s) => ({ ref: s.ref || s.id, note: s.note || '', title: s.title || '' })).filter((s) => Q.exists(s.ref) || s.ref === 'root');
  if (!st.length) return;
  state.flow = { f: { id: 'tmp-' + Date.now(), title, description, steps: st }, i: 0, inPlace };
  flowStep();
}
const ext = { sections: { overview: [], item: [] }, listeners: {} };
const custom = { panel: null };
function emit(event, data) { for (const fn of ext.listeners[event] || []) { try { fn(data); } catch (e) { console.error('floorplan extension', e); } } }
window.Floorplan = Object.freeze({
  version: 1,
  graph: G, query: Q, state, agent: AGENT, exported: EXPORTED,
  // model helpers
  info, chain, children: (id) => visibleKids(id), parentOf: (id) => parentOf.get(id), exists: (id) => Q.exists(id),
  files, nodes, routes, colorOf, iconKey,
  // html helpers
  h, icon, iconI, fmt, plural, md,
  // navigation
  go, reveal, select, open, up, fit, render: (o) => render({ keepTransform: true, ...o }), refreshPanel: () => renderPanel(),
  showBoard, playFlow, startFlow, stopFlow: () => { if (state.flow) stopFlow(); },
  freeArea: () => freeArea(),
  closeMenus: () => { closeMenu(); fm.classList.remove('open'); legendEl.classList.remove('open'); },
  // asking
  addAskContext, ask: (text) => { closeSheet(); askInput.value = text; submitAsk(); }, askEngine: () => askState.engine,
  // a blueprint's Change mode: whether it's available here, and putting a request in the Ask bar to finish and send
  canChange: () => canChange(),
  draftChange(text) {
    if (!canChange()) return false;
    closeSheet(); // on a phone the open details sheet hides the ask bar, so the request would be typed where nobody can see it
    setAskMode('change');
    askInput.value = text;
    askInput.focus();
    askInput.setSelectionRange(text.length, text.length);
    return true;
  },
  // chrome
  addHeaderButton({ id, label = '', icon: ic, svg, title = '', onClick }) {
    const b = document.createElement('button');
    b.className = 'btn' + (label ? '' : ' icon'); if (id) b.id = id; b.title = title || label; if (label) b.setAttribute('aria-label', label);
    b.innerHTML = `${svg ? `<svg class="i" viewBox="0 0 24 24">${svg}</svg>` : ic ? iconI(ic) : ''}${label ? `<span class="bl">${h(label)}</span>` : ''}`;
    b.onclick = (ev) => { ev.stopPropagation(); onClick?.(ev, b); };
    $('#hdr-ext').appendChild(b);
    syncHeader(); // a new button can make the bar a row taller
    return b;
  },
  addPanelSection(where, fn) { (ext.sections[where] ||= []).push(fn); },
  showPanel(html, bind) { custom.panel = { html, bind }; setPanel(true); renderPanel(); },
  closePanel() { custom.panel = null; renderPanel(); },
  modal: showModal, toast, copy: (text) => copy(text),
  icons: P,
  technical, setTechnical,
  store,
  on(event, fn) { (ext.listeners[event] ||= []).push(fn); },
});
technicalFlag = !!store.get('technical', false);

const init = readHash();
state.container = init.v; state.selected = init.s;
if (init.s && isPhone()) { document.body.classList.remove('no-panel'); $('#btn-panel').setAttribute('aria-expanded', 'true'); } // a shared link to a box opens its details
const fontsReady = document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 1500))]) : Promise.resolve();
fontsReady.then(() => render({ after: () => { renderPanel(); emit('ready', {}); if (PLAN && window.FLOORPLAN_SERVER) showChangeResult(); } }));
})();
</script>
<!--__UI_EXTENSIONS__-->
</body>
</html>

`
