# rss-feed-fetching Specification

## Purpose
TBD - created by archiving change implement-rss-fetching. Update Purpose after archive.
## Requirements
### Requirement: Parse RSS feed from URL
The system SHALL parse RSS feed content from a given URL using the `rss-parser` library.

#### Scenario: Successful RSS parsing
- **WHEN** a valid RSS feed URL is provided
- **THEN** system parses the feed and extracts title, link, content, pubDate, and author for each item

#### Scenario: RSS parsing timeout
- **WHEN** RSS feed URL takes longer than 10 seconds to respond
- **THEN** system throws a timeout error and returns failure

### Requirement: Deduplicate feed items by link
The system SHALL prevent duplicate feed items from being stored based on the `link` field.

#### Scenario: New item with unique link
- **WHEN** an RSS item with a unique `link` value is parsed
- **THEN** system inserts the item into the `feed_items` table

#### Scenario: Existing item with same link
- **WHEN** an RSS item with an existing `link` value is parsed
- **THEN** system skips insertion and does not create a duplicate record

### Requirement: Store parsed items in database
The system SHALL store parsed RSS items in the `feed_items` table with proper field mapping.

#### Scenario: Store item with all fields
- **WHEN** an RSS item is parsed with title, link, content, publishedAt, and author
- **THEN** system stores the item with all fields mapped to `feed_items` schema

#### Scenario: Store item with missing optional fields
- **WHEN** an RSS item is parsed without author or readingTime
- **THEN** system stores the item with null values for optional fields

### Requirement: Calculate reading time
The system SHALL calculate estimated reading time for each feed item based on content length.

#### Scenario: Calculate reading time for text content
- **WHEN** an RSS item has 500 words of content
- **THEN** system sets `readingTime` to approximately 2 minutes (250 words per minute)

### Requirement: Update feed last refreshed timestamp
The system SHALL update the `lastUpdatedAt` timestamp of the feed after successful fetching.

#### Scenario: Successful fetch updates timestamp
- **WHEN** RSS feed items are successfully fetched and stored
- **THEN** system sets `feeds.lastUpdatedAt` to current Unix timestamp

### Requirement: Handle RSS fetch errors gracefully
The system SHALL handle RSS fetch errors without crashing and return meaningful error messages.

#### Scenario: Invalid feed URL
- **WHEN** RSS feed URL is unreachable or returns invalid content
- **THEN** system returns error message "Failed to fetch RSS feed"

#### Scenario: Network error
- **WHEN** network error occurs during RSS fetch
- **THEN** system returns error message "Network error while fetching feed"

