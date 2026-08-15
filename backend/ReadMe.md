# Master Implementation Plan: Ethiopian Property Platform

## Overview
The Ethiopian Property Platform is a production-oriented real estate marketplace supporting both **Rent** and **Sale** properties in Ethiopia. The backend is designed using a **Feature-Based Modular Layered Architecture** with Express.js, TypeScript, PostgreSQL, Prisma ORM, and Redis.

### Core Business Rules & Scope
1. **Transactions Supported**: RENT & SALE (No house exchange).
2. **Offline Operations**:
   - **Rent Payment**: Handled offline between Owner and Renter.
   - **Sale Payment**: Handled offline between Owner and Buyer.
   - **Government Tax & Legal Ownership Transfer**: Handled offline through government channels.
3. **Platform Operations**:
   - **Owner Subscription**: Required *before* an owner can create or post a property.
   - **Platform Payment**: Platform processes **Subscription payments only** via a Payment Provider Abstraction (Chapa simulation initially).
   - **Verification**: Admin-controlled verification for User National IDs and Owner House Ownership/License documents (with AI pre-check integration hooks).

---

## Architecture Breakdown

### Feature-Based Modular Layered Architecture
Every business domain is isolated inside its own module within `src/modules/`. Within each module, clean separation of concerns is maintained:

```
src/modules/[feature]/
├── [feature].routes.ts        # HTTP route definitions & middleware wiring
├── [feature].controller.ts    # Request parsing & HTTP response formatting
├── [feature].service.ts       # Core business logic
├── [feature].repository.ts    # Prisma database abstraction
├── [feature].validation.ts    # Zod schemas for input validation
└── [feature].types.ts         # TypeScript interfaces & DTOs
```

