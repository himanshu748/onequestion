import express from "express";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  Event,
  Workspace,
  solve,
  questions,
  type Workspace as W,
} from "../src/domain";
import { demoWorkspace } from "../src/demo";
import {
  AddPeople,
  AddSource,
  ReviewFact,
  addPeople,
  addSource,
  reviewFact,
  importWorkspace,
} from "./actions";
import {
  available,
  compileBrief,
  analyzePerson,
  prepareAnalysis,
} from "./clocked";

const app = express();
const port = Number(process.env.PORT ?? 4317);
const dataDir = process.env.ONEQUESTION_DATA_DIR ?? "data";
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(path.join(dataDir, "onequestion.sqlite"));
db.exec(
  "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, data TEXT NOT NULL);",
);
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  const host = req.headers.host ?? "";
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(host))
    return res.status(403).json({ error: "Local access only." });
  const origin = req.headers.origin;
  if (
    origin &&
    ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(origin)
  )
    return res.status(403).json({ error: "Cross-origin access is blocked." });
  next();
});
app.use(express.json({ limit: "256kb" }));
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
function read(id: string): W {
  const row = db.prepare("SELECT data FROM workspaces WHERE id=?").get(id) as
    { data: string } | undefined;
  if (!row)
    throw Object.assign(new Error("Workspace not found."), { status: 404 });
  return Workspace.parse(JSON.parse(row.data));
}
function write(w: W) {
  Workspace.parse(w);
  db.prepare("INSERT OR REPLACE INTO workspaces VALUES (?,?)").run(
    w.id,
    JSON.stringify(w),
  );
}
function reply(res: express.Response, w: W) {
  return res.json({ workspace: w, plan: solve(w), questions: questions(w) });
}
function mutate(id: string, revision: number, fn: (w: W) => void) {
  const w = read(id);
  if (w.revision !== revision)
    throw Object.assign(
      new Error("This workspace changed in another tab. Reload before saving."),
      { status: 409 },
    );
  fn(w);
  w.revision++;
  w.updatedAt = new Date().toISOString();
  write(w);
  return w;
}
const wrap =
  (fn: express.RequestHandler): express.RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
app.get("/api/status", (_req, res) =>
  res.json({
    live: available(),
    storage: "local SQLite",
    maxPeople: 12,
    maxSlots: 8,
  }),
);
app.get("/api/workspaces", (_req, res) =>
  res.json(
    db
      .prepare("SELECT data FROM workspaces")
      .all()
      .map((r) => {
        const w = JSON.parse(String(r.data));
        return {
          id: w.id,
          name: w.event.name,
          demo: w.demo,
          updatedAt: w.updatedAt,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  ),
);
app.post(
  "/api/workspaces",
  wrap((req, res) => {
    const body = z
      .object({ demo: z.boolean().optional(), event: Event.optional() })
      .parse(req.body);
    const id = crypto.randomUUID();
    let w: W;
    if (body.demo) w = demoWorkspace(id);
    else {
      if (!body.event) throw new Error("Event details are required.");
      w = {
        id,
        revision: 0,
        demo: false,
        event: body.event,
        people: [],
        sources: [],
        facts: [],
        baseline: {},
        updatedAt: new Date().toISOString(),
      };
    }
    write(w);
    reply(res, w);
  }),
);
app.get(
  "/api/workspaces/:id",
  wrap((req, res) => reply(res, read(String(req.params.id)))),
);
app.delete(
  "/api/workspaces/:id",
  wrap((req, res) => {
    const b = z.object({ revision: z.number().int() }).parse(req.body);
    mutate(String(req.params.id), b.revision, () => {});
    db.prepare("DELETE FROM workspaces WHERE id=?").run(String(req.params.id));
    res.json({ ok: true });
  }),
);
app.post(
  "/api/workspaces/:id/reset",
  wrap((req, res) => {
    const b = z.object({ revision: z.number().int() }).parse(req.body);
    const w = mutate(String(req.params.id), b.revision, (w) => {
      if (!w.demo) throw new Error("Only fictional examples can be reset.");
      Object.assign(w, demoWorkspace(w.id), { revision: w.revision });
    });
    reply(res, w);
  }),
);
app.post(
  "/api/workspaces/:id/people",
  wrap((req, res) => {
    const b = AddPeople.parse(req.body);
    const w = mutate(String(req.params.id), b.revision, (w) => addPeople(w, b));
    reply(res, w);
  }),
);
app.post(
  "/api/workspaces/:id/source",
  wrap((req, res) => {
    const b = AddSource.parse(req.body);
    const w = mutate(String(req.params.id), b.revision, (w) => addSource(w, b));
    reply(res, w);
  }),
);
app.post(
  "/api/workspaces/:id/fact",
  wrap((req, res) => {
    const b = ReviewFact.parse(req.body);
    const w = mutate(String(req.params.id), b.revision, (w) =>
      reviewFact(w, b),
    );
    reply(res, w);
  }),
);
app.post(
  "/api/workspaces/:id/baseline",
  wrap((req, res) => {
    const b = z.object({ revision: z.number().int() }).parse(req.body);
    const w = mutate(String(req.params.id), b.revision, (w) => {
      w.baseline = solve(w).assignments;
    });
    reply(res, w);
  }),
);
const active = new Set<string>();
let calls = 0;
app.post(
  "/api/compile",
  wrap(async (req, res) => {
    const b = z
      .object({ text: z.string().trim().min(1).max(8000) })
      .parse(req.body);
    if (active.size || calls >= 40)
      throw new Error(
        "Live request limit reached or another analysis is running.",
      );
    active.add("compile");
    calls++;
    try {
      res.json(await compileBrief(b.text));
    } finally {
      active.delete("compile");
    }
  }),
);
app.post(
  "/api/workspaces/:id/analyze",
  wrap(async (req, res) => {
    const b = z
      .object({ revision: z.number().int(), personId: z.string() })
      .parse(req.body);
    const id = String(req.params.id);
    const w = read(id);
    if (w.revision !== b.revision)
      throw Object.assign(new Error("Reload the current workspace first."), {
        status: 409,
      });
    prepareAnalysis(w, b.personId);
    if (active.size || calls >= 40)
      throw new Error(
        "Another analysis is running or the 40-analysis session limit was reached.",
      );
    active.add(id);
    calls++;
    try {
      const r = await analyzePerson(w, b.personId);
      const saved = mutate(id, b.revision, (w) => {
        w.sources.push(r.source);
        for (const proposal of r.proposals) {
          const index = w.facts.findIndex((f) => f.id === proposal.id);
          w.facts[index] = proposal;
        }
      });
      res.json({
        workspace: saved,
        plan: solve(saved),
        questions: questions(saved),
        usage: r.credits,
      });
    } finally {
      active.delete(id);
    }
  }),
);
app.post(
  "/api/import",
  wrap((req, res) => {
    const w = importWorkspace(req.body);
    write(w);
    reply(res, w);
  }),
);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Unknown API route." }),
);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("dist")));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.resolve("dist/index.html")),
  );
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const e = err as { status?: number };
    const message =
      err instanceof z.ZodError
        ? "Invalid input: " + err.issues.map((i) => i.message).join("; ")
        : err instanceof Error
          ? err.message
          : "Request failed.";
    res.status(e.status ?? 400).json({
      error: message.includes("clk_")
        ? "Provider request failed. Check server configuration."
        : message,
    });
  },
);
app.listen(port, "127.0.0.1", () =>
  console.log(`OneQuestion is available at http://127.0.0.1:${port}`),
);
