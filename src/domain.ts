import { z } from "zod";

export const Status = z.enum([
  "yes",
  "no",
  "unknown",
  "conditional",
  "conflict",
]);
export type Status = z.infer<typeof Status>;
const Identifier = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9:_-]{0,199}$/);
export const Slot = z.object({
  id: Identifier.max(100),
  name: z.string().trim().min(1).max(80),
  qualification: z.string().max(250),
  approval: z.boolean(),
});
export const Event = z
  .object({
    name: z.string().trim().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timezone: z.string().min(1).max(80),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    brief: z.string().max(8000),
    slots: z.array(Slot).min(1).max(8),
  })
  .superRefine((v, c) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: v.timezone });
    } catch {
      c.addIssue({ code: "custom", message: "Use a valid IANA timezone." });
    }
    const validTime = (s: string) =>
      Number(s.slice(0, 2)) < 24 && Number(s.slice(3)) < 60;
    if (!validTime(v.start) || !validTime(v.end) || v.start >= v.end)
      c.addIssue({
        code: "custom",
        message: "Use a same-day interval with end after start.",
      });
    const parsedDate = new Date(v.date + "T12:00:00Z");
    if (
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== v.date
    )
      c.addIssue({ code: "custom", message: "Use a valid calendar date." });
    if (new Set(v.slots.map((s) => s.id)).size !== v.slots.length)
      c.addIssue({ code: "custom", message: "Slot IDs must be unique." });
  });
