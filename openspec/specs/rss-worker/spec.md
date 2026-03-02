# rss-worker Specification

## Purpose
TBD - created by archiving change implement-rss-fetching. Update Purpose after archive.
## Requirements
### Requirement: Run as independent background process
The RSS worker SHALL run as a separate Node.js process independent of the Next.js application.

#### Scenario: Worker starts independently
- **WHEN** worker process is started via `pnpm worker:rss`
- **THEN** worker initializes and begins scheduling tasks without affecting Next.js process

### Requirement: Schedule periodic RSS refresh
The worker SHALL schedule RSS feed refresh every 30 minutes using cron expression.

#### Scenario: Cron schedule triggers
- **WHEN** cron schedule expression `*/30 * * * *` triggers
- **THEN** worker initiates refresh of all subscribed RSS feeds

### Requirement: Fetch all user feeds
The worker SHALL fetch all RSS feeds from the database for processing.

#### Scenario: Retrieve all feeds
- **WHEN** scheduled refresh triggers
- **THEN** worker queries all records from `feeds` table

### Requirement: Process feeds sequentially
The worker SHALL process RSS feeds one at a time to avoid overwhelming the server.

#### Scenario: Process feeds with delay
- **WHEN** multiple feeds exist in database
- **THEN** worker processes each feed with a small delay between requests

### Requirement: Respect minimum refresh interval
The worker SHALL skip feeds that were refreshed within the last 5 minutes.

#### Scenario: Skip recently refreshed feed
- **WHEN** a feed's `lastUpdatedAt` is less than 5 minutes ago
- **THEN** worker skips processing that feed

#### Scenario: Process stale feed
- **WHEN** a feed's `lastUpdatedAt` is more than 5 minutes ago
- **THEN** worker processes that feed

### Requirement: Log worker activity
The worker SHALL log important events including start, fetch completion, and errors.

#### Scenario: Log successful batch
- **WHEN** a batch of feeds is processed successfully
- **THEN** worker logs summary with feeds processed and items added

#### Scenario: Log fetch error
- **WHEN** an individual feed fetch fails
- **THEN** worker logs error with feed ID and error message

### Requirement: Continue processing on individual failures
The worker SHALL continue processing remaining feeds even if one feed fails.

#### Scenario: Partial batch failure
- **WHEN** one feed fails to fetch but other feeds remain
- **THEN** worker logs error and continues with remaining feeds

### Requirement: Use shared database connection
The worker SHALL use the same database connection utilities as the main application.

#### Scenario: Worker database access
- **WHEN** worker needs to access database
- **THEN** worker imports and uses `lib/db` connection module

### Requirement: Prepare for AI processing extension
The worker architecture SHALL support future addition of AI processing pipeline.

#### Scenario: Extensible pipeline
- **WHEN** AI processing feature is added in future
- **THEN** worker can add AI processing step after RSS fetching without major refactoring

