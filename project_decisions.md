# REELVAULT — PROJECT DECISIONS & DEVELOPMENT DOCUMENT

**Last Updated:** 17 November 2026  
**Project Status:** Backend foundation and user registration completed  
**Current Phase:** Phase 3 — System Design & Implementation

---

# 1. PROJECT OVERVIEW

## 1.1 Problem Statement

People save large numbers of Instagram Reels but often forget about them. Their saved libraries become difficult to search, organize, and revisit.

## 1.2 Product Vision

ReelVault is an application that helps users organize, manage, search, and rediscover their saved Instagram Reels.

## 1.3 Target Audience

Everyone who regularly saves Instagram Reels.

### User Personas

- **Primary — Content Collector:** Saves many Reels but struggles to find them later.
- **Learner:** Saves educational and informative Reels.
- **Action-Oriented User:** Saves Reels containing ideas, tutorials, and things to try.
- **Casual Saver:** Saves interesting content occasionally.

## 1.4 Product Direction

- Android-first application, with iOS planned later.
- Development-first portfolio project.
- Focus on good architecture, security, maintainability, and user experience.
- Avoid premature optimization and unnecessary complexity.
- Build a production-oriented project without prematurely designing for massive scale.

---

# 2. PRODUCT SCOPE

## 2.1 V1 Scope

- Instagram Reels only.
- Android application.
- User authentication.
- Save Reels.
- Organize Reels using categories and collections.
- Search saved Reels.
- Add personal notes.
- Track Reel viewing status.
- Rediscover previously saved content.
- Import Instagram data-export ZIP files.
- Share Reels directly from Instagram to ReelVault.

## 2.2 Reel Ingestion Methods

Three methods will be supported:

1. **Share to App:** Share a Reel from Instagram directly to ReelVault.
2. **Instagram Data Export:** Import previously saved Reels from Instagram's data-export ZIP.
3. **Paste URL:** Manually paste a Reel URL.

Importing older Reels is optional. Users can start with an empty library.

## 2.3 Instagram Platform Limitations

- Do not promise automatic synchronization of Instagram's Saved collection.
- Do not request Instagram passwords.
- Do not scrape private Instagram endpoints or use unofficial private APIs.
- Instagram's official APIs do not provide a dependable way to synchronize a user's personal Saved Reels.
- Reel URLs are the primary records; metadata is optional and editable.
- Do not download or host other creators' videos.
- Play Reels inside ReelVault wherever embedding/playback is supported.
- Otherwise, provide an option to open the original Reel in Instagram.
- Private, deleted, restricted, or region-blocked Reels may not play.

Technical proof-of-concepts are required for:
- Android share-target behavior.
- Instagram export ZIP structure.
- Reel playback and embedding support.

---

# 3. FUNCTIONAL REQUIREMENTS

## 3.1 Authentication

- Register using email and password.
- Login and logout.
- Email verification.
- Password reset.
- Secure password hashing.
- Access-token and refresh-token authentication.
- Session management.
- User account deletion.
- Google Sign-In deferred.

## 3.2 Reel Management

- Save a Reel through sharing, URL paste, or import.
- View saved Reels.
- Edit available metadata.
- Delete individual Reels.
- Track availability.
- Prevent duplicate records.

### Duplicate Prevention

Use a normalized Instagram URL or stable Reel identifier.

Rules:
- A user cannot have duplicate records for the same Reel.
- Different users can save the same Reel.
- Saving an existing Reel again should reuse its record.
- Existing category and collection assignments can be updated.

### Unavailable Reels

If a Reel becomes unavailable:
- Retain its record.
- Retain its URL.
- Retain categories and collections.
- Retain notes and saved date.
- Mark it unavailable.
- Allow users to delete it manually.

## 3.3 Categories

Categories represent the topics of Reels.

Proposed default categories:
- Technology
- Education
- Food
- Fitness
- Travel
- Entertainment
- Shopping
- Others

Requirements:
- Users can create custom categories.
- A Reel can belong to multiple categories.
- Users can add or remove category assignments.
- Category suggestions can be generated from available metadata.
- Users can accept, modify, or reject suggestions.

### Category Selection Flow

