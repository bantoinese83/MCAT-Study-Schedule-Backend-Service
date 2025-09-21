"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTimeout = exports.logRequest = exports.sanitizeInput = exports.validateScheduleParams = void 0;
const error_handling_1 = require("../utils/error-handling");
const validation_1 = require("../utils/validation");
/**
 * Validates schedule generation request parameters
 */
const validateScheduleParams = (req, res, next) => {
    try {
        const params = validation_1.ValidationUtils.validateScheduleParams(req.query);
        // Sanitize string inputs
        params.priorities = params.priorities.map(p => validation_1.ValidationUtils.sanitizeString(p));
        params.availability = params.availability.map(a => validation_1.ValidationUtils.sanitizeString(a));
        params.fl_weekday = validation_1.ValidationUtils.sanitizeString(params.fl_weekday);
        req.validatedParams = params;
        next();
    }
    catch (error) {
        const errorResponse = error_handling_1.ErrorHandler.handle(error);
        res.status(errorResponse.statusCode).json(error_handling_1.ErrorHandler.createErrorResponse(errorResponse));
    }
};
exports.validateScheduleParams = validateScheduleParams;
/**
 * General input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        const queryObj = req.query;
        Object.keys(queryObj).forEach((key) => {
            const queryValue = queryObj[key];
            if (typeof queryValue === 'string') {
                queryObj[key] = validation_1.ValidationUtils.sanitizeString(queryValue);
            }
            else if (Array.isArray(queryValue)) {
                queryObj[key] = queryValue.map(s => validation_1.ValidationUtils.sanitizeString(s));
            }
        });
    }
    // Sanitize body parameters
    if (req.body && typeof req.body === 'object') {
        const bodyObj = req.body;
        Object.keys(bodyObj).forEach((key) => {
            const bodyValue = bodyObj[key];
            if (typeof bodyValue === 'string') {
                bodyObj[key] = validation_1.ValidationUtils.sanitizeString(bodyValue);
            }
            else if (Array.isArray(bodyValue)) {
                bodyObj[key] = bodyValue.map(s => validation_1.ValidationUtils.sanitizeString(s));
            }
        });
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
/**
 * Request logging middleware
 */
const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip ?? req.socket?.remoteAddress;
    error_handling_1.Logger.debug(`${timestamp} ${method} ${url} - ${ip}`);
    next();
};
exports.logRequest = logRequest;
/**
 * Request timeout middleware
 */
const requestTimeout = (timeoutMs = 30000) => {
    return (_req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    error: 'Request timeout',
                    code: 'REQUEST_TIMEOUT',
                    details: { timeoutMs },
                });
            }
        }, timeoutMs);
        res.on('finish', () => {
            clearTimeout(timeout);
        });
        next();
    };
};
exports.requestTimeout = requestTimeout;
//# sourceMappingURL=validation.js.map