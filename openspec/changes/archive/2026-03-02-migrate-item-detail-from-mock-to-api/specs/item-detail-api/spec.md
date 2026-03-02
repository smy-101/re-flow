## ADDED Requirements

### Requirement: Article detail page displays article from database
The article detail page at `/items/[itemId]` SHALL fetch and display article data from the real API instead of mock data.

#### Scenario: User accesses existing article
- **WHEN** user navigates to `/items/1` where article ID 1 exists in database
- **THEN** page fetches article via `/api/items/1` endpoint
- **AND** displays article title, content, and metadata
- **AND** shows feed title from which the article originated

#### Scenario: User accesses non-existent article
- **WHEN** user navigates to `/items/999` where article ID 999 does not exist
- **THEN** API returns 404 status
- **AND** page displays "文章不存在" (article does not exist) message
- **AND** provides a back button to return to previous page

### Requirement: Article detail page auto-marks as read
The article detail page SHALL automatically mark an article as read when viewed.

#### Scenario: First-time view of unread article
- **WHEN** user navigates to an unread article
- **THEN** page calls `/api/items/[id]/read` endpoint with `isRead: true`
- **AND** updates local state to reflect read status
- **AND** subsequent list views show article as read

#### Scenario: Re-viewing already read article
- **WHEN** user navigates to an already read article
- **THEN** page does not call the read endpoint
- **AND** displays article content without redundant API call

### Requirement: Article detail page provides navigation
The article detail page SHALL provide previous/next navigation between articles in the user's feed.

#### Scenario: Navigate to previous article
- **WHEN** user clicks "Previous" button and not on first article
- **THEN** router navigates to previous article in the sorted list
- **AND** page loads with new article content

#### Scenario: Navigate to next article
- **WHEN** user clicks "Next" button and not on last article
- **THEN** router navigates to next article in the sorted list
- **AND** page loads with new article content

#### Scenario: Navigation disabled at boundaries
- **WHEN** user is on first article
- **THEN** "Previous" button is disabled or hidden
- **WHEN** user is on last article
- **THEN** "Next" button is disabled or hidden
