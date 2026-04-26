---
description: Run the pre-launch checklist and produce a go/no-go decision with a rollback plan
mode: ask
---

Run a pre-launch review of the current change and produce a single **GO / NO-GO** decision.

## Step 1 — Code quality review
Apply the five-axis review framework (correctness, readability, architecture, security, performance) to the staged changes or recent commits.

## Step 2 — Security audit
Check for OWASP Top 10 issues, secrets in code, auth/authz gaps, and dependency vulnerabilities (`npm audit`).

## Step 3 — Test coverage analysis
Identify gaps in test coverage: happy path, edge cases, error paths. Run: `node --import tsx/esm --test src/*.test.ts`

## Step 4 — Pre-launch checklist
- [ ] All tests pass
- [ ] Build succeeds with no warnings (`npm run build`)
- [ ] No secrets committed
- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] Environment variables / config documented
- [ ] Rollback plan defined

## Step 5 — Decision

Produce this output:

```markdown
## Ship Decision: GO | NO-GO

### Blockers (must fix before ship)
### Recommended fixes (should fix before ship)
### Acknowledged risks
### Rollback plan
- Trigger conditions:
- Rollback procedure:
- Recovery time objective:
```

If any Critical finding exists, default to **NO-GO** unless the risk is explicitly accepted.

#file:.github/agents/code-reviewer.md
#file:.github/agents/security-auditor.md
#file:.github/agents/test-engineer.md
#file:.github/skills/shipping-and-launch/SKILL.md
#file:.github/skills/security-and-hardening/SKILL.md
