# Observability and exposure

There is no hosted deploy. These are the local controls.

## Logs

`StoryService` writes:

- `story.create` with the URL count and how many outlets were untracked
- `story.fetch.fail` with the URL and the fetch error
- `story.image-backfill skipped` when the backfill flag is off

Search those strings in the process log. A create that never logs `story.create` did not save.

## Health

`GET /actuator/health` returns `{"status":"UP"}` when the process is serving. The verification doctor uses this. It does not prove the home page rendered; `scripts/control-news-rater expect` does.

## Flags

`news-rater.flags.image-backfill` skips refetching missing lead images on startup when false.

`news-rater.flags.open-api-ui` turns Swagger and the OpenAPI document on or off (`springdoc.*.enabled` follows it).

## Canary

A canary is a second process, not a cloud stage:

```bash
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=canary
```

`application-canary.properties` uses `backend/data/newsrater-canary` and turns both flags off. Do not point it at the operator database `backend/data/newsrater`.

## Not enabled

No production tracer, error tracker, or traffic split. Add those when a deploy target exists.
