# Implementation Tasks

## 1. Setup

- [x] 1.1 Install dependencies: `drizzle-orm`, `better-sqlite3`, `bcrypt`, `drizzle-kit`, `@types/bcrypt`, `jose`
- [x] 1.2 Create `lib/db/` directory structure
- [x] 1.3 Create `drizzle.config.ts` configuration file
- [x] 1.4 Update `.gitignore` to exclude `*.db` and `*.db-journal`
- [x] 1.5 Add `JWT_SECRET` to `.env.local` (generate secure random string)

## 2. Database Schema

- [x] 2.1 Create `lib/db/schema.ts` with users table definition (id, username, password_hash, created_at)
- [x] 2.2 Create `lib/db/index.ts` to export database connection
- [x] 2.3 Generate initial migration using `drizzle-kit generate`
## 3. Auth Utilities

- [x] 3.1 Create `lib/auth/password.ts` with hashPassword function (bcrypt, salt rounds: 10)
- [x] 3.2 Add verifyPassword function to compare password with hash
- [x] 3.3 Create `lib/auth/jwt.ts` with signToken function using jose (HS256, 7 days expiration)
- [x] 3.4 Add verifyToken function to validate JWT signature and expiration
- [x] 3.5 Add getUserIdFromToken helper to extract user ID from valid token

## 4. Rate Limiting

- [x] 4.1 Create `lib/auth/rate-limit.ts` with in-memory rate limiter
- [x] 4.2 Implement sliding window rate limit (5 attempts per minute per IP)

## 5. API Routes - Register

- [x] 5.1 Create `app/api/auth/register/route.ts` POST endpoint
- [x] 5.2 Implement username validation (3-20 chars, alphanumeric + underscore)
- [x] 5.3 Implement password validation (min 8 chars)
- [x] 5.4 Check for duplicate username in database
- [x] 5.5 Hash password and create user record
- [x] 5.6 Return 201 on success, 400 on validation error

## 6. API Routes - Login

- [x] 6.1 Create `app/api/auth/login/route.ts` POST endpoint
- [x] 6.2 Validate request body (username and password required)
- [x] 6.3 Apply rate limiting to login endpoint
- [x] 6.4 Query user by username from database
- [x] 6.5 Verify password against stored hash
- [x] 6.6 Sign JWT with user ID and set HTTP-only Cookie on success
- [x] 6.7 Return 401 on invalid credentials
- [x] 6.8 Return 429 when rate limit exceeded

## 7. API Routes - Logout

- [x] 7.1 Create `app/api/auth/logout/route.ts` POST endpoint
- [x] 7.2 Clear JWT Cookie
- [x] 7.3 Redirect to home page

## 8. Middleware

- [x] 8.1 Create `middleware.ts` in project root
- [x] 8.2 Define protected routes matcher
- [x] 8.3 Extract JWT from Cookie
- [x] 8.4 Verify JWT signature and expiration for protected routes
- [x] 8.5 Redirect to login page if token invalid or missing

## 9. UI - Register Page

- [x] 9.1 Create `app/register/page.tsx` Client Component
- [x] 9.2 Add registration form with username and password fields
- [x] 9.3 Implement client-side form validation
- [x] 9.4 Handle API errors and display user-friendly messages
- [x] 9.5 Redirect to login page on successful registration
- [x] 9.6 Add link to login page

## 10. UI - Login Page

- [x] 10.1 Create `app/login/page.tsx` Client Component
- [x] 10.2 Add login form with username and password fields
- [x] 10.3 Handle API errors and display user-friendly messages
- [x] 10.4 Redirect to home page on successful login
- [x] 10.5 Add link to registration page

## 11. Testing

- [x] 11.1 Create `__tests__/lib/auth/password.test.ts` for password hash/verify functions
- [x] 11.2 Create `__tests__/lib/auth/jwt.test.ts` for JWT sign/verify functions
- [x] 11.3 Create `__tests__/lib/auth/rate-limit.test.ts` for rate limiter
- [ ] 11.4 Add integration test for registration flow
- [ ] 11.5 Add integration test for login/logout flow

## 12. Type Check

- [x] 12.1 Run `pnpm exec tsc --noEmit` to confirm zero type errors
