# QuickPizza k6 Performance Testing Case Study

## Project Overview

This repository is a portfolio-grade k6 harness for the public [QuickPizza](https://quickpizza.grafana.com/) application. The goal was not to produce a tutorial or a pile of one-off scripts. The goal was to show how a small performance project can still reflect production thinking:

- one business flow used consistently across test types
- hard pass/fail performance gates
- reusable test architecture instead of copy-paste HTTP calls
- CI jobs that treat performance checks like delivery pipeline inputs

The chosen flow is intentionally business-shaped:

1. create an isolated user
2. log in
3. request a pizza recommendation
4. submit a five-star rating
5. verify the rating exists
6. clean up and log out

That flow is exercised at the protocol layer for speed and control, and at the browser layer for user-journey realism.

The public QuickPizza host is a shared demo environment, so the load profile here is deliberately restrained. That is a design choice, not a missing feature. A real team should not point an aggressive portfolio load test at someone else’s public demo.

## Architecture Diagram

```text
                 +----------------------+
                 |   src/config/*.ts    |
                 | env + scenarios      |
                 +----------+-----------+
                            |
                            v
 +--------------------+   +-----------------------+   +----------------------+
 | src/data/*.ts      |-->| src/flows/*.ts        |<--| src/api/*.ts         |
 | restriction presets|   | reusable business flow|   | typed HTTP wrappers  |
 +--------------------+   +-----------+-----------+   +----------------------+
                                        |
                  +---------------------+----------------------+
                  |                                            |
                  v                                            v
      +----------------------------+             +----------------------------+
      | src/scenarios/api/*.test.ts|             | src/browser/**/*.ts        |
      | smoke + load executors     |             | page objects + UI journey  |
      +-------------+--------------+             +-------------+--------------+
                    |                                            |
                    +----------------------+---------------------+
                                           |
                                           v
                              +---------------------------+
                              | src/reporting/summary.ts  |
                              | CLI summary + JSON files  |
                              +-------------+-------------+
                                            |
                                            v
                              +---------------------------+
                              | .github/workflows/k6.yml  |
                              | PR smoke + browser,       |
                              | manual load, artifacts    |
                              +---------------------------+
```

## Test Strategy

The repository uses three layers because they answer different questions.

**API smoke**

This is the PR gate. It runs the full business flow with a tiny footprint so correctness regressions fail quickly. The smoke suite is fast enough for pull requests, but still validates real state transitions: user creation, authentication, recommendation retrieval, rating creation, rating verification, cleanup.

**API load**

This is the performance lens. It uses the same reusable business journey but under a restrained staged load profile suitable for a shared public host. The value here is not raw scale theater. The value is that latency and error-rate thresholds are applied to a realistic, stateful workflow instead of a synthetic single endpoint.

**Browser smoke**

This is intentionally thin. Browser tests are slower and more operationally fragile, so they should justify themselves. Here the browser layer verifies that a real user can log in, request a recommendation, rate it, and see that rating in their profile. That gives frontend signal without pretending browser automation is the best place to do load.

## Scenarios Explained

### Smoke

- Executor: `per-vu-iterations`
- Shape: `3` VUs, `1` iteration each
- Purpose: correctness-first PR signal
- Flow: register user -> login -> get pizza -> rate -> verify -> delete -> logout

### Load

- Executor: `ramping-vus`
- Shape: `30s -> 5 VUs`, `1m -> 10 VUs`, `90s -> 20 VUs`, `30s -> 0`
- Purpose: detect performance drift on the public demo without being abusive
- Flow: same as smoke, which keeps the comparison honest

### Browser

- Executor: `shared-iterations`
- Shape: `1` VU, `1` iteration
- Purpose: validate the user-visible journey and collect browser metrics
- Flow: create user via API setup -> UI login -> request pizza -> rate in UI -> verify rating in profile -> clear ratings

## Performance Gates

These thresholds are strict enough to fail meaningfully, but realistic for a shared internet-hosted demo application.

| Suite | Gate |
| --- | --- |
| API smoke | `http_req_failed < 1%` |
| API smoke | `checks > 99%` |
| API smoke | `journey_success_rate > 99%` |
| API smoke | `http_req_duration p95 < 1000ms` |
| API load | `http_req_failed < 1%` |
| API load | `checks > 99%` |
| API load | `journey_success_rate > 99%` |
| API load | `http_req_duration p95 < 1500ms` |
| Browser smoke | `browser_http_req_failed < 1%` |
| Browser smoke | `checks > 95%` |
| Browser smoke | `browser_web_vital_lcp p95 < 4000ms` |

## How to Run Locally

Install dependencies:

```bash
pnpm install
```

Run the fast repo checks:

```bash
pnpm test:unit
pnpm typecheck
```

Run the protocol smoke test:

```bash
pnpm test
```

Run the restrained load test:

```bash
pnpm test:load
```

Run the browser journey:

```bash
pnpm test:browser
```

Environment variables:

- `BASE_URL` defaults to `https://quickpizza.grafana.com`
- `TEST_PROFILE` is managed by the runner for `smoke` and `load`
- `RESULTS_DIR` defaults to `results`
- `BROWSER_HEADLESS` defaults to `true`
- `K6_BIN` can point to a local k6 binary if `k6` is not on your `PATH`

Notes:

- The local runner writes raw k6 JSON output to `results/<label>-raw.json`.
- `handleSummary()` writes an aggregated summary file to `results/<label>-summary.json`.
- Browser runs require a Chromium-based browser and a recent k6 binary with browser support.

## CI/CD Integration

The workflow lives in [k6.yml](/Users/tomas.breburda/git_repos/k6-perf-test-showcase/.github/workflows/k6.yml).

The pipeline is split by intent, not by technology novelty:

- `quality` installs dependencies, runs unit tests, and runs `pnpm typecheck`
- `api-smoke` runs on every pull request and fails hard on threshold breaches
- `browser-smoke` runs on every pull request as a separate job so UI failures are visible on their own
- `api-load` runs only through `workflow_dispatch`, which is the responsible default for a shared public environment

Every k6 job uploads `results/*.json` as artifacts even when the run fails. That matters because a failed threshold without preserved evidence is not very useful in a delivery pipeline.

## Example Results

Representative smoke run against the public QuickPizza host from this repository:

```text
checks.........................: 100.00% ✓ 27 ✗ 0
http_req_failed................: 0.00%   ✓ 0  ✗ 21
http_req_duration..............: p(95)=199.05ms
journey_duration...............: p(95)=1.36s
journey_success_rate...........: 100.00% ✓ 3 ✗ 0
```

This is the signal I want from the smoke layer: low noise, a real multi-step flow, and enough assertions that a fast green build still means something.

Representative restrained load run against the same public host:

```text
checks.........................: 100.00% ✓ 17766 ✗ 0
http_req_failed................: 0.00%   ✓ 0     ✗ 13818
http_req_duration..............: p(95)=214.08ms
journey_duration...............: p(95)=1.15s
journey_success_rate...........: 100.00% ✓ 1974  ✗ 0
iterations.....................: 1974
http_reqs......................: 13818
```

That result matters less as a bragging-rights number than as proof that the staged profile and threshold gates work against a stateful end-to-end flow.

The repository also emits:

- raw k6 event output for later analysis
- aggregated JSON summary files for artifact retention
- browser metrics such as `browser_http_req_failed` and `browser_web_vital_lcp` when the browser suite runs in CI

## Key Learnings

1. Performance tests become much more credible when they model a business workflow instead of isolated endpoints.
2. Reuse matters even in small k6 repositories. Separating API wrappers, flows, scenarios, and reporting keeps the test code understandable when you add the second and third test type.
3. Browser checks should be meaningful, not oversized. A single real journey is more useful than pretending browser automation is where heavy load belongs.
4. Public shared environments force engineering judgment. The right answer is not always “push more VUs”; sometimes the right answer is to keep the profile responsible and document why.
5. CI artifacts are part of the product. If a threshold fails, the result files need to survive the failure.
