# Research: Travel Companion AU

**Phase**: 0 - Technical Research & Decision Making  
**Date**: 2025-11-03  
**Status**: Complete

## Overview

This document captures technical research findings and architectural decisions for the Travel Companion AU feature. All research aligns with the Travel Companion Constitution v1.0.0 principles.

## Research Areas

### 1. Next.js Static Export for SPA Architecture

**Decision**: Use Next.js 14 with App Router in static export mode (`output: 'export'`)

**Rationale**:
- **Constitution Compliance**: Satisfies "No custom backend APIs" requirement (Principle III)
- **Static Generation**: Entire app exports to static HTML/CSS/JS, deployable to Azure Static Web Apps
- **Client-Side Routing**: Next.js App Router handles navigation without server round-trips
- **Performance**: Pre-rendered pages = instant loads, excellent for mobile (Principle II)
- **Developer Experience**: TypeScript first-class support, hot reload, automatic code splitting

**Alternatives Considered**:
- **Create React App**: Deprecated, lacks modern features, poor TypeScript support
- **Vite + React**: Good performance but requires manual routing setup, no file-based routing
- **Plain React**: Too much boilerplate, no optimization out-of-the-box

**Implementation Notes**:
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export mode
  images: {
    unoptimized: true  // Required for static export
  },
  trailingSlash: true,  // Better Azure Static Web Apps compatibility
}
```

**Trade-offs**:
- ❌ No Server-Side Rendering (SSR) - acceptable since auth via Auth0, data from Azure SQL
- ❌ No API routes - constitution requires this anyway
- ✅ CDN-friendly, global distribution
- ✅ Zero infrastructure management

---

### 2. Azure SQL Database + Prisma ORM

**Decision**: Azure SQL Database (Serverless tier) with Prisma ORM for client-side data access

**Rationale**:
- **Serverless Auto-Scaling**: Aligns with constitution requirement for dynamic scaling (Clarification: "No hard limit - scale resources dynamically")
- **Row-Level Security**: Azure SQL supports RLS with Auth0 JWT claims - enforces privacy at database level
- **Prisma Type Safety**: Generated TypeScript types from schema ensure compile-time safety
- **Connection Pooling**: Prisma manages connections efficiently from browser (via Prisma Data Proxy for production)
- **Migration Management**: Prisma Migrate handles schema versioning

**Alternatives Considered**:
- **Firebase**: Not in user's tech stack, vendor lock-in concerns
- **Supabase**: Strong candidate but user specified Azure SQL
- **CosmosDB**: Overkill for relational data, higher cost
- **MongoDB**: Document model doesn't fit relational flight/user/message structure

**Implementation Notes**:
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

// Row-Level Security via Auth0 claims
// Azure SQL function: dbo.fn_GetUserIdFromJWT()
```

**Security Considerations**:
- **Mobile Number Encryption**: Use Azure SQL `EncryptByKey` for mobile numbers at rest
- **JWT Validation**: Azure SQL validates Auth0 JWT before query execution
- **Prepared Statements**: Prisma automatically uses parameterized queries (SQL injection protection)

**Cost Optimization**:
- Serverless tier auto-pauses after inactivity (5-minute threshold)
- Pay only for vCore-seconds used + storage
- Estimated cost: ~$5-20/month for 1,000 users (based on usage patterns)

---

### 3. Auth0 Integration Strategy

**Decision**: Auth0 React SDK with Universal Login (password + magic link), mobile numbers in user_metadata

**Rationale**:
- **Constitution Mandate**: Principle IV requires Auth0 for all authentication
- **Magic Link Support**: Built-in passwordless authentication via Auth0 Dashboard config
- **Mobile Number Storage**: `user_metadata` appropriate for non-authenticating PII
- **SMS Verification**: Auth0 Actions can trigger SMS verification via Twilio integration
- **Token Management**: Automatic refresh, secure storage in browser memory (not localStorage)

**Configuration Steps**:
1. Create Auth0 Application (Single Page Application type)
2. Enable Authentication Methods:
   - Username-Password-Authentication (default database)
   - Email (passwordless) for magic link
3. Configure Actions:
   - Post-Registration: Store mobile number in `user_metadata`
   - Post-Login: Optionally trigger SMS verification if unverified
4. Set up Custom Claims:
   - Add `user_id`, `email`, `mobile_verified` to JWT for Azure SQL RLS

**Implementation Notes**:
```typescript
// src/lib/auth0.ts
export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: 'openid profile email'
  }
};
```

**Privacy Compliance**:
- Mobile numbers stored in Auth0 (encrypted at rest, EU/US data residency options)
- Never exposed via Auth0 Management API to other users
- Only accessible via authenticated user's own profile endpoint

---

### 4. Mobile-First CSS Framework: Tailwind CSS

**Decision**: Tailwind CSS 3.x with mobile-first breakpoints and accessibility utilities