1. Save the Reel URL.
2. Retrieve available metadata.
3. Analyze the caption if available.
4. If metadata is insufficient or ambiguous, show a category-selection modal.
5. Allow multiple selections, custom category creation, or skipping.
6. If dismissed, retain the Reel as pending/uncategorized.

The modal should not appear for every Reel.

## 3.4 Collections

Collections are user-created groups based on purpose.

Examples:
- Watch Later
- Project Ideas
- Workout Routine
- Weekend Plans
- Learning Resources

Requirements:
- Users can create custom collections.
- A Reel can belong to multiple collections.
- Categories and collections are separate concepts.

**Categories = What the content is about.**

**Collections = Why the user wants to keep it.**

## 3.5 Notes

- Add notes to saved Reels.
- Edit notes.
- Delete notes.
- Multiple notes per Reel.
- Notes remain private to the user.
- Notes are searchable.

## 3.6 Search and Filtering

Search across:
- Available Reel titles.
- Captions.
- Notes.

Filters:
- Category.
- Reel status.

Sorting:
- Saved date.

Advanced sorting and bulk operations may be considered later.

## 3.7 Reel Status

Supported statuses:

- To Watch
- Watched
- Completed
- Archived

Archived Reels are excluded from rediscovery.

## 3.8 Rediscovery

Purpose: Help users revisit Reels they previously saved.

Decisions:
- Basic rule-based rediscovery in V1.
- No machine-learning recommendations initially.
- Daily rediscovery is the default.
- Weekly/custom schedules are supported.
- Users can disable rediscovery.
- Rediscovery feed remains available even when push notifications are disabled.
- Prioritize older or unvisited Reels.
- Avoid repeatedly showing the same Reels.
- Maintain rediscovery history.

## 3.9 Availability

Check Reel availability when the user opens it rather than continuously monitoring every saved URL.

## 3.10 Notifications

- Push notifications are optional.
- Users can disable notifications.
- Device tokens may be stored for multiple devices.

## 3.11 Import Management

- Validate uploaded ZIP files.
- Extract Reel URLs.
- Prevent duplicates.
- Show import progress and summary.
- Handle failures gracefully.
- Make imports retryable and idempotent.
- Delete uploaded ZIP files after processing.
- Retain imported Reel records and relevant metadata.

---

# 4. FEATURES OUTSIDE V1

The following are intentionally excluded:

- Automatic Instagram Saved synchronization.
- Downloading or hosting other creators' videos.
- AI/ML-based recommendations.
- Social features.
- Initial iOS launch.
- YouTube Shorts and TikTok ingestion.
- Microservices architecture.
- Complex analytics and enterprise features.

---

# 5. REQUIREMENTS ANALYSIS — PHASE 2

**Status: Completed and frozen.**

Completed deliverables:

1. User personas.
2. Use cases.
3. Functional requirements.
4. Non-functional requirements.
5. User journeys.
6. Acceptance criteria.
7. MoSCoW prioritization.
8. SRS draft and review.

## 5.1 MoSCoW Prioritization

### MUST HAVE

- Authentication and password reset.
- Share-to-app and URL paste.
- Instagram export ZIP import.
- Library and pagination.
- Reel playback/fallback.
- Duplicate prevention.
- Categories and custom categories.
- Multiple categories per Reel.
- Collections and custom collections.
- Multiple collections per Reel.
- Search.
- Notes.
- Reel status.
- Basic rediscovery.
- User isolation and security.
- Individual Reel and account deletion.
- Import error handling and idempotency.

### SHOULD HAVE

- Category suggestions.
- Category and status filters.
- Custom rediscovery schedule.
- Rediscovery history.
- Push notifications.
- Import progress and summary.
- Unavailable-Reel indicator.

### COULD HAVE

- Advanced sorting.
- Bulk operations.
- Recommendation explanations.
- Dashboard insights.
- Library export.
- Other platforms.

### WON'T HAVE IN V1

- Automatic Saved synchronization.
- Downloading/hosting videos.
- AI recommendations.
- Social features.
- Initial iOS launch.
- Other platforms.
- Microservices.
- Enterprise analytics.

## 5.2 Non-Functional Requirements

