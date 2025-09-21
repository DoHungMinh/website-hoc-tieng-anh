import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal server error";

    // Log lỗi với chi tiết
    console.error("🚨 Error occurred:", {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        timestamp: new Date().toISOString(),
    });

    // Handle các loại lỗi cụ thể
    if (
        error.name === "ValidationError" &&
        error instanceof mongoose.Error.ValidationError
    ) {
        statusCode = 400;
        message = "Validation Error";
        const errors = Object.values(error.errors).map((err) => err.message);

        res.status(statusCode).json({
            status: "error",
            message,
            errors,
            type: "validation",
        });
        return;
    }

    if (
        error.name === "CastError" &&
        error instanceof mongoose.Error.CastError
    ) {
        statusCode = 400;
        message = "Invalid ID format";

        res.status(statusCode).json({
            status: "error",
            message,
            type: "cast_error",
        });
        return;
    }

    if (error.name === "MongoServerError" && "code" in error) {
        if ((error as any).code === 11000) {
            statusCode = 400;
            message = "Duplicate field value";

            res.status(statusCode).json({
                status: "error",
                message,
                type: "duplicate_key",
            });
            return;
        }
    }

    if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";

        res.status(statusCode).json({
            status: "error",
            message,
            type: "jwt_error",
        });
        return;
    }

    if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";

        res.status(statusCode).json({
            status: "error",
            message,
            type: "token_expired",
        });
        return;
    }

    // Default error response
    res.status(statusCode).json({
        status: "error",
        message:
            process.env.NODE_ENV === "production" ? message : error.message,
        type: "general_error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};

// Global uncaught exception handler
export const handleUncaughtException = () => {
    process.on("uncaughtException", (error: Error) => {
        console.error("🚨 Uncaught Exception:", error);
        console.error("Stack:", error.stack);

        // Graceful shutdown
        setTimeout(() => {
            console.log("🛑 Server shutting down due to uncaught exception");
            process.exit(1);
        }, 1000);
    });
};

// Global unhandled promise rejection handler
export const handleUnhandledRejection = () => {
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
        console.error("🚨 Unhandled Rejection at:", promise);
        console.error("Reason:", reason);

        // Graceful shutdown
        setTimeout(() => {
            console.log("🛑 Server shutting down due to unhandled rejection");
            process.exit(1);
        }, 1000);
    });
};
