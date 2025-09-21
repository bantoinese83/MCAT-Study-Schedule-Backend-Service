/**
 * Centralized error handling and logging utilities
 */

// Simple logger utility to avoid console statements in production
export const Logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },
}

export interface AppError {
  code: string
  message: string
  statusCode: number
  details?: Record<string, unknown>
}

/**
 * Custom error classes
 */
export class ValidationError extends Error implements AppError {
  public code = 'VALIDATION_ERROR'
  public statusCode = 400

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class DataLoadError extends Error implements AppError {
  public code = 'DATA_LOAD_ERROR'
  public statusCode = 500

  constructor(message: string) {
    super(message)
    this.name = 'DataLoadError'
  }
}

export class ScheduleGenerationError extends Error implements AppError {
  public code = 'SCHEDULE_GENERATION_ERROR'
  public statusCode = 500

  constructor(message: string) {
    super(message)
    this.name = 'ScheduleGenerationError'
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Handles errors and returns appropriate response format
   */
  public static handle(error: Error): {
    error: string
    code: string
    statusCode: number
    details?: Record<string, unknown>
  } {
    if (
      error instanceof ValidationError ||
      error instanceof DataLoadError ||
      error instanceof ScheduleGenerationError
    ) {
      return {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
      }
    }

    // Handle unknown errors
    Logger.error('Unexpected error:', error)
    return {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    }
  }

  /**
   * Wraps async functions with error handling
   */
  public static async wrap<T>(
    fn: () => Promise<T>
  ): Promise<
    { success: true; data: T } | { success: false; error: ReturnType<typeof ErrorHandler.handle> }
  > {
    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.handle(error as Error),
      }
    }
  }

  /**
   * Wraps synchronous functions with error handling
   */
  public static wrapSync<T>(
    fn: () => T
  ):
    | { success: true; data: T }
    | { success: false; error: ReturnType<typeof ErrorHandler.handle> } {
    try {
      const data = fn()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.handle(error as Error),
      }
    }
  }

  /**
   * Logs errors with context
   */
  public static logError(error: Error, context?: string): void {
    const contextStr = context ? `[${context}] ` : ''
    Logger.error(`${contextStr}${error.name}: ${error.message}`)

    if (error.stack) {
      Logger.debug('Stack trace:', error.stack)
    }
  }

  /**
   * Creates a standardized error response
   */
  public static createErrorResponse(error: ReturnType<typeof ErrorHandler.handle>): {
    success: false
    error: string
    code: string
    details?: Record<string, unknown>
  } {
    return {
      success: false,
      error: error.error,
      code: error.code,
      details: error.details,
    }
  }
}

/**
 * Async error boundary for Express middleware
 */
export function asyncHandler(
  fn: (_req: unknown, _res: unknown, _next: unknown) => void | Promise<void>
) {
  return (_req: unknown, _res: unknown, _next: unknown) => {
    void Promise.resolve(fn(_req, _res, _next)).catch(_next as (_reason: unknown) => void)
  }
}
