## ADDED Requirements

### Requirement: Verify JWT token for protected routes

The system SHALL verify the JWT token from the `token` Cookie for all incoming requests, except for routes defined in the public whitelist.

#### Scenario: Valid token allows access to protected page
- **WHEN** a request is made to a protected route (e.g., `/dashboard`)
- **AND** the request contains a valid JWT token in the `token` Cookie
- **THEN** the system SHALL allow the request to proceed to the requested page

#### Scenario: Missing token redirects to login
- **WHEN** a request is made to a protected route
- **AND** the request does not contain a `token` Cookie
- **THEN** the system SHALL redirect the user to `/login` with HTTP 302 status

#### Scenario: Invalid token redirects to login
- **WHEN** a request is made to a protected route
- **AND** the request contains an invalid or expired JWT token
- **THEN** the system SHALL redirect the user to `/login` with HTTP 302 status

#### Scenario: Public routes bypass authentication
- **WHEN** a request is made to `/login`, `/register`, or related API endpoints
- **THEN** the system SHALL allow the request to proceed without JWT verification

### Requirement: Maintain public route whitelist

The system SHALL maintain a configurable list of public routes that bypass JWT authentication.

#### Scenario: Login page is accessible without authentication
- **WHEN** a user navigates to `/login`
- **THEN** the system SHALL serve the login page without requiring a JWT token

#### Scenario: Register page is accessible without authentication
- **WHEN** a user navigates to `/register`
- **THEN** the system SHALL serve the register page without requiring a JWT token

#### Scenario: Authentication API endpoints are public
- **WHEN** a request is made to `/api/auth/login` or `/api/auth/register`
- **THEN** the system SHALL allow the request without JWT verification

### Requirement: Edge Runtime compatibility

The middleware SHALL use Edge Runtime compatible libraries for JWT verification.

#### Scenario: Middleware runs in Edge Runtime
- **WHEN** the Next.js middleware is invoked
- **THEN** the system SHALL verify JWT using an Edge-compatible library (e.g., `jose`)
- **AND** the verification SHALL complete without requiring Node.js-specific APIs
