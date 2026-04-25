---
name: performance-optimization
description: Optimizes application performance. Use when performance requirements exist, when you suspect performance regressions, or when Core Web Vitals or load times need improvement.
---

# Performance Optimization

## Overview

Measure before optimizing. Performance work without measurement is guessing.

## The Optimization Workflow

1. MEASURE → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX → Address the specific bottleneck
4. VERIFY → Measure again, confirm improvement
5. GUARD → Add monitoring or tests to prevent regression

## Core Web Vitals Targets

| Metric | Good |
|--------|------|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |

## Verification

After any performance-related change:

- [ ] Before and after measurements exist (specific numbers)
- [ ] The specific bottleneck is identified and addressed
- [ ] Core Web Vitals are within "Good" thresholds
- [ ] No N+1 queries in new data fetching code
- [ ] Existing tests still pass
