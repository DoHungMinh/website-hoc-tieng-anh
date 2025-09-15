import { Request, Response, NextFunction } from "express";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Skip logging if disabled
    if (process.env.ENABLE_REQUEST_LOGGING === "false") {
        next();
        return;
    }

    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;

    // Only log important requests (errors, auth, payments) - skip routine operations
    const isImportantRoute =
        url.includes("/auth/") ||
        url.includes("/payment/") ||
        (method !== "GET" &&
            !url.includes("/heartbeat") &&
            !url.includes("/offline"));

    // Skip all polling/routine endpoints
    const isRoutineEndpoint =
        url.includes("/heartbeat") ||
        url.includes("/realtime") ||
        url.includes("/recent-activities") ||
        url.includes("/statistics/") ||
        url.includes("/offline");

    // Only log if it's important and not routine
    if (isImportantRoute && !isRoutineEndpoint) {
        console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
    }

    next();
};