### Security
- Secure password hashing.
- Authentication and session validation.
- Authorization.
- User-data isolation.
- HTTPS.
- Secret management.
- Input validation.
- Rate limiting.
- Safe logging.

### Reliability
- Graceful error handling.
- Retryable imports.
- Idempotent operations.
- Database integrity.

### Performance
- Support growth to thousands of Reels per user.
- Pagination for large libraries.
- Appropriate database indexes.
- Background jobs for long-running tasks.

### Maintainability
- Modular TypeScript architecture.
- API documentation.
- Unit and integration tests.
- CI pipeline.

### Privacy
- Data minimization.
- Temporary ZIP deletion.
- Account deletion.
- No Instagram password storage.

Specific production performance and uptime targets will be defined later.

---

# 6. SYSTEM ARCHITECTURE

## 6.1 Architecture Decision

**Modular Monolith**

One deployable backend application divided into independent logical modules.

Reasons:
- Easier development and debugging.
- Less infrastructure complexity.
- Clear separation of responsibilities.
- Easier testing and maintenance.
- Can evolve into distributed services if actual requirements justify it.

Microservices are not required for V1.

## 6.2 Technology Stack

### Mobile Application
- React Native.
- Expo.
- TypeScript.
- Android first.

### Backend
- Node.js.
- Express.js.
- TypeScript.
- REST APIs.

Express was explicitly selected instead of Fastify.

### Database
- PostgreSQL.
- Prisma ORM.

PostgreSQL was chosen because ReelVault has relational entities, many-to-many relationships, ownership constraints, and transactional requirements.

### Database Connection
- Prisma 7.
- pg Node.js driver.
- @prisma/adapter-pg.
- PrismaPg adapter.

Prisma 7 requires the driver adapter configuration used in this project.

### Background Jobs
- Redis.
- BullMQ.

Intended use:
- ZIP import processing.
- Long-running asynchronous tasks.
- Future notification jobs.

### API Documentation
- OpenAPI.
- Swagger UI.

### Testing
- Vitest.
- Unit tests.
- Integration tests.

### Development and Deployment Tools
- Git.
- GitHub.
- Docker.
- Docker Compose.
- GitHub Actions (planned).
- Sentry and structured logging (planned).

---

# 7. BACKEND ARCHITECTURE

## 7.1 Module Structure

Each backend feature follows this structure:

- routes — endpoint definitions.
- controller — HTTP request and response handling.
- service — business logic.
- repository — database operations.
- validation — input validation.
- types — TypeScript types.

## 7.2 Intended Backend Folder Structure

backend/

    src/
        modules/
            auth/
            users/
            reels/
            categories/
            collections/
            notes/
            search/
            rediscovery/
            imports/
            notifications/

        middleware/
        config/
        database/
        queues/
        workers/
        utils/
        types/

        app.ts
        server.ts

    prisma/
        schema.prisma
        migrations/

    tests/

    .env.example
    prisma.config.ts
    package.json
    tsconfig.json

## 7.3 Intended Mobile Folder Structure

mobile/

    src/
        components/
        screens/
        navigation/

        features/
            auth/
            reels/
            categories/
            collections/
            search/
            rediscovery/

        hooks/
        services/
        store/
        utils/
        types/

    assets/
    app.json
    package.json

## 7.4 Documentation Structure

docs/

    SRS.md
    architecture.md
    database-design.md
    API.md

---

# 8. DATABASE DESIGN

## 8.1 Database Design Lifecycle

The design followed this process:

1. Requirements analysis.
2. Conceptual ERD.
3. Logical database design.
4. Normalization and refinement.
5. Physical database design.
6. Index and constraint design.
7. Prisma implementation.
8. Migrations and testing.

## 8.2 Planned Entities

The database contains 13 planned entities:

1. User
2. Reel
3. Category
4. ReelCategory
5. Collection
6. CollectionReel
7. Note
8. ImportBatch
9. RediscoveryHistory
10. UserPreference
11. Device
12. AuthSession
13. AuthToken

## 8.3 Important Relationships

