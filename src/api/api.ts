import { createUserService } from '../services/user';
import { createPostUserLogin } from './endpoints/post-user-login';
import { env } from '../config/env';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import { createUserRepository } from '../data/repositories/user';
import { createSessionRepository } from '../data/repositories/session';
import { v4 } from 'uuid';
import { createGetRooms } from './endpoints/get-rooms';
import { createRoomService } from '../services/room';
import { createRoomRepository } from '../data/repositories/room';
import { getDateTimeValueWithoutTime, getDaysBetween } from '../utils';
import { createBookingRepository } from '../data/repositories/booking';
import { createGetUserBookings } from './endpoints/get-user-bookings';
import { createBookingService } from '../services/booking';
import { createPostCreateBooking } from './endpoints/post-create-booking';
import { createDeleteUserBooking } from './endpoints/delete-user-booking';
import { Request, Response, Router } from 'express';
import { createExpressEndpointHandler } from './endpoint';
import { createIsAuthenticated } from './middlewares/is-authenticated';

export const createPublicEndpoints = ({
  db,
}: {
  db: MySql2Database<typeof schema>;
}) => [
  createPostUserLogin({
    userService: createUserService({
      userRepository: createUserRepository({ db, getNewId: () => v4() }),
      sessionRepository: createSessionRepository({ db, getNewId: () => v4() }),
    }),
    sessionCookieName: env.SESSION_COOKIE_NAME,
  }),
];

export const createPrivateEndpoints = ({
  db,
}: {
  db: MySql2Database<typeof schema>;
}) => [
  createGetRooms({
    roomService: createRoomService({
      roomRepository: createRoomRepository({ db, getNewId: () => v4() }),
      bookingRepository: createBookingRepository({ db, getNewId: () => v4() }),
      getDateTimeValueWithoutTime,
    }),
  }),
  createGetUserBookings({
    bookingService: createBookingService({
      roomRepository: createRoomRepository({ db, getNewId: () => v4() }),
      bookingRepository: createBookingRepository({ db, getNewId: () => v4() }),
    }),
    userService: createUserService({
      userRepository: createUserRepository({ db, getNewId: () => v4() }),
      sessionRepository: createSessionRepository({ db, getNewId: () => v4() }),
    }),
  }),
  createPostCreateBooking({
    bookingService: createBookingService({
      roomRepository: createRoomRepository({ db, getNewId: () => v4() }),
      bookingRepository: createBookingRepository({ db, getNewId: () => v4() }),
    }),
    userService: createUserService({
      userRepository: createUserRepository({ db, getNewId: () => v4() }),
      sessionRepository: createSessionRepository({ db, getNewId: () => v4() }),
    }),
    roomService: createRoomService({
      roomRepository: createRoomRepository({ db, getNewId: () => v4() }),
      bookingRepository: createBookingRepository({ db, getNewId: () => v4() }),
      getDateTimeValueWithoutTime,
    }),
    getDaysBetween,
  }),
  createDeleteUserBooking({
    bookingService: createBookingService({
      roomRepository: createRoomRepository({ db, getNewId: () => v4() }),
      bookingRepository: createBookingRepository({ db, getNewId: () => v4() }),
    }),
    userService: createUserService({
      userRepository: createUserRepository({ db, getNewId: () => v4() }),
      sessionRepository: createSessionRepository({ db, getNewId: () => v4() }),
    }),
  }),
];

export const createPublicRoutes = ({
  db,
  router,
}: {
  db: MySql2Database<typeof schema>;
  router: Router;
}): Router => {
  createPublicEndpoints({ db }).forEach((endpoint) => {
    (router as any)[endpoint.method.toLowerCase()](
      endpoint.path,
      createExpressEndpointHandler(endpoint)
    );
  });

  return router;
};

export const createPrivateRoutes = ({
  db,
  router,
}: {
  db: MySql2Database<typeof schema>;
  router: Router;
}): Router => {
  const isAuthenticatedService = createIsAuthenticated({
    userService: createUserService({
      userRepository: createUserRepository({ db, getNewId: () => v4() }),
      sessionRepository: createSessionRepository({ db, getNewId: () => v4() }),
    }),
  });
  router.use((req: Request, res: Response, next) => {
    const isLoggedIn = isAuthenticatedService(
      req.cookies[env.SESSION_COOKIE_NAME]
    );
    if (!isLoggedIn) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }
    next();
  });
  createPrivateEndpoints({ db }).forEach((endpoint) => {
    (router as any)[endpoint.method.toLowerCase()](
      endpoint.path,
      createExpressEndpointHandler(endpoint as any)
    );
  });

  return router;
};
