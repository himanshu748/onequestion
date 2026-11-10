import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { solve } from "../src/domain";

test(
  "Cloudflare runtime isolates browser sessions and preserves review/revision boundaries with real local D1",
  { timeout: 120000 },
  async () => {
    assert.ok(
      existsSync("dist/index.html"),
      "Cloudflare tests require dist/index.html. Run npm test (pretest builds assets), or npm run build before invoking this test directly.",
    );
    const dir = mkdtempSync(path.join(tmpdir(), "onequestion-cloud-"));
    const port = 46000 + Math.floor(Math.random() * 1000);
    const base = `http://127.0.0.1:${port}`;
    const cli = "node_modules/wrangler/bin/wrangler.js";
    let child: ChildProcess | undefined;
    const env = { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "true" };
    try {
      execFileSync(
        process.execPath,
        [
          cli,
          "d1",
          "migrations",
          "apply",
          "onequestion",
          "--local",
          "--persist-to",
          dir,
        ],
        { env, stdio: "ignore" },
      );
      child = spawn(
        process.execPath,
        [
          cli,
          "dev",
          "--ip",
          "127.0.0.1",
          "--port",
          String(port),
          "--persist-to",
          dir,
          "--var",
          "LIVE_ACCESS_TOKEN:synthetic-worker-access-code",
        ],
        { env, stdio: "ignore" },
      );
      let startupError: Error | undefined;
      child.once("error", (error) => {
        startupError = error;
      });
      let ready = false;
      for (let i = 0; i < 200; i++) {
        if (startupError)
          throw new Error(
            "Wrangler could not start. Run npm ci and npm run build.",
          );
        if (child.exitCode !== null || child.signalCode !== null)
          throw new Error(
            `Wrangler exited before readiness (code ${child.exitCode}, signal ${child.signalCode}). Run npm ci and npm run build.`,
          );
        try {
          if ((await fetch(base + "/api/status")).ok) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.ok(ready, "Worker must start");
      async function client() {
        const r = await fetch(base + "/api/status");
        const cookie = r.headers.get("set-cookie")!.split(";")[0];
        const call = (
          route: string,
          body?: unknown,
          method?: string,
          origin?: string,
        ) =>
          fetch(base + "/api" + route, {
            method: method ?? (body ? "POST" : "GET"),
            headers: {
              Cookie: cookie,
              ...(body ? { "Content-Type": "application/json" } : {}),
              ...(origin ? { Origin: origin } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
          });
        return call;
      }
      const a = await client(),
        b = await client();
      const created = await (await a("/workspaces", { demo: true })).json();
      const w = created.workspace,
        id = w.id;
      assert.equal(solve(w).coverage, 3);
      assert.equal((await (await a("/workspaces")).json()).length, 1);
      assert.deepEqual(await (await b("/workspaces")).json(), []);
      assert.equal((await b("/workspaces/" + id)).status, 404);
      const fact = w.facts.find(
        (f: { personId: string; kind: string; slotId: string }) =>
          f.personId === "cy" &&
          f.kind === "qualification" &&
          f.slotId === "keyholder",
      );
      const update = {
        revision: 0,
        factId: fact.id,
        status: "yes",
        note: "Fictional keyholder confirmation for this event.",
        reviewer: "Cloud QA",
      };
      assert.equal((await b(`/workspaces/${id}/fact`, update)).status, 404);
      assert.equal(
        (
          await a(
            `/workspaces/${id}/fact`,
            update,
            undefined,
            "https://example.invalid",
          )
        ).status,
        403,
      );
      const changed = await (await a(`/workspaces/${id}/fact`, update)).json();
      assert.equal(solve(changed.workspace).coverage, 4);
      assert.equal((await a(`/workspaces/${id}/fact`, update)).status, 409);
      assert.equal(
        (await b(`/workspaces/${id}`, { revision: 1 }, "DELETE")).status,
        404,
      );
      assert.equal((await a("/workspaces/" + id)).status, 200);
      const imported = await (await a("/import", changed.workspace)).json();
      assert.ok(
        imported.workspace.facts.every(
          (f: { reviewed: boolean }) => !f.reviewed,
        ),
      );
      assert.equal(solve(imported.workspace).coverage, 0);
      assert.equal(
        (await a("/compile", { text: "One Welcome role." })).status,
        403,
      );
      assert.equal(
        (await a("/live-session", { token: "wrong-code" })).status,
        403,
      );
      assert.equal(
        (await a("/live-session", { token: "synthetic-worker-access-code" }))
          .status,
        200,
      );
      for (let i = 0; i < 3; i++)
        assert.equal((await a("/workspaces", { demo: true })).status, 200);
      assert.equal((await a("/workspaces", { demo: true })).status, 409);
      const oversized = await fetch(base + "/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "x".repeat(270000) }),
      });
      assert.equal(oversized.status, 413);
    } finally {
      if (
        child &&
        child.exitCode === null &&
        child.signalCode === null &&
        !child.killed
      ) {
        const closed = new Promise((r) => child!.once("exit", r));
        child.kill("SIGTERM");
        await closed;
      }
      rmSync(dir, { recursive: true, force: true });
    }
  },
);

test(
  "zero hosted allowance blocks valid work while invalid analysis fails before budget reservation (keyless)",
  { timeout: 120000 },
  async () => {
    assert.ok(
      existsSync("dist/index.html"),
      "Run npm test to build dist before the Worker test.",
    );
    const dir = mkdtempSync(path.join(tmpdir(), "onequestion-budget-"));
    const port = 47000 + Math.floor(Math.random() * 1000);
    const base = `http://127.0.0.1:${port}`;
    const cli = "node_modules/wrangler/bin/wrangler.js";
    const env = { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "true" };
    let child: ChildProcess | undefined;
    try {
      execFileSync(
        process.execPath,
        [
          cli,
          "d1",
          "migrations",
          "apply",
          "onequestion",
          "--local",
          "--persist-to",
          dir,
        ],
        { env, stdio: "ignore" },
      );
      child = spawn(
        process.execPath,
        [
          cli,
          "dev",
          "--ip",
          "127.0.0.1",
          "--port",
          String(port),
          "--persist-to",
          dir,
          "--var",
          "LIVE_ACCESS_TOKEN:synthetic-worker-access-code",
          "--var",
          "CLOCKED_API_KEY:clk_synthetic_never_called",
          "--var",
          "LIVE_DAILY_REQUEST_LIMIT:0",
        ],
        { env, stdio: "ignore" },
      );
      let startupError: Error | undefined;
      child.once("error", (error) => {
        startupError = error;
      });
      let ready = false;
      for (let i = 0; i < 200; i++) {
        if (
          startupError ||
          child.exitCode !== null ||
          child.signalCode !== null
        )
          throw new Error("Budget-test Worker exited before readiness.");
        try {
          if ((await fetch(base + "/api/status")).ok) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.ok(ready, "Budget-test Worker must start");
      const initial = await fetch(base + "/api/status");
      const cookie = initial.headers.get("set-cookie")!.split(";")[0];
      const call = (route: string, data: unknown) =>
        fetch(base + "/api" + route, {
          method: "POST",
          headers: { Cookie: cookie, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      const unlock = await call("/live-session", {
        token: "synthetic-worker-access-code",
      });
      assert.equal(unlock.status, 200);
      assert.deepEqual(await unlock.json(), { live: true });
      assert.equal(
        (await call("/compile", { text: "One Welcome role." })).status,
        429,
      );
      const created = await (await call("/workspaces", { demo: true })).json();
      const unknown = await call(
        `/workspaces/${created.workspace.id}/analyze`,
        { revision: 0, personId: "unknown-person" },
      );
      assert.ok(unknown.status >= 400 && unknown.status < 500);
      assert.notEqual(unknown.status, 429);
      assert.match((await unknown.json()).error, /Person not found/);
      assert.equal(
        (
          await call(`/workspaces/${created.workspace.id}/analyze`, {
            revision: 0,
            personId: "cy",
          })
        ).status,
        429,
      );
    } finally {
      if (
        child &&
        child.exitCode === null &&
        child.signalCode === null &&
        !child.killed
      ) {
        const closed = new Promise((r) => child!.once("exit", r));
        child.kill("SIGTERM");
        await closed;
      }
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