- User has many Reels.
- User has many Categories.
- User has many Collections.
- Reel belongs to one User.
- Reel has many Notes.
- Reel and Category have a many-to-many relationship through ReelCategory.
- Reel and Collection have a many-to-many relationship through CollectionReel.
- User has one UserPreference.
- User has many Devices.
- Device can have many AuthSessions.
- AuthSession may optionally reference a Device.
- User has many ImportBatches.
- User has many RediscoveryHistory records.
- User has many AuthSessions and AuthTokens.

## 8.4 Why Junction Tables Are Needed

### ReelCategory

A Reel can belong to many Categories, and a Category can contain many Reels.

Therefore, ReelCategory stores the associations.

### CollectionReel

A Reel can belong to multiple Collections, and a Collection can contain multiple Reels.

Therefore, CollectionReel stores the associations.

These are not unnecessary tables. They correctly represent many-to-many relationships and allow additional constraints.

## 8.5 Data Integrity and Ownership

- User-owned records use foreign keys to User.
- Deleting a User cascades to their owned records.
- Deleting a Reel cascades to its Notes and association/history records.
- Deleting a Category or Collection removes its association records, not the Reels.
- Composite foreign keys enforce same-user ownership for ReelCategory and CollectionReel.
- AuthSession can reference a Device owned by the same User.

## 8.6 Normalization

### First Normal Form (1NF)
- Store atomic values.
- Avoid lists of Reel URLs or category names inside a single database field.
- Use separate records and relationship tables.

### Second Normal Form (2NF)
- Avoid partial dependencies on composite keys.
- Store Category and Collection information in their own tables.

### Third Normal Form (3NF)
- Avoid inappropriate transitive dependencies.
- Do not duplicate descriptive information that belongs to another entity.

## 8.7 Physical Database Decisions

- UUID identifiers.
- VARCHAR and TEXT.
- PostgreSQL enums.
- INTEGER.
- BOOLEAN.
- TIMESTAMPTZ.
- JSONB where flexible structured preferences are needed.

## 8.8 Planned Indexes

- Reel(userId, savedAt)
- Reel(userId, status, savedAt)
- ReelCategory(categoryId, reelId)
- CollectionReel(collectionId, reelId)
- Note(reelId, createdAt)
- ImportBatch(userId, createdAt)
- RediscoveryHistory(userId, shownAt)
- Device(userId)
- AuthSession(userId, expiresAt)

## 8.9 Important Unique Constraints

- User.email
- Reel(userId, normalizedUrl)
- Category(userId, name)
- Collection(userId, name)
- Junction table composite primary keys.
- Device.pushToken.
- AuthSession.refreshTokenHash.
- AuthToken.tokenHash.

Case-insensitive uniqueness for Category and Collection names requires PostgreSQL expression indexes using LOWER(name), if retained.

---

# 9. LOCAL DEVELOPMENT ENVIRONMENT

## 9.1 Environment

- Operating System: Windows.
- Project location: E:\reel_vault
- Backend location: E:\reel_vault\backend
- Terminal: PowerShell.
- Container runtime: Docker Desktop.

## 9.2 Docker Services

### PostgreSQL
- Container: reelvault-postgres
- Image: postgres:18-alpine
- Database: reelvault
- User: reelvault
- Port: 5432

### Redis
- Container: reelvault-redis
- Image: redis:8-alpine
- Port: 6379

Both services were previously confirmed healthy.

## 9.3 Environment Variables

The backend uses:

- DATABASE_URL
- REDIS_URL
- PORT
- NODE_ENV

Actual credentials and secrets belong in `.env` only.

`.env.example` should contain placeholders, never actual credentials.

## 9.4 Important Troubleshooting History

A Windows PostgreSQL service was competing with Docker PostgreSQL for port 5432.

This caused Prisma P1000 connection/authentication errors.

The local Windows PostgreSQL service was stopped. Docker PostgreSQL is the intended database.

Do not repeat password-reset troubleshooting unless new evidence indicates a credential issue.

## 9.5 GitHub and Security

- Git repository initialized.
- Project pushed to GitHub.
- `.env` must never be committed.
- Exclude node_modules, dist, coverage, and generated Prisma client.
- Commit Prisma schema and migrations.
- Inspect `git status` before committing.

---

# 10. IMPLEMENTATION PROGRESS

## 10.1 Backend Foundation — COMPLETED

