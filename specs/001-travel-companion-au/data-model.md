# Data Model: Travel Companion AU

**Phase**: 1 - Data Model Design  
**Date**: 2025-11-03  
**Status**: Complete  
**Database**: Azure SQL Database (Serverless)  
**ORM**: Prisma 5.x

## Overview

This document defines the database schema for Travel Companion AU. The data model implements privacy-first principles, ensuring mobile numbers are never exposed in user-facing queries and supporting automated data retention policies.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │◄──────┤   Flight    │───────┤ Conversation│
│             │ 1   * │             │ 1   * │             │
│ (Auth0)     │       │             │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                            │
       │ 1                                          │ 1
       │                                            │
       │ *                                          │ *
       │                                            │
┌─────────────┐                           ┌─────────────┐
│   Rating    │                           │   Message   │
│             │                           │             │
└─────────────┘                           └─────────────┘

┌─────────────┐       ┌─────────────┐
│   Report    │       │   Block     │
│             │       │             │
└─────────────┘       └─────────────┘

┌─────────────┐
│Administrator│
│             │
└─────────────┘
```

## Entities

### 1. User (Profile)

**Description**: Represents a registered traveler. Core identity managed by Auth0 (email, mobile number stored in Auth0 user_metadata).

**Key Attributes**:
- `id` (UUID): Primary key, maps to Auth0 user_id
- `firstName` (VARCHAR(50)): User's first name (visible to other users)
- `languages` (JSON array): Spoken languages for matching
- `accountStatus` (ENUM): `active`, `suspended`, `blocked`
- `mobileVerified` (BOOLEAN): SMS verification status (synced from Auth0)
- `createdAt` (DATETIME2): Account creation timestamp
- `updatedAt` (DATETIME2): Last profile update

**Privacy Constraints**:
- ❌ Mobile number NOT stored in this table (Auth0 user_metadata only)
- ❌ Email NOT stored (Auth0 handles)
- ✅ Only `firstName`, `languages`, `accountStatus`, `mobileVerified` exposed in search APIs

**Prisma Schema**:
```prisma
model User {
  id             String         @id @default(uuid())
  firstName      String         @db.VarChar(50)
  languages      Json           // Array of language codes: ["en", "es"]
  accountStatus  AccountStatus  @default(ACTIVE)
  mobileVerified Boolean        @default(false)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  
  // Relationships
  flights        Flight[]
  sentMessages   Message[]      @relation("SentMessages")
  receivedMessages Message[]    @relation("ReceivedMessages")
  givenRatings   Rating[]       @relation("GivenRatings")
  receivedRatings Rating[]      @relation("ReceivedRatings")
  reports        Report[]
  blockedUsers   Block[]        @relation("Blocker")
  blockedBy      Block[]        @relation("Blocked")

  @@index([accountStatus])
  @@index([mobileVerified])
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  BLOCKED
}
```

**Validation Rules**:
- `firstName`: 1-50 characters, no special characters except hyphen/apostrophe
- `languages`: Must contain at least 1 language code (ISO 639-1)
- `mobileVerified`: Synced from Auth0 via webhook after SMS verification

---

### 2. Flight

**Description**: Represents a specific trip a user is taking. Used for search matching and message retention calculations.

**Key Attributes**:
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `sourceAirport` (CHAR(3)): IATA airport code (e.g., "SYD")
- `destinationAirport` (CHAR(3)): IATA airport code (e.g., "MEL")
- `travelDate` (DATE): Date of flight
- `flightNumber` (VARCHAR(10)): Optional flight number (e.g., "QF123")
- `dataSource` (ENUM): `manual`, `imported`
- `createdAt` (DATETIME2): Record creation timestamp

**Lifecycle**:
- ✅ Created: User adds flight via profile
- ✅ Updated: User edits flight details
- ✅ Auto-deleted: 30 days after `travelDate` (Azure SQL scheduled job)

**Prisma Schema**:
```prisma
model Flight {
  id                  String      @id @default(uuid())
  userId              String
  sourceAirport       String      @db.Char(3)
  destinationAirport  String      @db.Char(3)
  travelDate          DateTime    @db.Date
  flightNumber        String?     @db.VarChar(10)
  dataSource          DataSource  @default(MANUAL)
  createdAt           DateTime    @default(now())
  
  // Relationships
  user                User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversations       Conversation[]

  @@index([userId])
  @@index([sourceAirport, destinationAirport, travelDate]) // Search optimization
  @@index([travelDate]) // Cleanup job optimization
}

