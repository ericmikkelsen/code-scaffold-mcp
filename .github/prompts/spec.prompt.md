---
description: Start spec-driven development — write a structured specification before writing code
mode: ask
---

Begin spec-driven development. Ask me clarifying questions before writing anything, then generate a structured specification.

**Questions to ask first:**
1. What is the objective and who are the target users?
2. What are the core features and acceptance criteria?
3. Are there tech stack preferences or constraints beyond this repo's existing choices (TypeScript, ESM, `node:test`)?
4. What are the boundaries — what should this always do, ask about first, or never do?

**Then generate a spec covering:**
1. **Objective** — what problem this solves and for whom
2. **Commands / API** — the public interface (function signatures, CLI, MCP tool names, etc.)
3. **Project structure** — new files and directories needed
4. **Code style** — conventions to follow (from `AGENTS.md`)
5. **Testing strategy** — what to test and how
6. **Boundaries** — explicit "always / ask / never" rules

Save the spec as `SPEC.md` in the project root and confirm with me before any code is written.

#file:.github/skills/spec-driven-development/SKILL.md
#file:.github/skills/api-and-interface-design/SKILL.md
