// Run: npx tsx scripts/check-dynamic-scoring.ts
import assert from "node:assert";
import { challengeValue, firstBloodBonus } from "../lib/dynamicScoring";

assert.strictEqual(challengeValue(500, 0), 500);
assert.strictEqual(challengeValue(500, 1), 500); // first solver gets full value
assert.strictEqual(challengeValue(500, 16), 407); // halfway through decay

assert.strictEqual(challengeValue(500, 31), 125); // floor at 25%
assert.strictEqual(challengeValue(500, 1000), 125);
for (let n = 1; n < 40; n++) assert.ok(challengeValue(500, n + 1) <= challengeValue(500, n));
assert.strictEqual(firstBloodBonus(500), 50);
console.log("dynamic scoring ok");
