---
name: news-rater-backend
description: >
  Spring Boot 3 / Java 21 backend for Did you hear the news, an intelligent
  news product: one event, several outlet URLs, bias on the outlet, a short
  summary. H2 JPA, story CRUD, article fetch (readability4j/jsoup), outlet
  bias catalog. Use when editing backend/, com.newsrater, /api/stories,
  ArticleFetchService, StoryService, OutletCatalog, or outlet/domain matching.
---

# Did you hear the news — backend

Intelligent news. A story is one event covered by several outlets. The API returns that event once: fetched articles, a short summary, and how coverage splits Left, Center, and Right. Bias belongs to the outlet, not the article text. The UI brand is "Did you hear the news". The repo, package, and database stay `news-rater` / `com.newsrater`.

The Angular UI lives in `frontend/` and calls this API. See `frontend/.agents/skills/news-rater-frontend` for component and client patterns.

## Run

From `backend/`:

```bash
mvn spring-boot:run
```

- Port **8080** (`src/main/resources/application.properties`).
- H2 file DB: `jdbc:h2:file:./data/newsrater` (relative to `backend/`). `backend/data/` is gitignored. Do not commit `*.mv.db` or lock files.
- `spring.jpa.hibernate.ddl-auto=update`, `open-in-view=false`.
- H2 console at `/h2-console` (user `sa`, empty password).
- Java 21, Spring Boot 3.3. Dependencies: web, data-jpa, validation, H2, jsoup, readability4j, Guava.

CORS allows `http://localhost:4200` on `/api/**` (`WebConfig`). The Angular dev server also proxies `/api` to 8080, so the browser is usually same-origin.

## Layout

Package `com.newsrater`:

| Layer | Role |
| --- | --- |
| `controller` | HTTP only. `StoryController` is the only API. |
| `service` | Orchestration, fetch, matching, bias math, summarization. |
| `repository` | Spring Data JPA. |
| `model` | JPA entities and enums. |
| `dto` | Records returned to the client. |
| `config` | CORS. |

Constructor injection. No field `@Autowired`.

## API

`StoryController` at `/api/stories`:

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/api/stories` | `201` + `StoryDto`. Body: `CreateStoryRequest` (`title` optional, `urls` required). |
| `GET` | `/api/stories` | `StorySummaryDto` list, newest first. |
| `GET` | `/api/stories/{id}` | `StoryDto`, or `404`. |

`IllegalArgumentException` from `StoryService.create` becomes `400`.

`urls` is a JSON array. Each string may contain newline-separated URLs; `StoryService` splits, trims, and de-dupes.

### Response shapes

`StoryDto`: `id`, `title`, `summary`, `origin` (`MANUAL` or `CLUSTERED`), `createdAt`, `distribution`, `articles`.

`StorySummaryDto`: `id`, `title`, `createdAt`, `articleCount`, `distribution`, `imageUrl` (lead image from the first OK article that has one).

`ArticleDto`: `id`, `url`, `domain`, `title`, `excerpt`, `imageUrl`, `publishedAt`, `outletName`, `bias` (enum name), `biasLabel`, `fetchStatus` (`OK` or `FAILED`), `fetchError`.

`BiasDistributionDto`: counts `left`, `center`, `right`, `untracked`, `trackedTotal`, and integer percents `leftPct`, `centerPct`, `rightPct`. Percents are of **tracked** articles only. `untracked` is excluded from the percentage base.

Keep DTO records and `frontend/src/app/models.ts` in sync when adding fields.

## Create flow

`StoryService.create`:

1. Normalize URLs. Reject when none remain.
2. New `Story` with origin `MANUAL`. Blank title becomes `"Untitled story"`, then the first OK headline if the request title was blank.
3. For each URL: `DomainUtil.registrableDomain`, `OutletMatcher.match` (empty means untracked), `ArticleFetchService.fetch`.
4. A fetch failure is stored as `FetchStatus.FAILED` with `fetchError`. It does not abort the story.
5. `Summarizer.summarize` sets the story summary.
6. Save and return `StoryDto` with `BiasDistributionService.compute`.

`Article.story` may be null for a future RSS ingest. Manual paste always sets the story via `Story.addArticle`.

## Bias and outlets

`Bias`: `LEFT`, `LEAN_LEFT`, `CENTER`, `LEAN_RIGHT`, `RIGHT`, `UNTRACKED`.

`side()` folds the five leans into `LEFT` / `CENTER` / `RIGHT`. `UNTRACKED` has a null side and is left out of the bar.

`OutletCatalog` seeds a starter US catalog on startup **only when the outlet table is empty**. Ratings are a demo catalog, not a measured source. Factuality and ownership stay null. Adding an outlet means adding a row in `OutletCatalog.seed` (or a later migration); existing databases are not re-seeded.

`OutletMatcher` looks up the registrable domain (`DomainUtil`, Guava `InternetDomainName`). Subdomains map to the same outlet as the registrable domain.

Article bias is `outlet.getBias()`, or `UNTRACKED` when there is no outlet. `outletName` falls back to the domain.

## Fetch and summary

`ArticleFetchService` uses Jsoup (8s timeout, browser user-agent) plus readability4j. It returns `FetchResult` and does not throw for a bad page. Lead image is typically `og:image`. Excerpt is capped.

`Summarizer` is the interface. `ExtractiveSummarizer` is the implementation. Do not call an LLM unless the task explicitly asks for one.

## Conventions

- Match surrounding style. Small diffs. Do not add tests unless asked.
- Do not commit `backend/data/`, `backend/target/`, or `*.class`.
- `CLUSTERED` origin is reserved for a future clustering job. Manual paste stays `MANUAL`.
