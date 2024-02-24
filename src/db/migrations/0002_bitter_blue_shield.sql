ALTER TABLE `bookings` ADD `hotel_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cost` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_hotel_id_hotels_id_fk` FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE no action ON UPDATE no action;