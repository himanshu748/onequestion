import { test } from "node:test";
import assert from "node:assert/strict";
import {
  solve,
  questions,
  eligible,
  anchorValid,
  newFacts,
  Event,
  type Workspace,
} from "../src/domain";
import { demoWorkspace } from "../src/demo";
import { parseCsv, rosterCsv } from "../src/import-export";

test("canonical roster has 3 roles, Cy adds one, Dee adds none, and preview never mutates facts", () => {
  const w = demoWorkspace("test");
  const before = JSON.stringify(w);
  const q = questions(w);
  assert.equal(solve(w).coverage, 3);
  assert.equal(q.singles.length, 2);
  const cy = q.singles.find((q) => q.fact.personId === "cy")!,
    dee = q.singles.find((q) => q.fact.personId === "dee")!;
  assert.equal(cy.yes.coverage, 4);
  assert.equal(cy.no.coverage, 3);
  assert.equal(cy.yes.changes, 3);
  assert.equal(dee.yes.coverage, 3);
  assert.equal(dee.no.coverage, 3);
  assert.deepEqual(cy.yes.assignments, {
    welcome: "dee",
    tickets: "ana",
    av: "ben",
    keyholder: "cy",
  });
  assert.equal(JSON.stringify(w), before);
  assert.equal(new Set(Object.values(cy.yes.assignments)).size, 4);
});
test("only reviewed affirmative facts enable assignments; conflict cannot be previewed away", () => {
  const w = demoWorkspace("test");
  const f = w.facts.find(
    (f) => f.personId === "ana" && f.kind === "availability",
  )!;
  for (const state of ["no", "unknown", "conditional", "conflict"] as const) {
    f.status = state;
    assert.equal(eligible(w, "ana", w.event.slots[0]), false);
  }
  f.status = "yes";
  f.reviewed = false;
  assert.equal(eligible(w, "ana", w.event.slots[0]), false);
  f.reviewed = true;
  assert.equal(eligible(w, "ana", w.event.slots[0]), true);
  f.status = "conflict";
  assert.equal(eligible(w, "ana", w.event.slots[0], { [f.id]: true }), false);
});

