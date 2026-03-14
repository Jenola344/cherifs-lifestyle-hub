/**
 * Centralised logger — replaces raw console.error/console.log calls in production.
 *
 * In development: logs everything to the console with a prefix.
 * In production: suppresses info logs; errors are logged WITHOUT stack traces
 *   to avoid leaking internal paths/configs. In the future, replace the
 *   production error handler with a service like Sentry or Logtail.
 */
export const logger = {
    info: (msg: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[INFO] ${msg}`, ...args);
        }
    },

    warn: (msg: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${msg}`, ...args);
        }
    },

    error: (msg: string, err?: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[ERROR] ${msg}`, err);
        } else {
            // In production, log just the message — no stack trace, no internals
            console.error(`[ERROR] ${msg}`);
            // TODO: send to Sentry/Logtail here
        }
    },
};