**Rationale**:
- **Mobile-First Design**: Tailwind's default breakpoints start mobile (Principle II)
- **Touch Target Enforcement**: Custom Tailwind plugin enforces 44×44px minimum
- **Accessibility**: Built-in `sr-only` for screen readers, focus states
- **Performance**: PurgeCSS removes unused styles (critical for 3G loading time)
- **Developer Productivity**: IntelliSense autocomplete, rapid prototyping

**Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      minWidth: { '11': '2.75rem' }, // 44px minimum
      minHeight: { '11': '2.75rem' },
      colors: {
        // WCAG AA compliant contrast ratios
        'primary': { DEFAULT: '#0066CC', light: '#3399FF' },
        'danger': { DEFAULT: '#CC0000', light: '#FF3333' }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),     // Accessible form styles
    require('@tailwindcss/typography'), // Readable text
  ]
}
```

**Accessibility Plugin**:
```javascript
// Custom Tailwind plugin for touch targets
plugin(function({ addUtilities }) {
  addUtilities({
    '.touch-target': {
      'min-width': '44px',
      'min-height': '44px',
    }
  })
})
```

**Alternatives Considered**:
- **Material-UI (MUI)**: Heavier bundle size, not mobile-first by default
- **Chakra UI**: Good accessibility but slower build times
- **Bootstrap**: Legacy framework, not modern React patterns

---

### 5. Data Retention Automation Strategy

**Decision**: Azure SQL scheduled jobs via SQL Agent for automated deletion (flights: 30d, messages: 60d post-flight)

**Rationale**:
- **Constitution Requirement**: Principle VI mandates automatic data deletion
- **Reliability**: SQL Agent jobs run server-side (no dependency on client or separate cron service)
- **Transactional**: Deletions run in transactions, ensuring data consistency
- **Auditing**: SQL Server audit logs track deletion events for compliance

**Implementation**:
```sql
-- Azure SQL Scheduled Job (runs daily at 2 AM UTC)
CREATE PROCEDURE dbo.CleanupExpiredFlights
AS
BEGIN
  DELETE FROM Flights
  WHERE TravelDate < DATEADD(day, -30, GETUTCDATE());
END;

CREATE PROCEDURE dbo.CleanupExpiredMessages
AS
BEGIN
  DELETE m FROM Messages m
  INNER JOIN Conversations c ON m.ConversationId = c.Id
  INNER JOIN Flights f ON c.FlightId = f.Id
  WHERE f.TravelDate < DATEADD(day, -60, GETUTCDATE());
END;
```

**Alternatives Considered**:
- **Azure Functions (Timer Trigger)**: Requires separate infrastructure, more complex
- **GitHub Actions Cron**: Unreliable, depends on repo activity, not transactional
- **Client-Side Cleanup**: Insecure, can be bypassed

**Trade-offs**:
- ✅ No additional infrastructure cost
- ✅ Guaranteed execution (SQL Agent reliability)
- ⚠️ Requires SQL Server Agent (available in Azure SQL Basic tier and above)

---

### 6. Accessibility Testing Strategy

**Decision**: Axe DevTools + Jest integration for automated WCAG 2.1 AA compliance

**Rationale**:
- **Constitution Mandate**: Principle II requires WCAG 2.1 Level AA
- **Automated Testing**: Axe catches 57% of WCAG issues automatically (industry standard)
- **CI Integration**: Jest + axe-core runs on every PR
- **Manual Testing**: Axe browser extension for dev QA

**Implementation**:
```typescript
// tests/accessibility/a11y.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('SearchForm has no accessibility violations', async () => {
  const { container } = render(<SearchForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual Testing Checklist**:
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader testing (NVDA on Windows, VoiceOver on macOS)
- [ ] Color contrast validation (WebAIM Contrast Checker)
- [ ] Touch target size verification (Chrome DevTools)
- [ ] Focus indicators visible

**WCAG 2.1 AA Requirements Mapped to Components**:
- **1.4.3 Contrast**: Tailwind custom colors (4.5:1 ratio)
- **2.1.1 Keyboard**: All interactive elements focusable
- **2.4.7 Focus Visible**: Custom focus ring styles
- **3.2.4 Consistent Identification**: Icon + label pattern
- **4.1.2 Name, Role, Value**: ARIA labels on all inputs

---

### 7. Testing Strategy: Jest + Mocha + React Testing Library

**Decision**: Jest for unit tests, Mocha for integration tests, React Testing Library for component tests

**Rationale**:
- **User Requirement**: "Testing: Jest, Mocha" specified in plan input
- **Jest**: Fast, excellent React support, snapshot testing, code coverage
- **Mocha**: Flexible, good for async integration tests (Auth0, Azure SQL)
- **React Testing Library**: Encourages accessibility-focused testing (query by role, label)

**Test Structure**:
```typescript
// tests/unit/hooks/useSearch.test.ts (Jest)
import { renderHook, waitFor } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';

test('useSearch filters by language', async () => {
  const { result } = renderHook(() => useSearch());
  
  act(() => {
    result.current.setFilter({ language: 'Spanish' });
  });
  
  await waitFor(() => {
    expect(result.current.results).toHaveLength(3);
  });
});

// tests/integration/auth.test.ts (Mocha)
import { expect } from 'chai';
import { authenticateUser } from './helpers';

describe('Auth0 Integration', () => {
  it('stores mobile number in user_metadata', async () => {
    const user = await authenticateUser({ mobile: '+61412345678' });
    expect(user.user_metadata.mobile_number).to.equal('+61412345678');
  });
});
```

**Coverage Targets**:
- Unit tests: ≥80% coverage
- Integration tests: Critical paths (auth, search, messaging)
- Accessibility tests: All user-facing components

---

### 8. Privacy Warning Implementation (FR-028)

**Decision**: Modal dialog with "Don't show again" checkbox, stored in localStorage

**Rationale**:
- **Constitution Requirement**: Users must receive privacy warnings before messaging
- **User Experience**: Show once per user, non-intrusive
- **Accessibility**: Modal traps focus, Escape key to dismiss

**Implementation**:
```typescript
// src/components/ui/PrivacyWarning.tsx
export function PrivacyWarning({ onAccept }: { onAccept: () => void }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem('privacy-warning-accepted', 'true');
    }
    onAccept();
  };
  
  return (
    <Modal aria-labelledby="privacy-warning-title">
      <h2 id="privacy-warning-title">Privacy Notice</h2>
      <p>
        Your first name will be visible to the person you're messaging. 
        Do not share sensitive information like your full address, credit card details, 
        or other personal data.
      </p>
      <Checkbox 
        checked={dontShowAgain} 
        onChange={setDontShowAgain}
        label="Don't show this again"
      />
      <Button onClick={handleAccept} className="touch-target">
        I Understand
      </Button>
    </Modal>
  );
}
```

**User Flow**:
1. User clicks "Send Message" for first time
2. Privacy warning modal appears (focus trapped)
3. User reads warning, optionally checks "Don't show again"
4. User clicks "I Understand" → message composer opens
5. Subsequent messages skip warning if localStorage flag set

---

### 9. Mobile Number Validation: E.164 Format

**Decision**: Zod schema with regex validation for E.164 international format

**Rationale**:
- **Specification Requirement**: FR-003 mandates E.164 validation
- **International Support**: Travelers from all countries (assumption in spec)
- **Type Safety**: Zod provides TypeScript types + runtime validation

**Implementation**:
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const MobileNumberSchema = z.string()
  .regex(/^\+[1-9]\d{1,14}$/, {
    message: 'Mobile number must be in international format (e.g., +61412345678)'
  });

export const ProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  email: z.string().email(),
  mobileNumber: MobileNumberSchema,
  languages: z.array(z.string()).min(1)
});

