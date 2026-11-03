# Floorplan for Antigravity

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![Antigravity Skill](https://img.shields.io/badge/Antigravity-Skill-8A2BE2.svg)](SKILL.md)

Interactive, offline architecture maps for codebases in Antigravity. Generates a self-contained `floorplan/index.html` at your project root with zero runtime dependencies.

---

## ⚡ Quick Install

Install it directly into Antigravity with a single command (just like `npx impeccable install`):

```bash
npx floorplan-antigravity install
```

That's it! It automatically installs the skill into your global Antigravity skills directory (`~/.gemini/config/skills/floorplan-antigravity`).

### Install & Update Options:
- **Global Install (Default):**
  ```bash
  npx floorplan-antigravity install
  ```
- **Update to Latest Version:**
  ```bash
  npx floorplan-antigravity update
  ```
- **Current Workspace Only (`.agent/skills`):**
  ```bash
  npx floorplan-antigravity install --workspace
  ```
- **Uninstall:**
  ```bash
  npx floorplan-antigravity uninstall
  ```
- **Alternative (via Git):**
  ```bash
  # Install (macOS / Linux):
  git clone https://github.com/Aniketkumar-01/floorplan-antigravity.git ~/.gemini/config/skills/floorplan-antigravity

  # Install (Windows PowerShell):
  git clone https://github.com/Aniketkumar-01/floorplan-antigravity.git "$HOME\.gemini\config\skills\floorplan-antigravity"

  # Update (Git):
  git -C "$HOME\.gemini\config\skills\floorplan-antigravity" pull
  ```

---

## 🚀 How to Use in Antigravity

Once installed, simply ask Antigravity in chat:

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
│   ├── install.mjs       # 1-command installer (npx floorplan-antigravity install)
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
