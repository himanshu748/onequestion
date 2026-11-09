import { test } from "node:test";
import assert from "node:assert/strict";
import { videoResponse } from "../cloud/video";

test("public demo serves complete, prefix, suffix, open-ended and conditional video ranges", async () => {
  const data = Uint8Array.from({ length: 100 }, (_, i) => i);
  const load = async (r: Request) => {
    assert.equal(r.headers.get("Range"), null);
    assert.equal(r.headers.get("If-None-Match"), null);
    return new Response(data, {
      headers: {
        "Content-Type": "video/mp4",
        ETag: '"demo-v1"',
        "Content-Length": "100",
      },
    });
  };
  const call = (range?: string, method = "GET", ifRange?: string) =>
    videoResponse(
      new Request("https://example.test/demo/onequestion-demo.mp4", {
        method,
        headers: {
          ...(range ? { Range: range } : {}),
          ...(ifRange ? { "If-Range": ifRange } : {}),
        },
      }),
      load,
    );
  const full = await call();
  assert.equal(full.status, 200);
  assert.equal(full.headers.get("Accept-Ranges"), "bytes");
  assert.equal((await full.arrayBuffer()).byteLength, 100);
  for (const [range, start, end] of [
    ["bytes=0-9", 0, 9],
    ["bytes=90-", 90, 99],
    ["bytes=-5", 95, 99],
    ["bytes=95-1000", 95, 99],
  ] as const) {
    const r = await call(range);
    assert.equal(r.status, 206);
    assert.equal(r.headers.get("Content-Range"), `bytes ${start}-${end}/100`);
    assert.deepEqual(
      new Uint8Array(await r.arrayBuffer()),
      data.slice(start, end + 1),
    );
  }
  for (const range of [
    "bytes=100-",
    "bytes=20-10",
    "bytes=-0",
    "bytes=",
    "bytes=0-1,4-5",
    "bytes=999999999999999999999-",
  ]) {
    const r = await call(range);
    assert.equal(r.status, 416);
    assert.equal(r.headers.get("Content-Range"), "bytes */100");
  }
  const head = await call("bytes=0-9", "HEAD");
  assert.equal(head.status, 206);
  assert.equal(head.headers.get("Content-Length"), "10");
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal((await call("bytes=0-9", "GET", '"outdated"')).status, 200);
  assert.equal((await call("bytes=0-9", "GET", '"demo-v1"')).status, 206);
  assert.equal((await call(undefined, "POST")).status, 405);
});
