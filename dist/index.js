"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("./middleware/validation");
const schedule_orchestrator_1 = require("./scheduler/schedule-orchestrator");
const error_handling_1 = require("./utils/error-handling");
const app = (0, express_1.default)();
const port = process.env.PORT ?? 3000;
// Initialize orchestrator
const orchestrator = new schedule_orchestrator_1.ScheduleOrchestrator();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(validation_1.sanitizeInput);
app.use(validation_1.logRequest);
app.use((0, validation_1.requestTimeout)(60000)); // 60 second timeout for schedule generation
// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});
app.get('/full-plan', validation_1.validateScheduleParams, (0, error_handling_1.asyncHandler)((req, res) => {
    const typedRes = res;
    const validatedReq = req;
    const params = validatedReq.validatedParams;
    if (!params) {
        typedRes.status(400).json({
            success: false,
            error: 'Request validation failed',
            code: 'VALIDATION_ERROR',
        });
        return;
    }
    const result = error_handling_1.ErrorHandler.wrapSync(() => orchestrator.generateSchedule(params));
    if (result.success) {
        typedRes.json({
            success: true,
            data: result.data.data,
            stats: result.data.stats,
            generatedAt: new Date().toISOString(),
        });
    }
    else {
        const errorResponse = error_handling_1.ErrorHandler.createErrorResponse(result.error);
        typedRes.status(result.error.statusCode).json(errorResponse);
    }
}));
app.get('/stats', validation_1.validateScheduleParams, (0, error_handling_1.asyncHandler)((req, res) => {
    const typedRes = res;
    const validatedReq = req;
    const params = validatedReq.validatedParams;
    if (!params) {
        typedRes.status(400).json({
            success: false,
            error: 'Request validation failed',
            code: 'VALIDATION_ERROR',
        });
        return;
    }
    const result = error_handling_1.ErrorHandler.wrapSync(() => orchestrator.generateSchedule(params));
    if (result.success) {
        typedRes.json({
            success: true,
            stats: result.data.stats,
            generatedAt: new Date().toISOString(),
        });
    }
    else {
        const errorResponse = error_handling_1.ErrorHandler.createErrorResponse(result.error);
        typedRes.status(result.error.statusCode).json(errorResponse);
    }
}));
// Error handling middleware
app.use((error, req, res) => {
    error_handling_1.ErrorHandler.logError(error, 'Unhandled Error');
    const errorResponse = error_handling_1.ErrorHandler.handle(error);
    res.status(errorResponse.statusCode).json(error_handling_1.ErrorHandler.createErrorResponse(errorResponse));
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
    });
});
app.listen(port, () => {
    error_handling_1.Logger.info(`🚀 MCAT Study Scheduler running on port ${port}`);
    error_handling_1.Logger.info(`📊 Health check: http://localhost:${port}/health`);
    error_handling_1.Logger.info(`📅 Schedule: http://localhost:${port}/full-plan`);
    error_handling_1.Logger.info(`📈 Stats: http://localhost:${port}/stats`);
});
//# sourceMappingURL=index.js.map