export type Event = z.infer<typeof Event>;
export type Slot = z.infer<typeof Slot>;
export const Source = z.object({
  id: Identifier,
  personId: Identifier,
  text: z.string().min(1).max(16000),
  createdAt: z.string(),
  derived: z.boolean().optional(),
});
export type Source = z.infer<typeof Source>;
export const Anchor = z.object({
  sourceId: z.string().max(200),
  value: z.string(),
  start: z.number().int().min(0),
  end: z.number().int().min(1),
});
export const Fact = z.object({
  id: Identifier,
  personId: Identifier,
  label: z.string().max(500),
  kind: z.enum(["availability", "willingness", "qualification", "approval"]),
  slotId: Identifier.optional(),
  status: Status,
  reviewed: z.boolean(),
  provenance: z.enum(["fixture", "coordinator", "clocked"]),
  anchors: z.array(Anchor),
  note: z.string().max(2000),
  history: z
    .array(
      z.object({
        at: z.string(),
        status: Status,
        note: z.string().max(2000),
        reviewer: z.string(),
      }),
    )
    .max(200),
});
export type Fact = z.infer<typeof Fact>;
export const Person = z.object({
  id: Identifier,
  name: z.string().trim().min(1).max(80),
});
export type Person = z.infer<typeof Person>;
export const Workspace = z.object({
  id: z.string().max(200),
  revision: z.number().int(),
  demo: z.boolean(),
  event: Event,
  people: z.array(Person).max(12),
  sources: z.array(Source).max(100),
  facts: z.array(Fact).max(400),
  baseline: z.record(z.string(), z.string()),
  updatedAt: z.string(),
});
export type Workspace = z.infer<typeof Workspace>;
export type Plan = {
  assignments: Record<string, string>;
  coverage: number;
  changes: number;
};
export function anchorValid(source: Source, a: z.infer<typeof Anchor>) {
  return (
    a.sourceId === source.id &&
    a.start < a.end &&
    a.end <= Array.from(source.text).length &&
    Array.from(source.text).slice(a.start, a.end).join("") === a.value
  );
}
export function requirements(w: Workspace, personId: string, slotId: string) {
  return w.facts.filter(
    (f) =>
      f.personId === personId &&
      (f.kind === "availability" || f.slotId === slotId),
  );
}
export function eligible(
  w: Workspace,
  pid: string,
  s: Slot,
  overrides: Record<string, boolean> = {},
) {
  const req = requirements(w, pid, s.id);
  const kinds = [
    "availability",
    "willingness",
    ...(s.qualification ? ["qualification"] : []),
    ...(s.approval ? ["approval"] : []),
  ];
  if (req.some((f) => f.status === "conflict")) return false;
  return kinds.every((kind) => {
    const matches = req.filter((f) => f.kind === kind);
    if (matches.length !== 1) return false;
    const f = matches[0];
    return Object.hasOwn(overrides, f.id)
      ? overrides[f.id]
      : f.reviewed && f.status === "yes";
  });
}
/** Exact min-cost maximum matching: maximize coverage, then retain existing assignments. */
export function solve(
  w: Workspace,
  overrides: Record<string, boolean> = {},
): Plan {
  type Edge = { to: number; rev: number; cap: number; cost: number };
  const source = 0,
    personOffset = 1,
    slotOffset = 1 + w.people.length;
  const sink = slotOffset + w.event.slots.length;
  const graph: Edge[][] = Array.from({ length: sink + 1 }, () => []);
  function add(from: number, to: number, cost: number) {
    const forward = { to, rev: graph[to].length, cap: 1, cost };
    const reverse = { to: from, rev: graph[from].length, cap: 0, cost: -cost };
    graph[from].push(forward);
    graph[to].push(reverse);
    return forward;
  }
  const links: { personId: string; slotId: string; edge: Edge }[] = [];
  for (const [i, p] of w.people.entries()) {
    add(source, personOffset + i, 0);
    for (const [j, slot] of w.event.slots.entries())
      if (eligible(w, p.id, slot, overrides)) {
        links.push({
          personId: p.id,
          slotId: slot.id,
          edge: add(
            personOffset + i,
            slotOffset + j,
            w.baseline[slot.id] === p.id ? -1 : 0,
          ),
        });
      }
  }
  w.event.slots.forEach((_, j) => add(slotOffset + j, sink, 0));
  let coverage = 0;
  while (true) {
    const distance = Array(sink + 1).fill(Infinity),
      previousNode = Array(sink + 1).fill(-1),
      previousEdge = Array(sink + 1).fill(-1);
    const queue = [source],
      queued = Array(sink + 1).fill(false);
    distance[source] = 0;
    queued[source] = true;
    for (let head = 0; head < queue.length; head++) {
      const from = queue[head];
      queued[from] = false;
      for (const [index, edge] of graph[from].entries())
        if (edge.cap > 0 && distance[edge.to] > distance[from] + edge.cost) {
          distance[edge.to] = distance[from] + edge.cost;
          previousNode[edge.to] = from;
          previousEdge[edge.to] = index;
          if (!queued[edge.to]) {
            queue.push(edge.to);
            queued[edge.to] = true;
          }
        }
    }
    if (previousNode[sink] < 0) break;
    for (let node = sink; node !== source; node = previousNode[node]) {
      const edge = graph[previousNode[node]][previousEdge[node]];
      edge.cap--;
      graph[node][edge.rev].cap++;
    }
    coverage++;
  }
  const assignments: Record<string, string> = {};
  for (const link of links)
    if (link.edge.cap === 0) assignments[link.slotId] = link.personId;
  const next = Object.fromEntries(
    Object.entries(assignments).map(([s, p]) => [p, s]),
  );
  const changes = Object.entries(w.baseline).filter(
    ([slot, person]) => next[person] !== slot,
  ).length;
  return { assignments, coverage, changes };
}
export function questions(w: Workspace) {
  const ids = new Set<string>();
  for (const p of w.people)
    for (const s of w.event.slots) {
      const req = requirements(w, p.id, s.id);
      if (req.some((f) => f.reviewed && f.status === "no")) continue;
      const missing = req.filter((f) => !f.reviewed || f.status !== "yes");
      if (missing.length <= 2)
        missing
          .filter(
            (f) => f.reviewed && ["unknown", "conditional"].includes(f.status),
          )
          .forEach((f) => ids.add(f.id));
    }
  const candidates = w.facts.filter((f) => ids.has(f.id));
  const singles = candidates
    .slice(0, 10)
    .map((f) => ({
      fact: f,
      yes: solve(w, { [f.id]: true }),
      no: solve(w, { [f.id]: false }),
    }))
    .sort(
      (a, b) =>
        b.yes.coverage - a.yes.coverage ||
        a.yes.changes - b.yes.changes ||
        a.fact.label.localeCompare(b.fact.label),
    );
  const pairs = [];
  for (let i = 0; i < singles.length; i++)
    for (let j = i + 1; j < singles.length; j++) {
      const a = singles[i].fact,
        b = singles[j].fact;
      const branches = [false, true].flatMap((x) =>
        [false, true].map((y) => ({
          answers: [x, y],
          plan: solve(w, { [a.id]: x, [b.id]: y }),
        })),
      );
      pairs.push({ facts: [a, b], branches });
    }
  return {
    singles,
    pairs,
    truncated: candidates.length > 10,
    total: candidates.length,
  };
}
export function newFacts(p: Person, event: Event): Fact[] {
  const make = (kind: Fact["kind"], label: string, slotId?: string): Fact => ({
    id: `${p.id}:${kind}:${slotId ?? "all"}`,
    personId: p.id,
    label,
    kind,
    slotId,
    status: "unknown",
    reviewed: true,
    provenance: "coordinator",
    anchors: [],
    note: "Not established. Coordinator-created prerequisite.",
    history: [],
  });
  return [
    make("availability", `Is ${p.name} available for the full event interval?`),
    ...event.slots.flatMap((s) => [
      make("willingness", `Is ${p.name} willing to take ${s.name}?`, s.id),
      ...(s.qualification
        ? [
            make(
              "qualification",
              `Does ${p.name} satisfy: ${s.qualification}?`,
              s.id,
            ),
          ]
        : []),
      ...(s.approval
        ? [
            make(
              "approval",
              `Has the coordinator approved ${p.name} for ${s.name}?`,
              s.id,
            ),
          ]
        : []),
    ]),
  ];
}
