// Run: npx tsx scripts/check-solve-stats.ts
import assert from "node:assert";
import { computeStreaks } from "../lib/solveStats";

const now = Date.parse("2026-10-21T12:00:00Z");
assert.deepStrictEqual(computeStreaks([], now), { current: 0, longest: 0 });
assert.deepStrictEqual(computeStreaks(["2026-10-21"], now), { current: 1, longest: 1 });
// Streak from yesterday is still alive today
assert.deepStrictEqual(computeStreaks(["2026-10-19", "2026-10-20"], now), { current: 2, longest: 2 });
// Gap of a full day breaks it
assert.deepStrictEqual(computeStreaks(["2026-10-17", "2026-10-18", "2026-10-19"], now), { current: 0, longest: 3 });
// Duplicates and unsorted input
assert.deepStrictEqual(
  computeStreaks(["2026-10-21", "2026-10-01", "2026-10-20", "2026-10-02", "2026-10-03", "2026-10-21"], now),
  { current: 2, longest: 3 }
);
console.log("solve stats ok");
