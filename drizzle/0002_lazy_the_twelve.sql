ALTER TABLE `znake_scans` ADD `stage` text DEFAULT 'initializing' NOT NULL;--> statement-breakpoint
CREATE INDEX `scans_stage_idx` ON `znake_scans` (`stage`);