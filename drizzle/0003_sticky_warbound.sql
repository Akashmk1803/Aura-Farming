ALTER TABLE `coupons` ADD `usage_limit` integer;--> statement-breakpoint
ALTER TABLE `coupons` ADD `is_welcome` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `description` text;--> statement-breakpoint
ALTER TABLE `coupons` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP;