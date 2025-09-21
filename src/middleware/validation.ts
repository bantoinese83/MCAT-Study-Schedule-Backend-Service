import { Request, Response, NextFunction } from 'express'

import { ScheduleParams } from '../types'
import { ErrorHandler, Logger } from '../utils/error-handling'
import { ValidationUtils } from '../utils/validation'

/**
 * Express middleware for request validation
 */

export interface ValidatedRequest extends Request {
  validatedParams?: ScheduleParams
}

/**
 * Validates schedule generation request parameters
 */
export const validateScheduleParams = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const params = ValidationUtils.validateScheduleParams(req.query)

    // Sanitize string inputs
    params.priorities = params.priorities.map(p => ValidationUtils.sanitizeString(p))
    params.availability = params.availability.map(a => ValidationUtils.sanitizeString(a))
    params.fl_weekday = ValidationUtils.sanitizeString(params.fl_weekday)
    ;(req as ValidatedRequest).validatedParams = params
    next()
  } catch (error) {
    const errorResponse = ErrorHandler.handle(error as Error)
    res.status(errorResponse.statusCode).json(ErrorHandler.createErrorResponse(errorResponse))
  }
}

/**
 * General input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    const queryObj = req.query as Record<string, unknown>
    Object.keys(queryObj).forEach((key: string) => {
      const queryValue = queryObj[key]
      if (typeof queryValue === 'string') {
        queryObj[key] = ValidationUtils.sanitizeString(queryValue)
      } else if (Array.isArray(queryValue)) {
        queryObj[key] = (queryValue as string[]).map(s => ValidationUtils.sanitizeString(s))
      }
    })
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    const bodyObj = req.body as Record<string, unknown>
    Object.keys(bodyObj).forEach((key: string) => {
      const bodyValue = bodyObj[key]
      if (typeof bodyValue === 'string') {
        bodyObj[key] = ValidationUtils.sanitizeString(bodyValue)
      } else if (Array.isArray(bodyValue)) {
        bodyObj[key] = (bodyValue as string[]).map(s => ValidationUtils.sanitizeString(s))
      }
    })
  }

  next()
}

/**
 * Request logging middleware
 */
export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip ?? req.socket?.remoteAddress

  Logger.debug(`${timestamp} ${method} ${url} - ${ip}`)

  next()
}

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT',
          details: { timeoutMs },
        })
      }
    }, timeoutMs)

    res.on('finish', () => {
      clearTimeout(timeout)
    })

    next()
  }
}
