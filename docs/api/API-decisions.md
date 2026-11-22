# ReelVault API Design Decisions

**Document:** API Design Decisions  
**Project:** ReelVault  
**API Version:** v1  
**Base Path:** `/api/v1`  
**Status:** In Progress

---

## 1. Purpose

This document records the architectural and implementation decisions governing the ReelVault REST API.

It serves as a reference when designing, implementing, testing, and maintaining API endpoints.

The API specification is maintained separately in:

`docs/api/openapi.yaml`

This document explains why particular API design choices were made.

---

## 2. API Architecture

### 2.1 RESTful API

**Decision:** ReelVault will use a RESTful API.

**Reasoning:**
- Resources such as users, reels, categories, and collections can be represented through URLs.
- HTTP methods provide clear semantics for resource operations.
- REST is well-supported by React Native, Express, and API testing tools.
- OpenAPI provides a standardized way to document the endpoints.

### 2.2 API Versioning

**Decision:** Use URL-based versioning.

All API endpoints will use:

`/api/v1`

**Reasoning:**
- Makes breaking changes easier to manage.
- Allows older clients to continue using previous API versions.
- Keeps versioning explicit and easy to understand.

### 2.3 Data Format

**Decision:** JSON will be the standard request and response format.

- Request content type: `application/json`
- Response content type: `application/json`
- Exception: endpoints handling file uploads may use `multipart/form-data`.

### 2.4 Backend Architecture

**Decision:** Implement the API within a modular monolith using Node.js, Express.js, and TypeScript.

Each feature will be organized into logical modules.

The standard module structure is:

- Routes: Define HTTP endpoints.
- Controllers: Handle HTTP requests and responses.
- Services: Implement business logic.
- Repositories: Handle database operations.
- Validation: Validate incoming request data.
- Types: Define TypeScript types.

---

## 3. Authentication and Authorization

### 3.1 Authentication Method

**Decision:** Use JWT-based authentication.

The API uses:
- Short-lived access tokens.
- Long-lived refresh tokens.

### 3.2 Access Token

**Current implementation:**
- Algorithm: HS256.
- Expiration: 15 minutes.
- Subject: User ID.
- Issuer: `reelvault-api`.
- Audience: `reelvault-app`.

Protected endpoints require:

`Authorization: Bearer <accessToken>`

### 3.3 Refresh Token

**Current implementation:**
- Generated using cryptographically secure random bytes.
- Stored in the database as a SHA-256 hash.
- Expiration: 7 days.
- Rotated whenever a refresh request succeeds.

The raw refresh token is returned to the client but is never stored directly in the database.

### 3.4 Refresh Token Rotation

**Decision:** Implement refresh token rotation.

Whenever a refresh token is used:
1. Hash the submitted token.
2. Find the corresponding authentication session.
3. Verify that the session is not expired or revoked.
4. Generate a new refresh token.
5. Replace the old token hash with the new hash.
6. Issue a new access token.
7. Return the new token pair.

The database update checks the previous token hash and session state to prevent reuse of an already-rotated token.

### 3.5 Logout

**Decision:** Logout revokes the refresh-token session.

The logout endpoint:
- Accepts the refresh token in the request body.
- Hashes the token.
- Revokes the matching active session.
- Returns success even if the session has already been revoked or does not exist.

**Important limitation:** Logout does not immediately invalidate an already-issued access JWT. It remains valid until its 15-minute expiration because access-token verification is currently stateless.

### 3.6 Authorization

**Decision:** Users can access and modify only their own resources.

The authenticated user's ID is obtained from the verified access token through authentication middleware.

The API must not trust a client-supplied `userId` for ownership decisions.

Repositories and services must enforce ownership when accessing user-specific resources.

---

## 4. Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate an existing user |
| POST | `/auth/refresh` | Rotate refresh token and issue a new access token |
| POST | `/auth/logout` | Revoke refresh-token session |

### 4.1 Registration

**Decision:** Email and password registration.

Validation:
- Email is trimmed and converted to lowercase.
- Email must be valid and no longer than 254 characters.
- Password must contain at least 12 characters.
- Password must not exceed 128 characters.
- Additional request properties are rejected.

