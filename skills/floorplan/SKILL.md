---
name: floorplan
description: "Draw a floorplan of an app's codebase (one repo or several side by side), an interactive node-graph map where every subsystem, module, file and HTTP route has a human-readable name and a one-line description, connected by the imports and HTTP calls between them, at several zoom levels. It is saved as a self-contained floorplan/index.html in the codebase. Use whenever the user wants to visualize, map, diagram, document or get an architectural overview of a codebase, repo or monorepo, understand how their app works or is connected under the hood, onboard onto unfamiliar code, see how the frontend talks to the backend, or update an existing floorplan. Also use before code exists: when the user shares a PRD or spec, it draws a blueprint planned from the document."
---

# Floorplan for Antigravity

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
