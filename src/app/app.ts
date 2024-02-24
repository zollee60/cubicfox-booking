import express, { Express } from 'express';
import { Connection } from 'mysql2/promise';
import { createPrivateRoutes, createPublicRoutes } from '../api/api';
import { env } from '../config/env';
import { createDbConnection } from '../db/db';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

const createBookingApplication = async (): Promise<{
  app: Express;
  connection: Connection;
}> => {
  const { db, connection } = await createDbConnection();

  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Cubicfox Booking API',
      version: '1.0.0',
      description: 'API for booking rooms',
    },
  };

  const options = {
    swaggerDefinition,
    apis: ['./src/api/endpoints/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(options);

  const app = express();

  const publicRouter = express.Router();
  const privateRouter = express.Router();

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/public', createPublicRoutes({ db, router: publicRouter }));
  app.use('/', createPrivateRoutes({ db, router: privateRouter }));
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  return { app, connection };
};

export const runApplication = async () => {
  const { app, connection } = await createBookingApplication();

  const port = Number(env.OWN_PORT) || 3000;
  app.listen(port, () => {
    console.log('Server is running on port 3000');
  });

  process.on('unhandledRejection', (error: Error) =>
    console.error({ error, message: 'Unhandled rejection', stack: error.stack })
  );

  process.on('uncaughtException', (error) =>
    console.error({ error, message: 'Uncaught exception' })
  );

  process.on('SIGINT', () => {
    console.log('Received SIGINT');
    connection.end();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM');
    connection.end();
    process.exit(0);
  });
};