// Usage in form
const form = useForm<ProfileInput>({
  resolver: zodResolver(ProfileSchema)
});
```

**E.164 Format Rules**:
- Starts with `+` (country code prefix)
- Country code: 1-3 digits
- Subscriber number: up to 12 digits
- Total length: max 15 digits (including country code)

**Examples**:
- ✅ `+61412345678` (Australia)
- ✅ `+12025551234` (USA)
- ✅ `+442071234567` (UK)
- ❌ `0412345678` (missing country code)
- ❌ `+61 412 345 678` (contains spaces)

---

### 10. GitHub Actions Deployment to Azure Static Web Apps

**Decision**: Use Azure-provided GitHub Actions workflow for automated deployment

**Rationale**:
- **User Requirement**: "Deployment: Github action (will be created by Azure)" specified
- **Auto-Generated**: Azure Static Web Apps wizard creates workflow file automatically
- **Zero Configuration**: Push to `main` → auto-deploy
- **Preview Deployments**: PRs get preview URLs

**Workflow Structure** (auto-generated by Azure):
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build Next.js
        run: npm run build
        
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          output_location: 'out'  # Next.js static export directory
```

**CI/CD Pipeline**:
1. Code pushed to `main` or PR opened
2. Install dependencies (npm ci)
3. Run linting (BiomeJS)
4. Run tests (Jest + Mocha)
5. Build Next.js static export
6. Deploy to Azure Static Web Apps
7. Comment PR with preview URL

---

## Research Summary

All technical decisions align with the Travel Companion Constitution v1.0.0. Key findings:

- ✅ **Privacy-First**: Mobile numbers encrypted, never exposed via APIs
- ✅ **Mobile-First**: Tailwind CSS mobile-first, WCAG 2.1 AA compliance via Axe
- ✅ **SPA Architecture**: Next.js static export, no custom backend APIs
- ✅ **Auth0**: Mandatory for authentication, mobile numbers in user_metadata
- ✅ **Unit Testability**: Custom hooks isolate business logic, React Testing Library
- ✅ **Data Minimization**: Azure SQL scheduled jobs automate deletion policies

**Risk Mitigation**:
- **Prisma from Browser**: Use Prisma Data Proxy in production (secure connection pooling)
- **Auth0 Costs**: Free tier supports 7,000 active users (sufficient for MVP)
- **Azure SQL Serverless**: Auto-pause feature may cause cold start latency (~1-2s)

**Next Steps**: Proceed to Phase 1 - Data Model & Contracts design.
