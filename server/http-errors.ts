import { ClockedError } from "clocked-sdk";
import { z } from "zod";
import { ProviderResponseError } from "./provider-errors";

export function publicError(error: unknown) {
  if (error instanceof ClockedError || error instanceof ProviderResponseError)
    return { status: 502, message: "Provider request failed. Try again later.", name: error instanceof ClockedError ? "ClockedError" : "ProviderResponseError" };
  if (error instanceof z.ZodError)
    return { status: 400, message: "Invalid input: " + error.issues.map((i) => i.message).join("; "), name: "ZodError" };
  const explicit = error instanceof Error ? (error as Error & { status?: unknown }).status : undefined;
  const name = error instanceof Error && /^(Error|TypeError|RangeError|SyntaxError|ReferenceError|EvalError|URIError)$/.test(error.name) ? error.name : "Error";
  if (typeof explicit === "number" && Number.isInteger(explicit) && explicit >= 400 && explicit <= 599)
    return { status: explicit, message: (error as Error).message, name };
  return { status: 500, message: "Request failed. Please try again later.", name };
}

/** Only known route templates are logged, never arbitrary paths or workspace IDs. */
export function errorRoute(path: string) {
  if (["/api/status", "/api/workspaces", "/api/compile", "/api/import", "/api/live-session"].includes(path)) return path;
  const match = path.match(/^\/api\/workspaces\/[a-f0-9-]{36}(\/(?:reset|people|source|fact|baseline|analyze))?$/);
  return match ? "/api/workspaces/:id" + (match[1] ?? "") : "/api/unknown";
}
