/**
 * =============================================================================
 * Xebia-LMS (XAMS) — AWS Load Test
 * =============================================================================
 *
 * WHAT THIS SCRIPT DOES
 * ----------------------------------------------------------------------------
 * Drives HTTP load against the Xebia-LMS application through the AWS
 * Application Load Balancer (ALB) DNS name — never directly against an EC2
 * instance — to validate application behavior (latency, error rates,
 * authentication) at up to 3,000 concurrent virtual users (VUs).
 *
 * ARCHITECTURE UNDER TEST
 * ----------------------------------------------------------------------------
 *   k6  ->  ALB (xebia-lms ALB DNS)  ->  Target Group (xebia-lms-tg)
 *           ->  EC2 #1 / EC2 #2 (Auto Scaling Group)
 *               ->  RDS PostgreSQL
 *               ->  ElastiCache Redis
 *
 * IMPORTANT — WHAT THIS SCRIPT DOES *NOT* MEASURE
 * ----------------------------------------------------------------------------
 * k6 only sees what the ALB returns to it. It has NO visibility into, and
 * makes NO claims about underlying AWS infrastructure metrics (EC2 CPU,
 * Auto Scaling events, ALB-side metrics, RDS/Redis CPU or connections).
 * This script reports application-level results only.
 *
 * REAL API ENDPOINTS
 * ----------------------------------------------------------------------------
 * Endpoints below are taken directly from the project's own API
 * documentation (documentation/11_api_documentation.md and
 * 09_auth_and_auth.md) — nothing here is invented. If your deployment's
 * routes differ, edit the ENDPOINTS block below; everything else in the
 * script will keep working unchanged.
 *
 * AUTHENTICATION
 * ----------------------------------------------------------------------------
 * POST /api/auth/login returns:
 *   1. An HTTP-only JWT cookie ("JWT_TOKEN") — k6's built-in per-VU cookie
 *      jar captures and resends this automatically, so no special handling
 *      is required for that part.
 *   2. A JSON body containing a bearer `token` — this script also extracts
 *      that token and sends it as `Authorization: Bearer <token>` on every
 *      subsequent request, so the test works correctly whether your
 *      deployment enforces cookie auth, bearer-token auth, or both.
 *
 * USAGE
 * ----------------------------------------------------------------------------
 *   1) SMOKE TEST FIRST (always). 5-20 VUs, ~1 minute:
 *
 *      k6 run \
 *        -e BASE_URL="http://<your-alb-dns-name>" \
 *        -e EMAIL="test@example.com" \
 *        -e PASSWORD="password" \
 *        -e ROLE="STUDENT" \
 *        -e SMOKE_TEST="true" \
 *        xebia-lms-load-test.js
 *
 *      Confirm: ALB reachable, login succeeds (successful_logins > 0),
 *      login_failures == 0, api_failures == 0, cookies/tokens accepted.
 *      Do NOT proceed to the full run until the smoke test is clean.
 *
 *   2) FULL 3,000-VU STAGED TEST, once the smoke test passes:
 *
 *      k6 run \
 *        -e BASE_URL="http://<your-alb-dns-name>" \
 *        -e EMAIL="test@example.com" \
 *        -e PASSWORD="password" \
 *        -e ROLE="STUDENT" \
 *        --summary-export=summary.json \
 *        xebia-lms-load-test.js
 *
 *      (JSON results are also written continuously via handleSummary() /
 *      the k6 `--out json=results.json` flag — see notes near the bottom.)
 *
 * ENVIRONMENT VARIABLES
 * ----------------------------------------------------------------------------
 *   BASE_URL     (required) ALB DNS name, e.g. http://xebia-lms-alb-123.us-east-1.elb.amazonaws.com
 *   EMAIL        (required) Login email for the test account
 *   PASSWORD     (required) Login password for the test account
 *   ROLE         (optional) "STUDENT" (default) or "TEACHER" — selects which
 *                authenticated endpoint set to exercise
 *   SMOKE_TEST   (optional) "true" to run the 5-20 VU smoke profile instead
 *                of the full 3,000-VU staged profile
 *   MIN_THINK_S  (optional) minimum think time between requests, seconds (default 1)
 *   MAX_THINK_S  (optional) maximum think time between requests, seconds (default 4)
 * =============================================================================
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// -----------------------------------------------------------------------------
// CONFIGURATION — all values come from environment variables, nothing hardcoded
// -----------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL; // e.g. http://xebia-lms-alb-123.us-east-1.elb.amazonaws.com
const EMAIL = __ENV.EMAIL;
const PASSWORD = __ENV.PASSWORD;
const ROLE = (__ENV.ROLE || 'STUDENT').toUpperCase(); // STUDENT | TEACHER
const IS_SMOKE_TEST = (__ENV.SMOKE_TEST || 'false').toLowerCase() === 'true';
// Optional custom peak VU target for a smaller/intermediate staged test
// (e.g. -e PEAK_VUS=300 to find the breaking point below 3,000). Ignored
// when SMOKE_TEST=true. Defaults to the full 3,000-VU profile if not set.
const PEAK_VUS = __ENV.PEAK_VUS ? Number(__ENV.PEAK_VUS) : null;
// Optional duration controls, in minutes, so a staged test can be run much
// shorter than the ~21-min default when you just want a quick read on
// where things start to strain (e.g. -e RAMP_MIN=1 -e SUSTAIN_MIN=1 gives
// a ~8-minute run). Ignored when SMOKE_TEST=true.
const RAMP_MIN = __ENV.RAMP_MIN ? Number(__ENV.RAMP_MIN) : 3; // per ramp-up stage
const SUSTAIN_MIN = __ENV.SUSTAIN_MIN ? Number(__ENV.SUSTAIN_MIN) : 5; // hold at peak
const MIN_THINK_S = Number(__ENV.MIN_THINK_S || 1);
const MAX_THINK_S = Number(__ENV.MAX_THINK_S || 4);

if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error(
    'Missing required env vars. Run with -e BASE_URL=... -e EMAIL=... -e PASSWORD=...'
  );
}

// -----------------------------------------------------------------------------
// REAL APPLICATION ENDPOINTS
// (Sourced from documentation/11_api_documentation.md. Edit here — and
// nowhere else — if your deployed routes differ.)
// -----------------------------------------------------------------------------
const ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  STUDENT: [
    { name: 'student_dashboard', method: 'GET', path: '/api/student/dashboard' },
    { name: 'student_assignments', method: 'GET', path: '/api/student/assignments?page=0&size=10' },
    { name: 'student_submissions', method: 'GET', path: '/api/student/submissions?page=0&size=10' },
  ],
  TEACHER: [
    { name: 'teacher_dashboard', method: 'GET', path: '/api/teacher/dashboard' },
    { name: 'teacher_batches', method: 'GET', path: '/api/teacher/batches' },
    { name: 'teacher_assignments', method: 'GET', path: '/api/teacher/assignments?page=0&size=10' },
  ],
};

const AUTHENTICATED_ENDPOINTS = ENDPOINTS[ROLE] || ENDPOINTS.STUDENT;

// -----------------------------------------------------------------------------
// CUSTOM METRICS
// -----------------------------------------------------------------------------
// Login-specific
const loginFailures = new Counter('login_failures');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');
const loginFailureRate = new Rate('login_failure_rate');
const loginDuration = new Trend('login_duration_ms');

// Authenticated-API-specific
const apiFailures = new Counter('api_failures');
const apiFailureRate = new Rate('api_failure_rate');
const apiDuration = new Trend('api_request_duration_ms');

// Overall HTTP status breakdown (in addition to k6's built-in http_req_failed)
const http4xx = new Counter('http_4xx_responses');
const http5xx = new Counter('http_5xx_responses');
const overallFailureRate = new Rate('overall_http_failure_rate');

// -----------------------------------------------------------------------------
// LOAD PROFILE
// -----------------------------------------------------------------------------
// Full profile: gradual staged ramp so ALB / ASG behavior can be observed as
// traffic climbs, rather than a single jump to peak VUs.
// This is the shorter "first full run" shape (~21 min at 3,000 VUs) — good
// for an end-to-end validation pass and watching ASG scale-out without
// committing to a long test window. Once this passes cleanly, widen the
// sustain stage (e.g. '10m') for your final performance-validation run.
//
// buildStagedProfile scales this same shape to any peak (e.g. -e
// PEAK_VUS=300 to find the breaking point below 3,000, without editing
// the script) AND any duration (-e RAMP_MIN=1 -e SUSTAIN_MIN=1 for a much
// shorter run). Intermediate targets are proportional fractions of the
// peak: 3% -> 17% -> 33% -> 67% -> 100%, sustained, then ramped down.
function buildStagedProfile(peak, rampMin, sustainMin) {
  const step = (fraction, minutes) => ({
    duration: `${minutes}m`,
    target: Math.max(1, Math.round(peak * fraction)),
  });
  const warmupMin = Math.max(1, Math.round(rampMin * 0.67)); // slightly shorter warm-up stage
  const rampDownMin = Math.max(1, Math.round(rampMin * 0.67));
  return [
    step(0.03, warmupMin), // 1. Warm-up
    step(0.17, rampMin), // 2. Increase
    step(0.33, rampMin), // 3. Increase
    step(0.67, rampMin), // 4. Increase
    step(1.0, rampMin), // 5. Increase to peak
    step(1.0, sustainMin), // 6. Sustain at peak
    { duration: `${rampDownMin}m`, target: 0 }, // 7. Ramp down to 0
  ];
}

const DEFAULT_PEAK_VUS = 3000;
const FULL_STAGES = buildStagedProfile(PEAK_VUS || DEFAULT_PEAK_VUS, RAMP_MIN, SUSTAIN_MIN);

// Smoke-test profile: quick, low-VU sanity check before the full run.
const SMOKE_STAGES = [
  { duration: '20s', target: 5 },
  { duration: '30s', target: 20 },
  { duration: '20s', target: 20 },
  { duration: '15s', target: 0 },
];

const EFFECTIVE_PEAK = IS_SMOKE_TEST ? 20 : (PEAK_VUS || DEFAULT_PEAK_VUS);

export const options = {
  stages: IS_SMOKE_TEST ? SMOKE_STAGES : FULL_STAGES,

  // k6's default summary trend stats don't include p99 — add it explicitly
  // so "p99 latency" in the report is a real computed value, not a fallback.
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],

  thresholds: {
    // p95 HTTP request duration < 2000ms
    http_req_duration: ['p(95)<2000'],
    // Overall HTTP failure rate < 5%
    http_req_failed: ['rate<0.05'],
    overall_http_failure_rate: ['rate<0.05'],
    // Login failure rate < 5%
    login_failure_rate: ['rate<0.05'],
    // API failure rate < 5%
    api_failure_rate: ['rate<0.05'],
  },

  // Abort quickly on catastrophic failure instead of burning the full profile.
  // (Comment out if you want the test to run to completion regardless.)
  // discardResponseBodies: true reduces k6-side memory/CPU overhead at high VU counts.
  discardResponseBodies: false,
};

// -----------------------------------------------------------------------------
// STAGE / CLOUDWATCH CORRELATION LOGGING
// -----------------------------------------------------------------------------
// Prints a timestamped marker exactly once per approximate stage boundary so
// you can align the k6 console/JSON output with CloudWatch's timeline. This
// does NOT read CloudWatch — it only emits local wall-clock timestamps.
const loggedStages = {};
function logStageOnce(stageName) {
  if (!loggedStages[stageName]) {
    loggedStages[stageName] = true;
    console.log(
      `[STAGE MARKER] ${new Date().toISOString()} — entering stage "${stageName}" (cross-reference with CloudWatch)`
    );
  }
}

// -----------------------------------------------------------------------------
// SETUP — runs once, verifies the target is reachable before VUs spin up
// -----------------------------------------------------------------------------
export function setup() {
  console.log(`[SETUP] ${new Date().toISOString()} — Target ALB: ${BASE_URL}`);
  console.log(`[SETUP] Mode: ${IS_SMOKE_TEST ? 'SMOKE TEST' : `STAGED TEST — peak ${EFFECTIVE_PEAK} VUs`}`);
  console.log(`[SETUP] Role under test: ${ROLE}`);

  // No standalone GET to BASE_URL here on purpose: the frontend/root path
  // may not be served at "/" (and a 404 there wouldn't mean the app is
  // broken). Connectivity is proven by the very first login request each
  // VU makes in default(), which is a real, meaningful application call.

  return { startTime: new Date().toISOString() };
}

// -----------------------------------------------------------------------------
// DEFAULT FUNCTION — executed by every VU, every iteration
// -----------------------------------------------------------------------------
export default function () {
  // Rough stage marker based on elapsed test time vs the configured stages.
  logStageOnce(`vus~${__VU <= 3000 ? 'active' : 'unknown'}`);

  let authToken = null;

  // ---- 1. LOGIN --------------------------------------------------------
  group('login', function () {
    const loginPayload = JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    });

    const loginParams = {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' },
    };

    const res = http.post(`${BASE_URL}${ENDPOINTS.login}`, loginPayload, loginParams);
    loginDuration.add(res.timings.duration);

    const loginOk = check(res, {
      'login status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'login response has body': (r) => !!r.body,
    });

    if (loginOk) {
      successfulLogins.add(1);
      loginFailureRate.add(false);

      // Extract bearer token if present in the response body (in addition to
      // the HTTP-only cookie, which k6's per-VU cookie jar already handles
      // automatically for this session).
      try {
        const body = JSON.parse(res.body);
        if (body && body.token) {
          authToken = body.token;
        } else if (body && body.data && body.data.token) {
          authToken = body.data.token;
        }
      } catch (e) {
        // Non-JSON or unexpected body shape — cookie auth may still work.
      }
    } else {
      failedLogins.add(1);
      loginFailures.add(1);
      loginFailureRate.add(true);
    }

    overallFailureRate.add(res.status >= 400);
    if (res.status >= 400 && res.status < 500) http4xx.add(1);
    if (res.status >= 500) http5xx.add(1);
  });

  sleep(randomThinkTime());

  // ---- 2. AUTHENTICATED API REQUESTS -----------------------------------
  // If login failed outright, still exercise the endpoints to capture the
  // resulting 401/403 behavior as API failures (a real user in this state
  // would also hit these errors), but skip indefinite looping.
  group('authenticated_api_calls', function () {
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    };

    AUTHENTICATED_ENDPOINTS.forEach((endpoint) => {
      const res = http.request(
        endpoint.method,
        `${BASE_URL}${endpoint.path}`,
        null,
        { ...authHeaders, tags: { name: endpoint.name } }
      );

      apiDuration.add(res.timings.duration);

      const apiOk = check(res, {
        [`${endpoint.name} status is 2xx`]: (r) => r.status >= 200 && r.status < 300,
      });

      if (!apiOk) {
        apiFailures.add(1);
        apiFailureRate.add(true);
      } else {
        apiFailureRate.add(false);
      }

      overallFailureRate.add(res.status >= 400);
      if (res.status >= 400 && res.status < 500) http4xx.add(1);
      if (res.status >= 500) http5xx.add(1);

      // Realistic pause between individual API calls, not a tight loop.
      sleep(randomThinkTime());
    });
  });

  // ---- 3. THINK TIME BEFORE NEXT ITERATION ------------------------------
  sleep(randomThinkTime());
}

// Random think time between MIN_THINK_S and MAX_THINK_S seconds, simulating
// realistic user pacing instead of hammering the ALB in a tight loop.
function randomThinkTime() {
  return MIN_THINK_S + Math.random() * (MAX_THINK_S - MIN_THINK_S);
}

// -----------------------------------------------------------------------------
// TEARDOWN
// -----------------------------------------------------------------------------
export function teardown(data) {
  console.log(`[TEARDOWN] ${new Date().toISOString()} — test complete. Started at ${data.startTime}.`);
}

// -----------------------------------------------------------------------------
// CUSTOM SUMMARY OUTPUT
// -----------------------------------------------------------------------------
// Produces:
//   1. Standard k6 text summary (stdout)
//   2. A k6-application-metrics-only JSON file (summary-k6-app-metrics.json)
//   3. A plain-text "report card" with the fields the user needs to fill in
//      by hand from CloudWatch, clearly labeled as NOT measured by k6.
export function handleSummary(data) {
  const m = data.metrics;

  const val = (name, stat, fallback = 'N/A') =>
    m[name] && m[name].values && m[name].values[stat] !== undefined
      ? m[name].values[stat]
      : fallback;

  const passFail = (thresholdName) => {
    const t = m[thresholdName];
    if (!t || !t.thresholds) return 'N/A';
    const results = Object.values(t.thresholds).map((th) => (th.ok ? 'PASS' : 'FAIL'));
    return results.includes('FAIL') ? 'FAIL' : 'PASS';
  };

  const reportLines = [
    '=============================================================',
    ' XEBIA-LMS LOAD TEST — APPLICATION METRICS (measured by k6)',
    '=============================================================',
    ` Mode:                    ${IS_SMOKE_TEST ? 'SMOKE TEST' : `STAGED TEST — peak ${EFFECTIVE_PEAK} VUs`}`,
    ` Target (ALB):            ${BASE_URL}`,
    ` Role tested:             ${ROLE}`,
    '-------------------------------------------------------------',
    ` Peak VUs:                ${val('vus_max', 'max')}`,
    ` Total requests:          ${val('http_reqs', 'count', 0)}`,
    ` Requests/sec:            ${Number(val('http_reqs', 'rate', 0)).toFixed(2)}`,
    ` Avg response time (ms):  ${Number(val('http_req_duration', 'avg', 0)).toFixed(2)}`,
    ` p90 latency (ms):        ${Number(val('http_req_duration', 'p(90)', 0)).toFixed(2)}`,
    ` p95 latency (ms):        ${Number(val('http_req_duration', 'p(95)', 0)).toFixed(2)}`,
    ` p99 latency (ms):        ${Number(val('http_req_duration', 'p(99)', 0)).toFixed(2)}`,
    ` Max latency (ms):        ${Number(val('http_req_duration', 'max', 0)).toFixed(2)}`,
    ` HTTP failure rate:       ${(Number(val('http_req_failed', 'rate', 0)) * 100).toFixed(2)}%`,
    // Counter metrics that were never incremented (e.g. zero 4XX/5XX responses,
    // zero failed logins) don't appear in k6's summary data at all — default
    // those to 0 rather than "N/A", since 0 is the true value in that case.
    ` HTTP 4XX responses:      ${val('http_4xx_responses', 'count', 0)}`,
    ` HTTP 5XX responses:      ${val('http_5xx_responses', 'count', 0)}`,
    ` Successful logins:       ${val('successful_logins', 'count', 0)}`,
    ` Failed logins:           ${val('failed_logins', 'count', 0)}`,
    ` Login failure rate:      ${(Number(val('login_failure_rate', 'rate', 0)) * 100).toFixed(2)}%`,
    ` API failures:            ${val('api_failures', 'count', 0)}`,
    ` API failure rate:        ${(Number(val('api_failure_rate', 'rate', 0)) * 100).toFixed(2)}%`,
    '-------------------------------------------------------------',
    ' THRESHOLD RESULTS',
    '-------------------------------------------------------------',
    ` p95 < 2000ms:            ${passFail('http_req_duration')}`,
    ` HTTP failure < 5%:       ${passFail('http_req_failed')}`,
    ` Login failure < 5%:      ${passFail('login_failure_rate')}`,
    ` API failure < 5%:        ${passFail('api_failure_rate')}`,
    '=============================================================',
  ];

  const reportText = reportLines.join('\n');

  return {
    // 1. Standard k6 summary to stdout
    stdout: textSummary(data, { indent: ' ', enableColors: true }) + '\n\n' + reportText + '\n',
    // 2. Full raw metrics as JSON (all k6 + custom metrics)
    'summary-full.json': JSON.stringify(data, null, 2),
    // 3. Just the human-readable report card as its own text file
    'summary-report.txt': reportText,
  };
}

/**
 * =============================================================================
 * NOTE: this script only measures application-level results (via k6). It does
 * not call any AWS API or read CloudWatch. If you want to correlate results
 * against infrastructure metrics (EC2 CPU, ASG scaling, ALB, RDS, Redis),
 * cross-reference the [SETUP]/[TEARDOWN] timestamps printed above against
 * your AWS CloudWatch console separately.
 * =============================================================================
 */