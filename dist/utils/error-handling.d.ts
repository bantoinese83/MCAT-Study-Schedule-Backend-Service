/**
 * Centralized error handling and logging utilities
 */
export declare const Logger: {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
};
export interface AppError {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
}
/**
 * Custom error classes
 */
export declare class ValidationError extends Error implements AppError {
    code: string;
    statusCode: number;
    constructor(message: string);
}
export declare class DataLoadError extends Error implements AppError {
    code: string;
    statusCode: number;
    constructor(message: string);
}
export declare class ScheduleGenerationError extends Error implements AppError {
    code: string;
    statusCode: number;
    constructor(message: string);
}
/**
 * Error handler utility class
 */
export declare class ErrorHandler {
    /**
     * Handles errors and returns appropriate response format
     */
    static handle(error: Error): {
        error: string;
        code: string;
        statusCode: number;
        details?: Record<string, unknown>;
    };
    /**
     * Wraps async functions with error handling
     */
    static wrap<T>(fn: () => Promise<T>): Promise<{
        success: true;
        data: T;
    } | {
        success: false;
        error: ReturnType<typeof ErrorHandler.handle>;
    }>;
    /**
     * Wraps synchronous functions with error handling
     */
    static wrapSync<T>(fn: () => T): {
        success: true;
        data: T;
    } | {
        success: false;
        error: ReturnType<typeof ErrorHandler.handle>;
    };
    /**
     * Logs errors with context
     */
    static logError(error: Error, context?: string): void;
    /**
     * Creates a standardized error response
     */
    static createErrorResponse(error: ReturnType<typeof ErrorHandler.handle>): {
        success: false;
        error: string;
        code: string;
        details?: Record<string, unknown>;
    };
}
/**
 * Async error boundary for Express middleware
 */
export declare function asyncHandler(fn: (_req: unknown, _res: unknown, _next: unknown) => void | Promise<void>): (_req: unknown, _res: unknown, _next: unknown) => void;
//# sourceMappingURL=error-handling.d.ts.map