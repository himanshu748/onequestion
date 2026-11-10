import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("keyless recorded review preserves saved provider classifications, human review state and original Unicode anchors", () => {
  const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
  const archive = read("public/recorded-review/evidence.json");
  const browser = read("docs/BROWSER_LIVE_VALIDATION.json");
  const demo = read("docs/DEMO_VALIDATION.json");
  assert.equal(archive.isRecorded, true);
  assert.equal(archive.isLive, false);
  assert.equal(archive.fictionalInputs, true);
  assert.deepEqual(archive.fill, demo.recordedFill);
  assert.equal(
    archive.extractDecide.proposals.length,
    browser.proposals.length,
  );
  for (const fact of archive.extractDecide.proposals) {
    const saved = browser.proposals.find(
      (f: { label: string }) => f.label === fact.label,
    );
    assert.ok(saved);
    assert.equal(fact.status, saved.status);
    assert.equal(fact.reviewed, saved.reviewed);
    assert.equal(fact.anchors.length, saved.validAnchors);
    for (const anchor of fact.anchors) {
      assert.ok(anchor.start >= 0 && anchor.end > anchor.start);
      assert.equal(
        Array.from(archive.extractDecide.sourceText)
          .slice(anchor.start, anchor.end)
          .join(""),
        anchor.value,
      );
    }
  }
  const conservative = archive.extractDecide.proposals.find(
    (f: { slot: string; kind: string }) =>
      f.slot === "av" && f.kind === "qualification",
  );
  assert.equal(conservative.status, "conditional");
  assert.equal(conservative.reviewed, false);
});
