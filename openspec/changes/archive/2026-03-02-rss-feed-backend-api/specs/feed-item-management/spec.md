# Feed Item Management API

Backend API specification for RSS feed article/item management.

## ADDED Requirements

### Requirement: List feed items
The system SHALL provide an API endpoint that returns feed items with optional filtering by feedId, read status, and favorite status.

#### Scenario: List all items
- **WHEN** authenticated user sends GET request to `/api/items`
- **THEN** system returns array of item objects with id, feedId, title, link, content, publishedAt, isRead, isFavorite, author, readingTime
- **AND** items are scoped to user's feeds only
- **AND** items are ordered by publishedAt descending (newest first)
- **AND** response status is 200

#### Scenario: Filter by feed
- **WHEN** authenticated user sends GET to `/api/items?feedId=[feed-id]`
- **THEN** system returns only items belonging to specified feed
- **AND** feed belongs to authenticated user

#### Scenario: Filter unread items
- **WHEN** authenticated user sends GET to `/api/items?isRead=false`
- **THEN** system returns only unread items (isRead=false)

#### Scenario: Filter favorite items
- **WHEN** authenticated user sends GET to `/api/items?isFavorite=true`
- **THEN** system returns only favorited items (isFavorite=true)

#### Scenario: Combined filters
- **WHEN** authenticated user sends GET to `/api/items?feedId=[id]&isRead=false&isFavorite=true`
- **THEN** system applies all filters with AND logic
- **AND** returns matching items

### Requirement: Get single item
The system SHALL allow authenticated users to fetch a specific feed item via GET to `/api/items/[id]`.

#### Scenario: Successful item retrieval
- **WHEN** authenticated user GETs `/api/items/[id]` from their feed
- **THEN** system returns item object with all fields
- **AND** response status is 200

#### Scenario: Item not found
- **WHEN** authenticated user GETs `/api/items/[nonexistent-id]`
- **THEN** system returns 404 status

#### Scenario: Access item from another user's feed
- **WHEN** authenticated user GETs `/api/items/[id]` from feed owned by different user
- **THEN** system returns 403 status

### Requirement: Mark item as read/unread
The system SHALL allow authenticated users to update read status via PATCH to `/api/items/[id]/read`.

#### Scenario: Mark as read
- **WHEN** authenticated user PATCHes to `/api/items/[id]/read` with `{ isRead: true }`
- **THEN** system updates item's isRead to true
- **AND** decrements parent feed's unreadCount by 1
- **AND** returns updated item object
- **AND** response status is 200

#### Scenario: Mark as unread
- **WHEN** authenticated user PATCHes to `/api/items/[id]/read` with `{ isRead: false }`
- **THEN** system updates item's isRead to false
- **AND** increments parent feed's unreadCount by 1
- **AND** returns updated item object
- **AND** response status is 200

#### Scenario: Item not found
- **WHEN** authenticated user PATCHes to `/api/items/[nonexistent-id]/read`
- **THEN** system returns 404 status

#### Scenario: Unread count never negative
- **WHEN** authenticated user PATCHes an already-read item to read again
- **THEN** system does not decrement unreadCount below zero

### Requirement: Toggle item favorite status
The system SHALL allow authenticated users to toggle favorite status via POST to `/api/items/[id]/favorite`.

#### Scenario: Toggle to favorite
- **WHEN** authenticated user POSTs to `/api/items/[id]/favorite` for unfavorited item
- **THEN** system toggles isFavorite to true
- **AND** returns updated item object with isFavorite=true
- **AND** response status is 200

#### Scenario: Toggle to unfavorite
- **WHEN** authenticated user POSTs to `/api/items/[id]/favorite` for favorited item
- **THEN** system toggles isFavorite to false
- **AND** returns updated item object with isFavorite=false
- **AND** response status is 200

#### Scenario: Item not found
- **WHEN** authenticated user POSTs to `/api/items/[nonexistent-id]/favorite`
- **THEN** system returns 404 status
