#!/usr/bin/env node
/**
 * Optional env validation for production/CI.
 * With BUILD_ONLY=1 skips checks (for lint/build without DB).
 * Otherwise requires MONGODB_URI and NEXTAUTH_SECRET for production-style checks.
 */
const BUILD_ONLY = process.env.BUILD_ONLY === "1";

if (BUILD_ONLY) {
  console.log("BUILD_ONLY=1: skipping runtime env validation");
  process.exit(0);
}

const required = ["MONGODB_URI", "NEXTAUTH_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing required env:", missing.join(", "));
  process.exit(1);
}
console.log("Env validation passed");
process.exit(0);
