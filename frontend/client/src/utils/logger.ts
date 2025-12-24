/**
 * Centralized Logger Utility
 * Automatically disables logs in production for better performance
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log general information (only in development)
     */
    log: (...args: unknown[]): void => {
        if (isDev) console.log(...args);
    },

    /**
     * Log warnings (only in development)
     */
    warn: (...args: unknown[]): void => {
        if (isDev) console.warn(...args);
    },

    /**
     * Log errors (always, even in production)
     */
    error: (...args: unknown[]): void => {
        console.error(...args);
    },

    /**
     * Log debug information with prefix (only in development)
     */
    debug: (prefix: string, ...args: unknown[]): void => {
        if (isDev) console.log(`[${prefix}]`, ...args);
    },

    /**
     * Log API requests (only in development)
     */
    api: (method: string, endpoint: string, data?: unknown): void => {
        if (isDev) {
            console.log(`🚀 API ${method}:`, endpoint, data || '');
        }
    },

    /**
     * Log performance timing (only in development)
     */
    time: (label: string): void => {
        if (isDev) console.time(label);
    },

    timeEnd: (label: string): void => {
        if (isDev) console.timeEnd(label);
    },
};

export default logger;
