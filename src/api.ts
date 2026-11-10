import { Workspace as WorkspaceSchema, solve, questions } from "./domain";

export async function api<T>(
  path: string,
  body?: unknown,
  method?: string,
): Promise<T> {
  const r = await fetch("/api" + path, {
    method: method ?? (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => null);
  if (!r.ok)
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `Request failed (${r.status}). Please try again.`,
    );
  if (data === null || typeof data !== "object")
    throw new Error(
      "The server returned an unexpected response. Please try again.",
    );
  if (data.workspace && !data.plan) {
    const w = WorkspaceSchema.parse(data.workspace);
    data.workspace = w;
    data.plan = solve(w);
    data.questions = questions(w);
  }
  return data;
}

export function download(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
