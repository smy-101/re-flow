CREATE TABLE `ai_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`provider_type` text NOT NULL,
	`provider_id` text,
	`api_format` text NOT NULL,
	`base_url` text NOT NULL,
	`api_key_encrypted` text NOT NULL,
	`api_key_iv` text NOT NULL,
	`api_key_tag` text NOT NULL,
	`model` text NOT NULL,
	`system_prompt` text,
	`model_params` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`health_status` text DEFAULT 'unverified' NOT NULL,
	`last_error` text,
	`last_error_at` integer,
	`extra_params` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_configs_user_id_idx` ON `ai_configs` (`user_id`);