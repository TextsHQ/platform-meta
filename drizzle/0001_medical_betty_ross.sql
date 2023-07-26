CREATE TABLE `contacts` (
	`_original` blob,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`username` text,
	`fbid` text
);
--> statement-breakpoint
ALTER TABLE participants ADD `contactID` text DEFAULT null REFERENCES contacts(id);--> statement-breakpoint
ALTER TABLE participants ADD `username` text;--> statement-breakpoint
ALTER TABLE participants ADD `fbid` text;--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/