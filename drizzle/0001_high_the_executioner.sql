ALTER TABLE `products` ADD `status` text DEFAULT 'in_stock' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `image_url` text;