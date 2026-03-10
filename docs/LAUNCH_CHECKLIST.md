# Sanshou Production Launch Checklist

Use this checklist before and after deploying to production.

## Pre-launch (staging)

- [ ] **Smoke tests**: Run against staging URL.
  ```bash
  SMOKE_BASE_URL=https://your-staging-url.up.railway.app npm run smoke
  ```
- [ ] **Payment drill – course**: Enroll in a paid course using Stripe test card `4242 4242 4242 4242`. Confirm enrollment appears in Journey and course content is unlocked.
- [ ] **Payment drill – booking**: Create a trainer session booking and complete Stripe checkout. Confirm booking status becomes "confirmed" and success page shows "Session booked!" with CTA.
- [ ] **Auth**: Sign in with email and (if configured) Google. Confirm protected routes (e.g. `/journey`, `/profile`) work and redirect to login when signed out.
- [ ] **Env**: Ensure production env has `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`. Run `npm run validate-env` (with vars set) before first deploy.

## Health and readiness

- **Liveness** (no secrets): `GET /api/health/live` — use for load balancer or container liveness. Returns `{ ok: true }`.
- **Public health**: `GET /api/health` — returns ok and generic check messages (no error details).
- **Protected readiness**: `GET /api/health/ready` with header `x-ready-secret: <READY_CHECK_SECRET>` — returns full diagnostics (DB, Stripe, Cloudinary). Use for internal monitoring only.

## Post-launch monitoring

- [ ] **Availability**: Configure your host (e.g. Railway) or an external monitor to hit `/api/health/live` periodically. Alert on repeated failures.
- [ ] **Errors**: Monitor 5xx rate and auth failures (e.g. via host logs or APM). Investigate spikes.
- [ ] **Payments**: Monitor Stripe Dashboard for failed payments and webhook errors. Ensure `checkout.session.completed` webhook is configured and `/api/payments/webhook` is receiving events.
- [ ] **Readiness** (optional): In a secure context, poll `/api/health/ready` with `READY_CHECK_SECRET` and alert if `ok` is false.

## CI

- Lint and build run on every push/PR to `main`. Smoke runs after build with a MongoDB service; ensure branch protection requires CI to pass before merge if desired.
