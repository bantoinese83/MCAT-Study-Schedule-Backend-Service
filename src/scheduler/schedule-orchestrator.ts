import { DataLoader } from '../data/data-loader'
import { DataProcessor } from '../data/data-processor'
import { StudyDay, ScheduleParams, ScheduleStats } from '../types'
import { Logger } from '../utils/error-handling'

import { CalendarGenerator } from './calendar-generator'
import { FLScheduler } from './fl-scheduler'
import { PhaseManager } from './phase-manager'
import { ResourceManager } from './resource-manager'

/**
 * Main orchestrator for generating MCAT study schedules
 */
export class ScheduleOrchestrator {
  private dataLoader: DataLoader
  private resourceManager: ResourceManager

  constructor() {
    this.dataLoader = DataLoader.getInstance()
    this.resourceManager = new ResourceManager()
  }

  /**
   * Generates a complete study schedule
   */
  public generateSchedule(params: ScheduleParams): { data: StudyDay[]; stats: ScheduleStats } {
    try {
      // Step 1: Load and validate data
      const allTopics = this.dataLoader.loadTopics()
      this.validateParams(params)

      // Step 2: Generate calendar
      const calendar = CalendarGenerator.generateCalendar(
        params.start,
        params.test,
        params.availability
      )

      // Step 3: Split into phases
      const studyDays = calendar.filter(day => day.kind === 'study')
      const phases = PhaseManager.splitIntoPhases(studyDays)

      // Step 4: Schedule full-length exams
      const calendarWithFL = FLScheduler.scheduleFullLengthExams(
        calendar,
        params.fl_weekday,
        params.start,
        params.test
      )

      // Step 5: Prepare high-yield topics
      const availableTopics = DataProcessor.getAvailableHYTopics(allTopics, params.priorities)

      // Step 6: Generate study day content
      const schedule: StudyDay[] = []

      for (const day of calendarWithFL) {
        if (day.kind === 'study') {
          const phase = PhaseManager.getPhaseForDate(day.date, phases)
          const studyDay = this.resourceManager.generateStudyDay(
            day,
            phase,
            allTopics,
            availableTopics
          )

          // Track resources
          if ('blocks' in studyDay) {
            this.resourceManager.trackUsedResources(studyDay)
          }

          schedule.push(studyDay)
        } else {
          schedule.push(day)
        }
      }

      // Step 7: Validate final schedule
      this.validateSchedule(schedule, params)

      // Step 8: Generate statistics
      const stats = this.getScheduleStats(schedule)

      return { data: schedule, stats }
    } catch (error) {
      throw new Error(
        `Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validates input parameters
   */
  private validateParams(params: ScheduleParams): void {
    if (
      !params.start ||
      !params.test ||
      !params.priorities ||
      !params.availability ||
      !params.fl_weekday
    ) {
      throw new Error(
        'Missing required parameters: start, test, priorities, availability, fl_weekday'
      )
    }

    // Validate date format and order
    const startDate = new Date(params.start)
    const testDate = new Date(params.test)

    if (isNaN(startDate.getTime()) || isNaN(testDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD')
    }

    if (startDate >= testDate) {
      throw new Error('Start date must be before test date')
    }

    // Validate weekday format
    const validWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    if (!validWeekdays.includes(params.fl_weekday)) {
      throw new Error('Invalid fl_weekday. Use Mon, Tue, Wed, Thu, Fri, Sat, Sun')
    }

    // Validate availability
    params.availability.forEach(day => {
      if (!validWeekdays.includes(day)) {
        throw new Error(`Invalid availability day: ${day}`)
      }
    })
  }

  /**
   * Validates the generated schedule
   */
  private validateSchedule(schedule: StudyDay[], params: ScheduleParams): void {
    // Check phase balance
    const studyDays = schedule.filter(day => day.kind === 'study')
    const phases = PhaseManager.splitIntoPhases(studyDays)

    if (!PhaseManager.validatePhaseBalance(phases)) {
      Logger.warn('Phase balance is not optimal')
    }

    // Validate FL scheduling
    const flValidation = FLScheduler.validateFLScheduling(schedule, params.start, params.test)
    if (!flValidation.isValid) {
      Logger.warn('FL scheduling validation issues:', flValidation.issues.join(', '))
    } else {
      // Check if we have fewer than expected FLs due to safety constraints
      const flDays = schedule.filter(day => day.kind === 'full_length')
      if (flDays.length < 6) {
        Logger.info(
          `Scheduled ${flDays.length} FL exams (fewer than target of 6 due to 7-day buffer constraint)`
        )
      }
    }
  }

  /**
   * Gets schedule statistics
   */
  public getScheduleStats(schedule: StudyDay[]): ScheduleStats {
    const studyDays = schedule.filter(day => day.kind === 'study')
    const phases = PhaseManager.splitIntoPhases(studyDays)
    const flStats = FLScheduler.getFLStats(schedule)

    return {
      totalDays: schedule.length,
      studyDays: studyDays.length,
      breakDays: schedule.filter(day => day.kind === 'break').length,
      flDays: schedule.filter(day => day.kind === 'full_length').length,
      phaseStats: PhaseManager.getPhaseStats(phases),
      flStats,
      resourceStats: this.resourceManager.getResourceStats(),
    }
  }

  /**
   * Resets the orchestrator state (useful for testing)
   */
  public reset(): void {
    this.resourceManager.reset()
    this.dataLoader.clearCache()
  }
}
