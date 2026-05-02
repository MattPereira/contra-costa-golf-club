# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status: Reference-Only Codebase

This app is **finished and frozen**. It is the legacy v1 implementation kept around as a working reference for a planned ground-up rebuild that will be more modular and composable. Do not add features, refactor, or fix bugs here unless explicitly asked. When asked questions, treat this codebase as a read-only spec for the domain logic and feature surface that the new app must replicate or replace.

## Run / Inspect

- `npm start` (root) — runs client (Vite, port 3000) and server (nodemon, port 3001) concurrently via `concurrently`.
- `npm test` (server) — Jest with `-i` (serial). Tests hit a real Postgres DB named `ccgc_test` (see `server/config.js` `getDatabaseUri`); model/route tests share `_testCommon.js` fixtures. `~180` tests across routes/models/middleware/helpers.
- `make populate-local-db` — drops/recreates local `ccgc` DB and restores from `prod.dump` (produced by `make dump-prod-db` against the prod Railway host).
- DB schema lives at `database/schema.pgsql`. There is no migration framework — schema is a single hand-written DDL file.
- `compose.yaml` exists but references `./backend` and `./frontend` paths that don't match the actual `./server` and `./client` dirs — Docker Compose is stale and not the canonical dev path.

## Domain Model (the part the rebuild must preserve)

The whole app revolves around a **Tour Year** (e.g. `"23-24"`) made up of **Tournaments** on specific **dates**, each played at a **Course**. Members submit one **Round** per tournament, each round produces **Points**, and points aggregate into season-long **Standings**. **Greenies** are a side competition tracked per hole. Most primary keys are natural keys (course `handle`, tournament `date`, user `username`) which causes friction across the codebase — the rebuild should reconsider this.

### Tables (`database/schema.pgsql`)

- `users(username PK, email, password, first_name, last_name, is_admin)`
- `courses(handle PK, name, rating, slope, img_url)`
- `pars(course_handle FK, hole1..hole18, total)` — 1:1 with `courses`, denormalized columns
- `handicaps(course_handle FK, hole1..hole18)` — hole difficulty ranking, 1:1 with `courses`
- `tournaments(date PK, course_handle FK, tour_years VARCHAR(7))` — the date IS the identifier
- `rounds(id PK, tournament_date FK, username FK, total_strokes, net_strokes, total_putts, player_index, score_differential, course_handicap)` — one row per (tournament, user); compound uniqueness enforced in app code, not DB
- `strokes(round_id FK, hole1..hole18)` and `putts(round_id FK, hole1..hole18)` — 1:1 with `rounds`, hole-by-hole detail
- `points(round_id PK, strokes, putts, greenies, pars, birdies, eagles, aces, participation DEFAULT 3)` — points-per-category cache for one round
- `greenies(id PK, round_id FK, hole_number, feet, inches)` — one greenie = one closest-to-pin shot

The `hole1..hole18` shape repeats across `pars`, `handicaps`, `strokes`, `putts`. The rebuild should almost certainly normalize this to a `(round_id, hole_number, value)` row model — the current shape forces 18-column INSERT/UPDATE/SELECT statements everywhere.

### Calculation rules (encoded in `server/models/round.js` and `server/models/point.js`)

Handicap pipeline (`Round.create` / `Round.update`):
1. `score_differential = (113 / course_slope) * (total_strokes - course_rating)`
2. `player_index` = average of the **lowest 2 of the player's last 4 score differentials**. First-ever round seeds the array with `0`. On update, the round being edited is excluded via `OFFSET 1`.
3. `course_handicap = round((player_index * course_slope) / 113)`, capped at 36
4. `net_strokes = total_strokes - course_handicap`
5. If any hole stroke/putt is null (partial round), `score_differential` and `net_strokes` are left null but `player_index` and `course_handicap` are still computed.

