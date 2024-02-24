INSERT INTO `hotels` (`id`,`name`,`city`,`address`)
VALUES
  ("5db5cc4b-3133-473b-ba74-f845779f206c","Hotel 1","Budapest", "Dummy utca 10."),
  ("320a612d-390c-458a-bf55-2d632253f5d0","Hotel 2","Tokyo","Arigato street 5."),
  ("f947070f-dc31-498b-afe6-7641ead83383","Hotel 3","London","King avenue 100.");

INSERT INTO `rooms` (`id`,`hotel_id`,`room_number`,`price`)
VALUES
  ("ed32c10f-4c78-4c27-b2d2-8d2d565d1789","5db5cc4b-3133-473b-ba74-f845779f206c",101,2000),
  ("8ad380c7-9120-431c-9ed6-a0c24817503e","5db5cc4b-3133-473b-ba74-f845779f206c",201,5000),
  ("1ba6118d-749b-45b2-a37e-50500125385c","5db5cc4b-3133-473b-ba74-f845779f206c",301,10000),
  ("5865bca9-9f3b-4c04-9359-f34bc79a9149","320a612d-390c-458a-bf55-2d632253f5d0",100,5000),
  ("b4765259-c3bf-4424-be18-c0027e5f095d","320a612d-390c-458a-bf55-2d632253f5d0",200,12000),
  ("c22b7813-51c2-40d7-98ed-afd38ddd70ff","320a612d-390c-458a-bf55-2d632253f5d0",300,20000),
  ("eda02cbf-7bb8-4972-bd17-69998b624085","f947070f-dc31-498b-afe6-7641ead83383",400,10000);
  ("18a1c207-c0a5-4c78-bb83-5ddf2ac11ba9","f947070f-dc31-498b-afe6-7641ead83383",401,11000);
  ("804b32f5-563e-4996-9302-415327e34a7c","f947070f-dc31-498b-afe6-7641ead83383",402,11500);

INSERT INTO `users` (`id`,`email`,`password`)
VALUES
  ("0816592e-a179-43d5-9913-ab8dc0d6bf24", "hello@test.hu", "biztonsagosJelszo")
