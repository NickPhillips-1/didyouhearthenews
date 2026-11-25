---
name: verify-story-create
description: Model-check story create for Did you hear the news. Use when a change touches StoryService.create, ArticleFetchService failure handling, or which articles BiasDistributionService puts on the Left/Center/Right bar.
---

# Verify story create

A test lists cases. This check explores every fetch result and bias, up to two URLs, for three promises:

- An empty URL list never becomes a saved story. Harm: a blank paste creates a row.
- A failed fetch is still stored and the story is still saved. Harm: one bad URL drops the other sources.
- Untracked outlets are not in the bar. Harm: unknown domains move Left, Center, or Right.

The model is `formal/tla/StoryCreate.tla`. It is a model of `StoryService.create`, `ArticleFetchService.FetchResult`, and `BiasDistributionService.compute`. It is not the Java. Percent rounding on the real method is `BiasDistributionProperties` (jqwik), not this model. There is no Lean check: nothing extracts the Java into Lean.

## When it applies

Run it if the diff touches any of:

- `backend/src/main/java/com/newsrater/service/StoryService.java` (`create`, URL normalize, save)
- `backend/src/main/java/com/newsrater/service/ArticleFetchService.java` (OK versus failure)
- `backend/src/main/java/com/newsrater/service/BiasDistributionService.java` (who is in the bar)
- `formal/tla/StoryCreate.tla`

If those files changed after the commit in `formal/tla/SYNC`, read the model against the new methods before trusting a pass. Move `SYNC` forward only after the model still describes the code.

## Run

```bash
bash scripts/run-tla.sh
```

Needs Java and network the first time (downloads TLA+ tools 1.7.4 into `formal/tla/.cache/`, which is gitignored). The run is a few seconds at `MaxUrls = 2`.

Success is TLC finishing with no invariant violation. Read every TLC result with `/statechart`. Do not copy that skill's commands; they change. A violation's shortest path is the bug report: which phase, which fetch, which bias.

A pass covers this model at two URLs. It does not cover HTTP, the database, or percent rounding.

## What a failure means

- `EmptyRejected`: create stored a story with no URLs.
- `FailDoesNotAbort`: a FAIL URL was dropped or the story was not saved.
- `BarExcludesUntracked`: an UNTRACKED article is in `bar`.
- `TypeOK`: the model itself is inconsistent. Fix the model, not the product, unless the code gained a state the model cannot name.

Do not weaken an invariant to make TLC pass. If the Java is wrong, say so and leave the product change to the task that asked for it.

## Broken variant

To confirm the check can fail, copy the spec aside, stop appending articles whose fetch is `FAIL`, and run TLC. `FailDoesNotAbort` should fail. Restore the spec. Do not commit the broken copy.