Password storage:
- Use Argon2id.
- Never store plaintext passwords.
- Never expose password hashes in API responses.

Responses:
- `201 Created`: Registration successful.
- `400 Bad Request`: Validation failed.
- `409 Conflict`: Email already registered.
- `500 Internal Server Error`: Unexpected server error.

### 4.2 Login

**Decision:** Authenticate using email and password.

Validation:
- Email is normalized to lowercase.
- Password must be present.
- Password must not exceed 128 characters.

A generic authentication error is returned for both nonexistent accounts and incorrect passwords to avoid revealing whether an email is registered.

Responses:
- `200 OK`: Login successful.
- `400 Bad Request`: Validation failed.
- `401 Unauthorized`: Invalid email or password.
- `500 Internal Server Error`: Unexpected server error.

### 4.3 Refresh

**Decision:** Refresh tokens are submitted in the request body.

Responses:
- `200 OK`: Tokens refreshed successfully.
- `400 Bad Request`: Missing or invalid request data.
- `401 Unauthorized`: Invalid, expired, revoked, or previously rotated refresh token.
- `500 Internal Server Error`: Unexpected server error.

### 4.4 Logout

**Decision:** Accept the refresh token in the request body and revoke its session.

Responses:
- `200 OK`: Logout successful.
- `400 Bad Request`: Missing or invalid request data.
- `500 Internal Server Error`: Unexpected server error.

---

## 5. User API

### 5.1 User Resource

The current User model does not contain:
- `displayName`
- `profileImageUrl`

Therefore, these fields will not be included in the current user API contract.

The API will expose only fields supported by the existing user model.

### 5.2 User Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/me` | Retrieve authenticated user's account |
| DELETE | `/users/me` | Permanently delete authenticated user's account |

Both endpoints require authentication.

### 5.3 Retrieve Current User

**Decision:** Use `/users/me` instead of accepting a user ID from the client.

The authenticated user's ID is obtained from the access token.

The response includes:
- `id`
- `email`
- `createdAt`

### 5.4 Account Deletion

**Decision:** Permanent account deletion for V1.

The operation must:
- Delete the authenticated user's account.
- Delete dependent records according to the configured database cascade rules.
- Prevent access to the deleted account.
- Execute database-dependent deletion operations transactionally where necessary.

Expected success response:

`204 No Content`

No response body is returned.

**Implementation note:** Verify that all dependent data and authentication sessions are deleted correctly before considering this endpoint complete.

---

## 6. Reel API

The Reel resource is the central resource of ReelVault.

### 6.1 Reel Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/reels` | Save a Reel |
| GET | `/reels` | Retrieve the user's Reel library |
| GET | `/reels/{reelId}` | Retrieve a specific Reel |
| PATCH | `/reels/{reelId}` | Update editable Reel fields |
| DELETE | `/reels/{reelId}` | Remove a saved Reel |

All endpoints require authentication.

### 6.2 Saving a Reel

**Decision:** Users save Instagram Reels using their URL.

The client submits:

`POST /reels`

Example request:

```json
{
  "url": "https://www.instagram.com/reel/ABC123/"
}
```

The backend will:
1. Validate the URL.
2. Normalize the URL.
3. Obtain the authenticated user's ID.
4. Check for an existing Reel belonging to that user.
5. Return the existing record if a duplicate is found.
6. Otherwise, create a new Reel record.

The client cannot supply `userId`.

### 6.3 Duplicate Prevention

**Decision:** Prevent duplicate Reel records per user using:

`@@unique([userId, normalizedUrl])`

Behavior:

- New Reel: `201 Created`.
- Existing Reel: `200 OK`.

The same Reel URL can exist for different users.

When a duplicate is submitted, the API returns the existing record without creating another one.

Existing category and collection assignments must not be overwritten or removed merely because the Reel is submitted again.

Users can organize an existing Reel through the relevant category and collection operations.

The database unique constraint remains the final protection against concurrent duplicate creation.

### 6.4 Metadata Handling

**Decision:** Reel metadata is optional during initial creation.

The current Prisma model permits:
- `caption` to be null.
- `thumbnailUrl` to be null.

A Reel can therefore be saved using its URL and required ownership information.

