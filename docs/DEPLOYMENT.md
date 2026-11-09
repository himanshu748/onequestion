# Hosted OneQuestion

The [hosted app](https://onequestion.tbud.workers.dev) uses Cloudflare Workers Static Assets and D1. The original account dashboard showed **Free · $0 · Current plan** on November 9, 2026. The 3.2 MB demonstration video is served through a Worker byte-range handler so browsers can seek; other static assets bypass the Worker. Video requests count toward the Free dynamic-request quota. The React client computes matching and question branches; the Worker validates changes, scopes stored events to their browser session and calls Clocked only after owner authorization. The original Express + SQLite server remains available for local use.

## Privacy and recovery

Each browser receives a random 256-bit HttpOnly, Secure, SameSite=Strict cookie. D1 stores its SHA-256 digest as the workspace owner. Every workspace read and write checks that owner. A shared URL does not grant access to an event. This is browser-session isolation, not a user-account identity system.

Events expire 30 days after their last edit. Expired rows become inaccessible and are removed incrementally when new events are created. Each browser can hold five events. Clearing cookies or changing browsers loses access; export a **Private workspace backup** before doing so. Backup imports require fresh review of all facts. Names, source messages and history are sensitive: use fictional material for public demonstrations. Deletion removes the current database row, not provider recovery snapshots or exported files.

The owner code unlocks live analysis for one hour in that browser. Keep it private; it authorizes spending the shared Clocked free credits. The API key remains a Worker secret. Public manual planning does not call Clocked. The Worker atomically reserves a global maximum of six provider requests per UTC day: one for Fill, two for Extract + Decide. Failed attempts conservatively consume the reservation. Neither automatic retries nor background provider calls are enabled.

## Deploy your own

Requires Node.js 22.13+, npm, a Cloudflare account and Wrangler authorization. Verify **Workers Free** in the account dashboard before deploying under a zero-spending constraint. Do not enable a paid plan or add billing to follow this guide.

```sh
npm ci
npx wrangler login
npx wrangler whoami
npx wrangler d1 create onequestion
```

Replace `database_id` in `wrangler.jsonc` with the new database ID. The checked-in ID identifies the original deployment and does not grant access to it. Choose a unique Worker name if deploying into an account that already uses `onequestion`.

```sh
npx wrangler d1 migrations apply onequestion --remote
npm run deploy
```

Manual planning and the fictional example work without secrets. To enable owner-only live analysis, set these privately using Wrangler's masked prompts:

```sh
npx wrangler secret put CLOCKED_API_KEY
npx wrangler secret put LIVE_ACCESS_TOKEN
```

Use a random, strong `LIVE_ACCESS_TOKEN` as the owner code. Never commit either value or send them in URLs. The original Mac keeps the owner code in ignored `.env` as `HOSTED_OWNER_ACCESS_CODE`; the local Express server does not use it. For another deployment, keep the code in your password manager. `LIVE_DAILY_REQUEST_LIMIT` defaults to six in `wrangler.jsonc`; lowering it to zero disables new provider requests.

```sh
npx wrangler d1 migrations apply onequestion --local
npm run build
npm run dev:cloud
```

Local Wrangler storage is isolated from the remote database and ignored by Git. `npm test` creates its own disposable local Worker + D1 database; it uses a synthetic owner code and no provider key.

## Free limits and operations

Official pricing checked November 9, 2026: Workers Free includes 100,000 dynamic requests/day and 10 ms CPU per invocation; static assets are free. D1 Free includes 5 million rows read/day, 100,000 rows written/day and 5 GB total storage. Free-tier quota exhaustion can make the API unavailable. This deployment does not provision paid resources, enable a paid plan or add automatic upgrades. Clocked credits are separate from Cloudflare hosting; the daily request cap bounds request count, not credits per request.

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

Export needed workspaces before deleting the service or its database. A Worker rollback can restore code; it does not reverse database changes or provider calls. Keep migrations compatible with the code being restored. Request logs are disabled in this configuration, and no third-party analytics are installed. This hackathon deployment has no uptime guarantee or independent security audit.
