# Change-scoped Pages validation and npm release regression

**Goal:** Check ordinary integration candidates only where they change behavior. Build and publish verified Pages without running tests a second time. Reserve the complete suite for a new stable npm version.

**Design:** The candidate ref records the expected master SHA and candidate SHA. Candidate CI verifies the exact checkout and current master, then uses their tracked Git diff (including both sides of renames) to choose checks. The merge command and master Pages gate require a real successful targeted job on the same baseline and tested tree. The Pages build keeps reference byte checks but runs no tests. Protect authorization and the read-only/release-only permission split.

- [ ] Write and run failing tests for the selector: prose-only, docs application, component and test changes, cross-cutting smoke, source without a named check, generated reference, deletion/rename, and no implicit full. Implement `scripts/check-targeted-changes.mjs`. Keep selection explicit and log the plan. No default bare test command.
- [ ] Change candidate job and Pages proof wiring in `.github/workflows/docs.yml`; retain the exact checkout/tracked-byte sentinels. Take the Pages baseline only from the original master push, and require reruns to keep that same event. Accept only evidence for that immutable baseline.
- [ ] Revise the merge helper, verifier and their fixtures. Keep the local non-force compare-and-set push guard, exact job/attempt/repository validation and same-tree fallback for protected PR results on the same baseline.
- [ ] Move existing full unit, package, docs and three-engine browser verification into the stable npm release job before publishing. No npm trigger or release during this work.
- [ ] Document the policy and existing-authority limits in AGENTS and CI/release guidance. Run only targeted Node/Vitest tests, fixture/parity checks, actionlint and diff/reference checks.
