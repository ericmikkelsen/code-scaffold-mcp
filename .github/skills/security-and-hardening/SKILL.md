---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations.
---

# Security and Hardening

## Overview

Security-first development practices. Treat every external input as hostile, every secret as sacred, and every authorization check as mandatory.

## The Three-Tier Boundary System

### Always Do (No Exceptions)

- **Validate all external input** at the system boundary
- **Parameterize all database queries**
- **Encode output** to prevent XSS
- **Hash passwords** with bcrypt/scrypt/argon2
- **Never commit secrets** to version control

### Ask First (Requires Human Approval)

- Adding new authentication flows
- Storing new categories of sensitive data
- Adding new external service integrations

### Never Do

- Never commit secrets to version control
- Never log sensitive data
- Never trust client-side validation as a security boundary
- Never use `eval()` or `innerHTML` with user-provided data

## Verification

After implementing security-relevant code:

- [ ] `npm audit` shows no critical or high vulnerabilities
- [ ] No secrets in source code or git history
- [ ] All user input validated at system boundaries
- [ ] Authentication and authorization checked on every protected endpoint
- [ ] Error responses don't expose internal details
