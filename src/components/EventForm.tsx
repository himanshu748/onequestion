import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import type { Workspace, Slot } from "../domain";
import { api } from "../api";

export function EventForm({
  live,
  busy,
  onCreate,
}: {
  live: boolean;
  busy: boolean;
  onCreate: (event: Workspace["event"]) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([
      { id: crypto.randomUUID(), name: "", qualification: "", approval: false },
    ]),
    [brief, setBrief] = useState(""),
    [compiling, setCompiling] = useState(false),
    [localError, setLocalError] = useState(""),
    [requirementNotes, setRequirementNotes] = useState<string[]>([]),
    [unsupported, setUnsupported] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onCreate({
          name: String(fd.get("name")),
          date: String(fd.get("date")),
          timezone: String(fd.get("timezone")),
          start: String(fd.get("start")),
          end: String(fd.get("end")),
          brief,
          slots,
        });
      }}
    >
      <p className="form-note">
        One event, one shared interval, up to eight roles and twelve volunteers.
        Multiple shifts and cross-person dependencies are outside this model.
      </p>
      {localError && (
        <div className="error-banner" role="alert">
          {localError}
        </div>
      )}
      <label>
        Event name
        <input
          name="name"
          required
          maxLength={100}
          placeholder="e.g. The neighborhood gathering"
        />
      </label>
      <div className="form-grid">
        <label>
          Date
          <input type="date" name="date" required />
        </label>
        <label>
          Timezone
          <input
            name="timezone"
            required
            defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
            placeholder="Asia/Kolkata"
          />
        </label>
        <label>
          Starts
          <input type="time" name="start" required />
        </label>
        <label>
          Ends
          <input type="time" name="end" required />
        </label>
      </div>
      <label>
        Organizer brief
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          maxLength={8000}
          placeholder="Describe the roles and any required qualifications or approvals."
        />
      </label>
      <button
        type="button"
        className="secondary full"
        disabled={!live || !brief.trim() || compiling}
        onClick={() => {
          setCompiling(true);
          setLocalError("");
          void api<{
            roles: string[];
            requirements: string[];
            unsupported: boolean;
          }>("/compile", { text: brief })
            .then((r) => {
              setSlots(
                r.roles.map((name) => ({
                  id: crypto.randomUUID(),
                  name,
                  qualification: "",
                  approval: false,
                })),
              );
              setRequirementNotes(r.requirements);
              setUnsupported(r.unsupported);
            })
            .catch((e) => setLocalError(e.message))
            .finally(() => setCompiling(false));
        }}
      >
        {compiling ? "Compiling…" : "Propose roles with Clocked Fill"}
      </button>
      {!live && (
        <p className="smalltext muted">
          Clocked is disabled. Define and review roles manually below.
        </p>
      )}
      {requirementNotes.length > 0 && (
        <div className="info-note">
          <strong>
            Extracted requirements: add these to the appropriate roles before
            approving.
          </strong>
          <ul>
            {requirementNotes.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {unsupported && (
        <div className="error-banner">
          The brief may include unsupported constraints. Revise the brief and
          compile again, or create a supported single-interval plan manually.
        </div>
      )}
      <h3 className="form-section-title">Review individual roles</h3>
      {slots.map((s, i) => (
        <div className="slot-input" key={s.id}>
          <label>
            Role {i + 1}
            <input
              required
              maxLength={80}
              value={s.name}
              onChange={(e) =>
                setSlots(
                  slots.map((x) =>
                    x.id === s.id ? { ...x, name: e.target.value } : x,
                  ),
                )
              }
            />
          </label>
          <label>
            Required qualification, if any
            <input
              maxLength={250}
              value={s.qualification}
              onChange={(e) =>
                setSlots(
                  slots.map((x) =>
                    x.id === s.id ? { ...x, qualification: e.target.value } : x,
                  ),
                )
              }
              placeholder="e.g. current venue access"
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={s.approval}
              onChange={(e) =>
                setSlots(
                  slots.map((x) =>
                    x.id === s.id ? { ...x, approval: e.target.checked } : x,
                  ),
                )
              }
            />{" "}
            Coordinator approval required
          </label>
          {slots.length > 1 && (
            <button
              type="button"
              className="text-button"
              onClick={() => setSlots(slots.filter((x) => x.id !== s.id))}
            >
              <Trash2 size={13} /> Remove role
            </button>
          )}
        </div>
      ))}
      {slots.length < 8 && (
        <button
          type="button"
          className="text-button"
          onClick={() =>
            setSlots([
              ...slots,
              {
                id: crypto.randomUUID(),
                name: "",
                qualification: "",
                approval: false,
              },
            ])
          }
        >
          <Plus size={15} /> Add another role
        </button>
      )}
      <label className="checkbox-label">
        <input type="checkbox" required /> I reviewed all requirements. These
        roles share this interval and have no unsupported dependencies.
      </label>
      <button className="primary full" disabled={busy}>
        Create event <ArrowRight size={16} />
      </button>
    </form>
  );
}
