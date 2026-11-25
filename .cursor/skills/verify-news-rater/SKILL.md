---
name: verify-news-rater
description: Drive the Did you hear the news Angular app and Spring API the way a reader does. Use to prove a UI change, reproduce a home, topic, story, or bias bug, or capture screenshots and ARIA snapshots with scripts/control-news-rater.
---

# Verify Did you hear the news

The app is a web UI on an isolated port plus the Spring API on another isolated port. Do not drive the operator's `localhost:4200` or `localhost:8080`.

Read [features/README.md](features/README.md) before a journey. One convenient entry point does not cover the others.

## Launch

From the repo root, after `npm ci` in `frontend/` and `scripts/control/`, and `npx --prefix scripts/control playwright install chromium`:

```bash
scripts/control-news-rater up
```

`up` starts Maven and `ng serve` with a fresh H2 directory under `artifacts/verify/instance/data`, a generated proxy, and a headless browser. Ready means `/actuator/health` is `UP` and the UI shell has loaded. A fresh database has no stories.

There is no second instance. If `up` says one is already running, use it or `down` first.

## Doctor

```bash
scripts/control-news-rater doctor
```

Prints the UI URL, API URL, data directory, and git revision. Exit 1 means do not drive it.

## Drive

The harness is `scripts/control-news-rater`. It clicks by accessible name.

```bash
scripts/control-news-rater goto /
scripts/control-news-rater click --name "U.S."
scripts/control-news-rater aria
scripts/control-news-rater text
scripts/control-news-rater expect --text "No stories yet"
scripts/control-news-rater screenshot artifacts/verify/evidence/<feature>-<step>.png
```

`goto` takes a path on the verification UI (`/` or `/stories/1`). `click` matches a button, link, or radio. Prefer those names over coordinates.

Create-from-URLs has no form. Do not invent one. The API-only path is in [features/create-story-api.md](features/create-story-api.md).

## Evidence

Write proof under `artifacts/verify/evidence/`. Capture the action and the state after it: ARIA or `text`, and a screenshot that shows "Did you hear the news". Record the feature id. A fresh database that cannot reach a later step is a failed precondition, not a pass via another screen.

Mocks: the verification process uses a real Spring app and a real Angular dev server. Article fetch still calls the network when a story is created. Do not add a test-only HTTP route.

## Cleanup

```bash
scripts/control-news-rater down
```

Kills the backend, frontend, and browser this command started, and deletes `artifacts/verify/instance`. It does not delete `artifacts/verify/evidence`.

## Helpers

`scripts/control-news-rater` is the only helper. Run it; do not reimplement launch.

Keep the map current with `/maintain-verification-skill`.
