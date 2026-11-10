import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import type { Fact, Status } from "../domain";
import { labels } from "./fact-labels";

export function FactForm({
  fact,
  reply,
  busy,
  onSave,
}: {
  fact: Fact;
  reply?: boolean;
  busy: boolean;
  onSave: (
    f: Fact,
    s: Status,
    n: string,
    r: string,
    a?: boolean,
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState<Status>(reply ? "yes" : fact.status),
    [accept, setAccept] = useState(
      fact.provenance === "clocked" && !fact.reviewed,
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        void onSave(
          fact,
          status,
          String(fd.get("note")),
          String(fd.get("reviewer")),
          accept,
        );
      }}
    >
      <div className="review-question">
        <MessageCircle size={20} />
        <h3>{fact.label}</h3>
      </div>
      <p className="form-note">
        {reply
          ? "Record the answer you actually received. This updates the saved facts and recalculates the actual roster."
          : "Review all applicable source messages. An interpretation does not independently verify a real qualification."}
      </p>
      <label>
        Reviewed answer
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Status);
            if (e.target.value !== fact.status) setAccept(false);
          }}
        >
          {Object.entries(labels).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label>
        {reply ? "Actual reply and context" : "Reason / correction"}
        <textarea
          rows={4}
          name="note"
          required
          minLength={3}
          maxLength={2000}
          placeholder={
            reply
              ? "Paste the reply and how you confirmed it."
              : "Explain what the evidence establishes and why."
          }
        />
      </label>
      <label>
        Reviewed by
        <input
          name="reviewer"
          required
          maxLength={80}
          placeholder="Your name or initials"
        />
      </label>
      {fact.provenance === "clocked" && !fact.reviewed && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
          />{" "}
          Accept the source-backed proposal. Uncheck to record a
          coordinator-provided correction.
        </label>
      )}
      <button className="primary full" disabled={busy}>
        <Check size={16} />{" "}
        {reply ? "Save reply & update roster" : "Save reviewed fact"}
      </button>
    </form>
  );
}
