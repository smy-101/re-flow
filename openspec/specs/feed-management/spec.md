# Feed Management API

Backend API specification for RSS feed subscription management.

## Requirements

### Requirement: List user's feeds
The system SHALL provide an API endpoint that returns all RSS feeds owned by the authenticated user, ordered by most recently updated.

#### Scenario: Successful feed listing
- **WHEN** authenticated user sends GET request to `/api/feeds`
- **THEN** system returns array of feed objects with id, title, feedUrl, siteUrl, description, category, createdAt, lastUpdatedAt, unreadCount
- **AND** response status is 200
- **AND** feeds are scoped to current user only

#### Scenario: Empty feed list
- **WHEN** authenticated user with no subscriptions sends GET request to `/api/feeds`
- **THEN** system returns empty array
- **AND** response status is 200

#### Scenario: Unauthorized access
- **WHEN** unauthenticated request sends GET to `/api/feeds`
- **THEN** system returns 401 status
- **AND** error message indicates authentication required

### Requirement: Create new feed subscription
The system SHALL allow authenticated users to create new RSS feed subscriptions via POST to `/api/feeds`.

#### Scenario: Successful feed creation
- **WHEN** authenticated user POSTs to `/api/feeds` with feedUrl
- **THEN** system creates feed record in database
- **AND** returns created feed object with generated id
- **AND** feed is associated with user's userId
- **AND** `pipeline_id`, `template_id`, `auto_process` default to `null`, `null`, `false`
- **AND** response status is 201

#### Scenario: Feed URL already exists
- **WHEN** authenticated user attempts to create feed with feedUrl already subscribed
- **THEN** system returns 400 status
- **AND** error message indicates duplicate subscription

#### Scenario: Invalid feed URL format
- **WHEN** authenticated user POSTs to `/api/feeds` with malformed URL
- **THEN** system returns 400 status
- **AND** error message indicates invalid URL format

### Requirement: Update feed settings
The system SHALL allow authenticated users to update feed title, category, and auto-processing settings via PUT to `/api/feeds/[id]`.

#### Scenario: Successful feed update
- **WHEN** authenticated user PUTs to `/api/feeds/[id]` with valid fields
- **THEN** system updates feed record
- **AND** returns updated feed object including `pipeline_id`, `template_id`, `auto_process`
- **AND** lastUpdatedAt timestamp is refreshed
- **AND** response status is 200

#### Scenario: Update auto-processing config
- **WHEN** authenticated user PUTs with `auto_process: true` and `pipeline_id: 5`
- **THEN** system updates `auto_process` to `true`
- **AND** sets `pipeline_id` to `5`
- **AND** sets `template_id` to `null`

#### Scenario: Update non-existent feed
- **WHEN** authenticated user PUTs to `/api/feeds/[nonexistent-id]`
- **THEN** system returns 404 status
- **AND** error message indicates feed not found

#### Scenario: Update another user's feed
- **WHEN** authenticated user attempts to PUT to `/api/feeds/[id]` owned by different user
- **THEN** system returns 403 status
- **AND** error message indicates forbidden access

#### Scenario: Invalid pipeline/template reference
- **WHEN** user provides `pipeline_id` that doesn't exist or belongs to another user
- **THEN** system returns 400 status
- **AND** error message indicates invalid reference

### Requirement: Delete feed subscription
The system SHALL allow authenticated users to delete their feed subscriptions via DELETE to `/api/feeds/[id]`.

#### Scenario: Successful feed deletion
- **WHEN** authenticated user DELETEs to `/api/feeds/[id]` they own
- **THEN** system deletes feed record
- **AND** cascades deletion to all associated feed_items
- **AND** response status is 204

#### Scenario: Delete non-existent feed
- **WHEN** authenticated user DELETEs to `/api/feeds/[nonexistent-id]`
- **THEN** system returns 404 status

#### Scenario: Delete another user's feed
- **WHEN** authenticated user attempts to DELETE to `/api/feeds/[id]` owned by different user
- **THEN** system returns 403 status

### Requirement: Get single feed details
The system SHALL allow authenticated users to fetch details of a specific feed via GET to `/api/feeds/[id]`.

#### Scenario: Successful feed retrieval
- **WHEN** authenticated user GETs `/api/feeds/[id]` they own
- **THEN** system returns feed object with all fields including `pipeline_id`, `template_id`, `auto_process`
- **AND** response status is 200

#### Scenario: Feed not found
- **WHEN** authenticated user GETs `/api/feeds/[nonexistent-id]`
- **THEN** system returns 404 status

#### Scenario: Access another user's feed
- **WHEN** authenticated user GETs `/api/feeds/[id]` owned by different user
- **THEN** system returns 403 status

### Requirement: Validate auto-processing config
The system SHALL validate auto-processing configuration before saving.

#### Scenario: Pipeline and template mutual exclusion
- **WHEN** user provides both `pipeline_id` and `template_id`
- **THEN** system returns 400 status
- **AND** error message indicates "管道和模板只能选择一个"

#### Scenario: Auto-process requires config
- **WHEN** user sets `auto_process: true`
- **AND** does not provide `pipeline_id` or `template_id`
- **THEN** system returns 400 status
- **AND** error message indicates "启用自动处理需要选择管道或模板"
