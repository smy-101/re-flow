# Specs

This change is a bug fix with no new or modified capabilities.

**No specification changes required.**

The feed detail page is being fixed to correctly use existing APIs that are already specified and implemented. The requirements for:
- Fetching a single feed by ID (`/api/feeds/[id]`)
- Fetching feed items (`/api/items`)

are already defined in the existing codebase. This change simply corrects an import statement to align the frontend with the already-specified backend behavior.
