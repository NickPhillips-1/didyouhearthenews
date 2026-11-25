# Did you hear the news

Angular 18 UI in `frontend/`. Spring Boot 3 / Java 21 API in `backend/`. One event, several outlet URLs. Bias belongs to the outlet. The brand is "Did you hear the news". Packages stay `com.newsrater`.

This is not an Electron app. Do not add `electron-main/`, Dune APIs, or React `useEffect` rules.

Maps: [frontend skill](frontend/.agents/skills/news-rater-frontend/SKILL.md), [backend skill](backend/.agents/skills/news-rater-backend/SKILL.md). If a map and this file disagree, this file and the check that enforces it win.

## Finish line

A change is done when the check that defines it passes.

- Bug: reproduce it on the parent, then show the same check passing on the change.
- Feature: drive the user path in [.cursor/skills/verify-news-rater](.cursor/skills/verify-news-rater/SKILL.md) with `scripts/control-news-rater`. Name the feature id and the evidence path.
- Green CI is required and is not a substitute for that run. An approving bot review is not a substitute either.

## Where code goes

| Work | Path | Call |
| --- | --- | --- |
| HTTP from the UI | `frontend/src/app/story-api.service.ts` | `list`, `get`, `create` |
| Screens | `frontend/src/app/pages/` and the components next to them | `StoryApiService` only |
| HTTP in | `backend/.../controller/` | `StoryService` |
| Create, fetch, bias, summary | `backend/.../service/` | repositories and each other |
| Rows | `backend/.../model/`, `repository/` | not from controllers |
| Wire shapes | Java records in `dto/` and `frontend/src/app/models.ts` | change both in the same commit |

Create sequencing stays in `StoryService.create`. Do not copy a one-off retry into a component.

## Rule table

When a correction repeats, change the check, then this row. `/correct` does that. `/reflect` is for workflow, not for a rule that nothing enforces.

| Rule | Enforced by |
| --- | --- |
| UI HTTP only through `StoryApiService` | `frontend` ESLint `no-restricted-imports` on `@angular/common/http` |
| Do not recompute Left/Center/Right percents in templates | `scripts/check-bias-templates.mjs` |
| `frontend/src` does not import `com.newsrater` or `backend/` | `scripts/check-frontend-boundaries.mjs` |
| Controllers do not call repositories | ArchUnit `LayerRulesTest` |
| DTO record fields match `models.ts` | `scripts/check-dto-contract.mjs` |
| Percents sum to 100 when any article is tracked; untracked is outside the base | `BiasDistributionServiceTest`, jqwik `BiasDistributionProperties` |
| A failed fetch does not abort create; URLs are normalized | `StoryServiceTest` |
| Story-create ordering (empty rejected, fail still stored, untracked off the bar) | `formal/tla` via `scripts/run-tla.sh`, read with `/statechart` |
| Home empty state renders | `scripts/control-news-rater` feature `home-list` |

Judgment, not a check: bias ratings are a demo catalog; do not treat them as measured. `CLUSTERED` is reserved. Do not add an LLM summarizer unless the task asks.

## Prove it

```bash
cd backend && mvn -q test
cd frontend && npm run lint && npm test -- --watch=false && npm run build
node scripts/check-dto-contract.mjs
bash scripts/run-tla.sh
scripts/control-news-rater up && scripts/control-news-rater doctor
```

Drive one feature from `.cursor/skills/verify-news-rater/features/`, then `scripts/control-news-rater down`. Evidence stays under `artifacts/verify/evidence/`.

## Parallel work and shipping

One owner per PR. Unrelated work uses another worktree or a cloud agent. Stack a PR only when it needs the branch under it.

PR body: `.github/pull_request_template.md`.

- Babysit CI and review threads with `.cursor/skills/babysit-pr` (pstack babysit). Do not merge from babysit.
- Ship with `.cursor/skills/ship-pr` (pstack shipping). An independent verifier runs `verify-news-rater` against parent and head and posts `PASS`, `PASS+NOTES`, or `FAIL`. Reuse a verdict only when `git patch-id` still matches. Land bottom-up with `gh pr merge --squash`.
- Workers follow pstack `poteto-mode` `worker.md`. Model choices stay in the user rule `pstack-models.mdc`. Do not copy those skills into this repo.
- `/blast-radius` when a change is safe only because something else is true. `/interrogate` for a second look at a diff or design. `/benchmark-checklist` before quoting a performance number.
- `/loop` rechecks CI or review. Autopilot-stack may prepare a PR a person lands. Do not arm Autopilot-full until `verify-news-rater` has been run on the change.
- `/show-me-your-work` records decisions. Point it at the PR, the verdict, and `artifacts/verify/evidence/`.

## After deploy

There is no cloud deploy yet. Flags and a canary profile are local only. See [docs/ops/observability.md](docs/ops/observability.md).
