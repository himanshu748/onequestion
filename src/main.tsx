import { Avatar } from "./components/Avatar";
import { Dialog } from "./components/Dialog";
import { FactForm } from "./components/FactForm";
import { EventForm } from "./components/EventForm";
import { labels } from "./components/fact-labels";
import { api, download } from "./api";
import { RecordedOutput } from "./RecordedOutput";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  LayoutDashboard,
  Users,
  GitBranch,
  History,
  Download,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  X,
  RotateCcw,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarDays,
  ShieldCheck,
  Trash2,
  Eye,
} from "lucide-react";
import {
  type Workspace,
  type Fact,
  type Plan,
  type Status,
  questions,
  anchorValid,
  solve,
} from "./domain";
import { rosterCsv, parseCsv } from "./import-export";
import "./styles.css";
import "./polish.css";

type Bundle = {
  workspace: Workspace;
  plan: Plan;
  questions: ReturnType<typeof questions>;
};
type View = "plan" | "evidence" | "pairs" | "activity";
type Modal =
  | { type: "new" }
  | { type: "connect" }
  | { type: "person" }
  | { type: "source"; personId: string }
  | { type: "fact"; fact: Fact; reply?: boolean }
  | { type: "export" }
  | { type: "reset" }
  | { type: "delete" }
  | null;





