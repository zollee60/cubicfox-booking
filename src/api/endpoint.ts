import { Request, Response } from 'express';
import { z } from 'zod';

export const allEndpointMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export type EndpointMethod = typeof allEndpointMethods[number];

export const allHttpStatusCodes = [200, 204, 400, 401, 403, 404, 500] as const;
export type HttpStatusCode = typeof allHttpStatusCodes[number];

export const endpointErrorSchema = z.object({
  statusCode: z.number(),
  body: z.object({
    message: z.string(),
  }),
});

export type EndpointError = z.infer<typeof endpointErrorSchema>;

export interface Endpoint<T extends EndpointInput, U extends EndpointOutput> {
  inputSchema: z.ZodType<T>;
  outputSchema: z.ZodType<U>;
  method: EndpointMethod;
  path: string;
  handler: (input: T) => Promise<U | EndpointError>;
}

export interface EndpointInput {
  body?: any;
  query?: any;
  params?: any;
  cookies?: any;
}

export interface EndpointOutput {
  statusCode: number;
  body: any;
  byPass?: {
    cookies: [name: string, value: string][];
  };
}

export const createExpressEndpointHandler = <
  T extends EndpointInput,
  U extends EndpointOutput
>(
  impl: Endpoint<T, U>
) => {
  return async (req: Request, res: Response) => {
    const input = {
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    };

    const inputParseResult = impl.inputSchema.safeParse(input);
    if (!inputParseResult.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: inputParseResult.error.errors,
      });
    }
    const result = await impl.handler(inputParseResult.data);

    const outputParseResult = impl.outputSchema.safeParse(result);

    if (!outputParseResult.success) {
      return res.status(500).json({
        message: 'Internal server error - Response is not valid',
        errors: outputParseResult.error.errors,
      });
    }
    if (result.body.byPass) {
      for (const [name, value] of result.body.byPass?.cookies ?? []) {
        res.cookie(name, value);
      }
      res.status(result.statusCode).end();
    } else {
      res.status(result.statusCode).json(result.body);
    }
  };
};
