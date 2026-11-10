import recorded from "../public/recorded-review/evidence.json";
import "./recorded-output.css";

/** A read-only archive. Never enters workspace facts or triggers provider work. */
export function RecordedOutput() {
  const { fill, extractDecide } = recorded;
  const conservative = extractDecide.proposals.find(
    (fact) => fact.slot === "av" && fact.kind === "qualification",
  );
  return (
    <section
      className="recorded-output"
      aria-labelledby="recorded-output-title"
    >
      <div className="recorded-output-heading">
        <h2 id="recorded-output-title">
          Recorded 9 Nov Clocked output, no live call
        </h2>
        <a href="/recorded-review/">Full recorded review ↗</a>
      </div>
      <p className="recorded-output-boundary">
        Real saved provider outputs on fictional inputs. Separate from this
        plan’s hand-authored starting interpretations; these records do not
        change its facts.
      </p>
      <dl className="recorded-output-summary">
        <div>
          <dt>Fill</dt>
          <dd>
            {fill.roles.length} roles · {fill.requirements.length} requirement
          </dd>
        </div>
        <div>
          <dt>Extract</dt>
          <dd>{extractDecide.proposals.length} anchored proposals</dd>
        </div>
        <div>
          <dt>Decide</dt>
          <dd>
            Sound operation: <strong>{conservative?.status}</strong>
          </dd>
        </div>
      </dl>
      <details className="recorded-output-details">
        <summary>Inspect the saved Fill, Extract and Decide outputs</summary>
        <div className="recorded-fill">
          <h3>Fill: editable event proposals</h3>
          <ul>
            {fill.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
          <p>
            <strong>Requirement:</strong> {fill.requirements.join("; ")}
          </p>
          <p>
            Unsupported constraints: {String(fill.unsupported)} · {fill.model} ·{" "}
            {fill.credits} free credits in the recorded request.
          </p>
        </div>
        <h3>Extract quotes and Decide classifications</h3>
        <p className="recorded-output-boundary">
          Availability was reviewed in the recorded run. The other six proposals
          were awaiting review and cannot establish eligibility. The explicit
          sound-operation quote was classified conditional; that saved result is
          preserved.
        </p>
        <div className="recorded-proposals">
          {extractDecide.proposals.map((fact) => (
            <article key={fact.label} className="recorded-proposal">
              <div className="recorded-proposal-heading">
                <h4>{fact.label}</h4>
                <span className={"recorded-label recorded-" + fact.status}>
                  Decide: {fact.status}
                </span>
              </div>
              {fact.anchors.map((anchor) => (
                <blockquote key={anchor.start + ":" + anchor.end}>
                  <mark>{anchor.value}</mark>
                  <details>
                    <summary>Exact source position</summary>
                    <p>
                      Unicode code points [{anchor.start}, {anchor.end}), start
                      inclusive and end exclusive.
                    </p>
                  </details>
                </blockquote>
              ))}
              {fact.reviewed && <p>Reviewed: {fact.reviewNote}</p>}
            </article>
          ))}
        </div>
        <p>
          <a href="/recorded-review/evidence.json">
            Original recorded data (JSON)
          </a>{" "}
          ·{" "}
          <a href="/recorded-review/">
            Source snapshot, screenshot and validation records
          </a>
        </p>
      </details>
    </section>
  );
}
