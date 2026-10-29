# Delivery verification notes

The first local browser pass reached the new pages and controls, then correctly rejected a missing receipt link. It ran before the release receipt existed. The receipt was generated from completed research artifacts, the site rebuilt, and the complete browser link pass rerun. This was a packaging-order defect, not a scientific test or a seventh research round.

The initial local `git merge --ff-only origin/master` could not reconcile the shallow/stale CLI history. No unrelated-history merge or force update was attempted. Publication uses the connected GitHub API's current ref and expected-head checks; source publication, PR merge, Actions deployment and live bytes are verified separately.
