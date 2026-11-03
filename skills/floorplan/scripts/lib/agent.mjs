// Coding agent: Antigravity is the primary agent.
export const AGENTS = ['antigravity'];

export function detectAgent(args = {}, env = process.env) {
  const v = String(args.agent || env.FLOORPLAN_AGENT || '').toLowerCase();
  if (AGENTS.includes(v)) return v;
  return 'antigravity';
}
