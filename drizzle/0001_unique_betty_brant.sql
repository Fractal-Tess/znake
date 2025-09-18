CREATE INDEX `image_identity_idx` ON `znake_images` (`registry`,`repository`,`tag`);--> statement-breakpoint
CREATE INDEX `images_created_at_idx` ON `znake_images` (`created_at`);--> statement-breakpoint
CREATE INDEX `scans_image_id_idx` ON `znake_scans` (`image_id`);--> statement-breakpoint
CREATE INDEX `scans_status_idx` ON `znake_scans` (`status`);--> statement-breakpoint
CREATE INDEX `scans_created_at_idx` ON `znake_scans` (`created_at`);--> statement-breakpoint
CREATE INDEX `scans_status_created_at_idx` ON `znake_scans` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_scan_id_idx` ON `znake_vulnerabilities` (`scan_id`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_severity_idx` ON `znake_vulnerabilities` (`severity`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_cve_id_idx` ON `znake_vulnerabilities` (`cve_id`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_package_name_idx` ON `znake_vulnerabilities` (`package_name`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_scan_id_severity_idx` ON `znake_vulnerabilities` (`scan_id`,`severity`);--> statement-breakpoint
CREATE INDEX `vulnerabilities_cvss_score_idx` ON `znake_vulnerabilities` (`cvss_score`);