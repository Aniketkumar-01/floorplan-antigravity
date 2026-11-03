# Floorplan for Antigravity

Interactive, offline architecture maps for codebases in Antigravity. Generates `floorplan/index.html` at the project root with zero runtime dependencies.

## Features

- **Automated AST Scan:** Scans files, imports, and API routes in JS, TS, Python, Go, Rust, Java, and Kotlin with zero external packages (Node 18+ stdlib).
- **Interactive Visual Map:** Zoomable subsystem and module nodes, data flows, and screen maps powered by embedded ELK layout engine.
- **Health Checks:** Detects exposed credentials, unauthenticated endpoints, and permissive database rules with one-click fix prompts.
- **Recent Work:** Visual highlights for cards touched in recent commits or currently in flight.

## Quick Start (CLI)

Run directly via `npx` from any codebase:

```bash
# 1. Scan the codebase
npx floorplan-antigravity scan .

# 2. Build the map (after defining or generating architecture.json)
npx floorplan-antigravity build .

# 3. Open in browser
npx floorplan-antigravity open .
```

Or install globally:

```bash
npm install -g floorplan-antigravity
floorplan open .
```

## Installation as an Antigravity Skill

Place this repository or the `skills/floorplan-antigravity` directory in either:
- **Global:** `~/.gemini/config/skills/floorplan-antigravity/`
- **Workspace:** `skills/floorplan-antigravity/` or `.agent/skills/floorplan-antigravity/`

Then simply ask Antigravity in chat:
> *"Make me a floorplan of this codebase"*  
> *"Update the floorplan with recent changes"*

Full agent instructions live in [`skills/floorplan-antigravity/SKILL.md`](skills/floorplan-antigravity/SKILL.md).

## Credits & Attribution

This project is adapted from the original [Floorplan](https://github.com/haydenschmitty/floorplan) by [Hayden Schmidt](https://github.com/haydenschmitty), tailored specifically for Google Antigravity and the Antigravity IDE.

## License

MIT © Hayden Schmidt & Floorplan Contributors
