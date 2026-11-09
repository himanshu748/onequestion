import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

test("real HTTP entry point persists replies, rejects stale/cross-origin edits, and imports without trusting facts", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "onequestion-test-"));
  const port = 44000 + Math.floor(Math.random() * 1000);
  const base = `http://127.0.0.1:${port}`;
  let child: ChildProcess;
  const start = async () => {
    child = spawn(
      process.execPath,
      ["node_modules/tsx/dist/cli.mjs", "server/index.ts"],
      {
        env: {
          ...process.env,
          PORT: String(port),
          ONEQUESTION_DATA_DIR: dir,
          NODE_ENV: "production",
          CLOCKED_ENABLED: "false",
        },
        stdio: "ignore",
      },
    );
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(base + "/api/status")).ok) return;
      } catch {}
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("Test server did not start.");
  };
  const stop = async () => {
    if (child && !child.killed) {
      const ended = new Promise((r) => child.once("exit", r));
      child.kill("SIGTERM");
      await ended;
    }
  };
  const call = async (
    p: string,
    b?: unknown,
    headers: Record<string, string> = {},
  ) =>
    fetch(base + "/api" + p, {
      method: b ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...headers },
      body: b ? JSON.stringify(b) : undefined,
    });
  try {
    await start();
    const created = await (await call("/workspaces", { demo: true })).json();
    const id = created.workspace.id;
    assert.equal(created.plan.coverage, 3);
    const f = created.workspace.facts.find(
      (f: { personId: string; slotId: string; kind: string }) =>
        f.personId === "cy" &&
        f.slotId === "keyholder" &&
        f.kind === "qualification",
    );
    const update = {
      revision: 0,
      factId: f.id,
      status: "yes",
      note: "Cy confirmed renewed venue access.",
      reviewer: "Test coordinator",
    };
    const blocked = await call(`/workspaces/${id}/fact`, update, {
      Origin: "https://example.invalid",
    });
    assert.equal(blocked.status, 403);
    const saved = await (await call(`/workspaces/${id}/fact`, update)).json();
    assert.equal(saved.plan.coverage, 4);
    assert.equal(saved.workspace.revision, 1);
    const stale = await call(`/workspaces/${id}/fact`, update);
    assert.equal(stale.status, 409);
    await stop();
    await start();
    const restored = await (await call(`/workspaces/${id}`)).json();
    assert.equal(restored.plan.coverage, 4);
    assert.equal(
      restored.workspace.facts.find((x: { id: string }) => x.id === f.id).note,
      update.note,
    );
    const imported = await (await call("/import", restored.workspace)).json();
    assert.ok(
      imported.workspace.facts.every((f: { reviewed: boolean }) => !f.reviewed),
    );
    assert.equal(imported.plan.coverage, 0);
    const forged = structuredClone(restored.workspace);
    const proposal = forged.facts.find((x: { id: string }) => x.id === f.id);
    proposal.status = "conditional";
    proposal.provenance = "clocked";
    proposal.anchors = [];
    const proposalImport = await (await call("/import", forged)).json();
    const changedProposal = await call(
      `/workspaces/${proposalImport.workspace.id}/fact`,
      {
        ...update,
        revision: 0,
        acceptProposal: true,
      },
    );
    assert.equal(
      changedProposal.status,
      400,
      "A conditional proposal cannot be accepted as affirmative",
    );
    proposal.status = "yes";
    const noSpan = await (await call("/import", forged)).json();
    const acceptedWithoutEvidence = await call(
      `/workspaces/${noSpan.workspace.id}/fact`,
      {
        ...update,
        revision: 0,
        acceptProposal: true,
      },
    );
    assert.equal(
      acceptedWithoutEvidence.status,
      400,
      "An affirmative Clocked proposal needs valid source evidence",
    );
    const unavailable = await call(`/workspaces/${id}/analyze`, {
      revision: 1,
      personId: "cy",
    });
    assert.equal(unavailable.status, 400);
    assert.match((await unavailable.json()).error, /disabled/);
    const current = await (await call(`/workspaces/${id}`)).json();
    assert.equal(current.workspace.revision, 1);
  } finally {
    await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
