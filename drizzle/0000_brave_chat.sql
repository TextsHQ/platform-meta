CREATE TABLE `attachments` (
	`_original` blob,
	`threadKey` text NOT NULL,
	`messageId` text NOT NULL,
	`attachmentFbid` text NOT NULL,
	`filename` text,
	`filesize` integer,
	`hasMedia` integer,
	`playableUrl` text,
	`playableUrlFallback` text,
	`playableUrlExpirationTimestampMs` integer,
	`playableUrlMimeType` text,
	`dashManifest` text,
	`previewUrl` text,
	`previewUrlFallback` text,
	`previewUrlExpirationTimestampMs` integer,
	`previewUrlMimeType` text,
	`miniPreview` text,
	`previewWidth` integer,
	`previewHeight` integer,
	`attributionAppId` text,
	`attributionAppName` text,
	`attributionAppIcon` text,
	`attributionAppIconFallback` text,
	`attributionAppIconUrlExpirationTimestampMs` integer,
	`localPlayableUrl` text,
	`playableDurationMs` integer,
	`attachmentIndex` integer,
	`accessibilitySummaryText` text,
	`isPreviewImage` integer,
	`originalFileHash` text,
	`attachmentType` integer,
	`timestampMs` integer,
	`offlineAttachmentId` text,
	`hasXma` integer,
	`xmaLayoutType` text,
	`xmasTemplateType` text,
	`titleText` text,
	`subtitleText` text,
	`descriptionText` text,
	`sourceText` text,
	`faviconUrlExpirationTimestampMs` integer,
	`isBorderless` integer,
	`previewUrlLarge` text,
	`samplingFrequencyHz` integer,
	`waveformData` text,
	`authorityLevel` integer,
	FOREIGN KEY (`threadKey`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`_original` blob,
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`editedTimestamp` integer,
	`expiresInSeconds` integer,
	`forwardedCount` integer,
	`forwardedFromText` text,
	`forwardedFromThreadID` text,
	`forwardedFromUserID` integer,
	`senderID` text NOT NULL,
	`threadID` text NOT NULL,
	`text` text,
	`textAttributes` blob,
	`textHeading` text,
	`textFooter` text,
	`iframeURL` text,
	`seen` integer,
	`isDelivered` integer,
	`isHidden` integer,
	`isSender` integer,
	`isAction` integer,
	`isDeleted` integer,
	`isErrored` integer,
	`parseTemplate` integer,
	`linkedMessageThreadID` text,
	`linkedMessageID` text,
	`action` text,
	`cursor` text,
	`behavior` text DEFAULT null,
	`accountID` text,
	`sortKey` text,
	FOREIGN KEY (`forwardedFromThreadID`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`threadID`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`_original` blob,
	`threadID` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	FOREIGN KEY (`threadID`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`_original` blob,
	`id` text PRIMARY KEY NOT NULL,
	`folderName` text,
	`title` text,
	`isUnread` integer,
	`lastReadMessageID` text,
	`isReadOnly` integer,
	`isArchived` integer,
	`isPinned` integer,
	`mutedUntil` integer,
	`type` text DEFAULT 'single' NOT NULL,
	`timestamp` integer,
	`imgURL` text,
	`createdAt` integer,
	`description` text,
	`partialLastMessage` blob,
	`messageExpirySeconds` integer
);
