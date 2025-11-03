<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- Modified principles: N/A (Initial creation)
- Added sections: All 6 core principles, Architecture & Technology, Development Standards, Governance
- Removed sections: None
- Templates updated:
  ✅ .specify/templates/plan-template.md (Constitution Check section updated with 6 principles)
  ✅ .specify/templates/spec-template.md (No changes needed - already technology-agnostic)
  ✅ .specify/templates/tasks-template.md (Foundational phase updated with constitution-aligned tasks)
- Prompts verified:
  ✅ .github/prompts/speckit.plan.prompt.md (Already references constitution properly)
- Follow-up TODOs: None
-->

# Travel Companion Constitution

## Core Principles

### I. Privacy-First Data Handling (NON-NEGOTIABLE)

The application MUST minimize personally identifiable information exposure to protect user privacy.

- User mobile numbers MUST NOT be shared or displayed to other users through any interface
- The messaging system MUST NOT expose mobile numbers in any form (headers, metadata, content)
- User information displayed to other users MUST be limited to: first name, travel route, languages spoken, travel date, and mobile verification status
- Users MUST receive explicit privacy warnings before initiating contact via the messaging system
- Data collection MUST be limited to essential fields only: first name, email address, and mobile number
- All sensitive data (credentials, mobile numbers) MUST be encrypted both in transit and at rest

**Rationale**: Privacy is the key feature and competitive differentiator. Users trust the platform with sensitive contact information specifically for fraud prevention, not for exposure to other travelers.

### II. Mobile-First Design

The application MUST prioritize mobile user experience and accessibility standards.

- UI components MUST be designed mobile-first, then adapted for tablet and desktop
- Touch targets MUST meet minimum 44×44 pixel dimensions per WCAG 2.1 Level AA
- All features MUST be fully functional on mobile devices without degradation
- Responsive design MUST adapt seamlessly across mobile, tablet, and desktop screen sizes
- Core functionality MUST load within 5 seconds on 3G network connections
- The application MUST meet WCAG 2.1 Level AA compliance for accessibility (screen readers, keyboard navigation, color contrast)

**Rationale**: Travel companions are primarily accessed on-the-go. Accessibility ensures inclusivity for users with disabilities and improves usability for all travelers.

### III. Single Page Application Architecture

The application MUST be implemented as a client-side SPA without custom backend APIs.

- All application logic MUST run in the browser as a single page application
- No custom backend API layer MUST be developed
- Third-party APIs MAY be consumed (e.g., flight information services) via appropriate integration patterns
- State management MUST be handled client-side
- Backend services MUST be limited to authentication (Auth0) and data storage
- Data persistence MUST leverage serverless/BaaS solutions compatible with SPA architecture

**Rationale**: SPA architecture reduces complexity, deployment overhead, and aligns with modern web development practices. Eliminates need for custom API development and maintenance.

### IV. Leverage Managed Authentication (NON-NEGOTIABLE)

The application MUST use Auth0 for all authentication and user registration capabilities.

- Auth0 MUST handle user registration, login (password and magic link), and session management
- Custom authentication solutions MUST NOT be implemented for capabilities offered by Auth0
- Mobile number collection and validation MUST integrate with Auth0 user metadata
- Auth0 rules/actions MAY be used for business logic (e.g., mobile number verification)
- Multi-factor authentication options SHOULD leverage Auth0's built-in capabilities
- User credential security MUST rely on Auth0's proven security infrastructure

**Rationale**: Authentication is a security-critical domain requiring expertise. Auth0 provides battle-tested security, compliance, and reliability that custom solutions cannot match cost-effectively.

### V. Unit Testability

All application code MUST be designed and implemented to support comprehensive unit testing.

- Components MUST be modular with clear, testable interfaces
- Business logic MUST be separated from UI presentation for independent testing
- Dependencies MUST be injectable to enable mocking and isolation
- Pure functions MUST be preferred for business logic transformations
- Side effects (API calls, storage) MUST be abstracted behind testable interfaces
- Test coverage targets MUST be defined and enforced in CI/CD pipelines
- Tests MUST be runnable in isolation without external dependencies

**Rationale**: Unit tests provide fast feedback, enable confident refactoring, and document intended behavior. Testable code tends to be more modular and maintainable.

### VI. Data Minimization and Retention