### Overall Request Lifecycle
```
HTTP Request
    ↓
Routes (src/routes/index.ts & feature.routes.ts)
    ↓
Middleware (auth, role, rate-limit, validation)
    ↓
Controller (handles HTTP req/res)
    ↓
Service (executes business rules & calls abstractions)
    ↓
Repository (database access layer)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## User Review Required

> [!IMPORTANT]
> **Database Shift to PostgreSQL**:
> The existing backend schema used SQLite. We are switching to PostgreSQL + Prisma to support enum types, multi-role relations, private document uploads, and audit logging.

> [!NOTE]
> **Separation of app.ts and server.ts**:
> Express app configuration (`app.ts`) is strictly separated from server startup listener (`server.ts`) to enable clean supertest integration tests without port-binding side effects.

---

## Complete Database Design (Prisma + PostgreSQL)

Entities included in `prisma/schema.prisma`:
1. `User`: Core user credentials, profile, status, and role flags.
2. `Role`: Enums (`ADMIN`, `OWNER`, `RENTER`, `BUYER`).
3. `IdentityDocument`: Sensitive National ID records (status: PENDING, VERIFIED, REJECTED).
4. `License`: Owner business/house license verification documents.
5. `Property`: Houses/properties for RENT or SALE with status (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `PUBLISHED`, etc.).
6. `PropertyImage`: Images linked to properties.
7. `PropertyDocument`: Ownership title/deeds linked to properties.
8. `SubscriptionPlan`: Plans (`Basic`, `Professional`, `Business`) with price and listing limits.
9. `Subscription`: Active or expired owner subscriptions.
10. `Payment`: Subscription payment transactions (Chapa Provider Abstraction).
11. `RentalRequest` & `RentalAgreement`: Offline rent agreement workflows.
12. `SaleRequest`: Offline sale negotiation & legal status tracking workflows.
13. `Favorite`: User saved properties.
14. `Message`: Direct messaging between users (Owner ↔ Buyer/Renter).
15. `Notification`: Platform alerts (SMS, Email, Telegram, Push).
16. `Review`: Property and owner ratings/reviews.
17. `Report`: Flags and reports on listings or accounts.
18. `AuditLog`: Admin audit trail for platform actions.
19. `AIVerification`: Storage for document AI OCR risk analysis scores.
20. `AnalyticsEvent`: Behavioral data tracking for views, searches, and leads.

---

## Phased Implementation Roadmap

### Phase 1: Requirements & Business Rules Verification
- Finalize core platform rules, offline vs online boundaries, actor privileges.

### Phase 2: Actors & Use Cases
- Define permission matrices for OWNER, RENTER, BUYER, ADMIN, and multi-role users.

### Phase 3: System Architecture Setup
- Setup modular project layout, config loaders (`env.ts`, `database.ts`, `redis.ts`, `storage.ts`), standard error handlers, logger, and response helpers.

### Phase 4: PostgreSQL + Prisma ERD
- Create complete `schema.prisma` targeting PostgreSQL with all 20 domain models, seed script, and database connection config.

### Phase 5: Express + TypeScript Foundation
- Implement `app.ts`, `server.ts`, middleware suite (`error`, `auth`, `role`, `rate-limit`, `validation`, `not-found`), custom error classes, and base routes.

### Phase 6: Auth Module (`src/modules/auth`)
- Register, Login, Refresh token rotation, Phone OTP simulation, Email verification, Forgot/Reset password, password hashing with bcryptjs.

### Phase 7: User & Role Management (`src/modules/users`)
- Profile management, RBAC enforcement, role assignment, and multi-role context switching.

### Phase 8: Identity & Document Verification (`src/modules/verification`)
- Secure private upload for National ID and House Ownership documents, Admin approval workflow, document status management.

### Phase 9: Property Management (`src/modules/properties`)
- Listing creation (guarded by active subscription requirement), image/document attachment, approval lifecycle (Pending Review -> Approved -> Published).

### Phase 10: Subscriptions & Payment Abstraction (`src/modules/subscriptions` & `src/modules/payments`)
- Payment provider interface (`PaymentProvider`), `ChapaSimulationProvider` implementation, plan selection, payment verification, subscription activation.

### Phase 11: Rental System (`src/modules/rentals`)
- Rental request submission, owner acceptance/rejection, rental agreement status tracking (offline payment recording).

### Phase 12: Sale System (`src/modules/sales`)
- Purchase request submission, document review, government/legal step tracking (offline legal transfer status).

### Phase 13: Search & Discovery (`src/modules/search` & `src/modules/favorites`)
- PostgreSQL query builder for keyword, price, location, property type, transaction type (RENT/SALE), bedrooms, bathrooms, pagination, and favorites.

### Phase 14: Messaging & Notifications (`src/modules/messaging` & `src/modules/notifications`)
- Direct user messaging API, Notification service abstraction with SMS, Email, Telegram, and Push notification providers.

### Phase 15: Next.js Web Application Alignments
- REST API integration contracts for Next.js web client.

### Phase 16: Flutter Mobile Application Alignments
- Mobile REST API endpoints optimization.

### Phase 17: Admin Dashboard & Audit System (`src/modules/admin`)
- Platform administrative controls, audit log recording, user & property moderation.

### Phase 18: Analytics (`src/modules/analytics`)
- Behavioral analytics tracking (views, searches, leads, revenue).

### Phase 19: AI Document Verification (`src/modules/ai`)
- Isolated AI document verification pre-check pipeline (OCR field extraction & risk scoring).

### Phase 20: AI Admin Assistant
- Administrative query assistant for risk and demand analysis.

### Phase 21: AI Recommendations & ML
- Property recommendation engine based on user preference and analytics.

### Phase 22: Security Hardening & Testing
- Rate limiting, Helmet HTTP headers, CORS, Zod input validation, unit & integration tests.

### Phase 23: Production Deployment Readiness
- Environment config validation, Docker/PM2 scripts, database migration pipelines.

---

## Proposed Changes & Files to be Created in Initial Build (Phases 1 - 5)

#### [NEW] [schema.prisma](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/prisma/schema.prisma)
#### [NEW] [env.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/config/env.ts)
#### [NEW] [database.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/config/database.ts)
#### [NEW] [redis.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/config/redis.ts)
#### [NEW] [storage.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/config/storage.ts)
#### [NEW] [errors.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/utils/errors.ts)
#### [NEW] [response.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/utils/response.ts)
#### [NEW] [logger.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/utils/logger.ts)
#### [NEW] [error.middleware.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/middleware/error.middleware.ts)
#### [NEW] [not-found.middleware.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/middleware/not-found.middleware.ts)
#### [NEW] [validation.middleware.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/middleware/validation.middleware.ts)
#### [NEW] [rate-limit.middleware.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/middleware/rate-limit.middleware.ts)
#### [NEW] [app.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/app.ts)
#### [MODIFY] [server.ts](file:///c:/Users/shamb/Documents/INSA%20Summer%20Camp%20Talent/EthiopianHouseRentalPlatformWebsite/backend/src/server.ts)

---

## Verification Plan

### Automated Tests
- Run `npm run build` using `tsc` to verify strict TypeScript compilation.
- Execute `npx prisma validate` to confirm schema validity.

### Manual Verification
- Launch server via `npm run dev` and verify health check route GET `/api/v1/health`.
