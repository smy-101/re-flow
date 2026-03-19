CREATE TABLE `email_digest_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`frequency` text DEFAULT 'daily' NOT NULL,
	`custom_days` integer,
	`send_time` text DEFAULT '08:00' NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`mark_as_read` integer DEFAULT false NOT NULL,
	`paused_due_to_failures` integer DEFAULT false NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`last_sent_at` integer,
	`next_send_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_digest_configs_user_id_idx` ON `email_digest_configs` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_digest_configs_enabled_idx` ON `email_digest_configs` (`enabled`);--> statement-breakpoint
CREATE INDEX `email_digest_configs_next_send_at_idx` ON `email_digest_configs` (`next_send_at`);--> statement-breakpoint
CREATE TABLE `email_digest_filters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`config_id` integer NOT NULL,
	`filter_type` text NOT NULL,
	`filter_value` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`config_id`) REFERENCES `email_digest_configs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_digest_filters_config_id_idx` ON `email_digest_filters` (`config_id`);--> statement-breakpoint
CREATE INDEX `email_digest_filters_filter_type_idx` ON `email_digest_filters` (`filter_type`);--> statement-breakpoint
CREATE TABLE `email_digest_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`config_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`sent_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`success` integer NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	FOREIGN KEY (`config_id`) REFERENCES `email_digest_configs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_digest_logs_config_id_idx` ON `email_digest_logs` (`config_id`);--> statement-breakpoint
CREATE INDEX `email_digest_logs_user_id_idx` ON `email_digest_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_digest_logs_sent_at_idx` ON `email_digest_logs` (`sent_at`);--> statement-breakpoint
CREATE TABLE `mcp_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`token_prefix` text NOT NULL,
	`token_hash` text NOT NULL,
	`feed_whitelist` text,
	`time_window_days` integer,
	`allow_raw_fallback` integer DEFAULT true NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`last_used_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mcp_tokens_token_hash_unique` ON `mcp_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `mcp_tokens_user_id_idx` ON `mcp_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `mcp_tokens_token_hash_idx` ON `mcp_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `mcp_tokens_is_enabled_idx` ON `mcp_tokens` (`is_enabled`);