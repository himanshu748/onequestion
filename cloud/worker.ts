import type { D1Database, Fetcher } from "@cloudflare/workers-types";
import { z } from "zod";
import { Event, Workspace, solve, type Workspace as W } from "../src/domain";
import { demoWorkspace } from "../src/demo";
import {
  AddPeople,
  AddSource,
  ReviewFact,
  addPeople,
  addSource,
  reviewFact,
  importWorkspace,
} from "../server/actions";
import { compileBrief, analyzePerson, prepareAnalysis } from "../server/clocked";
import { videoResponse } from "./video";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  CLOCKED_API_KEY?: string;
  LIVE_ACCESS_TOKEN?: string;
  LIVE_DAILY_REQUEST_LIMIT?: string;
}
const lifetime = 30 * 86400;
function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
async function jsonBody(req: Request): Promise<unknown> {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    fail("Send JSON.", 415);
  const reader = req.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.byteLength;
    if (size > 262144) {
      await reader.cancel();
      fail("Request exceeds 256 KB.", 413);
    }
    chunks.push(r.value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    fail("Invalid JSON.");
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/demo/onequestion-demo.mp4")
      return videoResponse(
        req,
        (r) => env.ASSETS.fetch(r as never) as unknown as Promise<Response>,
      );
    if (!url.pathname.startsWith("/api/"))
      return env.ASSETS.fetch(req as never) as unknown as Promise<Response>;
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    });
    const respond = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status, headers });
    try {
      if (req.headers.get("origin") && req.headers.get("origin") !== url.origin)
        fail("Cross-origin access is blocked.", 403);
      if (req.headers.get("sec-fetch-site") === "cross-site")
        fail("Cross-site access is blocked.", 403);
      if (!["GET", "POST", "DELETE"].includes(req.method))
        fail("Method not allowed.", 405);
      const now = Math.floor(Date.now() / 1000);
      const secure = url.protocol === "https:";
      if (!secure && !["localhost", "127.0.0.1"].includes(url.hostname))
        fail("HTTPS is required.", 403);
      const cookieName = secure ? "__Host-onequestion" : "onequestion-local";
      let session = req.headers
        .get("cookie")
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(cookieName + "="))
        ?.slice(cookieName.length + 1);
      if (!session || !/^[a-f0-9]{64}$/.test(session)) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        session = Array.from(bytes, (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
      }
      headers.set(
        "Set-Cookie",
        `${cookieName}=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetime}${secure ? "; Secure" : ""}`,
      );
      const owner = await hash(session);
      const live = async () =>
        !!env.CLOCKED_API_KEY &&
        !!(await env.DB.prepare(
          "SELECT owner FROM live_sessions WHERE owner=? AND expires_at>?",
        )
          .bind(owner, now)
          .first());
      async function requireLive(requests: number) {
        if (!(await live()))
          fail(
            "Live analysis requires the owner access code. The public example and manual planning remain available.",
            403,
          );
        const day = new Date().toISOString().slice(0, 10);
        const limit = Math.min(
          20,
          Math.max(0, Number(env.LIVE_DAILY_REQUEST_LIMIT ?? "6")),
        );
        await env.DB.prepare(
          "INSERT OR IGNORE INTO live_budget(day,used) VALUES (?,0)",
        )
          .bind(day)
          .run();
        const r = await env.DB.prepare(
          "UPDATE live_budget SET used=used+? WHERE day=? AND used+?<=?",
        )
          .bind(requests, day, requests, limit)
          .run();
        if (r.meta.changes !== 1)
          fail(
            "The hosted live-request allowance is exhausted for today. Manual planning still works.",
            429,
          );
      }
      async function read(id: string): Promise<W> {
        const row = await env.DB.prepare(
          "SELECT data FROM workspaces WHERE id=? AND owner=? AND expires_at>?",
        )
          .bind(id, owner, now)
          .first<{ data: string }>();
        if (!row) fail("Workspace not found.", 404);
        return Workspace.parse(JSON.parse(row.data));
      }
      async function create(w: W) {
        await env.DB.prepare(
          "DELETE FROM workspaces WHERE id IN (SELECT id FROM workspaces WHERE expires_at<? LIMIT 10)",
        )
          .bind(now)
          .run();
        const count = await env.DB.prepare(
          "SELECT COUNT(*) AS n FROM workspaces WHERE owner=?",
        )
          .bind(owner)
          .first<{ n: number }>();
        if ((count?.n ?? 0) >= 5)
          fail(
            "This browser session can hold five events. Export or delete an event first.",
            409,
          );
        Workspace.parse(w);
        await env.DB.prepare(
          "INSERT INTO workspaces(id,owner,revision,data,updated_at,expires_at) VALUES (?,?,?,?,?,?)",
        )
          .bind(
            w.id,
            owner,
            w.revision,
            JSON.stringify(w),
            w.updatedAt,
            now + lifetime,
          )
          .run();
      }
      async function mutate(id: string, revision: number, fn: (w: W) => void) {
        const w = await read(id);
        if (w.revision !== revision)
          fail(
            "This workspace changed in another tab. Reload before saving.",
            409,
          );
        fn(w);
        w.revision++;
        w.updatedAt = new Date().toISOString();
        Workspace.parse(w);
        const r = await env.DB.prepare(
          "UPDATE workspaces SET revision=?,data=?,updated_at=?,expires_at=? WHERE id=? AND owner=? AND revision=?",
        )
          .bind(
            w.revision,
            JSON.stringify(w),
            w.updatedAt,
            now + lifetime,
            id,
            owner,
            revision,
          )
          .run();
        if (r.meta.changes !== 1)
          fail(
            "This workspace changed in another tab. Reload before saving.",
            409,
          );
        return w;
      }
      const route = url.pathname;
      if (route === "/api/status" && req.method === "GET")
        return respond({
          live: await live(),
          hosted: true,
          canUnlock: !!env.CLOCKED_API_KEY && !!env.LIVE_ACCESS_TOKEN,
          storage: "Cloudflare D1 · private browser session",
          maxPeople: 12,
          maxSlots: 8,
        });
      if (route === "/api/live-session" && req.method === "POST") {
        const b = z
          .object({ token: z.string().min(1).max(256) })
          .parse(await jsonBody(req));
        if (
          !env.LIVE_ACCESS_TOKEN ||
          (await hash(b.token)) !== (await hash(env.LIVE_ACCESS_TOKEN))
        )
          fail("Access code not recognized.", 403);
        await env.DB.prepare(
          "INSERT INTO live_sessions(owner,expires_at) VALUES (?,?) ON CONFLICT(owner) DO UPDATE SET expires_at=excluded.expires_at",
        )
          .bind(owner, now + 3600)
          .run();
        return respond({ live: !!env.CLOCKED_API_KEY });
      }
      if (route === "/api/workspaces" && req.method === "GET") {
        const r = await env.DB.prepare(
          "SELECT id,json_extract(data,'$.event.name') AS name,json_extract(data,'$.demo') AS demo,updated_at AS updatedAt FROM workspaces WHERE owner=? AND expires_at>? ORDER BY updated_at DESC LIMIT 5",
        )
          .bind(owner, now)
          .all();
        return respond(r.results);
      }
      if (route === "/api/workspaces" && req.method === "POST") {
        const b = z
          .object({ demo: z.boolean().optional(), event: Event.optional() })
          .parse(await jsonBody(req));
        const id = crypto.randomUUID();
        let w: W;
        if (b.demo) w = demoWorkspace(id);
        else {
          if (!b.event) fail("Event details are required.");
          w = {
            id,
            revision: 0,
            demo: false,
            event: b.event,
            people: [],
            sources: [],
            facts: [],
            baseline: {},
            updatedAt: new Date().toISOString(),
          };
        }
        await create(w);
        return respond({ workspace: w });
      }
      if (route === "/api/import" && req.method === "POST") {
        const w = importWorkspace(await jsonBody(req));
        await create(w);
        return respond({ workspace: w });
      }
      if (route === "/api/compile" && req.method === "POST") {
        const b = z
          .object({ text: z.string().trim().min(1).max(8000) })
          .parse(await jsonBody(req));
        await requireLive(1);
        return respond(
          await compileBrief(b.text, {
            apiKey: env.CLOCKED_API_KEY,
            enabled: true,
          }),
        );
      }
      const match = route.match(
        /^\/api\/workspaces\/([a-f0-9-]{36})(?:\/(reset|people|source|fact|baseline|analyze))?$/,
      );
      if (!match) fail("Unknown API route.", 404);
      const [, id, action] = match;
      if (!action && req.method === "GET")
        return respond({ workspace: await read(id) });
      if (!action && req.method === "DELETE") {
        const b = z
          .object({ revision: z.number().int() })
          .parse(await jsonBody(req));
        const r = await env.DB.prepare(
          "DELETE FROM workspaces WHERE id=? AND owner=? AND revision=?",
        )
          .bind(id, owner, b.revision)
          .run();
        if (r.meta.changes !== 1) {
          await read(id);
          fail(
            "This workspace changed in another tab. Reload before deleting.",
            409,
          );
        }
        return respond({ ok: true });
      }
      if (req.method !== "POST") fail("Method not allowed.", 405);
      const body = await jsonBody(req);
      if (action === "people") {
        const b = AddPeople.parse(body);
        return respond({
          workspace: await mutate(id, b.revision, (w) => addPeople(w, b)),
        });
      }
      if (action === "source") {
        const b = AddSource.parse(body);
        return respond({
          workspace: await mutate(id, b.revision, (w) => addSource(w, b)),
        });
      }
      if (action === "fact") {
        const b = ReviewFact.parse(body);
        return respond({
          workspace: await mutate(id, b.revision, (w) => reviewFact(w, b)),
        });
      }
      if (action === "reset" || action === "baseline") {
        const b = z.object({ revision: z.number().int() }).parse(body);
        const w = await mutate(id, b.revision, (w) => {
          if (action === "reset") {
            if (!w.demo) fail("Only fictional examples can be reset.");
            Object.assign(w, demoWorkspace(w.id), { revision: w.revision });
          } else w.baseline = solve(w).assignments;
        });
        return respond({ workspace: w });
      }
      if (action === "analyze") {
        const b = z
          .object({ revision: z.number().int(), personId: z.string() })
          .parse(body);
        const w = await read(id);
        if (w.revision !== b.revision)
          fail("Reload the current workspace first.", 409);
        prepareAnalysis(w, b.personId);
        await requireLive(2);
        const result = await analyzePerson(w, b.personId, {
          apiKey: env.CLOCKED_API_KEY,
          enabled: true,
        });
        const saved = await mutate(id, b.revision, (w) => {
          w.sources.push(result.source);
          for (const f of result.proposals) {
            const index = w.facts.findIndex((x) => x.id === f.id);
            if (index < 0) fail("Analysis is stale.", 409);
            w.facts[index] = f;
          }
        });
        return respond({ workspace: saved, usage: result.credits });
      }
      fail("Unknown API route.", 404);
    } catch (error) {
      const e = error as { status?: number };
      if (error instanceof z.ZodError)
        return respond(
          {
            error:
              "Invalid input: " + error.issues.map((i) => i.message).join("; "),
          },
          400,
        );
      const message =
        error instanceof Error ? error.message : "Request failed.";
      return respond(
        {
          error: /clk_|Bearer |api.key/i.test(message)
            ? "Provider request failed. Check the private server configuration."
            : message,
        },
        e.status ?? 400,
      );
    }
  },
};
