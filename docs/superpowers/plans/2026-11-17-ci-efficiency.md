# CI efficiency plan

Goal: remove duplicate full browser runs while never deploying an unverified revision.

Architecture: one CI workflow for non-draft PRs, manual checks and master pushes. Master may reuse a successful same-repository, same-workflow, exact-SHA push/manual run's unexpired documentation artifact. Otherwise it runs all checks itself. Deployment consumes only that verified artifact. Release publishing remains unchanged.

- [x] Test trusted run/artifact selection, missing/expired artifact fallback and SHA/event boundaries.
- [x] Implement conservative reuse helper and unified workflow; discover all browser scripts automatically.
- [x] Remove historical component workflows, document manual branch verification and short artifact retention.
- [ ] Run configuration tests, all existing checks, independent review, then coordinate master integration after Tabs.

Constraints: never trust PR artifacts for deployment; no pull_request_target; retain three browser engines, package and llms checks; no npm publication or historical artifact deletion. Network/API errors stop rather than deploy unverified code.