enum DataSource {
  MANUAL
  IMPORTED
}
```

**Validation Rules**:
- `sourceAirport`, `destinationAirport`: Must be valid IATA codes (3-letter)
- `sourceAirport` ≠ `destinationAirport` (no circular flights)
- `travelDate`: Must be in the future at creation time
- `flightNumber`: Optional, format: 2-letter airline code + 1-4 digits

**Business Rules**:
- Users can have multiple active flights (FR-012)
- Flights older than 30 days are automatically deleted (FR-016)
- Search matches flights within ±7 days of query date (FR-019)

---

### 3. Conversation

**Description**: Container for message threads between two users about a specific flight.

**Key Attributes**:
- `id` (UUID): Primary key
- `flightId` (UUID): Foreign key to Flight (which flight this conversation is about)
- `participant1Id` (UUID): First user in conversation
- `participant2Id` (UUID): Second user in conversation
- `status` (ENUM): `active`, `archived`, `blocked`
- `createdAt` (DATETIME2): Conversation initiation timestamp
- `closedAt` (DATETIME2): Timestamp when conversation was closed/archived

**Lifecycle**:
- ✅ Created: User initiates first message to another user
- ✅ Archived: One participant blocks the other (FR-040)
- ✅ Auto-deleted: 60 days after associated flight's `travelDate` (FR-037)

**Prisma Schema**:
```prisma
model Conversation {
  id              String              @id @default(uuid())
  flightId        String
  participant1Id  String
  participant2Id  String
  status          ConversationStatus  @default(ACTIVE)
  createdAt       DateTime            @default(now())
  closedAt        DateTime?
  
  // Relationships
  flight          Flight              @relation(fields: [flightId], references: [id], onDelete: Cascade)
  participant1    User                @relation("ConversationParticipant1", fields: [participant1Id], references: [id])
  participant2    User                @relation("ConversationParticipant2", fields: [participant2Id], references: [id])
  messages        Message[]

  @@unique([flightId, participant1Id, participant2Id]) // One conversation per flight per user pair
  @@index([participant1Id, participant2Id])
  @@index([status])
}

enum ConversationStatus {
  ACTIVE
  ARCHIVED
  BLOCKED
}
```

**Business Rules**:
- One conversation per user pair per flight (enforced by unique constraint)
- Messages deleted when conversation deleted (cascade)
- Conversations archived when one user blocks the other (FR-040)

---

### 4. Message

**Description**: Individual message within a conversation thread.

**Key Attributes**:
- `id` (UUID): Primary key
- `conversationId` (UUID): Foreign key to Conversation
- `senderId` (UUID): Foreign key to User (who sent)
- `recipientId` (UUID): Foreign key to User (who received)
- `content` (NVARCHAR(MAX)): Message text (max 10,000 characters)
- `sentAt` (DATETIME2): Message send timestamp
- `readAt` (DATETIME2): Timestamp when recipient read message

**Lifecycle**:
- ✅ Created: User sends message in conversation
- ✅ Updated: `readAt` set when recipient views message (FR-035)
- ✅ Auto-deleted: Cascade delete when conversation deleted (60d post-flight)

**Prisma Schema**:
```prisma
model Message {
  id              String      @id @default(uuid())
  conversationId  String
  senderId        String
  recipientId     String
  content         String      @db.NVarChar(Max)
  sentAt          DateTime    @default(now())
  readAt          DateTime?
  
  // Relationships
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender          User        @relation("SentMessages", fields: [senderId], references: [id])
  recipient       User        @relation("ReceivedMessages", fields: [recipientId], references: [id])

  @@index([conversationId, sentAt]) // Chronological message retrieval
  @@index([recipientId, readAt])    // Unread message queries
}
```

**Validation Rules**:
- `content`: 1-10,000 characters (FR-031)
- `senderId` ≠ `recipientId` (can't message yourself, FR-038)
- Rate limit: 50 messages/hour per user (enforced in application layer, FR-032)

---

### 5. Rating

**Description**: Post-travel feedback one user provides about another.

**Key Attributes**:
- `id` (UUID): Primary key
- `flightId` (UUID): Foreign key to Flight (which trip this rating is about)
- `raterId` (UUID): Foreign key to User (who gave the rating)
- `rateeId` (UUID): Foreign key to User (who received the rating)
- `stars` (TINYINT): 1-5 star rating
- `feedback` (NVARCHAR(500)): Optional text feedback
- `createdAt` (DATETIME2): Rating submission timestamp

**Lifecycle**:
- ✅ Created: User submits rating within 7 days after flight (FR-053)
- ✅ Preserved: Ratings remain even if user account blocked (FR-060)

**Prisma Schema**:
```prisma
model Rating {
  id        String    @id @default(uuid())
  flightId  String
  raterId   String
  rateeId   String
  stars     Int       // 1-5
  feedback  String?   @db.NVarChar(500)
  createdAt DateTime  @default(now())
  
  // Relationships
  flight    Flight    @relation(fields: [flightId], references: [id], onDelete: Cascade)
  rater     User      @relation("GivenRatings", fields: [raterId], references: [id])
  ratee     User      @relation("ReceivedRatings", fields: [rateeId], references: [id])

  @@unique([flightId, raterId, rateeId]) // One rating per user pair per flight
  @@index([rateeId]) // Aggregate rating queries
}
```

**Validation Rules**:
- `stars`: 1-5 (enforced via CHECK constraint)
- `feedback`: 0-500 characters (FR-054)
- `createdAt`: Must be ≤7 days after flight's `travelDate` (FR-053)
- Can't rate same person twice for same flight (enforced by unique constraint, FR-058)

**Business Rules**:
- Ratings preserved when user account blocked, but account marked inactive (FR-060)
- Inappropriate feedback flagged for admin review (FR-057)

---

### 6. Report

**Description**: User-generated report of inappropriate behavior.

**Key Attributes**:
- `id` (UUID): Primary key
- `reporterId` (UUID): Foreign key to User (who filed the report)
- `reportedUserId` (UUID): Foreign key to User (who was reported)
- `reportType` (ENUM): `harassment`, `spam`, `inappropriate_content`, `safety_concern`, `scam_attempt`
- `description` (NVARCHAR(1000)): Details of the report
- `status` (ENUM): `pending`, `under_review`, `resolved`, `dismissed`
- `priority` (ENUM): `critical`, `standard` (auto-set based on reportType)
- `createdAt` (DATETIME2): Report submission timestamp
- `reviewedAt` (DATETIME2): Admin review timestamp
- `reviewedBy` (UUID): Foreign key to Administrator

**Lifecycle**:
- ✅ Created: User reports another user (FR-087)
- ✅ Queued: Report enters admin review queue by priority (FR-089)
- ✅ Resolved: Admin takes action (warn/suspend/block)

**Prisma Schema**:
```prisma
model Report {
  id              String        @id @default(uuid())
  reporterId      String
  reportedUserId  String
  reportType      ReportType
  description     String        @db.NVarChar(1000)
  status          ReportStatus  @default(PENDING)
  priority        ReportPriority
  createdAt       DateTime      @default(now())
  reviewedAt      DateTime?
  reviewedBy      String?
  
  // Relationships
  reporter        User          @relation("ReportsFiled", fields: [reporterId], references: [id])
  reportedUser    User          @relation("ReportsReceived", fields: [reportedUserId], references: [id])
  reviewer        Administrator? @relation(fields: [reviewedBy], references: [id])

  @@index([status, priority, createdAt]) // Admin queue optimization
  @@index([reportedUserId])              // Pattern analysis
}

