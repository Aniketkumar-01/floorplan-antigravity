#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.resolve(here, '../skills/floorplan-antigravity/scripts');
const [cmd = 'open', ...args] = process.argv.slice(2);

const map = {
  scan: 'scan.mjs',
  build: 'build.mjs',
  open: 'open.mjs',
  refresh: 'refresh.mjs',
  plan: 'plan.mjs',
  describe: 'describe.mjs',
  recent: 'recent.mjs',
  status: 'status.mjs',
};

const script = map[cmd];
if (!script) {
  console.log(`Floorplan for Antigravity

Usage:
  floorplan [command] [options]
  npx floorplan-antigravity [command]

Commands:
  scan      Scan code, imports and routes
  build     Validate architecture and build map
  open      Open map in browser (default)
  refresh   Update map with recent changes
  status    Check map status
  describe  Generate worksheets for file descriptions
  recent    Mark recent git work
  plan      Validate blueprint plan.json
`);
  process.exit(1);
}

const res = spawnSync(process.execPath, [path.join(scripts, script), ...args], { stdio: 'inherit' });
process.exit(res.status ?? 0);

