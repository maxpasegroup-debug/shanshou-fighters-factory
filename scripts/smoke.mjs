const BASE_URL = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 15000);

function withTimeout(promise, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${TIMEOUT_MS}ms: ${label}`)), TIMEOUT_MS),
  );
  return Promise.race([promise, timeout]);
}

async function request(path, init = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await withTimeout(fetch(url, init), `${init.method || "GET"} ${path}`);
  return response;
}

function pass(name, details = "") {
  console.log(`PASS ${name}${details ? ` - ${details}` : ""}`);
}

function fail(name, details = "") {
  console.error(`FAIL ${name}${details ? ` - ${details}` : ""}`);
}

async function checkPublicPages() {
  const pages = ["/", "/home", "/dashboard/training", "/journey", "/login", "/register", "/health"];
  let ok = true;

  for (const path of pages) {
    try {
      const response = await request(path);
      if (response.status >= 200 && response.status < 400) {
        pass(`Page ${path}`, `status ${response.status}`);
      } else {
        ok = false;
        fail(`Page ${path}`, `unexpected status ${response.status}`);
      }
    } catch (error) {
      ok = false;
      fail(`Page ${path}`, String(error));
    }
  }

  return ok;
}

async function checkApiHealth() {
  try {
    const response = await request("/api/health");
    if (!response.ok) {
      fail("/api/health", `status ${response.status}`);
      return false;
    }
    const json = await response.json();
    const healthy = Boolean(json?.checks?.database?.ok);
    if (!healthy) {
      fail("/api/health", "database check not healthy");
      return false;
    }
    pass("/api/health", "database reachable");
    return true;
  } catch (error) {
    fail("/api/health", String(error));
    return false;
  }
}

async function checkPublicApis() {
  const endpoints = ["/api/courses", "/api/trainers"];
  let ok = true;

  for (const path of endpoints) {
    try {
      const response = await request(path);
      if (!response.ok) {
        ok = false;
        fail(path, `status ${response.status}`);
        continue;
      }
      const json = await response.json();
      if (!Array.isArray(json)) {
        ok = false;
        fail(path, "response is not an array");
        continue;
      }
      pass(path, `items ${json.length}`);
    } catch (error) {
      ok = false;
      fail(path, String(error));
    }
  }

  return ok;
}

async function checkCoursePayloads() {
  try {
    const coursesRes = await request("/api/courses");
    if (!coursesRes.ok) {
      fail("Course payload checks", `cannot fetch courses (${coursesRes.status})`);
      return false;
    }
    const courses = await coursesRes.json();
    if (!Array.isArray(courses) || courses.length === 0) {
      pass("Course payload checks", "no course data found, skipping deep checks");
      return true;
    }

    const first = courses[0];
    const courseId = first?._id;
    if (!courseId) {
      fail("Course payload checks", "missing _id in first course");
      return false;
    }

    const detailRes = await request(`/api/courses/${courseId}`);
    if (!detailRes.ok) {
      fail("Course detail API", `status ${detailRes.status}`);
      return false;
    }

    const detailJson = await detailRes.json();
    const hasCourse = Boolean(detailJson?.course);
    const hasLessons = Array.isArray(detailJson?.lessons);
    if (hasCourse && hasLessons) {
      pass("Course detail API", `course ${courseId}, lessons ${detailJson.lessons.length}`);
      return true;
    }

    fail("Course detail API", "invalid payload shape");
    return false;
  } catch (error) {
    fail("Course payload checks", String(error));
    return false;
  }
}

async function checkProtectedRedirects() {
  const protectedPages = ["/admin", "/trainer/dashboard"];
  let ok = true;

  for (const path of protectedPages) {
    try {
      const response = await request(path, { redirect: "manual" });
      const redirected = response.status >= 300 && response.status < 400;
      if (!redirected) {
        ok = false;
        fail(`Protected ${path}`, `expected redirect, got ${response.status}`);
        continue;
      }

      const location = response.headers.get("location") || "";
      if (!location.includes("/login")) {
        ok = false;
        fail(`Protected ${path}`, `redirect location was "${location}"`);
        continue;
      }
      pass(`Protected ${path}`, `redirects to ${location}`);
    } catch (error) {
      ok = false;
      fail(`Protected ${path}`, String(error));
    }
  }

  return ok;
}

async function main() {
  console.log(`Running smoke tests against ${BASE_URL}`);

  const checks = await Promise.all([
    checkPublicPages(),
    checkApiHealth(),
    checkPublicApis(),
    checkCoursePayloads(),
    checkProtectedRedirects(),
  ]);

  const passed = checks.every(Boolean);
  if (!passed) {
    console.error("");
    console.error("Smoke test suite failed.");
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Smoke test suite passed.");
}

main().catch((error) => {
  console.error("Unexpected smoke test error:", error);
  process.exitCode = 1;
});
