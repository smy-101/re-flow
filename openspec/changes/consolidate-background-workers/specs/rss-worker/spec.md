## REMOVED Requirements

### Requirement: Schedule periodic RSS refresh

**Reason**: RSS 抓取改为在摘要发送前按需触发，不再需要定时调度

**Migration**: 删除独立的 `workers/rss-worker.ts`，RSS 刷新逻辑合并到 digest-worker

---

### Requirement: Fetch all user feeds

**Reason**: 改为根据摘要过滤规则只刷新相关的 RSS 源

**Migration**: 使用 `lib/digest/refresher.ts` 中的 `refreshFeedsForDigest()` 函数

---

## MODIFIED Requirements

### Requirement: Run as independent background process

The RSS worker SHALL run as a separate Node.js process independent of the Next.js application.

#### Scenario: Worker starts independently
- **WHEN** worker process is started via `pnpm worker:digest`
- **THEN** worker initializes and begins scheduling digest tasks (including RSS refresh)
- **AND** RSS refresh is triggered on-demand before each digest send

---

### Requirement: Process feeds sequentially

The worker SHALL process RSS feeds one at a time to avoid overwhelming the server.

#### Scenario: Process feeds with delay
- **WHEN** multiple feeds need to be refreshed
- **THEN** worker processes each feed with a small delay between requests (500ms)

---

### Requirement: Respect minimum refresh interval

The worker SHALL skip feeds that were refreshed within the last 5 minutes.

#### Scenario: Skip recently refreshed feed
- **WHEN** a feed's `lastUpdatedAt` is less than 5 minutes ago
- **THEN** worker skips processing that feed

#### Scenario: Process stale feed
- **WHEN** a feed's `lastUpdatedAt` is more than 5 minutes ago
- **THEN** worker processes that feed
