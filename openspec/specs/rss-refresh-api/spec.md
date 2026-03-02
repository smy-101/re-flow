# rss-refresh-api Specification

## Purpose
TBD - created by archiving change implement-rss-fetching. Update Purpose after archive.
## Requirements
### Requirement: Provide single feed refresh endpoint
The system SHALL provide a POST endpoint at `/api/feeds/[id]/refresh` to manually refresh a single RSS feed.

#### Scenario: Successful single feed refresh
- **WHEN** authenticated user POSTs to `/api/feeds/123/refresh` for a feed they own
- **THEN** system fetches RSS content, stores new items, updates lastUpdatedAt, and returns success with count

#### Scenario: Refresh non-existent feed
- **WHEN** authenticated user POSTs to `/api/feeds/999/refresh` for non-existent feed
- **THEN** system returns 404 with error "Feed not found"

#### Scenario: Refresh feed without permission
- **WHEN** authenticated user POSTs to `/api/feeds/123/refresh` for feed owned by another user
- **THEN** system returns 403 with error "Forbidden"

### Requirement: Return refresh result details
The refresh endpoint SHALL return details about items added and any errors encountered.

#### Scenario: Return success with new items
- **WHEN** refresh adds 3 new items
- **THEN** system returns `{ success: true, itemsAdded: 3 }`

#### Scenario: Return no new items
- **WHEN** refresh finds no new items
- **THEN** system returns `{ success: true, itemsAdded: 0 }`

#### Scenario: Return fetch error
- **WHEN** RSS fetch fails due to network error
- **THEN** system returns `{ success: false, error: "Failed to fetch RSS feed" }`

### Requirement: Provide batch refresh endpoint for worker
The system SHALL provide a POST endpoint at `/api/feeds/refresh-all` to refresh all feeds.

#### Scenario: Successful batch refresh
- **WHEN** worker POSTs to `/api/feeds/refresh-all` with valid CRON_SECRET
- **THEN** system refreshes all feeds and returns `{ processed: 10, results: [...] }`

#### Scenario: Batch refresh authentication
- **WHEN** request without CRON_SECRET attempts to access `/api/feeds/refresh-all`
- **THEN** system returns 401 with error "Unauthorized"

### Requirement: Trigger background fetch on feed creation
The POST /api/feeds endpoint SHALL trigger background RSS fetch after creating feed record.

#### Scenario: Subscribe triggers background fetch
- **WHEN** user creates new feed via POST /api/feeds
- **THEN** system returns 201 immediately, then asynchronously fetches RSS items

#### Scenario: Non-blocking background fetch
- **WHEN** background fetch is triggered
- **THEN** system does not wait for fetch completion before returning response

### Requirement: Update feed timestamp on refresh
The refresh endpoint SHALL update the feed's `lastUpdatedAt` timestamp after successful fetch.

#### Scenario: Timestamp updated after success
- **WHEN** RSS fetch completes successfully
- **THEN** system sets `feeds.lastUpdatedAt` to current Unix timestamp

#### Scenario: Timestamp not updated on failure
- **WHEN** RSS fetch fails with error
- **THEN** system does not modify `feeds.lastUpdatedAt`

### Requirement: Support manual refresh from UI
The system SHALL provide UI controls for users to manually trigger feed refresh.

#### Scenario: Refresh button on feed card
- **WHEN** user clicks refresh button on FeedCard component
- **THEN** system calls POST /api/feeds/[id]/refresh and updates UI with result

#### Scenario: Show loading state during refresh
- **WHEN** refresh request is in progress
- **THEN** system displays loading indicator on refresh button

#### Scenario: Show error message on failure
- **WHEN** refresh request fails
- **THEN** system displays error message to user with option to retry

