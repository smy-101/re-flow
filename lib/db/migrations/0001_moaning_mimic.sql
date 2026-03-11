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
