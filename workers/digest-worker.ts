/**
 * Digest Worker Entry Point
 *
 * This worker runs the email digest scheduler, checking every 5 minutes
 * for due digests and sending them to users.
 *
 * Usage: pnpm worker:digest
 */

// Load environment variables - load all env files
import { config } from 'dotenv';
config({ path: '.env', override: true });
config({ path: '.env.local', override: true });
config({ path: '.env.development', override: true });
config({ path: '.env.development.local', override: true });

// Import and start the worker
import('../lib/digest/worker.js');
