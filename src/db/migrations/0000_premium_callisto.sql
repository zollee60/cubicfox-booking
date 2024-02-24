CREATE TABLE `hotels` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` varchar(36) NOT NULL,
	`hotel_id` varchar(36) NOT NULL,
	`room_number` int NOT NULL,
	`price` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(36) NOT NULL,
	`room_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`check_in` timestamp NOT NULL,
	`check_out` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_hotel_id_hotels_id_fk` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_room_id_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;