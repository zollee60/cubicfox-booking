import { z, SafeParseError } from 'zod';
import dotenv from 'dotenv';

export function envvars<
  E extends Record<string, z.ZodType<string | undefined>>
>(vars: E): z.infer<z.ZodObject<E>> {
  dotenv.config();
  const parseResult = z.object(vars).safeParse(process.env);
  if (!parseResult.success) {
    const message = (
      parseResult as SafeParseError<NodeJS.ProcessEnv>
    ).error.issues
      .map((i) => `${i.path.join('/')} (${i.message})`)
      .join(', ');
    throw new Error(`Invalid envvars: ${message}`);
  }
  return parseResult.data;
}
