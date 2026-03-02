# RSS Feed Validation API

Backend API specification for RSS feed URL validation and metadata extraction.

## ADDED Requirements

### Requirement: Validate RSS feed URL
The system SHALL provide an API endpoint to validate RSS feed URLs and extract feed metadata before subscription.

#### Scenario: Valid RSS feed URL
- **WHEN** authenticated user POSTs to `/api/feeds/validate` with valid `{ feedUrl }`
- **THEN** system attempts to fetch and parse the RSS feed
- **AND** returns `{ valid: true, title: <extracted-title> }`
- **AND** response status is 200
- **AND** title is extracted from feed's channel/title element

#### Scenario: Invalid RSS feed format
- **WHEN** authenticated user POSTs to `/api/feeds/validate` with URL that doesn't return valid RSS/Atom
- **THEN** system returns `{ valid: false, error: <error-message> }`
- **AND** response status is 200
- **AND** error message indicates feed parsing failed

#### Scenario: Invalid URL format
- **WHEN** authenticated user POSTs to `/api/feeds/validate` with malformed URL
- **THEN** system returns `{ valid: false, error: "URL 格式无效" }`
- **AND** response status is 200

#### Scenario: Network error
- **WHEN** authenticated user POSTs to `/api/feeds/validate` with URL that fails network request
- **THEN** system returns `{ valid: false, error: <network-error-message> }`
- **AND** response status is 200

#### Scenario: Missing feedUrl parameter
- **WHEN** authenticated user POSTs to `/api/feeds/validate` without feedUrl in request body
- **THEN** system returns 400 status
- **AND** error message indicates required parameter missing

#### Scenario: Unauthorized access
- **WHEN** unauthenticated request POSTs to `/api/feeds/validate`
- **THEN** system returns 401 status

### Requirement: Support multiple feed formats
The system SHALL accept and parse both RSS and Atom feed formats during validation.

#### Scenario: Parse RSS 2.0 feed
- **WHEN** authenticated user validates URL serving RSS 2.0 format
- **THEN** system successfully parses feed
- **AND** returns valid with extracted title

#### Scenario: Parse Atom feed
- **WHEN** authenticated user validates URL serving Atom format
- **THEN** system successfully parses feed
- **AND** returns valid with extracted title

#### Scenario: Parse RSS 1.0/RSS 0.9 feed
- **WHEN** authenticated user validates URL serving legacy RSS format
- **THEN** system successfully parses feed if supported by parser library
- **AND** returns valid with extracted title
