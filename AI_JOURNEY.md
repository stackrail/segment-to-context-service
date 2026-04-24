## Overview

This document outlines how I used AI-assisted development tools (Claude / Cursor-style workflow + ChatGPT) to design and implement the Segment-to-Context system.

The goal was not to blindly generate code, but to use AI as a collaborative engineering partner for:

- system design decisions
- backend architecture scaffolding
- debugging and environment setup
- iterative refinement of a distributed event-driven system

---

## 1. AI-Assisted System Design Prompting

### Prompt 1: Architecture Design (Event Pipeline)

**Prompt used:**

> "Design a scalable event ingestion system using Node.js, Pub/Sub, PostgreSQL, and a worker that generates user personas from event streams."

**Outcome from AI:**

- Express ingestion API
- Pub/Sub for buffering and decoupling
- Async worker for processing events
- PostgreSQL for persistence
- Separation of raw events vs derived context

**My contribution:**

- Introduced strict multi-tenant isolation (`tenant_id`)
- Added idempotency constraint at database level
- Refactored LLM step into a modular, replaceable service layer

---

### Prompt 2: Idempotency Strategy

**Prompt used:**

> "How do I ensure idempotent event processing in a Pub/Sub + PostgreSQL system?"

**Outcome from AI:**

- UNIQUE constraint on (event_id, tenant_id)
- Retry-safe worker design
- Handling PostgreSQL duplicate error (23505)

**My refinement:**

- Enforced idempotency at database layer (not application logic)
- Ensured worker gracefully ignores duplicates without retry loops or cascading failures

---

### Prompt 3: Context Aggregation Logic

**Prompt used:**

> "Design a worker that aggregates last 50 user events and prepares data for LLM persona generation."

**Outcome from AI:**

- `getLastEvents` query
- worker-based aggregation pipeline
- separation between ingestion and intelligence layers

**My contribution:**

- Made aggregation non-fatal (fail-safe isolation)
- Structured pipeline into clear stages:
  1. persist event
  2. aggregate history
  3. generate persona (LLM-ready layer)

---

## 2. AI Hallucination / Incorrect Suggestion Encountered

### Issue

AI initially suggested storing `signals` as `TEXT[]` in PostgreSQL while simultaneously treating them as structured JSON objects in application logic.

### Problem

This caused a schema mismatch between:

- Database layer (`TEXT[]`)
- Application layer (structured JSON / objects)

### Fix

I resolved this by:

- standardizing `signals` to `JSONB`
- aligning schema with event-driven + LLM-ready design
- ensuring future extensibility for structured persona outputs

---

## 3. Debugging with AI Assistance

### Issue: PostgreSQL authentication failure

Error:

### AI-assisted debugging steps:

- Verified PostgreSQL user configuration
- Checked `.env` variable consistency
- Reviewed `pg_hba.conf` authentication rules

### Resolution:

- Reset PostgreSQL credentials
- Fixed environment variable mismatch between system and app config

---

## 4. Iterative Development Workflow

Instead of building the system top-down, I used an incremental AI-assisted approach:

1. Scaffold Express API
2. Introduce Pub/Sub abstraction layer
3. Implement worker processing pipeline
4. Add PostgreSQL persistence layer
5. Build aggregation logic (last 50 events)
6. Add persona generation layer (LLM-ready structure)
7. Expose `/context` API endpoint

Each stage was validated using:

- integration tests
- curl-based API checks
- structured logging from worker pipeline

---

## 5. Key Learnings

- AI is effective for scaffolding but requires strict human validation for consistency
- Database schema design must be finalized before deep business logic implementation
- Idempotency must be enforced at the storage layer, not the application layer
- Event-driven systems require strict separation between ingestion, processing, and derivation layers
- Failure isolation is critical in distributed worker-based architectures

---

## 6. Final Reflection

This project demonstrates my ability to:

- design event-driven distributed systems
- integrate AI tools as engineering accelerators (not replacements)
- debug multi-layer backend infrastructure
- maintain consistency across API, worker, and database layers
- build production-oriented system design thinking under constraints

The key takeaway is not just implementation, but disciplined collaboration with AI while preserving architectural ownership and engineering rigor.
