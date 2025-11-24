import { PinoLogger } from 'nestjs-pino';

type LogContext = Record<string, unknown>;

/**
 * Handles the processing and logging of an unknown error.
 * @param logger The PinoLogger instance.
 * @param error The unknown error caught in a catch block.
 * @param message A static, human-readable message describing the error context.
 * @param context An object containing relevant variables (e.g., IDs, parameters).
 */
export function logServiceError(
  logger: PinoLogger,
  error: unknown,
  message: string,
  context: LogContext = {},
) {
  const safeError =
    error instanceof Error
      ? {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        }
      : { message: String(error) };

  const finalMessage = error instanceof Error ? message : `A non-error was thrown: ${message}`;

  const logPayload = { ...context, error: safeError };

  logger.error(logPayload, finalMessage);
}