Metadata may be populated later through enrichment or manual updates.

This ensures that Reel saving does not depend on successful Instagram metadata retrieval.

**Important:** The current Prisma model does not contain a `title` field. The API must not expose or require one unless the database model is deliberately extended.

### 6.5 Reel Status

**Decision:** The user can update the Reel's viewing status.

The current default is:

`TO_WATCH`

The supported enum values must match the actual `ReelStatus` enum in Prisma.

### 6.6 Availability Status

**Decision:** Availability status is backend-controlled.

The current default is:

`UNKNOWN`

Users cannot directly modify `availabilityStatus`.

The backend updates it when availability checks are performed.

### 6.7 Reel Update Rules

The general Reel update endpoint may support:

| Field | Editable by user? |
|---|---|
| `caption` | Yes |
| `thumbnailUrl` | Yes |
| `status` | Yes |
| `availabilityStatus` | No |
| `url` | No |
| `normalizedUrl` | No |
| `userId` | No |
| `id` | No |
| `savedAt` | No |

The API must validate every update and verify resource ownership.

### 6.8 Reel Deletion

**Decision:** Users can delete their own saved Reel.

Deleting a Reel must also handle its dependent records according to database cascade rules.

The operation must never delete another user's Reel.

---

## 7. Reel Library and Pagination

### 7.1 Pagination

**Decision:** Use pagination for the Reel library.

This avoids returning an entire library in one response and supports users with thousands of saved Reels.

Proposed query parameters:

| Parameter | Purpose | Example |
|---|---|---|
| `page` | Page number | `1` |
| `limit` | Number of records | `20` |
| `status` | Filter by Reel status | `TO_WATCH` |
| `categoryId` | Filter by category | UUID |
| `collectionId` | Filter by collection | UUID |
| `sortBy` | Sort field | `savedAt` |
| `order` | Sort direction | `desc` |

### 7.2 Default Sorting

**Proposed default:** Newest saved Reels first.

Sort by:

`savedAt DESC`

This is the recommended behavior but remains subject to final confirmation.

### 7.3 Pagination Response

The response should eventually include:
- Reel records.
- Current page.
- Page size.
- Total records.
- Total pages.

The exact response structure will be defined in OpenAPI before implementation.

---

## 8. Categories and Collections

### 8.1 Separate Concepts

**Decision:** Categories and collections are separate resources.

Categories represent content topics.

Examples:
- Technology
- Education
- Fitness
- Food
- Travel

Collections represent user-defined purposes or groupings.

Examples:
- Weekend Projects
- Watch Later
- Startup Ideas
- Learning Resources

### 8.2 Many-to-Many Relationships

**Decision:** A Reel can belong to multiple categories and multiple collections.

The database uses:
- `ReelCategory`
- `CollectionReel`

These are junction tables representing many-to-many relationships.

### 8.3 Ownership

Categories and collections belong to individual users.

The API must enforce ownership when:
- Creating them.
- Retrieving them.
- Updating them.
- Deleting them.
- Assigning Reels to them.

### 8.4 API Design

Category and collection endpoints will be designed as separate resource APIs.

Their exact endpoint paths, request formats, assignment operations, and response schemas remain to be finalized.

---

## 9. Notes and Search

### 9.1 Notes

**Decision:** Users can create multiple private notes for a Reel.

Supported operations:
- Add a note.
- Retrieve notes.
- Edit a note.
- Delete a note.

Notes must remain isolated to their owner.

### 9.2 Search

Search should eventually support:
- Reel captions.
- Reel notes.
- Other available Reel metadata.

The search API should support pagination and enforce user-level data isolation.

Detailed search parameters and response formats remain to be finalized.

---

## 10. HTTP Status Codes

The API will use standard HTTP status codes.

| Status | Meaning | Usage |
|---|---|---|
| 200 | OK | Successful retrieval, update, login, or existing Reel |
| 201 | Created | New resource created |
| 204 | No Content | Successful deletion without a response body |
| 400 | Bad Request | Request validation failure |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated user lacks permission, where applicable |
| 404 | Not Found | Resource does not exist or is not accessible |
| 409 | Conflict | Duplicate resource or conflicting operation |
| 500 | Internal Server Error | Unexpected server-side error |

