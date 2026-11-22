# ReelVault — Technical Topics & Learning Roadmap

A curated index of all core technical concepts, architectural patterns, and engineering topics used throughout the ReelVault project. Use this checklist as a study guide, interview refresher, or deeper-learning roadmap.

---

### 1. Architecture & System Design
- Modular Monolith Architecture
- Layered Architecture (Controller-Service-Repository Pattern)
- API-First (Contract-First) Design
- Separation of Concerns & Single Responsibility Principle
- Protocol-Agnostic Business Logic

### 2. API Design & HTTP Standards
- RESTful Resource Modeling
- OpenAPI 3.1.0 Specification & Swagger UI
- HTTP Methods Semantics (`GET`, `POST`, `PATCH`, `DELETE`)
- HTTP Status Codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`)
- Shallow Resource Routing (Nested vs. Flat Routes)
- Sub-Resource Routing for Many-to-Many Relationships
- Offset-Based Pagination vs. Keyset/Cursor-Based Pagination
- Idempotent API Design (Safe Duplicate Submissions)
- Uniform Error Response Formatting

### 3. Authentication, Security & Cryptography
- Stateless JWT (JSON Web Tokens) vs. Stateful Sessions
- Dual-Token Architecture: Short-Lived Access Tokens (15m) + Long-Lived Refresh Tokens (7d)
- Refresh Token Rotation (RTR) & Session Revocation
- Opaque Tokens: Cryptographic Random Bytes (`crypto.randomBytes`)
- Token Storage: SHA-256 Hashing for Stored Refresh Tokens
- Password Hashing: Argon2id (Memory-hard algorithms vs. Bcrypt / PBKDF2)
- RFC 5321 Email Validation & Address Length Constraints
- The Ghost Token / Dangling JWT Problem
- Insecure Direct Object Reference (IDOR) Prevention
- Multi-Tenant Relational Authorization & Data Isolation
- Defense-in-Depth Principle
- Security Headers (Helmet.js)
- Cross-Origin Resource Sharing (CORS) & Preflight Handling

### 4. Database Modeling & Relational Databases (PostgreSQL & Prisma)
- Relational Schema Design (1:1, 1:N, M:N)
- Junction / Association Tables (`ReelCategory`, `CollectionReel`)
- Database Constraints (`PRIMARY KEY`, `UNIQUE`, Composite Unique Constraints)
- Foreign Key Constraints & Engine-Level `ON DELETE CASCADE`
- Indexing Strategies: B-Tree Indexes & Composite Indexes
- Explicit Field Projection (`SELECT` vs. In-Memory Sanitization)
- Database Transactions (`$transaction`) & Preventing Phantom Reads
- Database Driver Adapters (`@prisma/adapter-pg` & Connection Pooling)
- Database Migrations & Schema Drift Management

### 5. Data Ingestion & String Processing
- URL Normalization & Canonicalization
- Regular Expressions for URL Parsing & Group Extraction
- Instagram Shortcode Extraction (`/reel/`, `/reels/`, `/p/`)
- Stripping Tracking Parameters (`utm_*`, `igsh`, query fragments)
- Idempotent Deduplication at Database Ingestion
- ZIP File Stream Processing (Instagram Export Ingestion)

### 6. Node.js & TypeScript Mastery
- Node.js Event Loop & Asynchronous I/O
- ECMAScript Modules (ESM) in Node.js (`type: "module"`)
- TypeScript Strict Mode Configuration
- TypeScript `exactOptionalPropertyTypes` & Soundness
- TypeScript `NodeNext` Module Resolution & Verbatim Module Syntax
- TypeScript Declaration Merging (Extending `Express.Request`)
- Runtime Schema Validation & Static Type Inference (Zod)
- Custom Domain Errors vs. Generic JavaScript Errors

### 7. Background Jobs & Caching (BullMQ & Redis)
- Message Queues & Distributed Job Processing (BullMQ)
- Redis Data Structures & In-Memory Storage
- Asynchronous Job Lifecycle: Queued, Active, Completed, Failed
- Exponential Backoff & Retry Strategies
- Decoupling Heavy Ingestion from HTTP Request-Response Lifecycles

### 8. Testing & Quality Assurance
- Automated Integration Testing with Vitest
- End-to-End API Testing with Postman
- Test Database Isolation & Teardown
- Testing Edge Cases: Ghost Tokens, Concurrent Duplicates, Cross-Tenant Access
