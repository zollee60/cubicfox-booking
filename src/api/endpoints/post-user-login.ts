import { UserService } from '../../services/user';
import { z } from 'zod';
import { Endpoint, endpointErrorSchema } from '../endpoint';

export type PostUserLoginDependencies = {
  userService: UserService;
  sessionCookieName: string;
};

const postUserLoginInputSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
});

export type PostUserLoginInput = z.infer<typeof postUserLoginInputSchema>;

export const postUserLoginOutputSchema = z.union([
  endpointErrorSchema,
  z.object({
    statusCode: z.number(),
    body: z.object({
      byPass: z.object({
        cookies: z.array(z.tuple([z.string(), z.string()])),
      }),
    }),
  }),
]);

export type PostUserLoginOutput = z.infer<typeof postUserLoginOutputSchema>;

/**
 * @swagger
 * 
 * /public/user/login:
    post:
      summary: Log in a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          headers:
            Set-Cookie:
              schema:
                type: string
                example: 'sessionid=38afes7a8; HttpOnly; Path=/'
        '401':
          description: Unauthorized
        '400':
          description: Bad Request
 */

export const createPostUserLogin = ({
  userService,
  sessionCookieName,
}: PostUserLoginDependencies): Endpoint<
  PostUserLoginInput,
  PostUserLoginOutput
> => ({
  inputSchema: postUserLoginInputSchema,
  outputSchema: postUserLoginOutputSchema,
  method: 'POST',
  path: '/user/login',
  handler: async ({ body }) => {
    try {
      const session = await userService.login(body);
      return {
        statusCode: 200,
        body: {
          byPass: {
            cookies: [[sessionCookieName, session]],
          },
        },
      };
    } catch (e) {
      return {
        statusCode: 401,
        body: {
          message: e instanceof Error ? e.message : 'Unknown error',
        },
      };
    }
  },
});
