---
name: shipping-and-launch
description: Prepares production launches. Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
---

# Shipping and Launch

## Overview

Ship with confidence. Every launch should be reversible, observable, and incremental.

## The Pre-Launch Checklist

- [ ] All tests pass (unit, integration, e2e)
- [ ] Build succeeds with no warnings
- [ ] No secrets in code or version control
- [ ] `npm audit` shows no critical or high vulnerabilities
- [ ] Core Web Vitals within "Good" thresholds
- [ ] Environment variables set in production
- [ ] Rollback plan documented
- [ ] Monitoring dashboards set up

## Staged Rollout

1. Deploy to staging
2. Deploy to production (feature flag OFF)
3. Enable for team (flag ON for internal users)
4. Canary rollout (5% of users)
5. Gradual increase (25% → 50% → 100%)
6. Full rollout

## Verification

Before deploying:

- [ ] Pre-launch checklist completed
- [ ] Feature flag configured (if applicable)
- [ ] Rollback plan documented
- [ ] Team notified of deployment
