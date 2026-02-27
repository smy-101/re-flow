# Implementation Tasks

## 1. Setup

- [ ] 1.1 Install dependencies: `drizzle-orm`, `better-sqlite3`, `bcrypt`, `drizzle-kit`, `@types/bcrypt`, `jose`
- [ ] 1.2 Create `lib/db/` directory structure
- [ ] 1.3 Create `drizzle.config.ts` configuration file
- [ ] 1.4 Update `.gitignore` to exclude `*.db` and `*.db-journal`
- [ ] 1.5 Add `JWT_SECRET` to `.env.local` (generate secure random string)

## 2. Database Schema

- [ ] 2.1 Create `lib/db/schema.ts` with users table definition (id, username, password_hash, created_at)
- [ ] 2.2 Create `lib/db/index.ts` to export database connection
- [ ] 2.3 Generate initial migration using `drizzle-kit generate`
- [ ] 2.4 Apply migration to create database tables

## 3. Auth Utilities

- [ ] 3.1 Create `lib/auth/password.ts` with hashPassword function (bcrypt, salt rounds: 10)
- [ ] 3.2 Add verifyPassword function to compare password with hash
- [ ] 3.3 Create `lib/auth/jwt.ts` with signToken function using jose (HS256, 7 days expiration)
- [ ] 3.4 Add verifyToken function to validate JWT signature and expiration
- [ ] 3.5 Add getUserIdFromToken helper to extract user ID from valid token

## 4. Rate Limiting

- [ ] 4.1 Create `lib/auth/rate-limit.ts` with in-memory rate limiter
- [ ] 4.2 Implement sliding window rate limit (5 attempts per minute per IP)

## 5. API Routes - Register

- [ ] 5.1 Create `app/api/auth/register/route.ts` POST endpoint
- [ ] 5.2 Implement username validation (3-20 chars, alphanumeric + underscore)
- [ ] 5.3 Implement password validation (min 8 chars)
- [ ] 5.4 Check for duplicate username in database
- [ ] 5.5 Hash password and create user record
- [ ] 5.6 Return 201 on success, 400 on validation error

## 6. API Routes - Login

- [ ] 6.1 Create `app/api/auth/login/route.ts` POST endpoint
- [ ] 6.2 Validate request body (username and password required)
- [ ] 6.3 Apply rate limiting to login endpoint
- [ ] 6.4 Query user by username from database
- [ ] 6.5 Verify password against stored hash
- [ ] 6.6 Sign JWT with user ID and set HTTP-only Cookie on success
- [ ] 6.7 Return 401 on invalid credentials
- [ ] 6.8 Return 429 when rate limit exceeded

## 7. API Routes - Logout

- [ ] 7.1 Create `app/api/auth/logout/route.ts` POST endpoint
- [ ] 7.2 Clear JWT Cookie
- [ ] 7.3 Redirect to home page

## 8. Middleware

- [ ] 8.1 Create `middleware.ts` in project root
- [ ] 8.2 Define protected routes matcher
- [ ] 8.3 Extract JWT from Cookie
- [ ] 8.4 Verify JWT signature and expiration for protected routes
- [ ] 8.5 Redirect to login page if token invalid or missing

## 9. UI - Register Page

- [ ] 9.1 Create `app/register/page.tsx` Client Component
- [ ] 9.2 Add registration form with username and password fields
- [ ] 9.3 Implement client-side form validation
- [ ] 9.4 Handle API errors and display user-friendly messages
- [ ] 9.5 Redirect to login page on successful registration
- [ ] 9.6 Add link to login page

## 10. UI - Login Page

- [ ] 10.1 Create `app/login/page.tsx` Client Component
- [ ] 10.2 Add login form with username and password fields
- [ ] 10.3 Handle API errors and display user-friendly messages
- [ ] 10.4 Redirect to home page on successful login
- [ ] 10.5 Add link to registration page

## 11. Testing

- [ ] 11.1 Create `__tests__/lib/auth/password.test.ts` for password hash/verify functions
- [ ] 11.2 Create `__tests__/lib/auth/jwt.test.ts` for JWT sign/verify functions
- [ ] 11.3 Create `__tests__/lib/auth/rate-limit.test.ts` for rate limiter
- [ ] 11.4 Add integration test for registration flow
- [ ] 11.5 Add integration test for login/logout flow

## 12. Type Check

- [ ] 12.1 Run `pnpm exec tsc --noEmit` to confirm zero type errors
