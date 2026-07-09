# ADR-001: Simple Linear Architecture for Phase 1

## Status

Approved

## Context

MOTU Phase 1 needs to ship a working chat product in 8 sprints. The original architecture proposed an event-driven Orbital Core with satellite modules, which was deemed too complex for initial validation.

## Decision

Use a simple linear architecture for Phase 1:

```
Frontend → FastAPI → Chat Service → Ollama → SQLite
```

No event bus. No module system. No vector database.

## Consequences

### Positive
- Ship fast — working product in 8 sprints
- Lower cognitive load — new team members understand codebase in hours
- Easier to refactor — extracting service layer into event bus is straightforward
- Resource efficient — no background event loop overhead

### Negative
- Will require refactoring when v3 modules arrive
- No semantic search until v2 (ChromaDB)
- No graph memory until v2 (NetworkX)

## Related Revisions

- Revision 1: Orbital Core deferred to v3
- Revision 2: ChromaDB deferred to v2
- Revision 3: NetworkX deferred to v2
