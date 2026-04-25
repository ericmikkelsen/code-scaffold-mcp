---
name: context-engineering
description: Optimizes agent context setup. Use when starting a new session, when agent output quality degrades, when switching between tasks, or when you need to configure rules files and context for a project.
---

# Context Engineering

## Overview

Feed agents the right information at the right time. Context is the single biggest lever for agent output quality — too little and the agent hallucinates, too much and it loses focus.

## The Context Hierarchy

1. Rules Files (CLAUDE.md, AGENTS.md, etc.) — Always loaded, project-wide
2. Spec / Architecture Docs — Loaded per feature/session
3. Relevant Source Files — Loaded per task
4. Error Output / Test Results — Loaded per iteration
5. Conversation History — Accumulates, compacts

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Context starvation | Agent invents APIs | Load rules file + relevant source files |
| Context flooding | Agent loses focus | Include only what is relevant |
| Stale context | Agent references outdated patterns | Start fresh sessions when context drifts |

## Verification

After setting up context, confirm:

- [ ] Rules file exists and covers tech stack, commands, conventions, and boundaries
- [ ] Agent output follows the patterns shown in the rules file
- [ ] Agent references actual project files and APIs (not hallucinated ones)
- [ ] Context is refreshed when switching between major tasks
