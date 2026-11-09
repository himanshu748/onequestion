CREATE TABLE workspaces (
 id TEXT PRIMARY KEY,
 owner TEXT NOT NULL,
 revision INTEGER NOT NULL,
 data TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX workspaces_owner_updated ON workspaces(owner,updated_at DESC);
CREATE INDEX workspaces_expiry ON workspaces(expires_at);
CREATE TABLE live_sessions (owner TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE live_budget (day TEXT PRIMARY KEY, used INTEGER NOT NULL DEFAULT 0);
