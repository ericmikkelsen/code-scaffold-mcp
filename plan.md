# Project Plan

The library is being built in four phases. Each phase ships as one or more PRs and adds a distinct scaffold target.

| Phase | Scope | Status |
|---|---|---|
| **1. Functions** | `scaffoldFunction` — generates typed function source + `node:test` template for TS and JS targets. | ✅ Done |
| **2. Components** | `scaffoldComponent` — generates UI component skeletons (e.g. React/Vue) with props types and a render stub. | 🔲 Planned |
| **3. Schemas** | `scaffoldSchema` — generates schema definitions (e.g. Zod, JSON Schema) from a field-definition config. | 🔲 Planned |
| **4. MCP Server** | Expose all scaffold generators as an MCP-compliant server so agents can call them over the Model Context Protocol. | 🔲 Planned |
