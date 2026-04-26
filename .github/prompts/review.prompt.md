---
description: Conduct a five-axis code review — correctness, readability, architecture, security, performance
mode: ask
---

Review the current changes (staged diff, recent commits, or the file/PR I specify) across all five axes:

1. **Correctness** — Does it match the spec? Edge cases handled? Tests adequate?
2. **Readability** — Clear names? Straightforward logic? Well-organized?
3. **Architecture** — Follows existing patterns (ESM, `node:test`, no runtime deps)? Clean boundaries? Right abstraction level?
4. **Security** — Input validated? Secrets safe? Auth checked?
5. **Performance** — No unbounded ops? No unnecessary work?

Categorize every finding:
- **Critical** — must fix before merge
- **Important** — should fix before merge
- **Suggestion** — consider for improvement

Output a structured review with specific `file:line` references and concrete fix recommendations. Always include at least one "What's Done Well" observation.

#file:.github/agents/code-reviewer.md
#file:.github/skills/code-review-and-quality/SKILL.md
#file:.github/skills/security-and-hardening/SKILL.md
