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
    pipelineId: integer('pipeline_id').references(() => pipelines.id, {
      onDelete: 'set null',
    }),
    templateId: integer('template_id').references(() => craftTemplates.id, {
      onDelete: 'set null',
    }),
    autoProcess: integer('auto_process', { mode: 'boolean' })
      .notNull()
      .default(false),
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

export const craftTemplates = sqliteTable(
  'craft_templates',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    aiConfigId: integer('ai_config_id')
      .notNull()
      .references(() => aiConfigs.id, { onDelete: 'restrict' }),
    promptTemplate: text('prompt_template').notNull(),
    category: text('category').notNull().default('custom'), // 'summarize' | 'translate' | 'filter' | 'analyze' | 'rewrite' | 'custom'
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdIdx: index('craft_templates_user_id_idx').on(table.userId),
    categoryIdx: index('craft_templates_category_idx').on(table.category),
  }),
);

export type CraftTemplate = typeof craftTemplates.$inferSelect;
export type NewCraftTemplate = typeof craftTemplates.$inferInsert;

export const pipelines = sqliteTable(
  'pipelines',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    steps: text('steps').notNull(), // JSON array: [{ templateId: number, order: number, name: string }]
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdIdx: index('pipelines_user_id_idx').on(table.userId),
  }),
);

export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;

// Step type for pipeline steps JSON
export interface PipelineStep {
  templateId: number;
  order: number;
  name: string;
}

export const processingResults = sqliteTable(
  'processing_results',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    feedItemId: integer('feed_item_id')
      .notNull()
      .references(() => feedItems.id, { onDelete: 'cascade' }),
    pipelineId: integer('pipeline_id').references(() => pipelines.id, {
      onDelete: 'set null',
    }),
    templateId: integer('template_id').references(() => craftTemplates.id, {
      onDelete: 'set null',
    }),
    output: text('output'),
    stepsOutput: text('steps_output'), // JSON array: [{ step: number, templateId: number, output: string, tokensUsed: number }]
    status: text('status').notNull().default('pending'), // 'pending' | 'processing' | 'done' | 'error'
    errorMessage: text('error_message'),
    tokensUsed: integer('tokens_used'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    completedAt: integer('completed_at'),
  },
  (table) => ({
    userIdIdx: index('processing_results_user_id_idx').on(table.userId),
    feedItemIdIdx: index('processing_results_feed_item_id_idx').on(
      table.feedItemId,
    ),
    statusIdx: index('processing_results_status_idx').on(table.status),
  }),
);

export type ProcessingResult = typeof processingResults.$inferSelect;
export type NewProcessingResult = typeof processingResults.$inferInsert;

// Step output type for pipeline steps output JSON
export interface StepOutput {
  step: number;
  templateId: number;
  output: string;
  tokensUsed: number;
}

export const processingQueue = sqliteTable(
  'processing_queue',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    feedItemId: integer('feed_item_id')
      .notNull()
      .references(() => feedItems.id, { onDelete: 'cascade' }),
    pipelineId: integer('pipeline_id').references(() => pipelines.id, {
      onDelete: 'set null',
    }),
    templateId: integer('template_id').references(() => craftTemplates.id, {
      onDelete: 'set null',
    }),
    status: text('status').notNull().default('pending'), // 'pending' | 'processing' | 'done' | 'error'
    priority: integer('priority').notNull().default(0),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    errorMessage: text('error_message'),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    startedAt: integer('started_at'),
    completedAt: integer('completed_at'),
  },
  (table) => ({
    userIdIdx: index('processing_queue_user_id_idx').on(table.userId),
    feedItemIdIdx: index('processing_queue_feed_item_id_idx').on(
      table.feedItemId,
    ),
    statusIdx: index('processing_queue_status_idx').on(table.status),
  }),
);

export type ProcessingQueue = typeof processingQueue.$inferSelect;
export type NewProcessingQueue = typeof processingQueue.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  feeds: many(feeds),
  feedItems: many(feedItems),
  aiConfigs: many(aiConfigs),
  craftTemplates: many(craftTemplates),
  pipelines: many(pipelines),
  processingResults: many(processingResults),
  processingQueue: many(processingQueue),
}));

export const feedsRelations = relations(feeds, ({ one, many }) => ({
  user: one(users, {
    fields: [feeds.userId],
    references: [users.id],
  }),
  pipeline: one(pipelines, {
    fields: [feeds.pipelineId],
    references: [pipelines.id],
  }),
  template: one(craftTemplates, {
    fields: [feeds.templateId],
    references: [craftTemplates.id],
  }),
  items: many(feedItems),
}));

export const feedItemsRelations = relations(feedItems, ({ one, many }) => ({
  feed: one(feeds, {
    fields: [feedItems.feedId],
    references: [feeds.id],
  }),
  user: one(users, {
    fields: [feedItems.userId],
    references: [users.id],
  }),
  processingResults: many(processingResults),
}));

export const aiConfigsRelations = relations(aiConfigs, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConfigs.userId],
    references: [users.id],
  }),
  craftTemplates: many(craftTemplates),
}));

export const craftTemplatesRelations = relations(craftTemplates, ({ one }) => ({
  user: one(users, {
    fields: [craftTemplates.userId],
    references: [users.id],
  }),
  aiConfig: one(aiConfigs, {
    fields: [craftTemplates.aiConfigId],
    references: [aiConfigs.id],
  }),
}));

export const pipelinesRelations = relations(pipelines, ({ one, many }) => ({
  user: one(users, {
    fields: [pipelines.userId],
    references: [users.id],
  }),
  processingResults: many(processingResults),
}));

export const processingResultsRelations = relations(
  processingResults,
  ({ one }) => ({
    user: one(users, {
      fields: [processingResults.userId],
      references: [users.id],
    }),
    feedItem: one(feedItems, {
      fields: [processingResults.feedItemId],
      references: [feedItems.id],
    }),
    pipeline: one(pipelines, {
      fields: [processingResults.pipelineId],
      references: [pipelines.id],
    }),
    template: one(craftTemplates, {
      fields: [processingResults.templateId],
      references: [craftTemplates.id],
    }),
  }),
);

export const processingQueueRelations = relations(
  processingQueue,
  ({ one }) => ({
    user: one(users, {
      fields: [processingQueue.userId],
      references: [users.id],
    }),
    feedItem: one(feedItems, {
      fields: [processingQueue.feedItemId],
      references: [feedItems.id],
    }),
    pipeline: one(pipelines, {
      fields: [processingQueue.pipelineId],
      references: [pipelines.id],
    }),
    template: one(craftTemplates, {
      fields: [processingQueue.templateId],
      references: [craftTemplates.id],
    }),
  }),
);
