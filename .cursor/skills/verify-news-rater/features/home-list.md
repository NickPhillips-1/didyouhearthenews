# Home list

The front page lists stories for the selected topic, or says that none exist yet.

## Sub-features

- `home-empty`: a fresh database shows "No stories yet".
- `home-error`: if the list request fails, an alert says the backend is not running.
- `home-lead`: when stories exist, the first one is a link named "Lead story: " plus the title.

## How to get to it (user POV)

- Open the site root.
- The header brand "Did you hear the news" is always on that page.
- A story title on the front page links to `/stories/:id`.

## Driving it with scripts/control-news-rater

Preconditions: `up` and `doctor ok`. Fresh data has no stories.

- Action: open the front page. Command: `scripts/control-news-rater goto /`. Expect: `scripts/control-news-rater expect --text "No stories yet"` and `expect --text "Did you hear the news"`.
- Action: capture the empty front page. Command: `scripts/control-news-rater screenshot artifacts/verify/evidence/home-empty.png`. Expect: the file exists after `down`.
- Action: read the accessible tree. Command: `scripts/control-news-rater aria`. Expect: a status whose name includes "No stories yet" and a link "Did you hear the news".

`home-lead` and `home-error` are not available on a fresh successful database. Report them as unmet. Do not seed through a hidden endpoint.

## Gotchas

- `stories.length === 0` wins over the topic filter, so an empty database never shows "No stories match".
- The operator's app on port 4200 is a different database. Doctor must show a verification URL and a data directory under `artifacts/verify/instance`.
- Loading copy "Loading…" can flash before the status. `expect` waits only for the current text; run it after `goto` returns.