function App() {
  const [bundle, setBundle] = useState<Bundle | null>(null),
    [view, setView] = useState<View>("plan"),
    [modal, setModal] = useState<Modal>(null),
    [preview, setPreview] = useState<Record<string, boolean> | null>(null),
    [selected, setSelected] = useState<string>("cy"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [live, setLive] = useState(false),
    [hosted, setHosted] = useState(false),
    [canUnlock, setCanUnlock] = useState(false),
    [mobileTab, setMobileTab] = useState("plan"),
    [recent, setRecent] = useState<
      { id: string; name: string; demo: boolean }[]
    >([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const w = bundle?.workspace;
  const q = bundle?.questions;
  const current = bundle?.plan;
  const plan = w ? (preview ? solve(w, preview) : current!) : null;
  async function refreshRecent() {
    setRecent(await api("/workspaces"));
  }
  function accept(b: Bundle) {
    setBundle(b);
    setPreview(null);
    localStorage.setItem("onequestion-last", b.workspace.id);
    void refreshRecent();
  }
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    setBusy(true);
    void (async () => {
      const status = await api<{
        live: boolean;
        hosted?: boolean;
        canUnlock?: boolean;
      }>("/status");
      setLive(status.live);
      setHosted(!!status.hosted);
      setCanUnlock(!!status.canUnlock);
      await refreshRecent();
      const id = localStorage.getItem("onequestion-last");
      if (id)
        try {
          setBundle(await api<Bundle>("/workspaces/" + encodeURIComponent(id)));
        } catch {
          localStorage.removeItem("onequestion-last");
        }
    })()
      .catch(() =>
        setError(
          "The workspace service is unavailable. Please reload and try again.",
        ),
      )
      .finally(() => setBusy(false));
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(t);
  }, [notice]);
  async function demo() {
    await run(async () => {
      accept(await api<Bundle>("/workspaces", { demo: true }));
      setView("plan");
      setSelected("cy");
    });
  }
  async function saveFact(
    f: Fact,
    status: Status,
    note: string,
    reviewer: string,
    acceptProposal = false,
  ) {
    if (!w) return;
    await run(async () => {
      accept(
        await api<Bundle>(`/workspaces/${w.id}/fact`, {
          revision: w.revision,
          factId: f.id,
          status,
          note,
          reviewer,
          acceptProposal,
        }),
      );
      setModal(null);
      setNotice("Fact reviewed. The actual roster has been recalculated.");
    });
  }
  async function importFile(file: File) {
    await run(async () => {
      if (file.size > 200000)
        throw new Error("Please choose a file smaller than 200 KB.");
      const text = await file.text();
      const data = file.name.toLowerCase().endsWith(".csv")
        ? parseCsv(text)
        : JSON.parse(text);
      if (!Array.isArray(data) && data.event) {
        accept(await api("/import", data));
        setNotice("Backup imported. Facts require a fresh review.");
      } else {
        if (!w) throw new Error("Create an event before importing volunteers.");
        accept(
          await api(`/workspaces/${w.id}/people`, {
            revision: w.revision,
            people: data,
          }),
        );
        setNotice(
          "Volunteer messages imported. Review the prerequisites in Evidence.",
        );
      }
      setView("evidence");
    });
  }
  const sourcePerson = w?.people.find((p) => p.id === selected) ?? w?.people[0];
  const sourceFacts =
    w?.facts.filter((f) => f.personId === sourcePerson?.id) ?? [];
  const itemNav = [
    { id: "plan" as const, label: "The plan", icon: LayoutDashboard },
    { id: "evidence" as const, label: "People & evidence", icon: Users },
    { id: "pairs" as const, label: "Question pairs", icon: GitBranch },
    { id: "activity" as const, label: "Activity", icon: History },
  ];
  return (
    <div className="app-shell">
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => {
            setBundle(null);
            setPreview(null);
            localStorage.removeItem("onequestion-last");
          }}
          aria-label="OneQuestion home"
        >
          <span className="brand-symbol">?</span>
          <span>
            OneQuestion<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="workspace-label">
          YOUR WORKSPACE <span>{hosted ? "PRIVATE" : "LOCAL"}</span>
        </div>
        <button className="new-plan" onClick={() => setModal({ type: "new" })}>
          <Plus size={17} /> New event <span>↗</span>
        </button>
        <div className="nav-label">PLANNING</div>
        <nav>
          {itemNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={"nav-item " + (w && view === id ? "active" : "")}
              disabled={!w}
              onClick={() => {
                setView(id);
                setPreview(null);
              }}
            >
              <Icon size={18} />
              {label}
              {id === "pairs" && q && (
                <span className="nav-count">{q.pairs.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-label recent-title">RECENT EVENTS</div>
        <div className="recent-list">
          {recent.slice(0, 5).map((r) => (
            <button
              key={r.id}
              className={w?.id === r.id ? "chosen" : ""}
              onClick={() =>
                void run(async () => {
                  accept(await api("/workspaces/" + r.id));
                  setView("plan");
                })
              }
            >
              <span className="event-dot" />
              {r.name}
              <ChevronRight size={12} />
            </button>
          ))}
          {!recent.length && (
            <p className="muted smalltext">Your events will appear here.</p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={16} />
            <span>
              Private by default
              <small>
                {hosted ? "Stored on Cloudflare" : "Saved on this Mac"}
              </small>
            </span>
          </div>
          {hosted && canUnlock && !live && (
            <button
              className="text-button"
              onClick={() => setModal({ type: "connect" })}
            >
              <ShieldCheck size={14} /> Enable live analysis
            </button>
          )}
          <a
            href="https://clocked.rezolve.ai/docs"
            target="_blank"
            rel="noreferrer"
            className="powered"
          >
            Built with <strong>Clocked</strong>
            <ArrowUpRight size={13} />
          </a>
          <div className="account">
            <span className="account-avatar">Y</span>
            <div>
              You
              <small>
                {hosted ? "Private browser session" : "Local coordinator"}
              </small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <main id="workspace" tabIndex={-1} className="main">
        <header className="topbar">
          <span className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <strong>{w ? w.event.name : "Welcome"}</strong>
          </span>
          <span className="save-status">
            <span className="online-dot" />
            {busy
              ? "Working…"
              : w
                ? hosted
                  ? "Changes saved privately"
                  : "Changes saved locally"
                : "Your next good question starts here"}
          </span>
        </header>
        {error && !modal && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
            {error.includes("another tab") && w && (
              <button
                onClick={() =>
                  void run(async () => accept(await api("/workspaces/" + w.id)))
                }
              >
                Reload workspace
              </button>
            )}
          </div>
        )}
        <div className="toast" role="status" aria-live="polite">
          {notice}
        </div>
        {!w ? (
          <div className="welcome">
            <div className="eyebrow">
              <span className="mini-line" /> LESS CHASING. BETTER PLANNING.
            </div>
            <h1>
              A better plan starts
              <br />
              with <em>one question.</em>
            </h1>
            <p className="welcome-sub">
              You have the people. You have their messages.
              <br />
              Find the missing answer that brings your roster together.
            </p>
            <div className="welcome-actions">
              <button
                className="primary large"
                disabled={busy}
                onClick={() => void demo()}
              >
                Try the four-person example <ArrowRight size={18} />
              </button>
              <button
                className="secondary large"
                onClick={() => setModal({ type: "new" })}
              >
                <Plus size={18} /> Start your own event
              </button>
            </div>
            <p className="demo-caption">
              Fictional volunteers. Real roster calculations. No API key needed.
            </p>
            <a className="recorded-review-link" href="/recorded-review/">
              Recorded 9 Nov Clocked review · keyless{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <div className="welcome-illustration">
              <div className="illustration-label">
                <span className="pill">THE DIFFERENCE ONE ANSWER MAKES</span>
                <h2 className="muted smalltext illustration-title">
                  A quick look at the example
                </h2>
              </div>
              <div className="intro-flow">
                <div className="mini-plan">
                  <span className="overline">RIGHT NOW</span>
                  <h3>
                    3 <span>/ 4 roles filled</span>
                  </h3>
                  <div className="mini-avatars">
                    {["Ana", "Ben", "Cy"].map((n, i) => (
                      <Avatar key={n} name={n} index={i} />
                    ))}
                    <span className="empty-avatar">?</span>
                  </div>
                  <p>
                    One empty role.
                    <br />
                    One person waiting to help.
                  </p>
                </div>
                <ArrowRight className="flow-arrow" />
                <div className="mini-question">
                  <MessageCircle size={20} />
                  <p>
                    “Has Cy’s keyholder
                    <br />
                    access been renewed?”
                  </p>
                  <span>
                    <span className="online-dot" /> If confirmed
                  </span>
                </div>
                <ArrowRight className="flow-arrow" />
                <div className="mini-plan after">
                  <span className="overline">WHAT BECOMES POSSIBLE</span>
                  <h3>
                    4 <span>/ 4 roles filled</span>
                  </h3>
                  <div className="mini-avatars">
                    {["Dee", "Ana", "Ben", "Cy"].map((n, i) => (
                      <Avatar key={n} name={n} index={i} />
                    ))}
                  </div>
                  <p>
                    Three reassignments.
                    <br />
                    One complete eligible draft.
                  </p>
                </div>
              </div>
            </div>
            <div className="welcome-footer">
              <span>
                <Eye size={16} /> Every fact, traceable
              </span>
              <span>
                <GitBranch size={16} /> Every preview, reversible
              </span>
              <span>
                <ShieldCheck size={16} /> You stay in control
              </span>
            </div>
            <button
              className="text-button"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={15} /> Restore a workspace backup
            </button>
          </div>
        ) : (
          <>
            <div className="event-heading">
              <div>
                <div className="eyebrow">
                  {w.demo ? "FICTIONAL EXAMPLE" : "EVENT WORKSPACE"}{" "}
                  <span className="divider-dot">·</span> ELIGIBLE ROSTER DRAFT
                </div>
                <h1>{w.event.name}</h1>
                <div className="event-meta">
                  <span>
                    <CalendarDays size={14} />
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(w.event.date + "T12:00:00Z"))}
                  </span>
                  <span>
                    <Clock size={14} />
                    {w.event.start}–{w.event.end} · {w.event.timezone}
                  </span>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="secondary"
                  onClick={() => setModal({ type: "export" })}
                >
                  <Download size={16} /> Export plan
                </button>
                <button
                  className="primary"
                  onClick={() => setModal({ type: "person" })}
                >
                  <Plus size={16} /> Add volunteer
                </button>
              </div>
            </div>
            <div className="mode-strip">
              <span>
                <span className="status-square" />
                {w.demo
                  ? w.facts.some((f) => f.provenance === "clocked")
                    ? "Fictional data · includes live Clocked proposals"
                    : "Fictional data · hand-authored interpretations"
                  : "Coordinator-reviewed evidence"}
                {live ? " · Clocked available" : " · Live Clocked disabled"}
              </span>
              <button
                className="text-button"
                onClick={() =>
                  setModal(w.demo ? { type: "reset" } : { type: "delete" })
                }
              >
                {w.demo ? (
                  <>
                    <RotateCcw size={13} /> Reset example
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Delete event
                  </>
                )}
              </button>
            </div>
            {w.demo && <RecordedOutput />}
            {preview && (
              <div className="preview-banner" role="status">
                <Eye size={19} />
                <div>
                  <strong>Hypothetical preview</strong>
                  <span>
                    {Object.entries(preview)
                      .map(
                        ([id, yes]) =>
                          `${w.people.find((p) => p.id === w.facts.find((f) => f.id === id)?.personId)?.name}: ${yes ? "confirmed" : "denied"}`,
                      )
                      .join(" · ")}
                    . Your saved facts have not changed.
                  </span>
                </div>
                <button className="secondary" onClick={() => setPreview(null)}>
                  Return to current plan <X size={14} />
                </button>
              </div>
            )}
            <section className="coverage-bar">
              <div className="coverage-number">
                {plan?.coverage}
                <span>/ {w.event.slots.length}</span>
              </div>
              <div className="coverage-description">
                <strong>
                  {plan?.coverage === w.event.slots.length
                    ? "Every role has a way forward."
                    : "A little clarity goes a long way."}
                </strong>
                <span>
                  {preview
                    ? "Roles fillable under these hypothetical answers."
                    : `${w.event.slots.length - (plan?.coverage ?? 0)} unfilled ${w.event.slots.length - (plan?.coverage ?? 0) === 1 ? "role" : "roles"} · ${w.people.length} volunteers · ${q?.singles.length} useful clarifications to explore`}
                </span>
              </div>
              <div
                className="coverage-segments"
                role="img"
                aria-label={`${plan?.coverage} of ${w.event.slots.length} roles filled`}
              >
                {w.event.slots.map((s, i) => (
                  <span
                    key={s.id}
                    className={i < (plan?.coverage ?? 0) ? "filled" : ""}
                  />
                ))}
              </div>
              <span className={"pill " + (preview ? "blue" : "")}>
                {preview ? "PREVIEW" : "CURRENT PLAN"}
              </span>
            </section>
            <div className="section-heading">
              <div>
                <h2>
                  {view === "plan"
                    ? "Bring the plan together"
                    : view === "evidence"
                      ? "People & evidence"
                      : view === "pairs"
                        ? "When two answers work together"
                        : "The story behind your plan"}
                </h2>
                <p>
                  {view === "plan"
                    ? "See what you know, what you can fill, and what to ask next."
                    : view === "evidence"
                      ? "Review original messages and keep uncertainty visible."
                      : view === "pairs"
                        ? "Explore all four outcomes. These calculations make no API calls."
                        : "Recorded changes and coordinator decisions, kept with their reasons."}
                </p>
              </div>
              {view === "evidence" && (
                <button
                  className="secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={15} /> Import CSV / JSON
                </button>
              )}
            </div>
            {view === "plan" && (
              <>
                <div
                  className="mobile-tabs"
                  role="tablist"
                  aria-label="Workbench panels"
                >
                  {["plan", "questions", "evidence"].map((t) => (
                    <button
                      role="tab"
                      tabIndex={mobileTab === t ? 0 : -1}
                      onKeyDown={(e) => {
                        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                          e.preventDefault();
                          const tabs = ["plan", "questions", "evidence"];
                          const next =
                            (tabs.indexOf(t) +
                              (e.key === "ArrowRight" ? 1 : 2)) %
                            3;
                          setMobileTab(tabs[next]);
                          (
                            e.currentTarget.parentElement?.children[
                              next
                            ] as HTMLElement
                          )?.focus();
                        }
                      }}
                      aria-selected={mobileTab === t}
                      key={t}
                      className={mobileTab === t ? "active" : ""}
                      onClick={() => setMobileTab(t)}
                    >
                      {t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="workbench">
                  <section
                    className={
                      "source-panel panel mobile-" +
                      (mobileTab === "evidence" ? "show" : "hide")
                    }
                  >
                    <div className="panel-top">
                      <h3>
                        <FileText size={16} /> The evidence
                      </h3>
                      <span>{w.sources.length} notes</span>
                    </div>
                    <div className="person-chips">
                      {w.people.map((p, i) => (
                        <button
                          key={p.id}
                          className={
                            p.id === sourcePerson?.id ? "selected" : ""
                          }
                          onClick={() => setSelected(p.id)}
                          aria-label={`View ${p.name}'s evidence`}
                        >
                          <Avatar name={p.name} index={i} small />
                          {p.name}
                        </button>
                      ))}
                    </div>
                    {sourcePerson ? (
                      <>
                        <div className="source-byline">
                          <Avatar
                            name={sourcePerson.name}
                            index={w.people.indexOf(sourcePerson)}
                          />
                          <div>
                            <strong>{sourcePerson.name}</strong>
                            <small>Volunteer message</small>
                          </div>
                        </div>
                        {w.sources
                          .filter((s) => s.personId === sourcePerson.id)
                          .slice(-1)
                          .map((s) => (
                            <blockquote key={s.id}>{s.text}</blockquote>
                          ))}
                        <div className="source-summary">
                          {
                            sourceFacts.filter(
                              (f) => f.status === "yes" && f.reviewed,
                            ).length
                          }{" "}
                          established facts<span> · </span>
                          {
                            sourceFacts.filter(
                              (f) => f.status !== "yes" && f.status !== "no",
                            ).length
                          }{" "}
                          unresolved
                        </div>
                        <button
                          className="text-button full"
                          onClick={() => setView("evidence")}
                        >
                          Inspect facts & sources <ArrowUpRight size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="empty-state">
                        <Users size={24} />
                        <p>
                          Add your first volunteer and their original message.
                        </p>
                      </div>
                    )}
                    <div className="evidence-note">
                      <ShieldCheck size={15} />
                      <p>
                        An interpretation is evidence to review, not an external
                        credential check.
                      </p>
                    </div>
                  </section>
                  <section
                    className={
                      "roster-panel mobile-" +
                      (mobileTab === "plan" ? "show" : "hide")
                    }
                  >
                    <div className="panel-top">
                      <h3>
                        {preview ? "Possible roster" : "Your current roster"}
                      </h3>
                      <span>
                        {preview
                          ? `${plan?.changes} existing assignments changed`
                          : "One person, one role"}
                      </span>
                    </div>
                    <div className="roster-grid">
                      {w.event.slots.map((s, i) => {
                        const person = w.people.find(
                          (p) => p.id === plan?.assignments[s.id],
                        );
                        const changed =
                          preview &&
                          plan?.assignments[s.id] !==
                            current?.assignments[s.id];
                        return (
                          <button
                            key={s.id}
                            className={
                              "roster-card " +
                              (!person ? "unfilled " : "") +
                              (changed ? "changed" : "")
                            }
                            onClick={() => {
                              if (person) {
                                setSelected(person.id);
                                setView("evidence");
                              } else {
                                setMobileTab("questions");
                                setTimeout(
                                  () =>
                                    document
                                      .querySelector<HTMLElement>(
                                        ".question-panel button",
                                      )
                                      ?.focus(),
                                  0,
                                );
                              }
                            }}
                          >
                            <div className="role-top">
                              <span className="role-number">0{i + 1}</span>
                              <span>
                                {person ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <HelpCircle size={16} />
                                )}
                              </span>
                            </div>
                            <h3>{s.name}</h3>
                            {person ? (
                              <div className="assigned-person">
                                <Avatar
                                  name={person.name}
                                  index={w.people.indexOf(person)}
                                />
                                <span>
                                  {person.name}
                                  <small>
                                    {changed
                                      ? Object.values(w.baseline).includes(
                                          person.id,
                                        )
                                        ? "Reassigned in preview"
                                        : "Newly assigned in preview"
                                      : "Eligible draft"}
                                  </small>
                                </span>
                              </div>
                            ) : (
                              <div className="unassigned">
                                <span className="empty-avatar">+</span>
                                <span>
                                  Still open
                                  <small>A missing answer may help</small>
                                </span>
                              </div>
                            )}
                            <div className="role-foot">
                              {s.qualification || "Availability + willingness"}
                              <ArrowUpRight size={13} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="unassigned-list">
                      <span>AVAILABLE TO HELP</span>
                      {w.people
                        .filter(
                          (p) =>
                            !Object.values(plan?.assignments ?? {}).includes(
                              p.id,
                            ),
                        )
                        .map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelected(p.id);
                              setView("evidence");
                            }}
                          >
                            <Avatar name={p.name} index={i + 3} small />
                            {p.name}
                            <span>Unassigned</span>
                          </button>
                        ))}
                      {w.people.length > 0 &&
                        Object.values(plan?.assignments ?? {}).length ===
                          w.people.length && (
                          <p>
                            All volunteers have an eligible draft assignment.
                          </p>
                        )}
                      {!w.people.length && (
                        <p>No volunteers yet. Add a message to begin.</p>
                      )}
                    </div>
                    <div className="draft-note">
                      <AlertCircle size={14} /> An eligible draft does not mean
                      volunteers have accepted their assignments.
                    </div>
                  </section>
                  <section
                    className={
                      "question-panel mobile-" +
                      (mobileTab === "questions" ? "show" : "hide")
                    }
                  >
                    <div className="panel-top">
                      <h3>
                        <MessageCircle size={16} /> Ask what matters
                      </h3>
                      <span>{q?.singles.length}</span>
                    </div>
                    {q?.singles.map((item, i) => {
                      const tied =
                        q.singles.filter(
                          (x) =>
                            x.yes.coverage === item.yes.coverage &&
                            x.yes.changes === item.yes.changes,
                        ).length > 1;
                      return (
                        <article
                          className={
                            "question-card " + (i === 0 ? "recommended" : "")
                          }
                          key={item.fact.id}
                        >
                          <div className="question-eyebrow">
                            {i === 0 ? (
                              <>
                                <span className="mini-line" />{" "}
                                {tied ? "EQUAL IMPACT" : "MOST COVERAGE"}
                              </>
                            ) : tied ? (
                              "EQUAL IMPACT"
                            ) : (
                              "ANOTHER CLARIFICATION"
                            )}
                            <span>0{i + 1}</span>
                          </div>
                          <h3>{item.fact.label}</h3>
                          <p>
                            {item.yes.coverage > (current?.coverage ?? 0)
                              ? `One answer could unlock ${item.yes.coverage - (current?.coverage ?? 0)} more role.`
                              : "Worth knowing. It won’t add coverage on its own."}
                          </p>
                          <div className="outcome-buttons">
                            <button
                              className={
                                preview?.[item.fact.id] === true ? "chosen" : ""
                              }
                              onClick={() =>
                                setPreview({ [item.fact.id]: true })
                              }
                            >
                              <span>
                                If confirmed <Eye size={12} />
                              </span>
                              <strong>
                                {item.yes.coverage}
                                <small> / {w.event.slots.length}</small>
                              </strong>
                            </button>
                            <button
                              className={
                                preview?.[item.fact.id] === false
                                  ? "chosen"
                                  : ""
                              }
                              onClick={() =>
                                setPreview({ [item.fact.id]: false })
                              }
                            >
                              <span>
                                If denied <Eye size={12} />
                              </span>
                              <strong>
                                {item.no.coverage}
                                <small> / {w.event.slots.length}</small>
                              </strong>
                            </button>
                          </div>
                          <button
                            className={
                              i === 0 ? "primary full" : "secondary full"
                            }
                            onClick={() => {
                              setPreview(null);
                              setModal({
                                type: "fact",
                                fact: item.fact,
                                reply: true,
                              });
                            }}
                          >
                            Record an actual reply <ArrowRight size={14} />
                          </button>
                          <button
                            className="text-button full"
                            onClick={() => {
                              setSelected(item.fact.personId);
                              setView("evidence");
                            }}
                          >
                            Why is this unresolved? <ArrowUpRight size={12} />
                          </button>
                        </article>
                      );
                    })}
                    {!q?.singles.length && (
                      <div className="empty-state">
                        <CheckCircle2 size={28} />
                        <h3>
                          {current?.coverage === w.event.slots.length
                            ? "The draft is complete"
                            : "Start with the evidence"}
                        </h3>
                        <p>
                          {w.people.length
                            ? "Review incomplete prerequisites in People & evidence. Conflicts and unreviewed interpretations need a coordinator."
                            : "Add volunteers to discover the questions that could improve your roster."}
                        </p>
                        <button
                          className="secondary"
                          onClick={() => setView("evidence")}
                        >
                          Review facts
                        </button>
                      </div>
                    )}
                    {q?.truncated && (
                      <p className="warning-text">
                        Showing 10 of {q.total} candidate facts. Pair analysis
                        is limited to these ten.
                      </p>
                    )}
                    <p className="question-footnote">
                      These are conditional outcomes, not predictions of
                      anyone’s answer.
                    </p>
                  </section>
                </div>
              </>
            )}
            {view === "evidence" && (
              <div className="evidence-layout">
                <aside className="people-list panel">
                  <div className="panel-top">
                    <h3>Volunteers</h3>
                    <span>{w.people.length}/12</span>
                  </div>
                  {w.people.map((p, i) => (
                    <button
                      key={p.id}
                      className={p.id === sourcePerson?.id ? "selected" : ""}
                      onClick={() => setSelected(p.id)}
                    >
                      <Avatar name={p.name} index={i} />
                      <span>
                        {p.name}
                        <small>
                          {
                            w.facts.filter(
                              (f) => f.personId === p.id && !f.reviewed,
                            ).length
                          }{" "}
                          awaiting review
                        </small>
                      </span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "person" })}
                  >
                    <Plus size={15} /> Add volunteer
                  </button>
                </aside>
                <section className="evidence-detail">
                  {sourcePerson ? (
                    <>
                      <div className="evidence-header">
                        <h2>{sourcePerson.name}’s evidence</h2>
                        <div>
                          <button
                            className="secondary"
                            onClick={() =>
                              setModal({
                                type: "source",
                                personId: sourcePerson.id,
                              })
                            }
                          >
                            <Plus size={14} /> Add message
                          </button>
                          <button
                            className="primary"
                            disabled={busy || !live}
                            title={
                              !live
                                ? "Requires CLOCKED_API_KEY and CLOCKED_ENABLED=true"
                                : ""
                            }
                            onClick={() =>
                              void run(async () => {
                                accept(
                                  await api(`/workspaces/${w.id}/analyze`, {
                                    revision: w.revision,
                                    personId: sourcePerson.id,
                                  }),
                                );
                                setNotice(
                                  "Clocked proposals are ready for review.",
                                );
                              })
                            }
                          >
                            Analyze with Clocked
                          </button>
                        </div>
                      </div>
                      {!live && (
                        <div className="info-note">
                          Live interpretation is unavailable. You can still
                          review facts and record replies manually.
                        </div>
                      )}
                      {w.sources
                        .filter((s) => s.personId === sourcePerson.id)
                        .map((s) => (
                          <article className="source-document panel" key={s.id}>
                            <div className="source-document-top">
                              <span>
                                <FileText size={14} />{" "}
                                {s.derived
                                  ? "Analysis source snapshot"
                                  : "Original source"}
                              </span>
                              <time>
                                {new Date(s.createdAt).toLocaleString()}
                              </time>
                            </div>
                            <p>{s.text}</p>
                          </article>
                        ))}
                      <h3 className="facts-title">
                        Prerequisites & interpretations{" "}
                        <small>
                          Only reviewed affirmative facts enable an assignment.
                        </small>
                      </h3>
                      <div className="facts-list">
                        {sourceFacts.map((f) => (
                          <div className="fact-row panel" key={f.id}>
                            <div>
                              <span className="fact-kind">
                                {f.kind}
                                {f.slotId
                                  ? " · " +
                                    w.event.slots.find((s) => s.id === f.slotId)
                                      ?.name
                                  : ""}
                              </span>
                              <h4>{f.label}</h4>
                              <div className="fact-provenance">
                                {f.provenance === "fixture"
                                  ? "Fictional interpretation"
                                  : f.provenance === "coordinator"
                                    ? "Coordinator-provided"
                                    : "Clocked proposal"}{" "}
                                · {f.reviewed ? "Reviewed" : "Awaiting review"}
                              </div>
                              {f.anchors.map((a, i) => {
                                const s = w.sources.find(
                                  (s) => s.id === a.sourceId,
                                );
                                return s && anchorValid(s, a) ? (
                                  <blockquote className="fact-quote" key={i}>
                                    <mark>{a.value}</mark>
                                  </blockquote>
                                ) : (
                                  <span className="warning-text" key={i}>
                                    Invalid source anchor. Correct manually.
                                  </span>
                                );
                              })}
                              <p className="fact-note">{f.note}</p>
                            </div>
                            <div className="fact-actions">
                              <span
                                className={
                                  "status-pill " +
                                  (f.reviewed ? f.status : "pending")
                                }
                              >
                                {f.reviewed ? labels[f.status] : "Needs review"}
                              </span>
                              <button
                                className="secondary"
                                onClick={() =>
                                  setModal({ type: "fact", fact: f })
                                }
                              >
                                {f.reviewed
                                  ? "Review / correct"
                                  : "Review proposal"}{" "}
                                <ArrowUpRight size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-state panel">
                      <Users size={32} />
                      <h3>Every good plan starts with a person.</h3>
                      <p>
                        Add a volunteer and paste their message, or import a CSV
                        with name and text columns.
                      </p>
                      <button
                        className="primary"
                        onClick={() => setModal({ type: "person" })}
                      >
                        Add your first volunteer
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}
            {view === "pairs" && (
              <div className="pairs-list">
                {q?.pairs.length ? (
                  q.pairs.map((pair, i) => (
                    <article className="pair-card panel" key={i}>
                      <span className="overline">
                        TWO-QUESTION COMPARISON {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3>{pair.facts[0].label}</h3>
                      <h3>
                        <span className="muted">and</span> {pair.facts[1].label}
                      </h3>
                      <div className="pair-outcomes">
                        {pair.branches.map((b, j) => (
                          <button
                            key={j}
                            onClick={() => {
                              setPreview({
                                [pair.facts[0].id]: b.answers[0],
                                [pair.facts[1].id]: b.answers[1],
                              });
                              setView("plan");
                            }}
                          >
                            <span>
                              {b.answers[0] ? "Yes" : "No"} +{" "}
                              {b.answers[1] ? "Yes" : "No"}
                            </span>
                            <strong>
                              {b.plan.coverage} / {w.event.slots.length}
                            </strong>
                            <small>
                              Preview <ArrowUpRight size={12} />
                            </small>
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state panel">
                    <GitBranch size={28} />
                    <h3>No pair to compare yet</h3>
                    <p>
                      Two unresolved, reviewed facts are needed. Conflicts and
                      pending review require a coordinator first.
                    </p>
                  </div>
                )}
              </div>
            )}
            {view === "activity" && (
              <div className="activity-list panel">
                {w.facts
                  .flatMap((f) => f.history.map((h, i) => ({ f, h, i })))
                  .reverse()
                  .map(({ f, h, i }) => (
                    <div className="activity-item" key={f.id + i}>
                      <History size={18} />
                      <div>
                        <strong>{f.label}</strong>
                        <p>
                          {h.reviewer} reviewed this fact. Previous state:{" "}
                          {labels[h.status]}.
                        </p>
                        <p>{h.note}</p>
                        <time>{new Date(h.at).toLocaleString()}</time>
                      </div>
                    </div>
                  ))}
                {!w.facts.some((f) => f.history.length > 0) && (
                  <div className="empty-state">
                    <History size={30} />
                    <h3>A clear trail, from the first answer.</h3>
                    <p>
                      Reviewed corrections and replies will appear here. No
                      changes have been recorded yet.
                    </p>
                  </div>
                )}
              </div>
            )}
            <footer className="main-footer">
              <span>
                <ShieldCheck size={13} />{" "}
                {hosted ? "Saved privately" : "Saved locally"} · No automatic
                outreach
              </span>
              <span>
                OneQuestion <span className="divider-dot">·</span> Clarity
                before commitment.
              </span>
            </footer>
          </>
        )}
      </main>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv"
        className="sr-only"
        aria-label="Import workspace or volunteers"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importFile(f);
          e.target.value = "";
        }}
      />
      {modal && (
        <Dialog
          title={
            modal.type === "connect"
              ? "Enable live analysis"
              : modal.type === "new"
                ? "Start a new event"
                : modal.type === "person"
                  ? "Add a volunteer"
                  : modal.type === "source"
                    ? "Add an original message"
                    : modal.type === "fact"
                      ? modal.reply
                        ? "Record an actual reply"
                        : "Review this fact"
                      : modal.type === "export"
                        ? "Take your plan with you"
                        : modal.type === "reset"
                          ? "Reset the fictional example?"
                          : "Delete this event?"
          }
          onClose={() => setModal(null)}
        >
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}
          {modal.type === "connect" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void run(async () => {
                  const result = await api<{ live: boolean }>("/live-session", {
                    token: String(fd.get("token")),
                  });
                  setLive(result.live);
                  setModal(null);
                  setNotice(
                    "Live analysis enabled for one hour in this browser session.",
                  );
                });
              }}
            >
              <p className="form-note">
                The public example and manual planning work without an access
                code. The owner can enable server-side Clocked analysis for this
                private browser session. Six provider requests per day are
                available across the hosted app.
              </p>
              <label>
                Owner access code
                <input
                  type="password"
                  name="token"
                  autoComplete="off"
                  required
                  maxLength={256}
                />
              </label>
              <button className="primary full" disabled={busy}>
                Enable for one hour
              </button>
            </form>
          )}
          {modal.type === "new" && (
            <EventForm
              live={live}
              busy={busy}
              onCreate={(event) =>
                void run(async () => {
                  accept(await api("/workspaces", { event }));
                  setModal(null);
                  setView("evidence");
                })
              }
            />
          )}
          {(modal.type === "person" || modal.type === "source") && w && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void run(async () => {
                  const b =
                    modal.type === "person"
                      ? {
                          revision: w.revision,
                          people: [
                            {
                              name: String(fd.get("name")),
                              text: String(fd.get("text")),
                            },
                          ],
                        }
                      : {
                          revision: w.revision,
                          personId: modal.personId,
                          text: String(fd.get("text")),
                        };
                  accept(
                    await api(
                      `/workspaces/${w.id}/${modal.type === "person" ? "people" : "source"}`,
                      b,
                    ),
                  );
                  setModal(null);
                  setView("evidence");
                  setNotice(
                    "Message saved. Review availability, willingness, and qualifications separately.",
                  );
                });
              }}
            >
              {modal.type === "person" && (
                <label>
                  Name
                  <input
                    name="name"
                    required
                    maxLength={80}
                    placeholder="e.g. Ana"
                  />
                </label>
              )}
              <label>
                Original message
                <textarea
                  name="text"
                  required
                  maxLength={8000}
                  rows={6}
                  placeholder="Paste their words, including any dates or conditions."
                />
              </label>
              <p className="form-note">
                Messages stay on this Mac unless you explicitly run Clocked
                analysis. New messages invalidate that person’s previous
                reviews.
              </p>
              <button className="primary full" disabled={busy}>
                Save message <ArrowRight size={15} />
              </button>
            </form>
          )}
          {modal.type === "fact" && (
            <FactForm
              fact={modal.fact}
              reply={modal.reply}
              busy={busy}
              onSave={saveFact}
            />
          )}
          {modal.type === "export" && w && (
            <div className="export-options">
              <div className="info-note">
                Exports use the actual saved plan. Hypothetical previews are
                excluded. This roster is a draft, not acceptance confirmation.
              </div>
              <h3>Shareable roster</h3>
              <p>
                Event, roles and volunteer names. Original messages and internal
                facts are omitted. Review names before sharing.
              </p>
              <pre className="export-preview">
                {w.event.slots
                  .map(
                    (s) =>
                      `${s.name}: ${w.people.find((p) => p.id === current?.assignments[s.id])?.name ?? "Unfilled"}`,
                  )
                  .join("\n")}
              </pre>
              <button
                className="primary full"
                onClick={() =>
                  download(
                    "onequestion-roster.csv",
                    rosterCsv(w, current!),
                    "text/csv;charset=utf-8",
                  )
                }
              >
                <Download size={15} /> Download roster CSV
              </button>
              <hr />
              <h3>Private workspace backup</h3>
              <p>
                Contains all original messages, fact history and names. Store
                securely. Imported facts require fresh review.
              </p>
              <button
                className="secondary full"
                onClick={() =>
                  download(
                    "onequestion-private-backup.json",
                    JSON.stringify(w, null, 2),
                    "application/json",
                  )
                }
              >
                <Download size={15} /> Download private backup
              </button>
            </div>
          )}
          {(modal.type === "reset" || modal.type === "delete") && w && (
            <div>
              <p>
                {modal.type === "reset"
                  ? "This replaces the fictional workspace with the original four-person example. Your other events are preserved."
                  : "This permanently removes this event, its messages and its fact history from the local database."}
              </p>
              <div className="dialog-actions">
                <button className="secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      if (modal.type === "reset")
                        accept(
                          await api(`/workspaces/${w.id}/reset`, {
                            revision: w.revision,
                          }),
                        );
                      else {
                        await api(
                          `/workspaces/${w.id}`,
                          { revision: w.revision },
                          "DELETE",
                        );
                        setBundle(null);
                        localStorage.removeItem("onequestion-last");
                        await refreshRecent();
                      }
                      setModal(null);
                    })
                  }
                >
                  {modal.type === "reset" ? "Reset example" : "Delete event"}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}





createRoot(document.getElementById("root")!).render(<App />);
