# Implementation Plan: Travel Companion AU

**Branch**: `001-travel-companion-au` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-travel-companion-au/spec.md`

**Note**: This plan follows the `/speckit.plan` command workflow and aligns with the Travel Companion Constitution v1.0.0.

## Summary

A privacy-focused web application that helps travelers find flight companions for language assistance. The system allows users to create verified profiles with minimal personal information (first name, email, mobile number), search for companions on matching routes, and communicate via a secure messaging system. The application implements strict privacy controls (mobile numbers never exposed), mobile-first design with WCAG 2.1 AA accessibility, and leverages Auth0 for authentication while using Azure SQL as a serverless database. Built as a Next.js static web app deployed on Azure with automatic data retention policies (flights: 30 days, messages: 60 days post-flight) and comprehensive user data export capabilities.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x LTS  
**Framework**: Next.js 14.x (App Router) - SPA mode with static export  
**Primary Dependencies**:
  - Auth0 React SDK (authentication)
  - Azure SQL Database (via Prisma ORM)
  - React 18.x (UI framework)
  - Tailwind CSS 3.x (mobile-first styling)
  - React Query / TanStack Query (client-side state management)

**Storage**: Azure SQL Database (serverless tier for auto-scaling)  
**Authentication**: Auth0 (password + magic link, mobile number in user metadata)  
**Testing**: Jest (unit), Mocha (integration), React Testing Library (components), Axe (accessibility)  
**Code Quality**: BiomeJS (linting, formatting)  
**Documentation**: Markdown (feature docs), Swagger/OpenAPI (API contracts if needed)  
**Monitoring**: Google Analytics (pluggable via environment config)  
**Repository**: GitHub with branch protection  
**Hosting**: Azure Static Web Apps  
**Deployment**: GitHub Actions (auto-created by Azure)  
**Target Platform**: Modern web browsers (Chrome 90+, Safari 14+, Firefox 88+), Progressive Web App (PWA) capable  
**Project Type**: Web application (Next.js SPA with static export)  
**Performance Goals**: 
  - Initial page load < 5 seconds on 3G (per constitution)
  - Time to Interactive (TTI) < 3 seconds on 4G
  - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
  - API response time < 200ms p95 (Azure SQL serverless)
  
**Constraints**:
  - No custom backend APIs (constitution requirement - SPA architecture only)
  - Mobile numbers MUST NOT be exposed in any client-facing API responses (privacy-first)
  - All database queries through Prisma ORM with row-level security
  - Static export mode (no server-side rendering after build)
  - WCAG 2.1 Level AA compliance mandatory
  - Touch targets minimum 44×44px (constitution requirement)
  
**Scale/Scope**:
  - Initial target: 1,000 concurrent users
  - Dynamic scaling via Azure SQL serverless (auto-scales based on load)
  - ~15-20 pages/screens (registration, search, messaging, profile, admin)
  - Estimated codebase: 10-15k LOC (TypeScript + React)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Review against `.specify/memory/constitution.md` principles:

- [x] **Privacy-First**: ✅ PASS
  - Mobile numbers stored in Auth0 metadata, never exposed in search/profile APIs
  - Privacy warning component (FR-028) before first message
  - Search results limited to: first name, route, languages, date, verification status (FR-021)
  - Encryption enforced: TLS 1.3 in transit, AES-256 at rest in Azure SQL

- [x] **Mobile-First Design**: ✅ PASS
  - Tailwind CSS mobile-first breakpoints (sm: 640px, md: 768px, lg: 1024px)
  - Touch targets 44×44px minimum (Tailwind: min-h-11 min-w-11)
  - WCAG 2.1 AA: Axe accessibility tests in CI, ARIA labels, 4.5:1 contrast
  - Progressive Web App (PWA) for mobile install capability
  - Responsive layout tested on Chrome DevTools mobile emulation

- [x] **SPA Architecture**: ✅ PASS  
  - Next.js static export mode (output: 'export' in next.config.js)
  - No custom API routes (Next.js API routes disabled in SPA mode)
  - Database access via Prisma Client directly from client-side (with Auth0 JWT validation)
  - Azure SQL configured with row-level security and Auth0 JWT claims

- [x] **Auth0 Integration**: ✅ PASS
  - Auth0 React SDK for authentication (@auth0/auth0-react)
  - Password + Magic Link configured in Auth0 dashboard
  - Mobile number stored in Auth0 user_metadata
  - SMS verification via Auth0 Actions/Rules
  - No custom authentication logic (FR-009, FR-010, FR-011)

- [x] **Unit Testability**: ✅ PASS
  - React components: Presentational vs. Container pattern
  - Custom hooks for business logic (useSearch, useMessaging, useFlights)
  - Dependency injection via React Context (Auth0Provider, QueryClientProvider)
  - Jest mocks for Auth0, Prisma, external APIs
  - React Testing Library for component isolation

- [x] **Data Minimization**: ✅ PASS
  - Automated deletion: Azure SQL scheduled jobs (flights: 30d, messages: 60d post-flight)
  - Data export API endpoint: GET /api/user/export (JSON format, FR-047)
  - Account deletion: DELETE /api/user/account (7-day grace period, FR-048-050)
  - Backup retention: Azure SQL automatic backups (90 days, FR-052)

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceeding to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # ✅ Phase 0 output (COMPLETE)
├── data-model.md        # ✅ Phase 1 output (COMPLETE)
├── quickstart.md        # ⏳ Phase 1 output (PENDING)
├── contracts/           # ⏳ Phase 1 output (PENDING)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
travel-companion/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/                 # Auth-protected routes
│   │   │   ├── profile/
│   │   │   ├── search/
│   │   │   ├── messages/
│   │   │   ├── flights/
│   │   │   └── admin/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx              # Root layout with Auth0Provider
│   │   └── page.tsx                # Landing page
│   ├── components/                 # React components
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── PrivacyWarning.tsx  # FR-028 privacy warning
│   │   ├── search/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── SearchFilters.tsx
│   │   ├── messaging/
│   │   │   ├── MessageThread.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageComposer.tsx
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── FlightsList.tsx
│   │   │   └── LanguageSelector.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── ReportsQueue.tsx
│   │       └── UserManagement.tsx
│   ├── hooks/                      # Custom React hooks (business logic)
│   │   ├── useAuth.ts              # Auth0 wrapper
│   │   ├── useSearch.ts            # Search logic (FR-018-027)
│   │   ├── useMessaging.ts         # Messaging logic (FR-028-040)
│   │   ├── useFlights.ts           # Flight CRUD (FR-012-017)
│   │   ├── useProfile.ts           # Profile management (FR-001-011)
│   │   └── useDataExport.ts        # Data export (FR-047-048)
│   ├── lib/                        # Utilities and configurations
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth0.ts                # Auth0 config
│   │   ├── validation.ts           # Zod schemas (email, mobile E.164)
│   │   ├── privacy.ts              # Privacy helpers (sanitize mobile)
│   │   └── analytics.ts            # Google Analytics wrapper
│   ├── types/                      # TypeScript types
│   │   ├── user.ts
│   │   ├── flight.ts
│   │   ├── message.ts
│   │   └── search.ts
│   └── styles/
│       └── globals.css             # Tailwind imports
├── prisma/
│   ├── schema.prisma               # Database schema (8 entities)
│   ├── migrations/
│   └── seed.ts                     # Test data seeder
├── tests/
│   ├── unit/                       # Jest unit tests
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── components/
│   ├── integration/                # Mocha integration tests
│   │   ├── auth.test.ts
│   │   ├── search.test.ts
│   │   └── messaging.test.ts
│   └── accessibility/              # Axe accessibility tests
│       └── a11y.test.ts
├── public/                         # Static assets
│   ├── icons/
│   └── manifest.json               # PWA manifest
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # Deployment workflow
├── next.config.js                  # Next.js config (output: 'export')
├── tailwind.config.js              # Tailwind mobile-first config
├── biome.json                      # BiomeJS config
├── jest.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**: Next.js App Router architecture selected for:
- Built-in SPA support via static export
- File-based routing (automatic code splitting)
- React Server Components disabled (client-side only)
- Tailwind CSS integration for mobile-first design
- All business logic in custom hooks (testable, injectable)
- Prisma ORM for type-safe database access
- Auth0 React SDK for authentication context

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
