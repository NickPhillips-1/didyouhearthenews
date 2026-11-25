# Create story API

`POST /api/stories` builds a story from URLs. The UI has no form for this. Do not add a click path that is not on the page.

## Sub-features

- `create-normalize`: newline-separated URLs and a missing scheme become distinct `https://` URLs.
- `create-fail-continues`: a fetch error is stored and the story is still created.
- `create-empty`: no URLs returns 400.

## How to get to it (user POV)

There is no user entry point in the UI. Call the verification API printed by `doctor`.

## Driving it with scripts/control-news-rater

Preconditions: `up` and `doctor ok`. Use the printed `api` base, not port 8080.

- Action: reject an empty list. Command: `curl -s -o /tmp/news-rater-create.json -w "%{http_code}" -X POST "$API/api/stories" -H 'content-type: application/json' -d '{"urls":["  "]}'`. Expect: status 400.
- Action: create with one URL that may fail to fetch. Command: `curl -s -X POST "$API/api/stories" -H 'content-type: application/json' -d '{"title":"Verify story","urls":["https://example.com/verify"]}'`. Expect: HTTP 201 and a JSON `id`. Fetch may take about 8 seconds.
- Action: open that id. Command: `scripts/control-news-rater goto /stories/<id>`. Expect: `expect --text "Verify story"`.

`$API` is the doctor line starting with `api`.

## Gotchas

- example.com is a real network call. Offline, the fetch fails and the story should still exist. If the process never returns, read `artifacts/verify/instance/backend.log` before blaming the UI.
- This does not prove the home lead. After create, home can show the story. That is [home-list.md](home-list.md) `home-lead`, run only after this returns an id.
- Unit coverage of normalize and failed fetch is `StoryServiceTest`, which does not replace this API call when the task changed create.