Points pipeline (`Point.*`, recomputed on every round/greenie write):
- `participation`: flat 3 per round
- `pars/birdies/eagles/aces`: derived by comparing `strokes[i]` to `pars[i]` per hole. Birdies × 2, eagles × 4, aces × 10. "Eagle" = stroke ≤ par − 2 (and > 1).
- `greenies`: per-greenie point by distance — `<2ft=4`, `<10ft=3`, `<20ft=2`, `≥20ft=1`. Recomputed by reading **all** greenies for the round.
- `strokes` (positional): top 5 net-strokes finishers in a tournament get `[25, 20, 15, 10, 5]`; everyone else is reset to 0. Tiebreaker is `total_strokes ASC`.
- `putts` (positional): top 3 total-putts finishers get `[6, 4, 2]`; rest are reset to 0.
- Positional points are recomputed for the **entire tournament** on every round create/update/delete (`Point.updateStrokesPositions`, `Point.updatePuttsPositions`).

Standings (`Point.getYearlyStandings`):
- For a given `tour_years`, sums each player's **top N rounds** by total points (configurable via `numberOfRounds` query param). Uses a `ROW_NUMBER() OVER(PARTITION BY username ORDER BY total DESC)` CTE.

Skins game (described in README, not in code) — `total_strokes - (handicap / 2)` distributed across the hardest holes; hole-winner-takes-stroke, ties void the hole. **Not implemented in the backend** — purely a manual/reference feature.

## Backend Architecture (`server/`)

Classic three-layer Express + node-postgres app. No ORM, no query builder beyond a tiny `sqlForPartialUpdate` helper (`server/helpers/sql.js`).

- `app.js` — CORS allowlist (ccgc.app, ccgc.vercel.app, localhost:3000), JSON body, morgan, JWT middleware, mounts seven routers under `/auth`, `/users`, `/courses`, `/rounds`, `/tournaments`, `/greenies`, `/points`.
- `middleware/auth.js` — `authenticateJWT` reads `Authorization: Bearer` and stuffs payload onto `res.locals.user`. Three guards: `ensureLoggedIn`, `ensureAdmin`, `ensureCorrectUserOrAdmin` (the last one reads `req.body.username`, which is fragile).
- `models/<entity>.js` — each is a static-method class with `create / findAll / get / update / remove` plus entity-specific reads. **All SQL lives here as inline template strings**; aliases (`AS "camelCase"`) are how snake_case columns become camelCase JS.
- `routes/<entity>.js` — thin glue: validate (most jsonschema validators are commented out — "TEMP TURN OFF VALIDATION DURING PARTIAL ROUND INPUT WORK"), call model, return JSON. **Round and greenie routes orchestrate point recalculation directly** — see `routes/rounds.js` calling `Point.create`, `Point.updateStrokesPositions`, `Point.updatePuttsPositions` after each write. There is no service/transaction layer; multi-write operations are not wrapped in a DB transaction, which is a known correctness hazard the rebuild should address.
- `schemas/*.json` — jsonschema definitions; partially abandoned.
- `helpers/tokens.js` — `createToken(user)` signs `{ username, isAdmin }` with `SECRET_KEY`.
- AWS S3 presigned-URL flow for course images: `GET /courses/image-upload?course=<handle>` returns a PUT URL the client uses to upload directly to S3.
- Deployed to Railway (`server/railway.json`).

### Cross-cutting backend patterns to be aware of

- **Hand-rolled IN clauses** with string interpolation (e.g. `WHERE round_id IN (${roundsIds.join(",")})`). Safe here because IDs are integers from prior queries, but the pattern is unsafe by default.
- **Snake_case → camelCase** is done per-query via `AS` aliases, not a mapper. There's no consistent contract — column casing in a returned object reflects whichever query you hit.
- **Cascading point recalcs** ripple from one row write to a tournament-wide rewrite of the `points` table. Rebuild candidate: derive standings on read instead of caching.
- Test DB setup wipes/seeds between tests via `_testCommon.js`. Tests are integration-style, not unit.

