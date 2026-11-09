import type { Workspace, Plan } from "./domain";
export function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
}
export function rosterCsv(w: Workspace, p: Plan) {
  return [
    [
      "Event",
      "Date",
      "Timezone",
      "Start",
      "End",
      "Role",
      "Volunteer",
      "Status",
    ],
    ...w.event.slots.map((s) => [
      w.event.name,
      w.event.date,
      w.event.timezone,
      w.event.start,
      w.event.end,
      s.name,
      w.people.find((person) => person.id === p.assignments[s.id])?.name ??
        "Unfilled",
      "Eligible draft; acceptance not recorded",
    ]),
  ]
    .map((r) => r.map(csvCell).join(","))
    .join("\r\n");
}
export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (quoted || field === "") quoted = !quoted;
      else throw new Error("Invalid quote in CSV.");
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw new Error("CSV has an unclosed quoted field.");
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  const head = rows.shift()?.map((h) =>
    h
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase(),
  );
  if (!head?.includes("name") || !head.includes("text"))
    throw new Error("CSV needs name and text column headers.");
  return rows.map((r) => ({
    name: r[head.indexOf("name")] ?? "",
    text: r[head.indexOf("text")] ?? "",
  }));
}
