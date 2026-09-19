# Deployment Runbook

## Ownership

- Release owner: Technical Lead / Owner
- Rollback approver: Technical Lead / Owner
- Target environment: Production (Vercel Free Tier)

## Preconditions

- [ ] Included feature verification is complete.
- [ ] Required migrations are reviewed and applied to the production database.
- [ ] Environment configuration is verified in the Vercel Dashboard.
- [ ] Rollback strategy is available (previous deployment).
- [ ] Incident contact is available.

## Deployment

Deployment is automated via Vercel GitHub integration.

1. Connect the GitHub repository in the Vercel dashboard.
2. Set the environment variables in the Vercel dashboard to match `.env.local`.
3. Push to the `main` branch to trigger an automatic deployment.

### Custom Domain Setup

- SSL is auto-provisioned by Vercel (Let's Encrypt).
- To add a custom domain, configure two DNS records from the domain provider:
  - `A` record pointing to Vercel's IP address.
  - `CNAME` record pointing to `cname.vercel-dns.com`.

## Post-Deployment Verification

1. Verify the production dashboard loads successfully.
2. Verify the patient search functionality works as expected.
3. Check Vercel logs for any runtime errors during the initial load.

## Rollback Trigger

Rollback when:

- Critical functionality (auth, billing, patient records) is broken.
- Unhandled exceptions occur on the main user paths.
- Data integrity issues are detected.

## Rollback Procedure

1. Open the Vercel dashboard for the project.
2. Navigate to the **Deployments** tab.
3. Locate the previous known good deployment.
4. Click the options menu and select **Promote to Production** or **Redeploy**.

Data compatibility considerations:

Ensure that any database migrations applied for the failed release are backwards compatible with the rolled-back application code, or perform a reverse database migration.

## Closeout

- [ ] Record release version and commit.
- [ ] Update `../context/PROJECT_STATE.md`.
- [ ] Update roadmap and feature registry.
- [ ] Record incident or limitation when applicable.
