CREATE TABLE `attachments` (
	`raw` text,
	`attachment` text,
	`threadKey` text NOT NULL,
	`messageId` text NOT NULL,
	`attachmentFbid` text,
	`timestampMs` integer,
	`offlineAttachmentId` text,
	PRIMARY KEY(`attachmentFbid`, `messageId`, `threadKey`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`raw` text,
	`contact` text,
	`id` text PRIMARY KEY NOT NULL,
	`profilePictureUrl` text,
	`name` text,
	`username` text
);
--> statement-breakpoint
CREATE TABLE `key_values` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`raw` text,
	`message` text,
	`threadKey` text NOT NULL,
	`messageId` text PRIMARY KEY NOT NULL,
	`offlineThreadingId` text,
	`primarySortKey` text,
	`timestampMs` integer,
	`senderId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`raw` text,
	`threadKey` text NOT NULL,
	`userId` text NOT NULL,
	`readWatermarkTimestampMs` integer,
	`readActionTimestampMs` integer,
	`deliveredWatermarkTimestampMs` integer,
	`lastDeliveredActionTimestampMs` integer,
	`isAdmin` integer,
	PRIMARY KEY(`threadKey`, `userId`)
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`raw` text,
	`threadKey` text,
	`timestampMs` integer,
	`messageId` text,
	`actorId` text,
	`reaction` text,
	PRIMARY KEY(`actorId`, `messageId`, `threadKey`)
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`threadKey` text PRIMARY KEY NOT NULL,
	`thread` text,
	`lastActivityTimestampMs` integer,
	`parentThreadKey` integer,
	`raw` text,
	`ranges` text
);
--> statement-breakpoint
CREATE TABLE `typing_indicators` (
	`raw` text,
	`threadKey` text NOT NULL,
	`minTimestampMs` integer,
	`minMessageId` text,
	`maxTimestampMs` integer,
	`maxMessageId` text,
	`isLoadingBefore` integer,
	`isLoadingAfter` integer,
	`hasMoreBefore` integer,
	`hasMoreAfter` integer
);