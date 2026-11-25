# Story detail

One story shows its title, coverage overview, evidence list, and the article track.

## Sub-features

- `story-title`: the page heading id `story-title` is the story title.
- `story-missing`: an unknown id shows an alert.
- `story-track`: sources sit in the region named "Sources".
- `story-back`: "All stories" returns to the front page.

## How to get to it (user POV)

- From the front page, open a story link.
- Direct URL `/stories/:id`.
- "All stories" goes back to `/`.

## Driving it with scripts/control-news-rater

Preconditions: `up`, `doctor ok`, and a story id that `GET /api/stories/:id` returns. A fresh database has none. Stop if it does not.

- Action: open the story. Command: `scripts/control-news-rater goto /stories/<id>`. Expect: `expect --text` of the title, and `aria` includes heading "story-title" text.
- Action: return. Command: `scripts/control-news-rater click --name "All stories"`. Expect: `expect --text "Did you hear the news"` and the front page copy.
- Action: screenshot the story before going back. Command: `scripts/control-news-rater screenshot artifacts/verify/evidence/story-<id>.png`.

`story-missing`: `goto /stories/999999` expects an alert. That path does not prove a real story.

## Gotchas

- Creating the story through `POST /api/stories` waits on article fetch (about 8 seconds per URL) and needs network. A failed fetch still creates the story. Do not treat a timeout as a UI bug until the API response is in.
- The article track is not on the home page.
