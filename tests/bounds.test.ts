import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hostedDailyLimit } from "../server/limits";
import { Workspace, Fact, Anchor } from "../src/domain";
import { demoWorkspace } from "../src/demo";

test("hosted allowance configuration has a finite fallback and bounded limits", () => {
  for (const value of [undefined, "NaN", "Infinity", "not-a-number"])
    assert.equal(hostedDailyLimit(value), 6);
  assert.equal(hostedDailyLimit("0"), 0);
  assert.equal(hostedDailyLimit("-1"), 0);
  assert.equal(hostedDailyLimit("200"), 20);
});

test("generous persisted-data bounds preserve the demo and archived evidence", () => {
  const w = demoWorkspace("bounded");
  assert.ok(Workspace.safeParse(w).success);
  const fact = w.facts[0];
  const valid = {
    ...fact,
    label: "x".repeat(500),
    note: "x".repeat(2000),
    history: Array.from({ length: 200 }, () => ({
      at: "recorded",
      status: "unknown",
      note: "x".repeat(2000),
      reviewer: "QA",
    })),
  };
  assert.ok(Fact.safeParse(valid).success);
  for (const changed of [
    { ...valid, label: "x".repeat(501) },
    { ...valid, note: "x".repeat(2001) },
    { ...valid, history: [...valid.history, valid.history[0]] },
  ])
    assert.equal(Fact.safeParse(changed).success, false);
  assert.equal(
    Workspace.safeParse({ ...w, id: "x".repeat(201) }).success,
    false,
  );
  const archive = JSON.parse(
    readFileSync("public/recorded-review/evidence.json", "utf8"),
  );
  for (const proposal of archive.extractDecide.proposals)
    for (const anchor of proposal.anchors)
      assert.ok(
        Anchor.safeParse({ ...anchor, sourceId: "recorded-source" }).success,
      );
  assert.equal(
    Anchor.safeParse({
      sourceId: "x".repeat(201),
      value: "x",
      start: 0,
      end: 1,
    }).success,
    false,
  );
});
