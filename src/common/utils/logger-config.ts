// logger-config.ts
import { IncomingMessage, ServerResponse } from 'http';

import { Options as PinoHttpOptions } from 'pino-http';

// --- Development Configuration ---
// Goal: Human-readable logs for easy debugging during development.
const pinoHttpDev: PinoHttpOptions = {
  genReqId: (req: IncomingMessage) => req.headers['x-request-id'] || '1',
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} ${res.statusCode}`,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, // Add color to the output
      ignore: 'pid,hostname', // Hide process ID and hostname for cleaner logs
    },
  },

  serializers: {
    req: () => ({}),
    res: () => ({}),
    err: ({ message, stack }) => ({ message, stack }),
  },
};

// --- Production Configuration ---
const pinoHttpProd: PinoHttpOptions = {
  genReqId: (req: IncomingMessage) => req.headers['x-request-id'] || '1',

  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} ${res.statusCode}`,

  serializers: {
    req: () => ({}),
    res: () => ({}),
    err: ({ message, stack }) => ({ message, stack }),
  },

  level: process.env.LOG_LEVEL || 'info',
};

export const pinoHttpConfig: PinoHttpOptions =
  process.env.NODE_ENV === 'production' ? pinoHttpProd : pinoHttpDev;

export { pinoHttpDev, pinoHttpProd };
