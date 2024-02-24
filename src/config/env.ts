import { z } from 'zod';
import { envvars } from './envvars';

export const env = envvars({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  SESSION_COOKIE_NAME: z.string(),
  OWN_PORT: z.string(),
});
