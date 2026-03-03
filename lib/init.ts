/**
 * Application initialization module.
 * This module should be imported once at application startup to validate
 * environment variables and perform other startup checks.
 */

import { validateEnv } from './auth/env';

// Validate environment variables at startup
validateEnv();

// Add other initialization tasks here as needed
// For example:
// - Database connection checks
// - External service availability checks
// - Cache initialization

export {};
