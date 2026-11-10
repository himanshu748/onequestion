import { test } from "node:test";
import assert from "node:assert/strict";
import { ClockedError } from "clocked-sdk";
import worker, { type Env } from "../cloud/worker";
import { ProviderResponseError } from "../server/provider-errors";

test("Worker errors preserve expected statuses, hide internal/provider details and log metadata only", async () => {
  const sensitive =
    "synthetic source text, synthetic-token and private-key-marker";
  const logs: unknown[] = [];
  const original = console.error;
  console.error = (entry) => {
    logs.push(entry);
  };
  try {
    for (const [error, expectedStatus, expectedMessage] of [
      [new Error(sensitive), 500, "Request failed. Please try again later."],
      [
        new ClockedError({
          status: 401,
          error: sensitive,
          idempotencyKey: "synthetic",
          attempts: 1,
        }),
        502,
        "Provider request failed. Try again later.",
      ],
      [
        new ProviderResponseError(),
        502,
        "Provider request failed. Try again later.",
      ],
      [
        Object.assign(new Error("Workspace unavailable."), { status: 409 }),
        409,
        "Workspace unavailable.",
      ],
    ] as const) {
      const env = {
        DB: {
          prepare() {
            throw error;
          },
        },
      } as unknown as Env;
      const response = await worker.fetch(
        new Request("https://example.test/api/workspaces"),
        env,
      );
      assert.equal(response.status, expectedStatus);
      assert.deepEqual(await response.json(), { error: expectedMessage });
      assert.equal(JSON.stringify(logs).includes(sensitive), false);
    }
    for (const entry of logs) {
      assert.deepEqual(Object.keys(entry as object).sort(), [
        "method",
        "name",
        "route",
        "status",
      ]);
      assert.equal((entry as { route: string }).route, "/api/workspaces");
    }
  } finally {
    console.error = original;
  }
});
