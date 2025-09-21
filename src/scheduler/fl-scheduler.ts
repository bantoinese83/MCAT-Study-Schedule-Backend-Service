import moment from 'moment'

import { FL_CONFIG } from '../constants'
import { StudyDay } from '../types'

import { CalendarGenerator } from './calendar-generator'

/**
 * Handles full-length exam scheduling
 */
export class FLScheduler {
  /**
   * Schedules full-length exams on the calendar
   */
  public static scheduleFullLengthExams(
    calendar: StudyDay[],
    flWeekday: string,
    startDate: string,
    testDate: string
  ): StudyDay[] {
    const flDates = CalendarGenerator.calculateFLDates(
      startDate,
      testDate,
      FL_CONFIG.TOTAL_FL_EXAMS,
      flWeekday
    )

    return calendar.map(day => {
      if (flDates.includes(day.date)) {
        return {
          ...day,
          kind: 'full_length' as const,
          provider: 'AAMC',
          name: `FL #${flDates.indexOf(day.date) + 1}`,
        }
      }
      return day
    })
  }

  /**
   * Validates that full-length exam scheduling is valid
   */
  public static validateFLScheduling(
    calendar: StudyDay[],
    startDate: string,
    testDate: string
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    const flDays = calendar.filter(day => day.kind === 'full_length')

    // Check total count
    if (flDays.length !== FL_CONFIG.TOTAL_FL_EXAMS) {
      issues.push(`Expected ${FL_CONFIG.TOTAL_FL_EXAMS} FL exams, got ${flDays.length}`)
    }

    // Check spacing
    const flDates = flDays.map(day => day.date).sort()
    for (let i = 1; i < flDates.length; i++) {
      const daysBetween = this.calculateDaysBetween(flDates[i - 1], flDates[i])
      if (daysBetween < 7) {
        issues.push(`FL exams too close: ${flDates[i - 1]} to ${flDates[i]} (${daysBetween} days)`)
      }
    }

    // Check minimum distance from test
    const lastFL = flDates[flDates.length - 1]
    const daysFromTest = this.calculateDaysBetween(lastFL, testDate)
    if (daysFromTest <= FL_CONFIG.MIN_DAYS_BEFORE_TEST) {
      issues.push(`Last FL too close to test: ${lastFL} (${daysFromTest} days before test)`)
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  }

  /**
   * Calculates days between two dates (exclusive)
   */
  private static calculateDaysBetween(date1: string, date2: string): number {
    const moment1 = moment(date1)
    const moment2 = moment(date2)
    return Math.abs(moment2.diff(moment1, 'days'))
  }

  /**
   * Gets FL exam statistics
   */
  public static getFLStats(calendar: StudyDay[]): {
    total: number
    dates: string[]
    averageSpacing: number
  } {
    const flDays = calendar.filter(day => day.kind === 'full_length')
    const flDates = flDays.map(day => day.date).sort()

    let totalSpacing = 0
    for (let i = 1; i < flDates.length; i++) {
      totalSpacing += this.calculateDaysBetween(flDates[i - 1], flDates[i])
    }

    const averageSpacing = flDates.length > 1 ? totalSpacing / (flDates.length - 1) : 0

    return {
      total: flDays.length,
      dates: flDates,
      averageSpacing: Math.round(averageSpacing),
    }
  }
}
