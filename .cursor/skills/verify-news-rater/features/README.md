# Did you hear the news verification map

Read this index, then the feature file. The harness is `scripts/control-news-rater`.

## Baseline preconditions

- `scripts/control-news-rater up` on a fresh H2 directory. Doctor must print `doctor ok`.
- The fresh database has no stories. The home empty state is the path that needs no seed.
- Do not point the harness at port 4200 or 8080.
- There is no create form. `POST /api/stories` is API-only.

## Driving conventions

- Start from `/` unless the feature says otherwise.
- Click with `click --name` using the accessible name.
- `expect --text` checks visible copy after the action.
- Screenshots go to `artifacts/verify/evidence/`.
- `down` removes the instance and keeps evidence.

## Proof and skip reporting

- Record the feature id with the screenshot.
- If a journey needs a story and the database has none, stop and say which precondition failed.
- Do not call the empty home a pass for story detail, topic match copy, or the bias bar.

## Features

- [Home list](home-list.md) covers empty, load error, and a populated front page.
- [Topic filter](topic-filter.md) covers `?topic=` and subtopics.
- [Story detail](story-detail.md) covers the story page and the article track.
- [Bias distribution](bias-distribution.md) covers percents of tracked outlets only.
- [Create story API](create-story-api.md) covers `POST /api/stories`. There is no UI for it.