enum ReportType {
  HARASSMENT
  SPAM
  INAPPROPRIATE_CONTENT
  SAFETY_CONCERN
  SCAM_ATTEMPT
}

enum ReportStatus {
  PENDING
  UNDER_REVIEW
  RESOLVED
  DISMISSED
}

enum ReportPriority {
  CRITICAL   // harassment, safety_concern, scam_attempt
  STANDARD   // spam, inappropriate_content
}
```

**Business Rules**:
- `priority` auto-set: `CRITICAL` for harassment/safety/scam, `STANDARD` for spam/inappropriate (FR-089)
- Critical reports trigger admin alerts within 2 hours (FR-090)
- Standard reports trigger alerts within 24 hours (FR-091)
- 3+ critical reports → automatic account review (FR-094)

---

### 7. Block

**Description**: Represents a user blocking another user.

**Key Attributes**:
- `id` (UUID): Primary key
- `blockerId` (UUID): Foreign key to User (who initiated the block)
- `blockedId` (UUID): Foreign key to User (who was blocked)
- `reason` (NVARCHAR(500)): Optional reason for block
- `createdAt` (DATETIME2): Block timestamp

**Lifecycle**:
- ✅ Created: User blocks another user, or admin blocks user (FR-067)
- ✅ Enforced: Blocked user cannot appear in search, send messages, or view blocker's profile

**Prisma Schema**:
```prisma
model Block {
  id        String    @id @default(uuid())
  blockerId String
  blockedId String
  reason    String?   @db.NVarChar(500)
  createdAt DateTime  @default(now())
  
  // Relationships
  blocker   User      @relation("Blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked   User      @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)

  @@unique([blockerId, blockedId]) // Can't block same user twice
  @@index([blockedId])             // Check if user is blocked before showing in results
}
```

**Business Rules**:
- Blocked users excluded from search results (FR-025)
- Blocked users can't initiate conversations (FR-030)
- Existing conversations archived when block occurs (FR-040)
- Blocked users can't re-register with same email/mobile (FR-068)

---

### 8. Administrator

**Description**: System administrator account with elevated privileges.

**Key Attributes**:
- `id` (UUID): Primary key, maps to Auth0 admin user_id
- `email` (VARCHAR(255)): Admin email (managed by Auth0)
- `createdAt` (DATETIME2): Admin account creation timestamp
- `createdBy` (UUID): Foreign key to Administrator (who created this admin)

**Lifecycle**:
- ✅ Created: Super-admin creates additional admin accounts (FR-062)
- ✅ All admins have equal privileges (no role hierarchy per constitution)

**Prisma Schema**:
```prisma
model Administrator {
  id         String         @id @default(uuid())
  email      String         @unique @db.VarChar(255)
  createdAt  DateTime       @default(now())
  createdBy  String?
  
  // Relationships
  creator    Administrator? @relation("AdminCreatedBy", fields: [createdBy], references: [id])
  createdAdmins Administrator[] @relation("AdminCreatedBy")
  reviewedReports Report[]

  @@index([email])
}
```

**Business Rules**:
- Super-admin account created during system deployment
- All admins have equal privileges (Clarification answer)
- Admin actions logged for audit (FR-075)

---

## Indexes & Performance Optimization

### Search Query Optimization
```sql
-- Multi-column index for flight search (source, destination, date range)
CREATE INDEX IX_Flight_Search ON Flight(sourceAirport, destinationAirport, travelDate);

-- Composite index for verification priority in search results
CREATE INDEX IX_User_Search ON User(mobileVerified, accountStatus);
```

### Cleanup Job Optimization
```sql
-- Index for expired flight deletion
CREATE INDEX IX_Flight_Cleanup ON Flight(travelDate) WHERE travelDate < DATEADD(day, -30, GETUTCDATE());

-- Index for expired message deletion (via conversation)
CREATE INDEX IX_Conversation_Cleanup ON Conversation(flightId);
```

### Admin Dashboard Optimization
```sql
-- Index for admin report queue
CREATE INDEX IX_Report_Queue ON Report(status, priority, createdAt) WHERE status IN ('PENDING', 'UNDER_REVIEW');
```

---

## Row-Level Security (Privacy Enforcement)

Azure SQL row-level security policies enforce privacy constraints at the database level:

```sql
-- Policy: Users can only read their own profile
CREATE SECURITY POLICY UserProfilePolicy
ADD FILTER PREDICATE dbo.fn_GetUserIdFromJWT() = id
ON dbo.User;

-- Policy: Mobile numbers never returned (enforced at column level)
-- Mobile numbers stored in Auth0 only, not in Azure SQL

-- Policy: Search results exclude blocked users
CREATE FUNCTION dbo.fn_IsNotBlocked(@userId UNIQUEIDENTIFIER)
RETURNS BIT
AS
BEGIN
  RETURN CASE 
    WHEN EXISTS (
      SELECT 1 FROM Block 
      WHERE blockedId = @userId 
        AND blockerId = dbo.fn_GetUserIdFromJWT()
    ) THEN 0
    ELSE 1
  END
END;

CREATE SECURITY POLICY SearchResultsPolicy
ADD FILTER PREDICATE dbo.fn_IsNotBlocked(id) = 1
ON dbo.User;
```

---

## Data Retention Policies (Automated)

### Scheduled Job: Cleanup Expired Flights
```sql
-- Runs daily at 2:00 AM UTC
CREATE PROCEDURE dbo.CleanupExpiredFlights
AS
BEGIN
  DELETE FROM Flight
  WHERE travelDate < DATEADD(day, -30, GETUTCDATE());
END;
```

### Scheduled Job: Cleanup Expired Messages
```sql
-- Runs daily at 2:30 AM UTC
CREATE PROCEDURE dbo.CleanupExpiredMessages
AS
BEGIN
  -- Delete conversations (cascade deletes messages)
  DELETE c FROM Conversation c
  INNER JOIN Flight f ON c.flightId = f.Id
  WHERE f.travelDate < DATEADD(day, -60, GETUTCDATE());
END;
```

---

## Schema Migration Strategy

Using Prisma Migrate for version-controlled schema changes:

```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Deploy to production
npx prisma migrate deploy
```

**Migration Naming Convention**:
- `YYYYMMDD_description` (e.g., `20251103_init`)
- Keep migrations atomic (one logical change per migration)
- Always test migrations in staging before production

---

## Next Steps

1. ✅ Generate Prisma schema from this data model
2. ✅ Create initial migration
3. ✅ Seed database with test data
4. ⏭️ Proceed to Phase 1 Contracts (API endpoint specifications)