The application MUST collect and retain only necessary data for the minimum required duration.

- Personal data collection MUST be limited to first name, email, and mobile number
- Flight information MUST be automatically deleted 30 days after travel date
- Message conversations MUST be automatically deleted 60 days after associated flight date
- Users MUST have the ability to export their data (JSON format) and permanently delete their accounts
- Account deletion MUST complete within 7 days, removing all personal information from active systems
- Backup retention MUST be limited to 90 days maximum

**Rationale**: Data minimization reduces privacy risks, storage costs, and regulatory compliance burden. Automatic deletion aligns with the temporary nature of travel coordination.

## Architecture & Technology Stack

### Technology Constraints

- **Frontend Framework**: Modern JavaScript framework suitable for SPAs (React, Vue, or Angular)
- **Authentication**: Auth0 (mandatory)
- **Data Storage**: Serverless/BaaS solution compatible with SPA architecture (Firebase, Supabase, AWS Amplify, or similar)
- **Third-Party Integrations**: Flight information APIs (optional), SMS verification services (optional)
- **Hosting**: Static hosting platform with CDN support (Vercel, Netlify, CloudFlare Pages, AWS S3+CloudFront, or similar)

### Architecture Decisions

- Client-side routing for navigation
- State management library appropriate for chosen framework
- API client abstraction layer for third-party integrations
- Separation of concerns: presentation components vs. business logic modules
- Environment-based configuration management (dev, staging, production)

## Development Standards

### Code Quality Requirements

- **Linting**: ESLint (JavaScript/TypeScript) with project-specific rules enforced
- **Formatting**: Prettier or similar code formatter with consistent configuration
- **Type Safety**: TypeScript RECOMMENDED for enhanced maintainability and error prevention
- **Code Reviews**: All changes MUST be reviewed before merging to main branch
- **Documentation**: Complex business logic MUST include inline comments explaining rationale

### Testing Requirements

- **Unit Tests**: REQUIRED for all business logic and utility functions
- **Component Tests**: REQUIRED for UI components with business logic
- **Integration Tests**: REQUIRED for Auth0 integration and third-party API interactions
- **Accessibility Tests**: REQUIRED for WCAG 2.1 Level AA compliance verification
- **Test Coverage**: Minimum 70% code coverage for core functionality
- **CI/CD**: Automated test execution on every pull request

### Security Standards

- **Data Encryption**: TLS 1.2+ for all data in transit, AES-256 for data at rest
- **Input Validation**: All user inputs MUST be validated and sanitized client-side and server-side
- **XSS Prevention**: Framework-provided sanitization MUST be leveraged (e.g., React's JSX escaping)
- **CSRF Protection**: Auth0 and BaaS provider's built-in protections MUST be utilized
- **Dependency Security**: Regular vulnerability scanning and updates of third-party libraries
- **Privacy Compliance**: GDPR and CCPA compliance for data export and deletion rights

## Governance

This constitution supersedes all other development practices and documentation. All architectural decisions, feature implementations, and code contributions MUST align with these core principles.

### Amendment Process

- Constitution amendments REQUIRE explicit documentation of rationale and impact analysis
- Version numbering MUST follow semantic versioning:
  - **MAJOR**: Backward incompatible principle removals or redefinitions
  - **MINOR**: New principles added or materially expanded guidance
  - **PATCH**: Clarifications, wording improvements, non-semantic refinements
- All amendments MUST be propagated to dependent templates and documentation
- Amendment proposals MUST include migration plan if existing code is affected

### Compliance Verification

- All pull requests MUST verify compliance with constitutional principles
- Code reviews MUST explicitly validate:
  - Privacy-first data handling (no mobile number exposure)
  - Mobile-first and accessibility standards adherence
  - Auth0 usage for authentication (no custom auth)
  - Unit testability of new code
  - Data minimization and retention policies
- Architectural decisions deviating from these principles REQUIRE explicit justification and approval

### Conflict Resolution

- When principles conflict, the order of priority is:
  1. Privacy-First Data Handling
  2. Leverage Managed Authentication
  3. Mobile-First Design
  4. Unit Testability
  5. SPA Architecture
  6. Data Minimization and Retention
- Conflicts MUST be documented and resolved through team discussion before implementation

**Version**: 1.0.0 | **Ratified**: 2025-11-03 | **Last Amended**: 2025-11-03
