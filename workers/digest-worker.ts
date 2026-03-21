/**
 * Digest Worker Entry Point
 *
 * This unified worker handles:
 * - Email digest scheduling and sending
 * - RSS feed refresh before sending digests
 * - AI processing of articles before sending
 *
 * Previously, these were separate workers (rss-worker, processing-worker, digest-worker).
 * Now they are consolidated for efficiency.
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
