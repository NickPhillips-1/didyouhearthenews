# Topic filter

Topic chips and footer links filter the front page by query `topic` and `subtopic`.

## Sub-features

- `topic-chip`: choosing U.S. sets `?topic=us` and marks that chip pressed.
- `topic-subtopic`: a subtopic adds `subtopic`.
- `topic-empty-match`: when stories exist and none match, the page says "No stories match" plus the topic label.

## How to get to it (user POV)

- On the front page, the topic row is labeled "Topics".
- Chip "U.S." and footer link "U.S." both go to `/?topic=us`.
- "For you" is the default and does not put `topic` in the URL.

## Driving it with scripts/control-news-rater

Preconditions: `up`, `doctor ok`, and at least one story whose title does not match the topic under test. A fresh database does not meet this. Stop and name the missing story.

- Action: open the front page. Command: `scripts/control-news-rater goto /`. Expect: the topics navigation is in `aria`.
- Action: choose U.S. Command: `scripts/control-news-rater click --name "U.S."`. Expect: `goto` is unnecessary; `text` includes "U.S." and the address bar path is `/?topic=us`. Read the URL with `aria` only if the copy is not enough; the chip's pressed state is in `aria`.
- Action: screenshot. Command: `scripts/control-news-rater screenshot artifacts/verify/evidence/topic-us.png`.

## Gotchas

- With zero stories the template shows "No stories yet" and never "No stories match". That is not a topic-filter pass.
- Several controls are named "U.S." (chip and footer). `click` uses the first button or link. The chip is a button and is tried first.
- Subtopic panels open on hover. Keyboard focus opens them too. If `click` on a subtopic name misses, report the miss. Do not click by coordinates.
