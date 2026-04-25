---
name: frontend-ui-engineering
description: Builds production-quality UIs. Use when building or modifying user-facing interfaces. Use when creating components, implementing layouts, managing state, or when the output needs to look and feel production-quality.
---

# Frontend UI Engineering

## Overview

Build production-quality user interfaces that are accessible, performant, and visually polished.

## Avoid the AI Aesthetic

| AI Default | Production Quality |
|---|---|
| Purple/indigo everything | Use the project's actual color palette |
| Excessive gradients | Flat or subtle gradients matching the design system |
| Rounded everything | Consistent border-radius from the design system |
| Lorem ipsum copy | Realistic placeholder content |

## Accessibility (WCAG 2.1 AA)

Every component must meet these standards:
- Keyboard navigation for all interactive elements
- ARIA labels on elements without visible text
- Correct focus management
- Meaningful empty and error states

## Verification

After building UI:

- [ ] Component renders without console errors
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader can convey the page's content and structure
- [ ] Responsive: works at 320px, 768px, 1024px, 1440px
- [ ] Loading, error, and empty states all handled
- [ ] Follows the project's design system
