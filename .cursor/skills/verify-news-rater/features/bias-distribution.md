# Bias distribution

Left, Center, and Right percents come from the API. Untracked outlets are counted and left off the bar.

## Sub-features

- `bias-strip`: a home story with tracked sources shows Left, Center, and Right percents.
- `bias-empty`: tracked total 0 shows "No tracked sources" on the strip, or omits the curve.
- `bias-untracked`: the story page legend can say untracked sources are excluded. The percents still sum from tracked only.

## How to get to it (user POV)

- Home: a story card shows the strip under the title when that story is not the empty database.
- Story page: the coverage region and the overview radios Left, Center, and Right.

## Driving it with scripts/control-news-rater

Preconditions: a story whose `distribution.trackedTotal` is greater than 0. Fresh data has no such story. Stop and say so.

- Action: open that story from the lead link. Command: `scripts/control-news-rater click --name "Lead story:"`. Expect: `text` includes a percent and the story title.
- Action: screenshot. Command: `scripts/control-news-rater screenshot artifacts/verify/evidence/bias-story.png`.
- The numeric contract is not proved by the screenshot. `mvn -q test` runs `BiasDistributionServiceTest` and `BiasDistributionProperties`.

## Gotchas

- Do not recompute percents in the page. The template check fails that.
- A story whose outlets are all untracked has no bar. That is success for `bias-empty`, not a broken chart.
- Home hides the lead curve when tracked total is 0. Absence of the curve is the proof, not a missing screenshot element you should invent.