## Frontend Architecture (`client/`)

Vite + React 18 + Material UI 5 + Tailwind 3 + DaisyUI, react-router-dom v6, react-hook-form, axios, dayjs. JWT in `localStorage` via a `useLocalStorage` hook.

- `App.jsx` — owns `currentUser` and `token` state, exposes `login/register/logout` to `Router`. On token change, decodes JWT, sets `CcgcApi.token` (a static class field), fetches `/users/:username`, and provides everything via `UserContext`.
- `api/api.js` — single `CcgcApi` static class wrapping axios. Every endpoint is a method; `BASE_URL` from `VITE_BASE_URL` (build-time, hardcoded to Railway URL in the `build` script).
- `router/Router.jsx` — flat route table. `<PrivateRoutes>` Outlet wrapper is used for `/dashboard` only; most "admin" gating happens inside page components by checking `currentUser.isAdmin`.
- `pages/<feature>/` — feature folders. Tournament details and round details use `[date]`/tab folder conventions but are **not** Next.js — these are just folder names. Tabs (`ScoresTab`, `GreeniesTab`, `HandicapTab`, `RoundsTab`) are driven by a `?tab=` query string and `useQuery` hook.
- `components/` — small set of shared UI (Navigation, Footer, PageHero, GreenieCard*, Modal, LoadingSpinner, AdminButtons, ScrollToTop, SiteHero).
- Styling is mixed: MUI `styled()` + sx, Tailwind utility classes, Bootstrap + react-bootstrap (residual), and a custom MUI theme in `theme/`. The rebuild should pick one system.
- Hosted on Vercel (`client/vercel.json`); production build hardcodes the Railway API URL into the bundle.

### Frontend patterns the rebuild should reconsider

- Static class with mutable `static token` field for API auth (not testable, not isolated per session).
- Page components fetch their own data in `useEffect` with manual `setLoading` — no React Query / SWR. Cache invalidation after mutations is ad-hoc (refetch in the same component).
- Forms use `react-hook-form` but each form re-encodes the same field-by-field shape that the backend's 18-hole tables impose.
- "Admin" UI is decided by `currentUser.isAdmin` checks scattered through pages.

## What "rebuild" should learn from this codebase

This codebase is best read for **what the product does**, not how it builds it. Treat the following as the canonical feature spec:

1. CRUD for users, courses (+ pars + handicaps), tournaments, rounds (+ strokes + putts), greenies.
2. Handicap calculation rules (formulas above) — these are USGA-flavored and must match.
3. Tour points rules (formulas above) — these are the club's house rules and must match.
4. Tournament leaderboard: sort rounds by `(net_strokes ASC, total_strokes ASC)`.
5. Season standings: sum top N rounds per player per `tour_years`.
6. Greenie tracking and per-greenie point payout by distance.
7. JWT-based auth with admin role; admin gates course/tournament/member management.
8. S3 presigned-URL image uploads for course photos.
9. Public read endpoints (courses, tournaments, rounds, greenies, standings) — no auth required for browsing.

Things the rebuild should explicitly do differently (cataloged from this code):

- Replace `hole1..hole18` columns with normalized `(round_id, hole_number, ...)` rows.
- Use surrogate keys (UUID/serial) instead of natural keys for users/courses/tournaments.
- Wrap multi-table writes (round + strokes + putts + points + position recalc) in DB transactions.
- Compute standings on read instead of maintaining a `points` cache table that must be re-derived on every mutation.
- Replace inline SQL with a query builder or typed ORM; remove per-query alias casing.
- Replace the static-class API client + `useEffect` fetching with a typed client + react-query (or equivalent) for cache + invalidation.
- Pick one styling system.
- Validate inputs with a schema library that's actually enforced (the jsonschema validators here are commented out).
- Re-think the `ensureCorrectUserOrAdmin` guard reading `req.body.username` — it should be derived from the route or token, not the body.
