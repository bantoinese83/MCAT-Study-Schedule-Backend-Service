import moment from 'moment'

import { WEEKDAYS } from '../constants'
import { StudyDay } from '../types'

/**
 * Handles calendar generation and date calculations with optimized performance
 */
export class CalendarGenerator {
  // Cache for weekday calculations to avoid repeated moment operations
  private static weekdayCache = new Map<string, string>()
  // Cache for FL date calculations
  private static flDateCache = new Map<string, string[]>()

  /**
   * Generates a calendar from start to test date (optimized)
   */
  public static generateCalendar(
    startDate: string,
    testDate: string,
    availability: string[]
  ): StudyDay[] {
    this.validateDates(startDate, testDate)

    const start = moment(startDate)
    const test = moment(testDate)
    const totalDays = test.diff(start, 'days')

    // Pre-allocate array for better performance
    const days: StudyDay[] = new Array<StudyDay>(totalDays)

    // Create availability set for O(1) lookups
    const availabilitySet = new Set(availability)

    for (let i = 0; i < totalDays; i++) {
      const currentDate = start.clone().add(i, 'days')
      days[i] = this.createCalendarDayOptimized(currentDate, availabilitySet)
    }

    return days
  }

  /**
   * Creates a single calendar day (optimized)
   */
  private static createCalendarDayOptimized(
    date: moment.Moment,
    availabilitySet: Set<string>
  ): StudyDay {
    const dateKey = date.format('YYYY-MM-DD')

    // Use cached weekday calculation or compute and cache
    let dayName = this.weekdayCache.get(dateKey)
    if (!dayName) {
      dayName = date.format('ddd')
      this.weekdayCache.set(dateKey, dayName)
    }

    const isStudyDay = availabilitySet.has(dayName)

    return {
      date: dateKey,
      kind: isStudyDay ? 'study' : 'break',
    }
  }

  /**
   * Creates a single calendar day (legacy method for compatibility)
   */
  private static createCalendarDay(date: moment.Moment, availability: string[]): StudyDay {
    const dayName = date.format('ddd') as keyof typeof WEEKDAYS
    const isStudyDay = availability.includes(WEEKDAYS[dayName])

    return {
      date: date.format('YYYY-MM-DD'),
      kind: isStudyDay ? 'study' : 'break',
    }
  }

  /**
   * Validates that start date is before test date
   */
  private static validateDates(startDate: string, testDate: string): void {
    const start = moment(startDate)
    const test = moment(testDate)

    if (!start.isValid() || !test.isValid()) {
      throw new Error('Invalid date format. Use YYYY-MM-DD')
    }

    if (!start.isBefore(test)) {
      throw new Error('Start date must be before test date')
    }
  }

  /**
   * Calculates the number of study days between two dates
   */
  public static calculateStudyDays(
    startDate: string,
    testDate: string,
    availability: string[]
  ): number {
    const calendar = this.generateCalendar(startDate, testDate, availability)
    return calendar.filter(day => day.kind === 'study').length
  }

  /**
   * Gets the weekday name from a date
   */
  public static getWeekday(date: string): string {
    return moment(date).format('ddd')
  }

  /**
   * Finds the next occurrence of a specific weekday from a start date
   */
  public static findNextWeekday(startDate: string, targetWeekday: string): string {
    const currentDate = moment(startDate).clone()

    while (currentDate.format('ddd') !== targetWeekday) {
      currentDate.add(1, 'day')
    }

    return currentDate.format('YYYY-MM-DD')
  }

  /**
   * Calculates evenly spaced dates for full-length exams (optimized with caching)
   */
  public static calculateFLDates(
    startDate: string,
    testDate: string,
    totalExams: number,
    weekday: string
  ): string[] {
    // Create cache key
    const cacheKey = `${startDate}-${testDate}-${totalExams}-${weekday}`

    // Use cached result if available
    if (this.flDateCache.has(cacheKey)) {
      return this.flDateCache.get(cacheKey)!
    }

    const start = moment(startDate)
    const test = moment(testDate)
    const totalDays = test.diff(start, 'days')

    if (totalDays <= 0) {
      throw new Error('Invalid date range')
    }

    const flDates: string[] = []
    const spacing = Math.floor(totalDays / totalExams)

    // Pre-calculate the minimum safe date (7 days before test)
    const minSafeDate = test.clone().subtract(7, 'days')

    for (let i = 1; i <= totalExams; i++) {
      const targetDate = start.clone().add(i * spacing, 'days')
      const flDate = this.findNextWeekdayOptimized(targetDate.format('YYYY-MM-DD'), weekday)

      // Ensure not in last 7 days before test
      if (moment(flDate).isBefore(minSafeDate)) {
        flDates.push(flDate)
      }
    }

    // Cache the result
    this.flDateCache.set(cacheKey, flDates)
    return flDates
  }

  /**
   * Finds the next occurrence of a specific weekday (optimized with caching)
   */
  private static findNextWeekdayOptimized(startDate: string, targetWeekday: string): string {
    const cacheKey = `${startDate}-${targetWeekday}`

    // Use cached result if available
    if (this.weekdayCache.has(cacheKey)) {
      return this.weekdayCache.get(cacheKey)!
    }

    const result = this.findNextWeekday(startDate, targetWeekday)
    this.weekdayCache.set(cacheKey, result)
    return result
  }
}