test("fictional example does not turn an absent qualification into a denial", () => {
  const w = demoWorkspace("fixture-policy");
  const absent = w.facts.find(f => f.personId === "ana" && f.kind === "qualification" && f.slotId === "av");
  assert.equal(absent?.status, "unknown");
  assert.ok(w.sources.every(s => s.text.includes("not willing to take any other roles")));
  assert.equal(questions(w).singles.length, 2);
});
test("availability, willingness, qualification and approval are separate gates", () => {
  const w = demoWorkspace("test");
  w.event.slots[0].approval = true;
  const p = w.people[0];
  const facts = newFacts(p, w.event);
  w.facts = w.facts.filter((f) => f.personId !== p.id).concat(facts);
  facts.forEach((f) => {
    f.status = "yes";
    f.reviewed = true;
  });
  const approval = facts.find((f) => f.kind === "approval")!;
  approval.status = "unknown";
  assert.equal(eligible(w, p.id, w.event.slots[0]), false);
  approval.status = "yes";
  assert.equal(eligible(w, p.id, w.event.slots[0]), true);
  const willing = facts.find(
    (f) => f.kind === "willingness" && f.slotId === "welcome",
  )!;
  willing.status = "no";
  assert.equal(eligible(w, p.id, w.event.slots[0]), false);
});
test("two unresolved gates can have branch coverage 3,3,3,4", () => {
  const w = demoWorkspace("pair");
  w.event.slots.forEach((s) => {
    s.qualification = "";
    s.approval = false;
  });
  w.facts = [];
  w.baseline = { welcome: "ana", tickets: "ben", av: "cy" };
  for (const [i, p] of w.people.entries()) {
    const fs = newFacts(p, w.event);
    for (const f of fs)
      f.status =
        f.kind === "availability" || f.slotId === w.event.slots[i].id
          ? "yes"
          : "no";
    if (i === 3) {
      fs[0].status = "unknown";
      fs.find((f) => f.slotId === "keyholder")!.status = "unknown";
    }
    w.facts.push(...fs);
  }
  const pair = questions(w).pairs[0];
  assert.ok(pair);
  assert.deepEqual(
    pair.branches.map((b) => b.plan.coverage),
    [3, 3, 3, 4],
  );
});
function oracle(w: Workspace) {
  let best = -1,
    changes = Infinity;
  const old = Object.fromEntries(
    Object.entries(w.baseline).map(([s, p]) => [p, s]),
  );
  function rec(i: number, used: Set<string>, assign: Record<string, string>) {
    if (i === w.event.slots.length) {
      const coverage = Object.keys(assign).length;
      const next = Object.fromEntries(
        Object.entries(assign).map(([s, p]) => [p, s]),
      );
      const c = Object.entries(old).filter(([p, s]) => next[p] !== s).length;
      if (coverage > best || (coverage === best && c < changes)) {
        best = coverage;
        changes = c;
      }
      return;
    }
    const s = w.event.slots[i];
    rec(i + 1, used, assign);
    for (const p of w.people)
      if (!used.has(p.id) && eligible(w, p.id, s)) {
        used.add(p.id);
        assign[s.id] = p.id;
        rec(i + 1, used, assign);
        delete assign[s.id];
        used.delete(p.id);
      }
  }
  rec(0, new Set(), {});
  return { coverage: best, changes };
}
test("solver agrees with exhaustive enumeration on 400 reproducible bounded graphs", () => {
  let seed = 72031;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let n = 0; n < 400; n++) {
    const w = demoWorkspace("oracle");
    w.people = w.people.slice(0, n % 5);
    w.event.slots = w.event.slots
      .slice(0, 1 + (n % 4))
      .map((s) => ({ ...s, qualification: "", approval: false }));
    w.baseline = {};
    w.facts = [];
    for (const p of w.people) {
      const fs = newFacts(p, w.event);
      for (const f of fs)
        f.status = f.kind === "availability" || rand() > 0.5 ? "yes" : "no";
      w.facts.push(...fs);
    }
    if (n % 3 && w.people.length) {
      const assignments = solve(w).assignments;
      w.baseline = assignments;
      const fact = w.facts[n % w.facts.length];
      if (fact) fact.status = fact.status === "yes" ? "no" : "yes";
    }
    const actual = solve(w);
    const expected = oracle(w);
    assert.deepEqual(
      { coverage: actual.coverage, changes: actual.changes },
      expected,
      `graph ${n}`,
    );
  }
});
test("Unicode evidence anchors use code points and reject mismatched quotes", () => {
  const source = {
    id: "s",
    personId: "p",
    text: "🙂 I can help",
    createdAt: "",
  };
  assert.equal(
    anchorValid(source, {
      sourceId: "s",
      start: 2,
      end: 12,
      value: "I can help",
    }),
    true,
  );
  assert.equal(
    anchorValid(source, {
      sourceId: "s",
      start: 3,
      end: 13,
      value: "I can help",
    }),
    false,
  );
  assert.equal(
    anchorValid(source, {
      sourceId: "s",
      start: 2,
      end: 12,
      value: "I might help",
    }),
    false,
  );
});
test("CSV handles quoted commas, escaped quotes, newlines and prevents formula injection", () => {
  assert.deepEqual(
    parseCsv(
      'name,text\r\n"Ana","I can help, yes"\r\nBen,"Line 1\nLine ""2"""',
    ),
    [
      { name: "Ana", text: "I can help, yes" },
      { name: "Ben", text: 'Line 1\nLine "2"' },
    ],
  );
  assert.throws(() => parseCsv('name,text\nAna,"unfinished'));
  const w = demoWorkspace("csv");
  w.people[0].name = '=HYPERLINK("bad")';
  const csv = rosterCsv(w, solve(w));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(!csv.includes("keyholder access was renewed"));
  assert.ok(!csv.includes("Hand-authored"));
});
test("invalid dates, timezones, duplicate slots and unsupported intervals are rejected", () => {
  const w = demoWorkspace("schema");
  for (const patch of [
    { date: "2026-02-30" },
    { date: "2026-99-99" },
    { timezone: "invalid/zone" },
    { end: "14:00" },
    { start: "26:00" },
    { slots: [w.event.slots[0], w.event.slots[0]] },
  ])
    assert.equal(Event.safeParse({ ...w.event, ...patch }).success, false);
});
