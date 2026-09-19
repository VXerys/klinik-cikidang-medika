# Incident Recovery Runbook

## Incident Classification

| Severity | Definition | Response expectation |
|---|---|---|
| P0 | Database down, data loss | Immediate owner escalation |
| P1 | Auth broken, billing incorrect | Prioritize before normal feature work |
| P2 | UI bug, slow queries | Schedule corrective work |

## First Response

1. Confirm impact and affected environment.
2. Check Supabase dashboard status for database or auth outages.
3. Check Vercel deployment logs for application errors.
4. Preserve evidence and correlation identifiers.
5. Stop destructive or amplifying operations.
6. Decide rollback, disablement, or forward fix.
7. Communicate current facts without speculation.

## Evidence

- Start time: [Record Time]
- Detected by: [User Report / Logs]
- Affected release: [Vercel Deployment ID / Commit]
- Symptoms: [Describe Issue]
- Logs or metrics: [Links to Vercel Logs / Supabase Dashboard]

## Recovery

To recover from a bad deployment:
1. Access the Vercel dashboard and redeploy the last known good commit.

To recover from data loss or severe corruption:
1. Restore the database from a Supabase automatic backup via the Supabase dashboard.

## Verification

- Check that the application loads properly (Dashboard).
- Check that critical flows (Auth, Patient Registration, Billing) are operational.
- Verify data integrity matches the pre-incident state or restored backup.

## Follow-Up

- Root cause: [Identify the trigger and underlying flaw]
- Corrective action: [Code or process change]
- Regression test: [Plan to prevent recurrence]
- ADR or architecture impact: Document in `docs/adr/` if the incident reveals an architecture gap.
- Owner and due date: [Assign responsibility]
