# CubicfoxBooking

This project is an NX based standalone applicaiton repository.

## How to start the application(s)?

- First, we have to install the dependencies. This project uses PNPM: `pnpm install`
- We can build the application: `npx nx run cubicfox-booking:build` (if you have the NX CLI installed, then you don't need `npx`)
- Then, you'll need a running MySQL Database. The simplest way to achieve this is to use Docker:
  - `docker pull mysql`
  - `docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest`
- Now, it is time to set the environment variables. The application validates the env values and throws an error during initialization if something is missing/not valid. You can find a `.env.example` file in the root, for more details.
- Now that we can actually connect to the DB, we have to run migrations: `pnpm migrations:run`
- Time to start the application: ` npx nx run cubicfox-booking:serve` (If you have NX CLI installed, then `pnpm start` is enough)

(You can use the NX Console VSCode extension, if you don't want to use the terminal)

## Core Features

- .ENV validation
- Request & Response schema validation
- Endpoint implementations have their own abstraction, so they are independent from the underlying HTTP framework

## Used frameworks

- Express: I've decided to use Express for this project so I can show my own organization / project structure skills/ideas. In a production environment it can be wiser to use something like Nest.js since we can make progress much faster with a "Convention over Configuration" based approach. Creating these abstraction layers from scratch are timeconsuming.

- Drizzle: It is a newer ORM on the block, therefore not that mature like Sequelize or Type-ORM. I've decided to use Drizzle, because I really like it's SQL-like, typesafe API. Another reason I have against Sequelize is that it's static Models are making testing a bit hard. Unfortunately Drizzle's schema API is not uniform, so, it requires addtional effort to make it accessible for unit tests for example.

- Zod: JSON schema validator, one of the bests in my opinion.
