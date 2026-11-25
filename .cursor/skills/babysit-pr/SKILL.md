---
name: babysit-pr
description: Watch a Did you hear the news pull request until it is merge-ready or blocked on a human. Use for babysit, CI failures, or Bugbot threads on this repo. Does not merge.
---

# Babysit a PR

Follow the pstack babysit playbook. This file only adds the repo facts.

- Forge: GitHub. Use `gh`. This remote is `https://github.com/NickPhillips-1/didyouhearthenews.git`.
- Declare `drive`, `threads-only`, or `check` in the first line.
- Status, conflicts, threads, then CI. Do not rebase, retarget, or force-push. A conflict stops you.
- Bugbot: check the claim against the code. Billing, data, auth, and security get escalated, not silently dismissed.
- CI jobs that must be green: `backend`, `contract`, `frontend`, `tla`, `verify-home`.
- A green check is not a user-level pass. Say if `verify-news-rater` has not been run.
- Do not merge.
