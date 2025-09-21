import express, { Response } from 'express'

import {
  validateScheduleParams,
  sanitizeInput,
  logRequest,
  requestTimeout,
  ValidatedRequest,
} from './middleware/validation'
import { ScheduleOrchestrator } from './scheduler/schedule-orchestrator'
import { ErrorHandler, asyncHandler, Logger } from './utils/error-handling'

const app = express()
const port = process.env.PORT ?? 3000

// Initialize orchestrator
const orchestrator = new ScheduleOrchestrator()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sanitizeInput)
app.use(logRequest)
app.use(requestTimeout(60000)) // 60 second timeout for schedule generation

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

app.get(
  '/full-plan',
  validateScheduleParams,
  asyncHandler((req: unknown, res: unknown) => {
    const typedRes = res as Response
    const validatedReq = req as ValidatedRequest
    const params = validatedReq.validatedParams

    if (!params) {
      typedRes.status(400).json({
        success: false,
        error: 'Request validation failed',
        code: 'VALIDATION_ERROR',
      })
      return
    }

    const result = ErrorHandler.wrapSync(() => orchestrator.generateSchedule(params))

    if (result.success) {
      typedRes.json({
        success: true,
        data: result.data.data,
        stats: result.data.stats,
        generatedAt: new Date().toISOString(),
      })
    } else {
      const errorResponse = ErrorHandler.createErrorResponse(result.error)
      typedRes.status(result.error.statusCode).json(errorResponse)
    }
  })
)

app.get(
  '/stats',
  validateScheduleParams,
  asyncHandler((req: unknown, res: unknown) => {
    const typedRes = res as Response
    const validatedReq = req as ValidatedRequest
    const params = validatedReq.validatedParams

    if (!params) {
      typedRes.status(400).json({
        success: false,
        error: 'Request validation failed',
        code: 'VALIDATION_ERROR',
      })
      return
    }

    const result = ErrorHandler.wrapSync(() => orchestrator.generateSchedule(params))

    if (result.success) {
      typedRes.json({
        success: true,
        stats: result.data.stats,
        generatedAt: new Date().toISOString(),
      })
    } else {
      const errorResponse = ErrorHandler.createErrorResponse(result.error)
      typedRes.status(result.error.statusCode).json(errorResponse)
    }
  })
)

// Error handling middleware

app.use((error: Error, req: express.Request, res: express.Response) => {
  ErrorHandler.logError(error, 'Unhandled Error')
  const errorResponse = ErrorHandler.handle(error)
  res.status(errorResponse.statusCode).json(ErrorHandler.createErrorResponse(errorResponse))
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
  })
})

app.listen(port, () => {
  Logger.info(`🚀 MCAT Study Scheduler running on port ${port}`)
  Logger.info(`📊 Health check: http://localhost:${port}/health`)
  Logger.info(`📅 Schedule: http://localhost:${port}/full-plan`)
  Logger.info(`📈 Stats: http://localhost:${port}/stats`)
})
