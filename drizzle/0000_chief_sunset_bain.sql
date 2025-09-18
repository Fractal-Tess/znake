CREATE TABLE `znake_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`registry` text NOT NULL,
	`repository` text NOT NULL,
	`tag` text NOT NULL,
	`digest` text,
	`size` integer,
	`architecture` text,
	`os` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `znake_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_id` integer NOT NULL,
	`status` text NOT NULL,
	`scanner` text DEFAULT 'trivy' NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`progress` integer DEFAULT 0,
	`error_message` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `znake_images`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `znake_vulnerabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scan_id` integer NOT NULL,
	`cve_id` text,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`package_name` text,
	`package_version` text,
	`fixed_version` text,
	`published_date` integer,
	`last_modified_date` integer,
	`references` text,
	`cvss_score` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`scan_id`) REFERENCES `znake_scans`(`id`) ON UPDATE no action ON DELETE cascade
);
