import { Request, Response, NextFunction } from "express";

/**
 * Timeout middleware để tránh hanging requests
 */
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Set timeout cho request
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                console.error(
                    `🕐 Request timeout for ${req.method} ${req.url}`
                );
                res.status(408).json({
                    status: "error",
                    message: "Request timeout",
                    type: "timeout",
                });
            }
        }, timeoutMs);

        // Clear timeout khi response được gửi
        const originalSend = res.send;
        res.send = function (body: any) {
            clearTimeout(timeout);
            return originalSend.call(this, body);
        };

        const originalJson = res.json;
        res.json = function (body: any) {
            clearTimeout(timeout);
            return originalJson.call(this, body);
        };

        const originalEnd = res.end;
        res.end = function (chunk?: any, encoding?: any) {
            clearTimeout(timeout);
            return originalEnd.call(this, chunk, encoding);
        };

        next();
    };
};

/**
 * Health check endpoint
 */
export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || "development",
    });
};
