---
name: ship-pr
description: Land verified Did you hear the news pull requests bottom-up. Use when shipping a stack, checking an independent PASS verdict, or deciding whether an old verdict still matches the patch.
---

# Ship a PR

Follow the pstack shipping playbook. This file only adds the repo facts.

- Forge: `gh` against `NickPhillips-1/didyouhearthenews`. Do not use Graphite.
- The independent verifier is a fresh agent that did not write the change. It runs `.cursor/skills/verify-news-rater` on the parent and on the head, for the feature the PR names. It posts `PASS`, `PASS+NOTES`, or `FAIL`.
- Green CI (`backend`, `contract`, `frontend`, `tla`, `verify-home`) is required and is not that verdict. A bot approval is not that verdict.
- Before reusing a verdict, compare `git patch-id` at the verdict SHA with the current head. A rebase that changes the patch gets a new run. If the driver was a dev server, rerun it.
- Land the lowest verified PR with `gh pr merge <pr> --squash` only when its verdict matches its head. Stop at the first PR without `PASS` or `PASS+NOTES`.
- Dependent PRs land bottom-up. After a merge, retarget the next PR onto `main` and apply the patch-id rule again.
- Do not arm Autopilot-full in this skill. Autopilot-stack may prepare a PR a person lands after the verdict exists.
