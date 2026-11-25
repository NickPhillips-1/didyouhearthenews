---
name: news-rater-frontend
description: >
  Angular 18 frontend for Did you hear the news, an intelligent news product:
  one event shown once, with Left / Center / Right coverage. Story list and
  detail, article cards, bias distribution bar, outlet styling. Use when
  editing frontend/, Angular components, StoryApiService, bias-bar,
  article-card, or the /api proxy.
---

# Did you hear the news — frontend

Repo-wide rules, the rule table, and how to prove a change live in the root [AGENTS.md](../../../../AGENTS.md). This file is the frontend map. If they disagree, AGENTS.md and the lint check win.

Intelligent news. The reader sees one event, then how Left, Center, and Right outlets covered it. The brand in the masthead is "Did you hear the news". The repo folder is still `news-rater`.

Angular 18 app that lists stories, creates one from pasted URLs, and shows that coverage. The API is the Spring app in `backend/`. See `backend/.agents/skills/news-rater-backend` for DTOs, ingestion, and bias rules.

## Run

From `frontend/`:

```bash
npm start
```

Dev server uses `proxy.conf.json`: `/api` → `http://localhost:8080`. Start the backend first or list/create calls fail. Direct browser calls to `:8080` also work; `WebConfig` allows origin `http://localhost:4200`.

Scripts: `npm start` (`ng serve`), `npm run build`, `npm test` (Karma). Do not add tests unless asked.

## Layout

Standalone components only. `HttpClient` and the router are provided in `app.config.ts`.

| Path | Role |
| --- | --- |
| `src/app/story-api.service.ts` | Only HTTP client. Base path `/api/stories`. |
| `src/app/models.ts` | `Story`, `StorySummary`, `Article`, `BiasDistribution`, `CreateStoryRequest`. |
| `src/app/app.routes.ts` | `''` → home, `stories/:id` → story, `**` → home. |
| `src/app/pages/home/` | Create form and story list. |
| `src/app/pages/story/` | One story and its articles. |
| `src/app/bias-bar/` | Left / Center / Right bar. |
| `src/app/article-card/` | Article row plus `outlet-skins.ts`. |
| `src/styles.css` | Shared styles. Component CSS stays next to the component. |

Components import what they use (`CommonModule`, `FormsModule`, `RouterLink`, child components). Constructor injection for `StoryApiService` and `Router`.

## API boundary

Do not call `HttpClient` from components. Add methods on `StoryApiService`:

- `list(): Observable<StorySummary[]>`
- `get(id): Observable<Story>`
- `create(request): Observable<Story>` — `{ title?: string; urls: string[] }`

Home pastes URLs into a textarea and sends them as `urls`. Title is optional.

When a response field is added or renamed, update `models.ts` and the backend DTO in the same change. Shapes today:

- `Story`: `id`, `title`, `summary`, `origin`, `createdAt`, `distribution`, `articles`.
- `StorySummary`: `id`, `title`, `createdAt`, `articleCount`, `distribution`, `imageUrl`.
- `Article`: `id`, `url`, `domain`, `title`, `excerpt`, `imageUrl`, `publishedAt`, `outletName`, `bias`, `biasLabel`, `fetchStatus` (`OK` | `FAILED`), `fetchError`.
- `BiasDistribution`: counts `left`, `center`, `right`, `untracked`, `trackedTotal`, percents `leftPct`, `centerPct`, `rightPct`.

Percents are of tracked articles. `untracked` is a count, not part of the bar. `fetchStatus: FAILED` still renders the article with `fetchError`.

## UI

Home shows a lead story (`stories[0]`), two side stories, and the rest of the list. Creating a story navigates to the new story page on success and surfaces the error string on failure.

`BiasBarComponent` reads `BiasDistribution` percents. Do not recompute sides in the template from raw article bias unless the task is to change that contract.

`outlet-skins.ts` maps known outlet names to visual skins. Unknown outlets use the default skin. A new catalog outlet does not require a skin.

## Conventions

- Match existing component style: `standalone: true`, `styleUrl` (singular), templates in `.html`.
- Keep diffs small. No new dependencies unless the task needs one.
- `frontend/node_modules/`, `frontend/dist/`, and `frontend/.angular/` are gitignored.
