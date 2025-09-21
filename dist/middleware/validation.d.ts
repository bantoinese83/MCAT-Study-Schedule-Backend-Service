import { Request, Response, NextFunction } from 'express';
import { ScheduleParams } from '../types';
/**
 * Express middleware for request validation
 */
export interface ValidatedRequest extends Request {
    validatedParams?: ScheduleParams;
}
/**
 * Validates schedule generation request parameters
 */
export declare const validateScheduleParams: (req: Request, res: Response, next: NextFunction) => void;
/**
 * General input sanitization middleware
 */
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Request logging middleware
 */
export declare const logRequest: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Request timeout middleware
 */
export declare const requestTimeout: (timeoutMs?: number) => (_req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map