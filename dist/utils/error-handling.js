"use strict";
/**
 * Centralized error handling and logging utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ScheduleGenerationError = exports.DataLoadError = exports.ValidationError = exports.Logger = void 0;
exports.asyncHandler = asyncHandler;
// Simple logger utility to avoid console statements in production
exports.Logger = {
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
};
/**
 * Custom error classes
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.code = 'VALIDATION_ERROR';
        this.statusCode = 400;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class DataLoadError extends Error {
    constructor(message) {
        super(message);
        this.code = 'DATA_LOAD_ERROR';
        this.statusCode = 500;
        this.name = 'DataLoadError';
    }
}
exports.DataLoadError = DataLoadError;
class ScheduleGenerationError extends Error {
    constructor(message) {
        super(message);
        this.code = 'SCHEDULE_GENERATION_ERROR';
        this.statusCode = 500;
        this.name = 'ScheduleGenerationError';
    }
}
exports.ScheduleGenerationError = ScheduleGenerationError;
/**
 * Error handler utility class
 */
class ErrorHandler {
    /**
     * Handles errors and returns appropriate response format
     */
    static handle(error) {
        if (error instanceof ValidationError ||
            error instanceof DataLoadError ||
            error instanceof ScheduleGenerationError) {
            return {
                error: error.message,
                code: error.code,
                statusCode: error.statusCode,
            };
        }
        // Handle unknown errors
        exports.Logger.error('Unexpected error:', error);
        return {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            statusCode: 500,
        };
    }
    /**
     * Wraps async functions with error handling
     */
    static async wrap(fn) {
        try {
            const data = await fn();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: ErrorHandler.handle(error),
            };
        }
    }
    /**
     * Wraps synchronous functions with error handling
     */
    static wrapSync(fn) {
        try {
            const data = fn();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: ErrorHandler.handle(error),
            };
        }
    }
    /**
     * Logs errors with context
     */
    static logError(error, context) {
        const contextStr = context ? `[${context}] ` : '';
        exports.Logger.error(`${contextStr}${error.name}: ${error.message}`);
        if (error.stack) {
            exports.Logger.debug('Stack trace:', error.stack);
        }
    }
    /**
     * Creates a standardized error response
     */
    static createErrorResponse(error) {
        return {
            success: false,
            error: error.error,
            code: error.code,
            details: error.details,
        };
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Async error boundary for Express middleware
 */
function asyncHandler(fn) {
    return (_req, _res, _next) => {
        void Promise.resolve(fn(_req, _res, _next)).catch(_next);
    };
}
//# sourceMappingURL=error-handling.js.map