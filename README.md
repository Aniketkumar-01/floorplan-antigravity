# Floorplan for Antigravity

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![Antigravity Skill](https://img.shields.io/badge/Antigravity-Skill-8A2BE2.svg)](SKILL.md)

Interactive, offline architecture maps for codebases in Antigravity. Generates a self-contained `floorplan/index.html` at your project root with zero runtime dependencies.

---

## ⚡ 1-Minute Quick Install

Install it as an Antigravity skill with a single copy-paste command.

### Option A: Global Install (Recommended)
Makes the skill available across **all** your workspaces and projects in Antigravity.

**macOS / Linux:**
```bash
git clone https://github.com/Aniketkumar-01/floorplan-antigravity.git ~/.gemini/config/skills/floorplan-antigravity
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/Aniketkumar-01/floorplan-antigravity.git "$HOME\.gemini\config\skills\floorplan-antigravity"
```

---

### Option B: Workspace Install
Only want it in your current project? Run this inside your project root:

```bash
git clone https://github.com/Aniketkumar-01/floorplan-antigravity.git .agent/skills/floorplan-antigravity
```

---

## 🚀 How to Use in Antigravity

Once installed, you don't need to memorize any CLI commands. Just chat with Antigravity:

| Goal | What to ask in chat |
| :--- | :--- |
| **Map an existing codebase** | *"Make me a floorplan of this codebase"* |
| **Update an existing map** | *"Refresh the floorplan with recent git changes"* |
| **Plan before writing code** | *"Draw a blueprint floorplan from this PRD / spec"* |
| **Check architecture health** | *"Check the floorplan health report and fix any unassigned routes"* |

Antigravity will scan the codebase, synthesize plain-English architectural boundaries, generate `floorplan/index.html`, and launch the interactive viewer.

---

## 💻 CLI Usage (Without Skill)

You can also run Floorplan directly via `npx` or install it as a standalone CLI:

```bash
# Scan codebase AST (files, routes, and imports)
npx floorplan-antigravity scan .

# Build interactive floorplan map
npx floorplan-antigravity build .

# Launch offline viewer in browser
npx floorplan-antigravity open .
```

Or install globally:

```bash
npm install -g floorplan-antigravity
floorplan open .
```

---

## ✨ Features

- **Automated Multi-Language AST Scan:** Scans files, imports, and API routes in TypeScript, JavaScript, Python, Go, Rust, Java, and Kotlin with zero external packages (pure Node 18+ stdlib).
- **Interactive Visual Map:** Zoomable subsystem and module nodes, data flows, and screen maps powered by embedded ELK layout engine.
- **Architectural Health Checks:** Flags exposed credentials, unauthenticated endpoints, and permissive database rules with one-click fix prompts.
- **Recent Work Highlights:** Automatically highlights cards touched in recent commits or currently in flight.
- **100% Offline & Private:** Built as a self-contained HTML file. No external telemetry, no external CDN dependencies, nothing leaves your machine.

---

## 📁 Repository Structure

```
floorplan-antigravity/
├── SKILL.md              # Main Antigravity skill definition & instructions
├── scripts/              # Fast, zero-dependency Node.js scan & build engine
│   ├── scan.mjs          # AST scanner for imports and routes
│   ├── build.mjs         # Floorplan graph and HTML generator
│   ├── open.mjs          # Lightweight live server & browser launcher
│   └── refresh.mjs       # Incremental updater for changed files
├── assets/               # Embedded offline UI (ELK engine, theme, viewer)
├── references/           # Architecture heuristics & schema reference
└── bin/                  # CLI binary entrypoint (floorplan / floorplan-antigravity)
```

---

## 🤝 Credits & Attribution

This project is adapted from the original [Floorplan](https://github.com/haydenschmitty/floorplan) by [Hayden Schmidt](https://github.com/haydenschmitty), tailored specifically for Google Antigravity and the Antigravity IDE.

## 📄 License

MIT © Hayden Schmidt & Floorplan Contributors
