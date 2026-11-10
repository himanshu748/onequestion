import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compileBrief,
  analyzePerson,
  prepareAnalysis,
} from "../server/clocked";
import { demoWorkspace } from "../src/demo";

test("Clocked adapter uses documented contracts, rejects invalid spans, and leaves proposals unreviewed (synthetic transport)", async () => {
  const prior = globalThis.fetch;
  const key = process.env.CLOCKED_API_KEY,
    enabled = process.env.CLOCKED_ENABLED;
  process.env.CLOCKED_API_KEY = "clk_synthetic_test_only";
  process.env.CLOCKED_ENABLED = "true";
  const paths: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input),
      body = JSON.parse(String(init?.body));
    paths.push(url);
    assert.equal(init?.method, "POST");
    if (url.endsWith("/fill")) {
      assert.equal(body.fields.roles.infer, false);
      return Response.json({
        model: "synthetic",
        fields: {
          roles: { value: ["Welcome"] },
          requirements: { value: [] },
          unsupported: { value: "supported_single_interval" },
        },
      });
    }
    if (url.endsWith("/extract")) {
      assert.ok(body.text.includes("I think"));
      return Response.json({
        model: "synthetic",
        fields: Object.fromEntries(
          Object.keys(body.fields).map((k) => [
            k,
            { value: "invented quote", start: 0, end: 14 },
          ]),
        ),
      });
    }
    assert.ok(body.state.event);
    assert.ok(body.questions);
    return Response.json({
      model: "synthetic",
      answers: Object.fromEntries(
        Object.keys(body.questions).map((k) => [
          k,
          {
            type: "choice",
            choice: "conditional",
            probabilities: { conditional: 1 },
            confidence: 1,
          },
        ]),
      ),
    });
  };
  try {
    const compiled = await compileBrief("One Welcome role.");
    assert.deepEqual(compiled.roles, ["Welcome"]);
    const w = demoWorkspace("adapter");
    const before = JSON.stringify(w);
    const result = await analyzePerson(w, "cy");
    assert.ok(result.source.derived);
    assert.ok(
      result.proposals.every(
        (f) =>
          f.status === "conditional" && !f.reviewed && f.anchors.length === 0,
      ),
    );
    assert.equal(JSON.stringify(w), before);
    assert.deepEqual(
      paths.map((p) => p.split("/").at(-1)),
      ["fill", "extract", "decide"],
    );
  } finally {
    globalThis.fetch = prior;
    if (key === undefined) delete process.env.CLOCKED_API_KEY;
    else process.env.CLOCKED_API_KEY = key;
    if (enabled === undefined) delete process.env.CLOCKED_ENABLED;
    else process.env.CLOCKED_ENABLED = enabled;
  }
});

test("analysis preparation is pure and rejects invalid inputs before provider or budget work", () => {
  const w = demoWorkspace("preparation");
  const before = JSON.stringify(w);
  const prepared = prepareAnalysis(w, "cy");
  assert.equal(prepared.person.id, "cy");
  assert.ok(prepared.text.startsWith("[Message "));
  assert.ok(prepared.facts.every((f) => f.kind !== "approval"));
  assert.equal(JSON.stringify(w), before);
  const rejects = (candidate: typeof w, person = "cy") =>
    assert.throws(
      () => prepareAnalysis(candidate, person),
      (error: unknown) =>
        error instanceof Error &&
        (error as Error & { status: number }).status === 400,
    );
  rejects(w, "missing");
  rejects({ ...w, sources: w.sources.filter((s) => s.personId !== "cy") });
  rejects({ ...w, sources: w.sources.map((s) => ({ ...s, derived: true })) });
  rejects({
    ...w,
    sources: w.sources.map((s) =>
      s.personId === "cy" ? { ...s, text: "x".repeat(16000) } : s,
    ),
  });
  rejects({ ...w, facts: w.facts.filter((f) => f.personId !== "cy") });
  rejects({
    ...w,
    sources: Array.from({ length: 100 }, (_, i) => ({
      ...w.sources[0],
      id: "source-" + i,
    })),
  });
  assert.equal(JSON.stringify(w), before);
});
