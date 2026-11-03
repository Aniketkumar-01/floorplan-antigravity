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

