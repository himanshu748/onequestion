import { newFacts, type Workspace } from "./domain";
export function demoWorkspace(id: string): Workspace {
  const w: Workspace = {
    id,
    revision: 0,
    demo: true,
    event: {
      name: "The neighborhood gathering",
      date: "2026-11-14",
      timezone: "Asia/Kolkata",
      start: "16:00",
      end: "19:00",
      brief:
        "Four simultaneous roles: Welcome, Tickets, AV, Keyholder. AV requires independent sound operation. Keyholder requires current venue keyholder access.",
      slots: [
        { id: "welcome", name: "Welcome", qualification: "", approval: false },
        { id: "tickets", name: "Tickets", qualification: "", approval: false },
        {
          id: "av",
          name: "AV",
          qualification: "independent sound operation",
          approval: false,
        },
        {
          id: "keyholder",
          name: "Keyholder",
          qualification: "current venue keyholder access",
          approval: false,
        },
      ],
    },
    people: [
      { id: "ana", name: "Ana" },
      { id: "ben", name: "Ben" },
      { id: "cy", name: "Cy" },
      { id: "dee", name: "Dee" },
    ],
    sources: [],
    facts: [],
    baseline: { welcome: "ana", tickets: "ben", av: "cy" },
    updatedAt: new Date().toISOString(),
  };
  const notes: Record<string, string> = {
    ana: "I am available on 14 November from 16:00 to 19:00 Asia/Kolkata. I am happy to do Welcome or Tickets.",
    ben: "I am available for the full gathering, 14 November, 16:00–19:00 Asia/Kolkata. I am happy to do Tickets or AV, and can operate sound independently.",
    cy: "I am available for the full gathering on 14 November, 16:00–19:00 Asia/Kolkata. I am happy to do AV or Keyholder. I can operate sound independently. I think my venue keyholder access was renewed.",
    dee: "I am available on 14 November, 16:00–19:00 Asia/Kolkata. I am happy to do Welcome or AV. I have carried speakers before, but you should check whether I can run the sound desk independently.",
  };
  const roles: Record<string, string[]> = {
    ana: ["welcome", "tickets"],
    ben: ["tickets", "av"],
    cy: ["av", "keyholder"],
    dee: ["welcome", "av"],
  };
  for (const p of w.people) {
    const text = notes[p.id] + " I am not willing to take any other roles.";
    const source = {
      id: `source-${p.id}`,
      personId: p.id,
      text,
      createdAt: "2026-11-09T07:00:00.000Z",
    };
    w.sources.push(source);
    const facts = newFacts(p, w.event);
    for (const f of facts) {
      f.provenance = "fixture";
      f.note = "Hand-authored fictional interpretation; no Clocked call.";
      f.status =
        f.kind === "availability" || roles[p.id].includes(f.slotId ?? "")
          ? "yes"
          : f.kind === "willingness"
            ? "no"
            : "unknown";
      if (
        p.id === "cy" &&
        f.kind === "qualification" &&
        f.slotId === "keyholder"
      )
        f.status = "conditional";
      if (p.id === "dee" && f.kind === "qualification" && f.slotId === "av")
        f.status = "unknown";
      f.anchors = [
        {
          sourceId: source.id,
          start: 0,
          end: Array.from(text).length,
          value: text,
        },
      ];
    }
    w.facts.push(...facts);
  }
  return w;
}