- Backend project initialized.
- Express configured.
- PostgreSQL and Redis running through Docker.
- Prisma 7 configured.
- PostgreSQL driver adapter configured.
- Database schema designed.
- Express server connects to PostgreSQL before listening.
- Health endpoint implemented and tested.

Health endpoint:

`GET /health`

Local API:

`http://localhost:5000`

## 10.2 Authentication — REGISTRATION COMPLETED

Created the Auth module:

```text
auth/
    auth.routes.ts
    auth.controller.ts
    auth.service.ts
    auth.repository.ts
    auth.validation.ts
    auth.types.ts
    auth.token.ts
```

### Registration Validation

- Zod schema implemented.
- Email is trimmed and converted to lowercase.
- Email format is validated.
- Password minimum length: 12 characters.
- Password maximum length: 128 characters.
- Password is not automatically trimmed or modified.

### Registration Repository

Implemented:

- `findUserByEmail()`
- `createUser()`

Uses Prisma for database operations.

### Registration Service

Implemented:

- Duplicate-email check.
- Argon2id password hashing.
- User creation.
- Public user response.
- Duplicate database constraint error handling.

### Registration Controller and Routes

Implemented request validation, service invocation, success responses, and error forwarding.

Endpoint:

`POST /api/v1/auth/register`

### Registration Testing

Verified:

- New valid user registration.
- Duplicate registration.
- Invalid email.
- Missing fields.
- Password length validation.
- Database record creation.
- Password hash not exposed in API response.

**Registration is working correctly.**

## 10.3 Login Authentication — IMPLEMENTATION IN PROGRESS

### Login Validation

Added `loginSchema` using Zod.

Validation rules:

- Email is validated using `z.email()`.
- Email is trimmed.
- Email is converted to lowercase.
- Password must not be empty.
- Password maximum length: 128 characters.

Login does not repeat the registration password-strength rule. Existing credentials should be checked rather than rejected because of registration-only requirements.

### Login Repository

Added:

- `findUserForLogin(email)`

Uses Prisma `findUnique()` to retrieve:

- User ID.
- Email.
- Password hash.

Only the fields needed for authentication are selected.

### Token Utilities

Created:

`src/modules/auth/auth.token.ts`

Installed:

`jose`

Implemented:

- `generateAccessToken(userId)`
- `verifyAccessToken(token)`
- `generateRefreshToken()`
- `hashRefreshToken(token)`

#### Access Token

- JWT-based.
- Signed using HS256.
- Lifetime: 15 minutes.
- Includes user ID as the subject.
- Includes issuer and audience claims.
- Verified using `jose`.

#### Refresh Token

- Generated using Node.js `crypto.randomBytes(32)`.
- Encoded using Base64URL.
- Stored in the database only as a SHA-256 hash.

### Login Service

Implemented `loginUser(data)`.

Current workflow:

1. Find user by normalized email.
2. Return a generic authentication error if the user does not exist.
3. Verify password using Argon2.
4. Return the same generic authentication error if the password is incorrect.
5. Generate an access token.
6. Generate a refresh token.
7. Hash the refresh token.
8. Calculate a seven-day session expiry.
9. Create an authentication session in the database.
10. Return public user information and both tokens.

The raw refresh token is returned to the client but never stored in the database.

### Authentication Session Repository

Added:

`createAuthSession(userId, refreshTokenHash, expiresAt)`

Uses Prisma to create an `AuthSession` record.

The existing Prisma model already supports:

- User association.
- Optional device association.
- Unique refresh-token hash.
- Expiration date.
- Revocation timestamp.
- Last-used timestamp.
- Creation timestamp.

No schema changes were required.

### Login Controller and Route

Added the login controller with:

- Request validation.
- Login service invocation.
- Success response.
- Error forwarding.

Added endpoint:

`POST /api/v1/auth/login`

### Current Login Issue — UNDER INVESTIGATION

The login implementation has been added, but incorrect credentials are currently producing HTTP 500 instead of the expected HTTP 401.

The error middleware was updated to recognize the `"Invalid email or password"` message, but the issue remains unresolved.

Possible causes still need verification:

- Error message mismatch.
- Error middleware behavior.
- Middleware registration order.
- An unexpected error occurring before credential verification.

