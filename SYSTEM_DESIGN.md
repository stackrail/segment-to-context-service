# Segment-to-Context Service Design

---

## 1. Architecture Overview

Client → Express API (/events)  
↓  
Pub/Sub (events topic)  
↓  
Worker (Cloud Run / Node worker)  
↓  
PostgreSQL (events table)  
↓  
Aggregation Layer (last 50 events)  
↓  
Persona Generation (LLM-ready structure)  
↓  
user_contexts table  
↓  
API (/context)

---

## 2. Design Goals

- Handle high event ingestion throughput
- Ensure data consistency under retries
- Support multi-tenant isolation
- Enable asynchronous processing
- Prepare system for LLM-based enrichment

---

## 3. Why Pub/Sub

Google Cloud Pub/Sub is used to decouple ingestion from processing.

Benefits:

- Handles burst traffic without API failure
- Enables asynchronous processing
- Supports horizontal scaling of workers
- Guarantees at-least-once delivery

---

## 4. Why PostgreSQL

PostgreSQL was chosen for:

- Strong consistency guarantees
- JSONB support for flexible payloads
- Efficient indexing for user queries
- ACID compliance for event integrity

---

## 5. Data Model Design

### Events Table

- Stores raw immutable event data
- Uses JSONB for flexible payload schema
- Enforces idempotency via:
  UNIQUE(event_id, tenant_id)

### User Context Table

- Stores derived user intelligence
- Updated via UPSERT operations
- Represents latest computed persona

---

## 6. Idempotency Strategy

Idempotency is enforced at the database level:

UNIQUE(event_id, tenant_id)

This ensures:

- Duplicate Pub/Sub deliveries do not cause double processing
- Worker retries are safe
- System remains consistent under failure

---

## 7. Worker Processing Pipeline

1. Insert event into database
2. Fetch last 50 events for user
3. Aggregate behavioral context
4. Generate persona structure (LLM-ready)
5. Upsert into user_contexts table

---

## 8. Failure Handling Strategy

- Event insertion failures trigger retries via Pub/Sub
- Aggregation failures are non-fatal
- Persona generation failures do not block ingestion
- Worker reprocessing is safe due to idempotency

---

## 9. Scaling Strategy

### API Layer

- Stateless Express service
- Horizontally scalable via Cloud Run

### Worker Layer

- Scales based on Pub/Sub queue depth
- Multiple workers can process concurrently

### Database Layer

- Indexed on tenant_id and user_id
- Supports high read/write workloads

---

## 10. N+1 Query Analysis

Current design avoids N+1 queries because:

- Only one query per event aggregation
- No nested per-event database calls
- Uses batch retrieval (last 50 events)

Future improvements:

- Redis caching for frequent users
- Precomputed event summaries

---

## 11. Consistency Model

System uses EVENTUAL CONSISTENCY:

- Events are immediately persisted
- Context is computed asynchronously
- Temporary mismatch between events and context is expected

---

## 12. Multi-Tenant Isolation

All queries enforce:

WHERE tenant_id = ?

This guarantees:

- No cross-tenant data leakage
- Logical data separation at query level

---

## 13. Tradeoffs

| Decision                 | Tradeoff                |
| ------------------------ | ----------------------- |
| Pub/Sub async model      | eventual consistency    |
| PostgreSQL over BigQuery | less analytical scaling |
| Mock LLM integration     | not production AI yet   |

---

## 14. Future Improvements

- Replace mock LLM with Vertex AI Gemini 1.5
- Add Redis caching layer
- Add BigQuery streaming pipeline
- Introduce authentication layer (JWT per tenant)
- Add dead-letter queue for failed events

---

## 15. Worker Failure Recovery

If worker fails mid-processing:

- Pub/Sub retries delivery automatically
- Idempotency prevents duplicate inserts
- Worker is stateless and safe to retry

---

## 16. Pub/Sub Retry Strategy

- At-least-once delivery model
- Automatic retry on failure
- Exponential backoff handled by GCP
- Poison messages should be moved to DLQ (future improvement)

---

## 17. LLM Fallback Design

Current system:

- Mock LLM layer (rule-based persona generation)

Future system:

- Primary: Vertex AI Gemini 1.5 Pro
- Fallback: Gemini Flash
- Final fallback: deterministic rule-based generator

Guarantee:

- System never breaks if LLM fails
- Always produces usable context

---

## 18. Conclusion

This system demonstrates:

- Event-driven architecture at scale
- Strong idempotency guarantees
- Multi-tenant safe data modeling
- Async worker processing model
- LLM-ready intelligence pipeline
- Cloud-native scalable backend design
