# Feed Categories API

Backend API specification for feed category management and listing.

## Requirements

### Requirement: List available categories
The system SHALL provide an API endpoint that returns a list of predefined feed categories for organizing subscriptions.

#### Scenario: Successful category listing
- **WHEN** authenticated user sends GET request to `/api/categories`
- **THEN** system returns array of category strings
- **AND** categories include: 技术, 设计, 新闻, 博客, 科学, 金融, 娱乐, 体育
- **AND** response status is 200

#### Scenario: Categories are static
- **WHEN** any authenticated user requests `/api/categories`
- **THEN** system returns the same predefined list
- **AND** categories are not user-specific
- **AND** categories are not stored in database

### Requirement: Allow uncategorized feeds
The system SHALL allow feeds to be created without a category (empty string or null).

#### Scenario: Create feed without category
- **WHEN** authenticated user creates feed with category omitted or empty string
- **THEN** system creates feed with category field as empty string or null
- **AND** feed appears in feed list without category display

#### Scenario: Update feed to remove category
- **WHEN** authenticated user updates feed setting category to empty string
- **THEN** system updates feed with category field cleared
- **AND** feed no longer has associated category

### Requirement: Category is optional text field
The system SHALL store category as a simple text field on the feed record, not as a relational table.

#### Scenario: Category is free-text
- **WHEN** authenticated user creates or updates feed with any category string value
- **THEN** system accepts the value
- **AND** stores exactly as provided (no validation against predefined list)

#### Scenario: Custom categories allowed
- **WHEN** authenticated user uses category not in predefined list (e.g., "个人博客")
- **THEN** system accepts custom category value
- **AND** stores and returns custom category on feed object
