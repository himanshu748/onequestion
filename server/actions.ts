import { z } from "zod";
import {
  Workspace,
  Status,
  anchorValid,
  newFacts,
  solve,
  type Workspace as W,
} from "../src/domain";

export const AddPeople = z.object({
  revision: z.number().int(),
  people: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        text: z.string().trim().min(1).max(8000),
      }),
    )
    .min(1)
    .max(12),
});
export function addPeople(w: W, raw: unknown) {
  const b = AddPeople.parse(raw);
  if (w.people.length + b.people.length > 12)
    throw new Error("The supported model allows at most 12 volunteers.");
  for (const item of b.people) {
    const p = { id: crypto.randomUUID(), name: item.name };
    w.people.push(p);
    w.sources.push({
      id: crypto.randomUUID(),
      personId: p.id,
      text: item.text,
      createdAt: new Date().toISOString(),
    });
    w.facts.push(...newFacts(p, w.event));
  }
}
export const AddSource = z.object({
  revision: z.number().int(),
  personId: z.string(),
  text: z.string().trim().min(1).max(8000),
});
export function addSource(w: W, raw: unknown) {
  const b = AddSource.parse(raw);
  if (!w.people.some((p) => p.id === b.personId))
    throw new Error("Volunteer not found.");
  w.sources.push({
    id: crypto.randomUUID(),
    personId: b.personId,
    text: b.text,
    createdAt: new Date().toISOString(),
  });
  w.facts
    .filter((f) => f.personId === b.personId)
    .forEach((f) => {
      f.reviewed = false;
      f.note = "New source added. Review all applicable messages again.";
    });
}
export const ReviewFact = z.object({
  revision: z.number().int(),
  factId: z.string(),
  status: Status,
  note: z.string().trim().min(3).max(2000),
  reviewer: z.string().trim().min(1).max(80),
  acceptProposal: z.boolean().optional(),
});
export function reviewFact(w: W, raw: unknown) {
  const b = ReviewFact.parse(raw);
  const f = w.facts.find((f) => f.id === b.factId);
  if (!f) throw new Error("Fact not found.");
  if (b.acceptProposal && (f.provenance !== "clocked" || b.status !== f.status))
    throw new Error(
      "Changing a proposal requires a coordinator-provided correction. Uncheck the proposal acceptance box.",
    );
  if (
    b.acceptProposal &&
    b.status === "yes" &&
    !f.anchors.some((a) => {
      const s = w.sources.find((s) => s.id === a.sourceId);
      return s && s.personId === f.personId && anchorValid(s, a);
    })
  )
    throw new Error(
      "An affirmative proposal requires valid source evidence. Use a coordinator-provided correction with a reason.",
    );
  f.history.push({
    at: new Date().toISOString(),
    status: f.status,
    note: f.note,
    reviewer: b.reviewer,
  });
  f.status = b.status;
  f.reviewed = true;
  f.note = b.note;
  if (!b.acceptProposal) {
    f.provenance = "coordinator";
    f.anchors = [];
  }
  w.baseline = solve(w).assignments;
}
export function importWorkspace(raw: unknown): W {
  const parsed = Workspace.parse(raw);
  const w = {
    ...parsed,
    id: crypto.randomUUID(),
    revision: 0,
    updatedAt: new Date().toISOString(),
  };
  const people = new Set(w.people.map((p) => p.id)),
    slots = new Set(w.event.slots.map((s) => s.id)),
    facts = new Set(w.facts.map((f) => f.id));
  if (
    people.size !== w.people.length ||
    facts.size !== w.facts.length ||
    new Set(w.sources.map((s) => s.id)).size !== w.sources.length
  )
    throw new Error("Duplicate IDs in backup.");
  if (
    w.facts.some(
      (f) => !people.has(f.personId) || (f.slotId && !slots.has(f.slotId)),
    ) ||
    w.sources.some((s) => !people.has(s.personId))
  )
    throw new Error("Backup has invalid references.");
  const gates = new Set<string>();
  for (const f of w.facts) {
    if ((f.kind === "availability") !== (f.slotId === undefined))
      throw new Error("Backup has incorrectly scoped prerequisites.");
    const gate = `${f.personId}:${f.kind}:${f.slotId ?? "all"}`;
    if (gates.has(gate)) throw new Error("Backup has duplicate prerequisites.");
    gates.add(gate);
  }
  w.facts.forEach((f) => {
    f.reviewed = false;
    f.note = "Imported backup. Review before use. " + f.note;
  });
  w.baseline = {};
  return w;
}
