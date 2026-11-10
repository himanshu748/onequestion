import type { Status } from "../domain";
export const labels: Record<Status, string> = {
  yes: "Established",
  no: "Not eligible",
  unknown: "Unknown",
  conditional: "Conditional",
  conflict: "Conflict",
};
