import assert from "node:assert/strict";
import {
  OPTICS,
  getOptic,
  suggestedDots,
  formatDotLine,
  snapshotDots,
  dotsEqualSuggestion,
} from "../js/hints.js";

assert.equal(getOptic("crossbow").dots.length, 5);
assert.deepEqual(
  suggestedDots("crossbow").map((d) => d.yards),
  [20, 30, 40, 50, 60],
);
assert.ok(suggestedDots("crossbow").every((d) => d.fromHint));

assert.deepEqual(
  suggestedDots("rifle").map((d) => d.yards),
  [100, 200, 300, 400, 500],
);
assert.equal(suggestedDots("reddot").length, 1);
assert.equal(suggestedDots("reddot")[0].yards, 50);

assert.deepEqual(
  suggestedDots("crossbow", "xb-4").map((d) => d.yards),
  [20, 30, 40, 50],
);
assert.equal(suggestedDots("reddot", "rd-100")[0].yards, 100);
assert.equal(suggestedDots("rifle", "rf-200")[0].yards, 200);

assert.equal(formatDotLine(suggestedDots("crossbow")), "20 · 30 · 40 · 50 · 60 yd");
assert.equal(formatDotLine([]), "No zeros set");

const snap = snapshotDots(suggestedDots("rifle"));
assert.equal(snap[0].label, "Primary / 1st");
assert.equal(snap[0].yards, 100);

assert.equal(dotsEqualSuggestion(suggestedDots("crossbow"), "crossbow"), true);
assert.equal(dotsEqualSuggestion([{ yards: 20 }], "crossbow"), false);

assert.equal(OPTICS.reddot.poaMode, "single");
assert.equal(OPTICS.crossbow.poaMode, "multi");
assert.ok(OPTICS.crossbow.hintKicker.toLowerCase().includes("suggestion"));
assert.ok(OPTICS.rifle.hintBody.includes("traditional") || OPTICS.rifle.hintTitle.includes("BDC"));

console.log("hints.test.js ok");
