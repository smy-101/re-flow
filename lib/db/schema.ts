import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const feeds = sqliteTable(
  'feeds',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    feedUrl: text('feed_url').notNull().unique(),
    siteUrl: text('site_url'),
    description: text('description'),
    category: text('category'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    lastUpdatedAt: integer('last_updated_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdIdx: index('feeds_user_id_idx').on(table.userId),
  }),
);

export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;

export const feedItems = sqliteTable(
  'feed_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    feedId: integer('feed_id')
      .notNull()
      .references(() => feeds.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    link: text('link').notNull(),
    content: text('content').notNull(),
    publishedAt: integer('published_at').notNull(),
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
    isFavorite: integer('is_favorite', { mode: 'boolean' })
      .notNull()
      .default(false),
    author: text('author'),
    readingTime: integer('reading_time'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    feedIdIdx: index('feed_items_feed_id_idx').on(table.feedId),
    userIdIdx: index('feed_items_user_id_idx').on(table.userId),
    publishedAtIdx: index('feed_items_published_at_idx').on(table.publishedAt),
    isFavoriteIdx: index('feed_items_is_favorite_idx').on(table.isFavorite),
  }),
);

export type FeedItem = typeof feedItems.$inferSelect;
export type NewFeedItem = typeof feedItems.$inferInsert;

export const aiConfigs = sqliteTable(
  'ai_configs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    providerType: text('provider_type').notNull(), // 'openai' | 'anthropic' | 'openai-compatible' | 'anthropic-compatible' | 'custom'
    providerId: text('provider_id'), // Preset provider ID, e.g., 'deepseek', 'qwen'
    apiFormat: text('api_format').notNull(), // 'openai' | 'anthropic'
    baseURL: text('base_url').notNull(),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    apiKeyIv: text('api_key_iv').notNull(),
    apiKeyTag: text('api_key_tag').notNull(),
    model: text('model').notNull(),
    systemPrompt: text('system_prompt'),
    modelParams: text('model_params'), // JSON string for model parameters
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    isEnabled: integer('is_enabled', { mode: 'boolean' })
      .notNull()
      .default(true),
    healthStatus: text('health_status')
      .notNull()
      .default('unverified'), // 'unverified' | 'active' | 'error'
    lastError: text('last_error'),
    lastErrorAt: integer('last_error_at'),
    extraParams: text('extra_params'), // JSON string for extra parameters
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdIdx: index('ai_configs_user_id_idx').on(table.userId),
  }),
);

export type AIConfig = typeof aiConfigs.$inferSelect;
export type NewAIConfig = typeof aiConfigs.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  feeds: many(feeds),
  feedItems: many(feedItems),
  aiConfigs: many(aiConfigs),
}));

export const feedsRelations = relations(feeds, ({ one, many }) => ({
  user: one(users, {
    fields: [feeds.userId],
    references: [users.id],
  }),
  items: many(feedItems),
}));

export const feedItemsRelations = relations(feedItems, ({ one }) => ({
  feed: one(feeds, {
    fields: [feedItems.feedId],
    references: [feeds.id],
  }),
  user: one(users, {
    fields: [feedItems.userId],
    references: [users.id],
  }),
}));

export const aiConfigsRelations = relations(aiConfigs, ({ one }) => ({
  user: one(users, {
    fields: [aiConfigs.userId],
    references: [users.id],
  }),
}));
