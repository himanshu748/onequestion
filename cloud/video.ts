/** Byte ranges for the small public demo, so browsers can seek without a paid video service. */
export async function videoResponse(
  request: Request,
  load: (request: Request) => Promise<Response>,
): Promise<Response> {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  const upstream = new Request(request, { method: "GET" });
  for (const name of [
    "range",
    "if-range",
    "if-none-match",
    "if-modified-since",
  ])
    upstream.headers.delete(name);
  upstream.headers.set("Accept-Encoding", "identity");
  const asset = await load(upstream);
  if (!asset.ok) return asset;
  // This route serves only the 3.2 MB demo; keep an explicit bound if it is replaced.
  if (Number(asset.headers.get("Content-Length") ?? "0") > 8 * 1024 * 1024)
    return new Response("Demo exceeds the supported size.", { status: 503 });
  const bytes = await asset.arrayBuffer();
  if (bytes.byteLength > 8 * 1024 * 1024)
    return new Response("Demo exceeds the supported size.", { status: 503 });
  const size = bytes.byteLength,
    headers = new Headers(asset.headers);
  headers.delete("Content-Encoding");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(size));
  const range = request.headers.get("Range"),
    ifRange = request.headers.get("If-Range");
  if (range && (!ifRange || ifRange === headers.get("ETag"))) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start = 0,
      end = size - 1;
    if (!m || (!m[1] && !m[2])) {
      headers.set("Content-Range", `bytes */${size}`);
      headers.set("Content-Length", "0");
      return new Response(null, { status: 416, headers });
    }
    if (!m[1]) start = Math.max(0, size - Number(m[2]));
    else {
      start = Number(m[1]);
      if (m[2]) end = Math.min(end, Number(m[2]));
    }
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= size
    ) {
      headers.set("Content-Range", `bytes */${size}`);
      headers.set("Content-Length", "0");
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(
      request.method === "HEAD" ? null : bytes.slice(start, end + 1),
      { status: 206, headers },
    );
  }
  return new Response(request.method === "HEAD" ? null : bytes, { headers });
}
