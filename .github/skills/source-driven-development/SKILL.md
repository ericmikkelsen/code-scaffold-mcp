---
name: source-driven-development
description: Grounds every implementation decision in official documentation. Use when you want authoritative, source-cited code free from outdated patterns.
---

# Source-Driven Development

## Overview

Every framework-specific code decision must be backed by official documentation. Don't implement from memory — verify, cite, and let the user see your sources.

## The Process

```
DETECT → FETCH → IMPLEMENT → CITE
```

1. **Detect Stack and Versions** — Read the project's dependency file.
2. **Fetch Official Documentation** — The specific page for the feature you're implementing.
3. **Implement Following Documented Patterns** — Use the API signatures from the docs.
4. **Cite Your Sources** — Every framework-specific pattern gets a citation.

## Source Hierarchy

1. Official documentation
2. Official blog / changelog
3. Web standards references (MDN, web.dev)
4. Browser/runtime compatibility (caniuse.com)

**Not authoritative:** Stack Overflow, blog posts, AI-generated summaries.

## Verification

After implementing with source-driven development:

- [ ] Framework and library versions were identified from the dependency file
- [ ] Official documentation was fetched for framework-specific patterns
- [ ] Code follows the patterns shown in the current version's documentation
- [ ] Non-trivial decisions include source citations with full URLs
- [ ] No deprecated APIs are used
