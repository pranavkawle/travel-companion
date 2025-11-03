---
description: "Implementation task list for Travel Companion AU"
---

# Tasks: Travel Companion AU

**Input**: Design documents from `/specs/001-travel-companion-au/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Not explicitly requested - tasks focus on implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 14 project with TypeScript and App Router in <project-root>/
- [ ] T002 Configure next.config.js for static export mode (output: 'export', images: { unoptimized: true }, trailingSlash: true)
- [ ] T003 [P] Install core dependencies: @auth0/auth0-react, @prisma/client, @tanstack/react-query, tailwindcss
- [ ] T004 [P] Initialize BiomeJS configuration in biome.json for linting and formatting
- [ ] T005 [P] Setup Tailwind CSS with mobile-first config in tailwind.config.js (min-width/height: 44px touch targets)
- [ ] T006 [P] Create project structure: src/app/, src/components/, src/hooks/, src/lib/, src/types/, prisma/
- [ ] T007 Configure package.json scripts for dev, build, lint, format, and prisma commands
- [ ] T008 Setup .env.local template with Auth0 and Azure SQL connection string placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create Prisma schema in prisma/schema.prisma with all 8 entities (User, Flight, Conversation, Message, Rating, Report, Block, Administrator)
- [ ] T010 Configure Prisma datasource for Azure SQL (sqlserver provider) with connection pooling
- [ ] T011 Add Prisma enums: AccountStatus, DataSource, ConversationStatus, ReportType, ReportStatus, ReportPriority
- [ ] T012 Add all entity relationships and indexes per data-model.md in prisma/schema.prisma
- [ ] T013 Create initial Prisma migration: npx prisma migrate dev --name init
- [ ] T014 Generate Prisma Client: npx prisma generate
- [ ] T015 Create Prisma client singleton in src/lib/prisma.ts with connection management
- [ ] T016 [P] Configure Auth0 application (SPA type) with password and magic link authentication
- [ ] T017 [P] Create Auth0 configuration in src/lib/auth0.ts with domain, clientId, audience, redirect_uri
- [ ] T018 [P] Setup Auth0Provider in src/app/layout.tsx wrapping entire application
- [ ] T019 [P] Create Auth0 custom hook in src/hooks/useAuth.ts wrapping useAuth0
- [ ] T020 [P] Configure Auth0 Actions for mobile number storage in user_metadata during registration
- [ ] T021 [P] Setup TanStack Query in src/lib/queryClient.ts with QueryClientProvider
- [ ] T022 [P] Add QueryClientProvider to src/app/layout.tsx
- [ ] T023 [P] Create base TypeScript types in src/types/: user.ts, flight.ts, message.ts, search.ts
- [ ] T024 [P] Create validation schemas in src/lib/validation.ts using Zod (email, mobile E.164, airport IATA codes)
- [ ] T025 [P] Create privacy helper functions in src/lib/privacy.ts (sanitize mobile numbers, never expose in APIs)
- [ ] T026 [P] Setup global styles in src/styles/globals.css with Tailwind imports
- [ ] T027 [P] Create responsive layout component in src/app/layout.tsx with mobile-first navigation
- [ ] T028 [P] Setup error boundary component in src/components/ui/ErrorBoundary.tsx
- [ ] T029 [P] Configure Jest for unit testing in jest.config.js
- [ ] T030 [P] Setup React Testing Library configuration
- [ ] T031 [P] Create test utilities in tests/utils/ for mocking Auth0, Prisma, and React Query
- [ ] T032 [P] Setup accessibility testing with Axe in tests/accessibility/a11y.test.ts
- [ ] T033 [P] Create reusable UI components: src/components/ui/Button.tsx (44x44px minimum)
- [ ] T034 [P] Create reusable UI components: src/components/ui/Input.tsx (accessible labels)
- [ ] T035 [P] Create reusable UI components: src/components/ui/Modal.tsx (keyboard navigation)
- [ ] T036 [P] Create loading states component in src/components/ui/Loading.tsx
- [ ] T037 [P] Setup Google Analytics wrapper in src/lib/analytics.ts (pluggable via env config)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Profile Creation and Flight Details (Priority: P1) 🎯 MVP

**Goal**: A traveler creates an account with their first name, email, and mobile number, then adds their upcoming flight information (source airport, destination airport, and flight date) to find potential travel companions for language assistance.

**Independent Test**: Can be fully tested by having a user register with their name, email, and mobile number, add at least one flight with source and destination airports, and verify the profile is created with flight information visible. Delivers the value of establishing verified user identity and trip context.

### Implementation for User Story 1

- [ ] T038 [P] [US1] Create User type interfaces in src/types/user.ts (firstName, languages, accountStatus, mobileVerified)
- [ ] T039 [P] [US1] Create Flight type interfaces in src/types/flight.ts (sourceAirport, destinationAirport, travelDate, flightNumber)
- [ ] T040 [P] [US1] Create registration page in src/app/register/page.tsx with Auth0 integration
- [ ] T041 [P] [US1] Create registration form component in src/components/profile/RegistrationForm.tsx (firstName, email, mobile fields)
- [ ] T042 [US1] Implement mobile number validation in registration form using E.164 format (src/components/profile/RegistrationForm.tsx)
- [ ] T043 [US1] Add email validation in registration form using Zod schema (src/components/profile/RegistrationForm.tsx)
- [ ] T044 [US1] Implement duplicate email/mobile check in registration flow (query Prisma before Auth0 signup)
- [ ] T045 [P] [US1] Create optional SMS verification component in src/components/profile/SmsVerification.tsx
- [ ] T046 [P] [US1] Create profile page in src/app/(auth)/profile/page.tsx (auth-protected route)
- [ ] T047 [P] [US1] Create profile management hook in src/hooks/useProfile.ts (CRUD operations)
- [ ] T048 [US1] Implement user profile creation in useProfile hook connecting to Prisma (create User record)
- [ ] T049 [P] [US1] Create language selector component in src/components/profile/LanguageSelector.tsx (multi-select)
- [ ] T050 [US1] Implement language update functionality in useProfile hook (update User.languages JSON)
- [ ] T051 [P] [US1] Create flight management hook in src/hooks/useFlights.ts (add, edit, delete flights)
- [ ] T052 [P] [US1] Create flight form component in src/components/profile/FlightForm.tsx (source, destination, date, flight number)
- [ ] T053 [US1] Implement airport code validation in flight form using IATA codes (src/lib/validation.ts)
- [ ] T054 [US1] Add flight date validation (must be future date at creation) in flight form
- [ ] T055 [US1] Implement add flight functionality in useFlights hook (create Flight record in Prisma)
- [ ] T056 [US1] Implement edit flight functionality in useFlights hook (update Flight record in Prisma)
- [ ] T057 [US1] Implement delete flight functionality in useFlights hook (delete Flight record in Prisma)
- [ ] T058 [P] [US1] Create flights list component in src/components/profile/FlightsList.tsx (display user's flights)
- [ ] T059 [US1] Add mobile verification status badge to profile (sync from Auth0 user_metadata)
- [ ] T060 [US1] Implement error handling for registration failures (duplicate email/mobile)
- [ ] T061 [US1] Add validation messages for all form fields (client-side + server-side)
- [ ] T062 [US1] Create login page in src/app/login/page.tsx with Auth0 Universal Login integration
- [ ] T063 [US1] Implement password and magic link authentication options in login page

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can register, login, manage profile, and add flights

---

## Phase 4: User Story 2 - Search and Discovery (Priority: P2)

**Goal**: A traveler searches for other users who are traveling on the same route (matching source and destination airports) to find potential companions who can provide language assistance.

**Independent Test**: Can be fully tested by creating multiple user profiles with various flight details, performing searches by source and destination airports, and verifying that matching users appear in results. Delivers immediate value by connecting travelers on the same route.

### Implementation for User Story 2

- [ ] T064 [P] [US2] Create SearchParams type in src/types/search.ts (source, destination, languages, dateRange)
- [ ] T065 [P] [US2] Create SearchResult type in src/types/search.ts (firstName, route, languages, travelDate, mobileVerified)
- [ ] T066 [P] [US2] Create search page in src/app/(auth)/search/page.tsx (auth-protected route)
- [ ] T067 [P] [US2] Create search hook in src/hooks/useSearch.ts (search logic with Prisma queries)
- [ ] T068 [US2] Implement search query to find flights matching source and destination airports (useSearch hook)
- [ ] T069 [US2] Add ±7 day date range filtering in search query (travelDate within window)
- [ ] T070 [US2] Add language filtering in search query (User.languages JSON contains selected languages)
- [ ] T071 [US2] Implement search result sorting: 1) mobileVerified (verified first), 2) travelDate proximity
- [ ] T072 [US2] Add exclusion of searching user from their own results (userId != currentUserId)
- [ ] T073 [US2] Add exclusion of blocked/suspended users from search results (accountStatus = ACTIVE, not in Block table)
- [ ] T074 [US2] Implement pagination (10 results per page) in search query with offset/limit
- [ ] T075 [P] [US2] Create search form component in src/components/search/SearchForm.tsx (airport inputs, language filter)
- [ ] T076 [US2] Add airport code autocomplete/validation in search form (IATA codes)
- [ ] T077 [P] [US2] Create search results component in src/components/search/SearchResults.tsx (display matches)
- [ ] T078 [US2] Display only safe user info in search results: firstName, route, languages, travelDate, mobileVerified (NEVER mobile number)
- [ ] T079 [P] [US2] Create search filters component in src/components/search/SearchFilters.tsx (language selector)
- [ ] T080 [US2] Implement filter application logic (update search query params)
- [ ] T081 [P] [US2] Create "no results" message component in src/components/search/NoResults.tsx
- [ ] T082 [US2] Add loading states during search query execution
- [ ] T083 [US2] Implement error handling for invalid airport codes or search failures
- [ ] T084 [US2] Add pagination controls component in src/components/search/Pagination.tsx
- [ ] T085 [US2] Create verification badge component in src/components/ui/VerificationBadge.tsx (visual indicator)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can search and find matching travel companions

---

## Phase 5: User Story 3 - Connection and Messaging (Priority: P3)

**Goal**: A traveler initiates contact with a potential companion they discovered through search, and they exchange messages to coordinate meeting at the airport or during the flight.

**Independent Test**: Can be fully tested by having one user send a connection request or message to another user from search results, and both users exchanging messages. Delivers the value of enabling actual coordination between matched travelers.

### Implementation for User Story 3

- [ ] T086 [P] [US3] Create Conversation type in src/types/message.ts (id, participants, status, flightId)
- [ ] T087 [P] [US3] Create Message type in src/types/message.ts (id, conversationId, senderId, content, sentAt, readAt)
- [ ] T088 [P] [US3] Create messaging hook in src/hooks/useMessaging.ts (conversation and message CRUD)
- [ ] T089 [US3] Implement initiate conversation function in useMessaging (create Conversation + first Message)
- [ ] T090 [US3] Add validation to prevent messaging blocked/suspended users (check accountStatus and Block table)
- [ ] T091 [US3] Add validation to prevent self-messaging (senderId != recipientId)
- [ ] T092 [P] [US3] Create privacy warning component in src/components/ui/PrivacyWarning.tsx (first message warning)
- [ ] T093 [US3] Display privacy warning before initiating first conversation (modal with acknowledgment)
- [ ] T094 [P] [US3] Create messages page in src/app/(auth)/messages/page.tsx (list conversations)
- [ ] T095 [P] [US3] Create conversation list component in src/components/messaging/ConversationList.tsx
- [ ] T096 [US3] Implement fetch user conversations query in useMessaging (where user is participant1 or participant2)
- [ ] T097 [US3] Add unread message count indicator in conversation list (count where readAt is null)
- [ ] T098 [P] [US3] Create conversation thread page in src/app/(auth)/messages/[id]/page.tsx
- [ ] T099 [P] [US3] Create message thread component in src/components/messaging/MessageThread.tsx (display messages)
- [ ] T100 [US3] Implement fetch messages query in useMessaging (by conversationId, ordered by sentAt)
- [ ] T101 [US3] Display messages in chronological order with sender identification
- [ ] T102 [P] [US3] Create message composer component in src/components/messaging/MessageComposer.tsx (textarea + send button)
- [ ] T103 [US3] Implement send message function in useMessaging (create Message record in Prisma)
- [ ] T104 [US3] Add message length validation (1-10,000 characters) before sending
- [ ] T105 [US3] Implement rate limiting (50 messages/hour per user) in message send function
- [ ] T106 [US3] Display rate limit error when user exceeds 50 messages/hour
- [ ] T107 [US3] Implement mark as read functionality in useMessaging (update Message.readAt)
- [ ] T108 [US3] Auto-mark messages as read when user views conversation thread
- [ ] T109 [US3] Add real-time unread message notifications (poll or React Query refetch)
- [ ] T110 [US3] Implement auto-archive conversation when one participant blocks the other (Conversation.status = ARCHIVED)
- [ ] T111 [US3] Display archived conversation state (read-only, no new messages)
- [ ] T112 [US3] Add loading states for message send and fetch operations
- [ ] T113 [US3] Implement error handling for message send failures

**Checkpoint**: All core user stories (1-3) are now independently functional - users can register, search, and communicate

---

## Phase 6: User Story 4 - User Feedback and Rating System (Priority: P4)

**Goal**: After completing a trip, travelers can provide feedback and ratings about their experience with their travel companion, helping build trust and improve match quality for future users.

**Independent Test**: Can be fully tested by having two users complete a conversation thread related to a past flight, then each user submitting a rating and optional feedback, and verifying the ratings appear on user profiles. Delivers the value of building community trust.

### Implementation for User Story 4

- [ ] T114 [P] [US4] Create Rating type in src/types/user.ts (id, flightId, raterId, rateeId, stars, feedback)
- [ ] T115 [P] [US4] Create rating hook in src/hooks/useRatings.ts (submit and fetch ratings)
- [ ] T116 [US4] Implement check if user can rate (travel date has passed, within 7-day window)
- [ ] T117 [P] [US4] Create rating prompt component in src/components/messaging/RatingPrompt.tsx (show after travel date)
- [ ] T118 [US4] Display rating prompt in conversation thread when travel date has passed
- [ ] T119 [P] [US4] Create rating form component in src/components/profile/RatingForm.tsx (1-5 stars + optional text)
- [ ] T120 [US4] Implement star rating input (radio buttons or interactive stars)
- [ ] T121 [US4] Add feedback text area with 500 character limit validation
- [ ] T122 [US4] Implement submit rating function in useRatings (create Rating record in Prisma)
- [ ] T123 [US4] Add validation: only accept ratings within 7 days after travel date
- [ ] T124 [US4] Add validation: prevent duplicate ratings (flightId + raterId + rateeId unique constraint)
- [ ] T125 [US4] Implement flag inappropriate feedback (basic content moderation keywords)
- [ ] T126 [US4] Implement fetch ratings for user profile (aggregate: average stars, total count)
- [ ] T127 [P] [US4] Display aggregate rating on user profile page (average score + count)
- [ ] T128 [P] [US4] Display aggregate rating in search results (verification + rating badges)
- [ ] T129 [US4] Implement rating notification (user notified when they receive a rating)
- [ ] T130 [US4] Add rating received indicator in notifications area
- [ ] T131 [US4] Preserve ratings when user account is blocked (keep Rating records, mark account inactive)
- [ ] T132 [US4] Add error handling for rating submission failures

**Checkpoint**: User Story 4 complete - rating system enables trust and safety

---

## Phase 7: User Story 5 - Administrative Management (Priority: P5)

**Goal**: Platform administrators monitor user activity, manage reported content, review flagged profiles, and maintain system health to ensure a safe and trustworthy environment for all travelers.

**Independent Test**: Can be fully tested by an administrator logging into the admin interface, viewing user statistics, managing a reported message or profile, and verifying actions are applied correctly. Delivers operational control and safety management.

### Implementation for User Story 5

- [ ] T133 [P] [US5] Create Report type in src/types/admin.ts (id, reporterId, reportedUserId, reportType, status, priority)
- [ ] T134 [P] [US5] Create AdminAction type in src/types/admin.ts (action type, targetUserId, reason)
- [ ] T135 [P] [US5] Create admin authentication check in src/hooks/useAuth.ts (verify Administrator role from Auth0)
- [ ] T136 [P] [US5] Create admin dashboard page in src/app/(auth)/admin/page.tsx (admin-only route)
- [ ] T137 [US5] Add route guard for admin pages (redirect non-admins)
- [ ] T138 [P] [US5] Create admin hook in src/hooks/useAdmin.ts (dashboard metrics, report management)
- [ ] T139 [P] [US5] Create dashboard component in src/components/admin/Dashboard.tsx (metrics display)
- [ ] T140 [US5] Implement fetch dashboard metrics: active users, new registrations, blocked accounts, reports count
- [ ] T141 [US5] Implement fetch mobile verification rate metric (mobileVerified users / total users)
- [ ] T142 [US5] Display key metrics in dashboard with visual indicators
- [ ] T143 [P] [US5] Create reports queue page in src/app/(auth)/admin/reports/page.tsx
- [ ] T144 [P] [US5] Create reports queue component in src/components/admin/ReportsQueue.tsx
- [ ] T145 [US5] Implement fetch reports query (ordered by priority, then createdAt)
- [ ] T146 [US5] Display critical reports separately (harassment, safety_concern, scam_attempt)
- [ ] T147 [US5] Display standard reports separately (spam, inappropriate_content)
- [ ] T148 [US5] Add SLA indicators: critical (2 hours), standard (24 hours)
- [ ] T149 [P] [US5] Create report detail page in src/app/(auth)/admin/reports/[id]/page.tsx
- [ ] T150 [US5] Display full report context: reporter, reported user, description, type, timestamp
- [ ] T151 [P] [US5] Create admin actions component in src/components/admin/AdminActions.tsx (warn, suspend, block)
- [ ] T152 [US5] Implement warn user action (update Report.status, log action, notify user)
- [ ] T153 [US5] Implement suspend user action (update User.accountStatus = SUSPENDED, log action, notify user)
- [ ] T154 [US5] Implement block user action (update User.accountStatus = BLOCKED, archive conversations, log action, notify user)
- [ ] T155 [US5] Add action reason text area (required for all admin actions)
- [ ] T156 [US5] Implement user notification system for admin actions (email or in-app)
- [ ] T157 [US5] Implement automatic escalation: 3+ critical reports → immediate review flag
- [ ] T158 [US5] Create blocked users list page in src/app/(auth)/admin/users/blocked/page.tsx
- [ ] T159 [US5] Display all blocked users with block reasons and timestamps
- [ ] T160 [US5] Implement prevent re-registration check (blocked email/mobile cannot register)
- [ ] T161 [P] [US5] Create user management page in src/components/admin/UserManagement.tsx
- [ ] T162 [US5] Display user report patterns (number of reports per user)
- [ ] T163 [P] [US5] Create announcement creation page in src/app/(auth)/admin/announcements/page.tsx
- [ ] T164 [US5] Implement create system-wide announcement (title, content, priority)
- [ ] T165 [US5] Display announcements to all users on login
- [ ] T166 [P] [US5] Create analytics page in src/app/(auth)/admin/analytics/page.tsx
- [ ] T167 [US5] Implement fetch engagement metrics: logins, searches, messages sent, connections made
- [ ] T168 [US5] Implement fetch verification adoption rate metric
- [ ] T169 [US5] Implement fetch blocking trends metric (blocks over time)
- [ ] T170 [US5] Display analytics charts/graphs (use chart library like Recharts)
- [ ] T171 [US5] Implement admin action audit log (all actions logged with timestamps and admin ID)
- [ ] T172 [P] [US5] Create super-admin page in src/app/(auth)/admin/admins/page.tsx
- [ ] T173 [US5] Implement create admin account function (super-admin only)
- [ ] T174 [US5] Log admin account creation events with creating admin ID
- [ ] T175 [US5] Add error handling for duplicate admin emails

**Checkpoint**: User Story 5 complete - admin tools enable platform safety and moderation

---

## Phase 8: User Story 6 - Responsive Multi-Device Access (Priority: P6)

**Goal**: Users access the travel companion platform seamlessly from mobile devices, tablets, and desktop computers, with the interface adapting to provide optimal usability regardless of screen size or device type.

**Independent Test**: Can be fully tested by accessing core features (registration, search, messaging) from different device types and screen sizes, verifying all functionality remains accessible and usable. Delivers ubiquitous access.

### Implementation for User Story 6

- [ ] T176 [P] [US6] Review all components for mobile-first responsive design (Tailwind breakpoints: sm, md, lg)
- [ ] T177 [P] [US6] Ensure all touch targets meet 44x44px minimum (buttons, links, form inputs)
- [ ] T178 [P] [US6] Test navigation menu responsiveness (hamburger menu on mobile)
- [ ] T179 [P] [US6] Test form layouts on mobile, tablet, desktop (stack vs. side-by-side)
- [ ] T180 [P] [US6] Test search results layout on different screen sizes
- [ ] T181 [P] [US6] Test messaging interface on mobile (full-screen on small devices)
- [ ] T182 [P] [US6] Add proper ARIA labels to all interactive elements
- [ ] T183 [P] [US6] Implement keyboard navigation for all features (tab order, enter/space for actions)
- [ ] T184 [P] [US6] Add focus indicators for keyboard navigation (visible focus rings)
- [ ] T185 [P] [US6] Test screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] T186 [P] [US6] Ensure color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] T187 [P] [US6] Add skip navigation links for screen readers
- [ ] T188 [P] [US6] Test orientation changes (portrait/landscape) on tablets
- [ ] T189 [P] [US6] Implement session persistence across devices (Auth0 token refresh)
- [ ] T190 [P] [US6] Test performance on 3G connections (optimize bundle size, lazy loading)
- [ ] T191 [P] [US6] Add loading skeletons for slow connections
- [ ] T192 [P] [US6] Create PWA manifest in public/manifest.json (name, icons, theme color)
- [ ] T193 [P] [US6] Add service worker for offline support (optional, basic caching)
- [ ] T194 [P] [US6] Run Lighthouse audits (performance, accessibility, best practices, SEO)
- [ ] T195 [P] [US6] Run Axe accessibility tests in CI pipeline

**Checkpoint**: User Story 6 complete - platform is fully responsive and accessible

---

## Phase 9: User Story 7 - Flight Data Integration (Priority: P7)

**Goal**: Users can optionally import their flight details from third-party sources or receive suggestions based on common routes, reducing manual entry effort and improving data accuracy for better matching.

**Independent Test**: Can be fully tested by users with booking confirmations using import features to auto-populate flight details, while users without can still manually enter information. Delivers convenience without creating dependency.

### Implementation for User Story 7

- [ ] T196 [P] [US7] Research flight data APIs (FlightStats, Amadeus, Skyscanner) or booking email parsing
- [ ] T197 [P] [US7] Create flight import hook in src/hooks/useFlightImport.ts
- [ ] T198 [US7] Implement email parsing logic for common booking confirmation formats (if chosen approach)
- [ ] T199 [US7] Implement flight data API integration (if chosen approach, with API key management)
- [ ] T200 [P] [US7] Create flight import component in src/components/profile/FlightImport.tsx
- [ ] T201 [US7] Add file upload for booking confirmation (email .eml or PDF)
- [ ] T202 [US7] Parse uploaded file and extract flight details (source, destination, date, flight number)
- [ ] T203 [P] [US7] Create flight suggestion component in src/components/profile/FlightSuggestions.tsx
- [ ] T204 [US7] Implement autocomplete for airport codes based on partial input
- [ ] T205 [US7] Pre-fill extracted flight details in flight form for user review
- [ ] T206 [US7] Allow user to edit any pre-filled field before saving
- [ ] T207 [US7] Implement graceful fallback to manual entry when import fails
- [ ] T208 [US7] Display clear error messages when third-party data is unavailable
- [ ] T209 [US7] Allow user to refresh imported data or override with manual entry
- [ ] T210 [US7] Add loading states during import/parsing operations

**Checkpoint**: User Story 7 complete - optional flight import enhances user experience

---

## Phase 10: Data Management & Retention (Cross-Cutting)

**Purpose**: Implement automated data retention and deletion policies per constitution requirements

- [ ] T211 Create Azure SQL scheduled job script in prisma/sql/cleanup-expired-flights.sql (delete flights 30+ days old)
- [ ] T212 Create Azure SQL scheduled job script in prisma/sql/cleanup-expired-messages.sql (delete conversations 60+ days after flight)
- [ ] T213 Configure Azure SQL Agent to run cleanup-expired-flights.sql daily at 2:00 AM UTC
- [ ] T214 Configure Azure SQL Agent to run cleanup-expired-messages.sql daily at 2:30 AM UTC
- [ ] T215 [P] Create data export hook in src/hooks/useDataExport.ts
- [ ] T216 [US1] Implement user data export function (fetch all user data: profile, flights, messages, ratings)
- [ ] T217 [US1] Generate JSON export file with all user personal data
- [ ] T218 [US1] Create data export page in src/app/(auth)/profile/export/page.tsx
- [ ] T219 [US1] Add "Download My Data" button in profile settings
- [ ] T220 [US1] Implement account deletion function in useProfile hook
- [ ] T221 [US1] Create account deletion page in src/app/(auth)/profile/delete/page.tsx
- [ ] T222 [US1] Add confirmation dialog for account deletion (7-day grace period warning)
- [ ] T223 [US1] Implement soft delete (mark account for deletion, actual deletion after 7 days)
- [ ] T224 [US1] Create scheduled job for permanent account deletion after 7-day grace period
- [ ] T225 Configure Azure SQL automatic backups (daily, 90-day retention)
- [ ] T226 [P] Document backup restoration procedures in docs/backup-recovery.md

---

## Phase 11: Security & Privacy Hardening (Cross-Cutting)

**Purpose**: Implement privacy-first security measures

- [ ] T227 Configure Azure SQL Row-Level Security policies (users can only access their own data)
- [ ] T228 Create SQL function dbo.fn_GetUserIdFromJWT() for RLS with Auth0 JWT validation
- [ ] T229 Apply RLS filter predicate on User table (dbo.fn_GetUserIdFromJWT() = id)
- [ ] T230 Apply RLS filter predicate on search results to exclude blocked users (dbo.fn_IsNotBlocked())
- [ ] T231 Configure TLS 1.3 for all connections (Azure SQL + Auth0 + client)
- [ ] T232 Enable AES-256 encryption at rest in Azure SQL
- [ ] T233 Review all API responses to ensure mobile numbers NEVER exposed (only in Auth0 metadata)
- [ ] T234 Add Content Security Policy headers in next.config.js
- [ ] T235 Implement rate limiting for all sensitive operations (registration, login, message send)
- [ ] T236 Add CSRF protection for state-changing operations
- [ ] T237 [P] Create security audit logging (all admin actions, blocks, reports)
- [ ] T238 [P] Document security measures in docs/security.md

---

## Phase 12: Performance Optimization (Cross-Cutting)

**Purpose**: Ensure 3G loading performance and Core Web Vitals compliance

- [ ] T239 [P] Implement code splitting with Next.js dynamic imports (lazy load non-critical components)
- [ ] T240 [P] Optimize Tailwind CSS (PurgeCSS to remove unused styles)
- [ ] T241 [P] Optimize images (use Next.js Image component with appropriate sizes)
- [ ] T242 [P] Add loading skeletons for all async data fetching
- [ ] T243 [P] Implement React Query caching strategy (staleTime, cacheTime)
- [ ] T244 [P] Add database query optimization: review all Prisma queries for N+1 issues
- [ ] T245 [P] Add composite indexes for search queries (sourceAirport, destinationAirport, travelDate)
- [ ] T246 [P] Configure Azure SQL auto-scaling (serverless tier with appropriate DTU limits)
- [ ] T247 [P] Setup monitoring for Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] T248 [P] Run Lighthouse performance audits and address issues (target: >90 score)
- [ ] T249 [P] Test initial page load on simulated 3G (< 5 seconds target)

---

## Phase 13: Testing & Quality Assurance (Cross-Cutting)

**Purpose**: Comprehensive testing coverage for production readiness

- [ ] T250 [P] Create unit tests for useAuth hook in tests/unit/hooks/useAuth.test.ts
- [ ] T251 [P] Create unit tests for useProfile hook in tests/unit/hooks/useProfile.test.ts
- [ ] T252 [P] Create unit tests for useSearch hook in tests/unit/hooks/useSearch.test.ts
- [ ] T253 [P] Create unit tests for useMessaging hook in tests/unit/hooks/useMessaging.test.ts
- [ ] T254 [P] Create unit tests for validation functions in tests/unit/lib/validation.test.ts
- [ ] T255 [P] Create unit tests for privacy helpers in tests/unit/lib/privacy.test.ts
- [ ] T256 [P] Create component tests for RegistrationForm in tests/unit/components/profile/RegistrationForm.test.tsx
- [ ] T257 [P] Create component tests for SearchForm in tests/unit/components/search/SearchForm.test.tsx
- [ ] T258 [P] Create component tests for MessageThread in tests/unit/components/messaging/MessageThread.test.tsx
- [ ] T259 [P] Create integration test for auth flow in tests/integration/auth.test.ts
- [ ] T260 [P] Create integration test for search flow in tests/integration/search.test.ts
- [ ] T261 [P] Create integration test for messaging flow in tests/integration/messaging.test.ts
- [ ] T262 [P] Create integration test for rating flow in tests/integration/rating.test.ts
- [ ] T263 [P] Create accessibility tests for all pages in tests/accessibility/a11y.test.ts
- [ ] T264 [P] Setup CI pipeline in .github/workflows/ci.yml (lint, format, test, build)
- [ ] T265 [P] Add BiomeJS linting to CI pipeline
- [ ] T266 [P] Add Jest unit tests to CI pipeline
- [ ] T267 [P] Add Axe accessibility tests to CI pipeline

---

## Phase 14: Deployment & DevOps (Cross-Cutting)

**Purpose**: Production deployment to Azure Static Web Apps

- [ ] T268 Create Azure Static Web Apps resource in Azure Portal
- [ ] T269 Configure GitHub Actions workflow in .github/workflows/azure-static-web-apps.yml (auto-generated by Azure)
- [ ] T270 Add Azure SQL connection string to GitHub Secrets
- [ ] T271 Add Auth0 credentials to GitHub Secrets
- [ ] T272 Configure custom domain (if applicable)
- [ ] T273 Setup SSL certificate (automatic with Azure)
- [ ] T274 Configure environment variables in Azure Static Web Apps settings
- [ ] T275 Run production build and deploy to Azure
- [ ] T276 Verify static export works correctly (all pages accessible)
- [ ] T277 Test Auth0 authentication in production environment
- [ ] T278 Test Azure SQL connectivity from production app
- [ ] T279 [P] Setup application monitoring (Application Insights or equivalent)
- [ ] T280 [P] Configure alerting for errors (>5% error rate)
- [ ] T281 [P] Configure alerting for performance (>5s response time)
- [ ] T282 [P] Configure alerting for auto-scaling events
- [ ] T283 [P] Create production deployment checklist in docs/deployment.md

---

## Phase 15: Documentation & Polish (Final Phase)

**Purpose**: Complete documentation and final refinements

- [ ] T284 [P] Create quickstart.md with step-by-step user guide
- [ ] T285 [P] Create developer README.md with setup instructions
- [ ] T286 [P] Document API integration patterns in docs/api-patterns.md
- [ ] T287 [P] Document Prisma schema and migrations in docs/database.md
- [ ] T288 [P] Create admin user guide in docs/admin-guide.md
- [ ] T289 [P] Create privacy policy document
- [ ] T290 [P] Create terms of service document
- [ ] T291 [P] Add help/FAQ page in src/app/help/page.tsx
- [ ] T292 [P] Review all error messages for clarity and user-friendliness
- [ ] T293 [P] Review all loading states and add meaningful messages
- [ ] T294 [P] Final UI polish: consistent spacing, colors, typography
- [ ] T295 [P] Final accessibility review (keyboard navigation, screen reader testing)
- [ ] T296 [P] Final mobile responsiveness review (test on real devices)
- [ ] T297 [P] Code cleanup: remove console.logs, unused imports, dead code
- [ ] T298 [P] Final BiomeJS formatting pass on entire codebase
- [ ] T299 Run all tests one final time before release
- [ ] T300 Create release notes and version tag

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially (P1 → P2 → P3 → P4 → P5 → P6 → P7)
  - **Recommended MVP**: Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US3) = Core functionality
- **Data Management (Phase 10)**: Can proceed in parallel with user stories, depends on Prisma schema from Phase 2
- **Security (Phase 11)**: Can proceed in parallel with user stories, depends on database setup from Phase 2
- **Performance (Phase 12)**: Best done after core user stories are implemented
- **Testing (Phase 13)**: Can proceed in parallel as features are implemented
- **Deployment (Phase 14)**: Depends on Setup, Foundational, and at least MVP user stories
- **Documentation (Phase 15)**: Can proceed in parallel, finalize after all features complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - foundational
- **User Story 2 (P2)**: Depends on US1 (needs user profiles and flights to search)
- **User Story 3 (P3)**: Depends on US2 (needs search results to initiate conversations)
- **User Story 4 (P4)**: Depends on US3 (needs conversations to rate companions)
- **User Story 5 (P5)**: Depends on US1-4 (needs user data to moderate)
- **User Story 6 (P6)**: Cross-cutting - applies to all stories
- **User Story 7 (P7)**: Enhances US1 (flight entry) but independent

### Within Each User Story

- Types before components
- Hooks before pages
- Forms before submission logic
- Validation before database operations
- Core implementation before integrations
- Story complete before moving to next priority

### Parallel Opportunities per User Story

**User Story 1 (Profile & Flights)**:
- T038-T039 (types) can run in parallel
- T040-T041 (registration page + form) can run in parallel
- T045 (SMS verification), T046 (profile page), T049 (language selector) can run in parallel
- T051-T052 (flight hook + form) can run in parallel
- T058 (flights list) can run in parallel with other UI components

**User Story 2 (Search)**:
- T064-T065 (types) can run in parallel
- T066-T067 (page + hook) can run in parallel
- T075, T077, T079 (UI components) can run in parallel after query logic complete
- T081 (no results), T084 (pagination), T085 (badge) can run in parallel

**User Story 3 (Messaging)**:
- T086-T087 (types) can run in parallel
- T092 (privacy warning) can be built in parallel
- T094-T095, T098-T099, T102 (all UI components) can run in parallel after core messaging logic

**User Story 4 (Ratings)**:
- T114-T115 (types + hook) can run in parallel
- T117, T119, T127-T128 (all UI components) can run in parallel

**User Story 5 (Admin)**:
- T133-T134 (types) can run in parallel
- T136, T138-T139, T143-T144 (admin pages + components) can run in parallel
- T151 (actions component) can be built in parallel

**Cross-Cutting Phases**: Most tasks in Phases 10-15 can run in parallel since they operate on different aspects (security, performance, testing, docs)

---

## Implementation Strategy

### MVP Scope (Recommended First Release)

**Core Value**: User Story 1 + 2 + 3 (Register → Search → Message)

**Estimated Tasks**: T001-T113 (113 tasks)
- Phase 1: Setup (8 tasks)
- Phase 2: Foundational (29 tasks)
- Phase 3: US1 - Profile & Flights (26 tasks)
- Phase 4: US2 - Search (22 tasks)
- Phase 5: US3 - Messaging (28 tasks)

**Deliverable**: Users can create verified profiles, find travel companions on matching routes, and communicate securely.

### Incremental Delivery Post-MVP

1. **Release 1.1**: Add User Story 4 (Ratings) - builds trust and safety
2. **Release 1.2**: Add User Story 5 (Admin) - enables moderation
3. **Release 1.3**: Add User Story 6 (Accessibility) - enhances reach
4. **Release 1.4**: Add User Story 7 (Flight Import) - improves UX
5. **Release 2.0**: All cross-cutting enhancements (security, performance, full test coverage)

### Parallel Execution Strategy

If working with a team:
- **Developer A**: Focus on User Story 1 (Profile & Auth)
- **Developer B**: Focus on User Story 2 (Search) - starts after US1 data model complete
- **Developer C**: Focus on User Story 3 (Messaging) - starts after US2 query patterns established
- **Developer D**: Focus on Foundational + Cross-Cutting (testing, security, performance)

---

## Total Task Count: 300 tasks

**By Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 29 tasks
- Phase 3 (US1 - Profile & Flights): 26 tasks
- Phase 4 (US2 - Search): 22 tasks
- Phase 5 (US3 - Messaging): 28 tasks
- Phase 6 (US4 - Ratings): 19 tasks
- Phase 7 (US5 - Admin): 43 tasks
- Phase 8 (US6 - Responsive): 20 tasks
- Phase 9 (US7 - Flight Import): 15 tasks
- Phase 10 (Data Management): 16 tasks
- Phase 11 (Security): 12 tasks
- Phase 12 (Performance): 11 tasks
- Phase 13 (Testing): 18 tasks
- Phase 14 (Deployment): 16 tasks
- Phase 15 (Documentation): 17 tasks

**By User Story**:
- User Story 1 (P1): 26 tasks + foundational dependencies
- User Story 2 (P2): 22 tasks
- User Story 3 (P3): 28 tasks
- User Story 4 (P4): 19 tasks
- User Story 5 (P5): 43 tasks
- User Story 6 (P6): 20 tasks
- User Story 7 (P7): 15 tasks
- Cross-cutting: 107 tasks (setup, foundational, data, security, performance, testing, deployment, docs)

**Parallel Opportunities**: Approximately 60% of tasks within each phase can be parallelized (marked with [P] or naturally independent)

**Independent Test Criteria**:
- ✅ US1: User can register, add profile info, and create flights independently
- ✅ US2: User can search and find matches without messaging (builds on US1)
- ✅ US3: User can send/receive messages with matches (builds on US1-2)
- ✅ US4: User can rate companions after trips (builds on US1-3)
- ✅ US5: Admin can moderate platform independently of user features
- ✅ US6: All features work on mobile/tablet/desktop consistently
- ✅ US7: Flight import enhances US1 without breaking manual entry

**Format Validation**: ✅ ALL tasks follow the required checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T300)
- [P] marker: Present where parallelizable
- [Story] label: Present for user story phases (US1-US7)
- Description: Clear action with file path

---

## Notes

- All file paths assume Next.js project structure at `<project-root>/` (replace `<project-root>` with your local project directory)
- Tasks marked [P] can be executed in parallel within their phase
- Tasks marked [USX] belong to a specific user story and enable independent delivery
- Auth0 configuration tasks (T016, T020) require Auth0 Dashboard access
- Azure SQL tasks (T211-T214, T227-T232) require Azure Portal access
- Tests are NOT included per feature specification (no TDD requirement stated)
- Mobile number MUST NEVER be exposed in any client API - enforced throughout
- All data retention policies are automated via scheduled jobs
- Constitution requirements satisfied: SPA architecture, Auth0, mobile-first, privacy-first, testable hooks