The exact status codes for individual endpoints must be documented in OpenAPI.

---

## 11. Validation and Error Handling

### 11.1 Request Validation

**Decision:** Use Zod for request validation.

Validation should occur before business logic executes.

Validate:
- Request body.
- Path parameters.
- Query parameters.
- Resource identifiers.
- Enum values.
- URL formats.

### 11.2 Error Responses

The current backend uses a message-based error response:

```json
{
  "message": "Internal server error"
}
```

Validation errors currently have two formats:

**Registration:**

```json
{
  "message": "Validation Failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Login and refresh:**

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_type",
      "path": ["email"],
      "message": "Invalid input"
    }
  ]
}
```

The existing implementation's response structures must be accurately reflected in OpenAPI.

Standardizing validation errors can be considered as a future improvement, but the current API documentation must describe the actual behavior.

### 11.3 Internal Errors

Unexpected errors are handled by centralized error middleware.

The API returns a generic `500 Internal Server Error` response.

Internal implementation details, database credentials, stack traces, and sensitive information must not be exposed to clients.

---

## 12. Security Decisions

The API must follow these security requirements:

1. Hash passwords using Argon2id.
2. Never store raw refresh tokens.
3. Use HTTPS in production.
4. Validate and sanitize incoming data.
5. Enforce authentication on protected endpoints.
6. Enforce resource ownership in services and repositories.
7. Never trust client-supplied ownership identifiers.
8. Keep secrets in environment variables.
9. Apply appropriate rate limits to authentication endpoints.
10. Avoid logging passwords, access tokens, refresh tokens, or sensitive personal data.
11. Use secure CORS configuration.
12. Prevent unauthorized access to another user's resources.

---

## 13. API Documentation

**Decision:** Use OpenAPI 3.1.0.

The specification is maintained in:

`docs/api/openapi.yaml`

Tools:
- Swagger Editor: Author and validate the OpenAPI specification.
- Swagger UI: Render interactive API documentation.
- Postman: Test API requests and responses.

The OpenAPI specification should remain consistent with the actual backend implementation.

Adding an endpoint to OpenAPI does not mean that endpoint has been implemented.

---

## 14. Implementation and Testing Rules

Before considering an endpoint complete:

1. Define its request schema.
2. Define its success responses.
3. Define its error responses.
4. Add ownership and authorization checks.
5. Implement validation.
6. Implement business logic.
7. Test successful requests.
8. Test invalid requests.
9. Test authentication failures.
10. Test cross-user access attempts.
11. Verify database changes.
12. Update the OpenAPI specification if behavior changes.

Automated tests should be added for critical business logic and API behavior.

Manual testing alone should not be treated as evidence that automated test coverage exists.

---

## 15. Decisions Pending

The following items require further design or confirmation.

| Area | Pending decision |
|---|---|
| Reel library | Confirm default sort order and pagination limits |
| Reel URL | Final URL normalization and supported URL formats |
| Reel metadata | Define metadata enrichment workflow |
| Categories | Finalize CRUD and assignment endpoints |
| Collections | Finalize CRUD and assignment endpoints |
| Notes | Finalize endpoint structure |
| Search | Define search parameters and indexing strategy |
| Rediscovery | Define feed and history endpoints |
| ZIP import | Define upload, processing, progress, and retry APIs |
| Notifications | Define device registration and notification endpoints |
| Account deletion | Verify all cascade behavior and transactional requirements |
| Error handling | Consider standardizing validation response structures |

---

## 16. Guiding Principles

All future ReelVault API decisions should follow these principles:

- **Consistency:** Similar operations should follow similar conventions.
- **Security:** Users must only access their own data.
- **Reliability:** Saving a Reel should not depend on optional metadata retrieval.
- **Data integrity:** Database constraints must enforce important invariants.
- **Scalability:** Use pagination and appropriate database indexes.
- **Maintainability:** Keep business logic out of controllers.
- **Documentation accuracy:** OpenAPI must describe actual API behavior.
- **Simplicity:** Avoid unnecessary abstractions and premature complexity.

---

**End of Document** 