**Login must not be marked complete until the issue is identified and successful and unsuccessful login cases are tested.**

---

# 11. AUTHENTICATION DESIGN AND REMAINING WORK

## 11.1 Authentication Strategy

### Access Token

- JWT.
- Lifetime: 15 minutes.
- Used for protected API requests.
- Sent through the Authorization Bearer header.

### Refresh Token

- Cryptographically random opaque token.
- Lifetime: 7 days.
- Only its hash is stored in `AuthSession`.
- Must be rotated when used.
- Sessions must be revocable on logout.

### Libraries

- `jose` — JWT signing and verification.
- Node.js `crypto` — Refresh-token generation and hashing.
- `argon2` — Password hashing and verification.

## 11.2 Login Workflow

1. Receive email and password.
2. Validate request using Zod.
3. Find user by email.
4. Verify password using Argon2.
5. Generate access token.
6. Generate refresh token.
7. Hash refresh token.
8. Store the hash in `AuthSession`.
9. Return tokens and public user information.

## 11.3 Remaining Authentication Tasks

1. Resolve the current HTTP 500 error.
2. Verify successful login.
3. Verify incorrect-password and nonexistent-user responses.
4. Verify validation errors.
5. Verify session creation in PostgreSQL.
6. Verify that the database stores only the refresh-token hash.
7. Implement refresh-token lookup and validation.
8. Implement refresh-token rotation.
9. Implement session revocation on logout.
10. Implement authentication middleware.
11. Protect user-specific routes.
12. Test authorization and session expiry.

---

# 12. FUTURE DEVELOPMENT ROADMAP

After authentication:

1. Complete login and session management.
2. Email verification.
3. Password reset.
4. User profile and account management.
5. Authentication middleware.
6. Reel saving and library APIs.
7. Category management.
8. Collection management.
9. Notes.
10. Search and filters.
11. Reel statuses.
12. Rediscovery.
13. Instagram URL handling.
14. Android share-to-app integration.
15. Instagram ZIP import.
16. BullMQ background processing.
17. Device and notification management.
18. Mobile application integration.
19. Testing, documentation, and deployment.

---

# 13. DEVELOPMENT PRINCIPLES

These principles apply throughout ReelVault development:

1. Keep the architecture modular without unnecessary abstractions.
2. Explain important technical decisions, but prioritize implementation.
3. Build in small, testable increments.
4. Test each feature before moving forward.
5. Keep business logic in services.
6. Keep database operations in repositories.
7. Keep HTTP handling in controllers.
8. Validate all incoming data.
9. Never expose password hashes, raw refresh tokens, secrets, or internal errors.
10. Enforce user ownership at application and database levels.
11. Prefer database constraints for data integrity.
12. Use migrations for schema changes.
13. Avoid premature caching and optimization.
14. Do not introduce microservices without a demonstrated need.
15. Keep README and documentation updated.
16. Do not mark a feature complete until it has been tested.
17. Use Express.js, not Fastify.
18. Use PostgreSQL and Prisma.
19. Maintain the modular monolith architecture.
20. Prioritize a working, maintainable product over unnecessary complexity.

---

# 14. CURRENT PROJECT CHECKPOINT

## Completed

- Requirements Analysis.
- Database design.
- Technology selection.
- Backend foundation.
- Docker-based PostgreSQL and Redis setup.
- Prisma configuration.
- Express server.
- Health endpoint.
- Auth module structure.
- Registration validation.
- User repository.
- Registration service.
- Registration controller.
- Registration route.
- Centralized error middleware.
- Registration API testing.
- JWT and refresh-token utility implementation.
- Login validation.
- Login user lookup repository.
- Login service implementation.
- Authentication session creation repository.
- Login controller.
- Login route.

## Currently Working On

- Debugging HTTP 500 responses for invalid login credentials.
- Testing successful login and session persistence.
- Completing authentication and session management.

## Immediate Next Task

Inspect and debug:

- `src/middleware/error.middleware.ts`
- Terminal error output from an unsuccessful login request.

Identify why `"Invalid email or password"` is still resulting in HTTP 500 instead of HTTP 401.

Do not move on to refresh-token rotation until the login flow is working and tested.

---

END OF REELVAULT PROJECT DOCUMENT