import { VALIDATION_PATTERNS, ERROR_MESSAGES, WEEKDAYS } from '../constants'
import { ScheduleParams } from '../types'

/**
 * Input validation utilities
 */
export class ValidationUtils {
  /**
   * Validates schedule parameters
   */
  public static validateScheduleParams(params: unknown): ScheduleParams {
    if (!params || typeof params !== 'object') {
      throw new Error(ERROR_MESSAGES.MISSING_PARAMETERS)
    }

    const { start, test, priorities, availability, fl_weekday } = params as Record<string, unknown>

    // Check required fields
    if (!start || !test || !priorities || !availability || !fl_weekday) {
      throw new Error(ERROR_MESSAGES.MISSING_PARAMETERS)
    }

    // Validate and parse parameters
    const validatedParams: ScheduleParams = {
      start: this.validateDate(start, 'start'),
      test: this.validateDate(test, 'test'),
      priorities: this.validatePriorities(priorities),
      availability: this.validateAvailability(availability),
      fl_weekday: this.validateWeekday(fl_weekday),
    }

    // Additional business logic validation
    this.validateDateOrder(validatedParams.start, validatedParams.test)

    return validatedParams
  }

  /**
   * Validates date format and value
   */
  private static validateDate(date: unknown, fieldName: string): string {
    if (typeof date !== 'string') {
      throw new Error(`Invalid ${fieldName} date: must be a string`)
    }

    if (!VALIDATION_PATTERNS.DATE.test(date)) {
      throw new Error(`Invalid ${fieldName} date format. Use YYYY-MM-DD`)
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid ${fieldName} date: ${date}`)
    }

    return date
  }

  /**
   * Validates date order
   */
  private static validateDateOrder(start: string, test: string): void {
    if (new Date(start) >= new Date(test)) {
      throw new Error(ERROR_MESSAGES.START_AFTER_TEST)
    }
  }

  /**
   * Validates and parses priorities from query parameters
   */
  private static validatePriorities(priorities: unknown): string[] {
    let prioritiesArray: string[]

    // Handle different input formats from query parameters
    if (typeof priorities === 'string') {
      prioritiesArray = priorities.split(',').map(p => p.trim())
    } else if (Array.isArray(priorities)) {
      prioritiesArray = priorities.map(p => String(p).trim())
    } else {
      throw new Error('Priorities must be a string or array')
    }

    if (prioritiesArray.length === 0) {
      throw new Error('Priorities cannot be empty')
    }

    // Validate each priority follows category pattern (e.g., "1A", "2B")
    const validPriorities = prioritiesArray.filter(priority => {
      return typeof priority === 'string' && VALIDATION_PATTERNS.CATEGORY.test(priority)
    })

    if (validPriorities.length !== prioritiesArray.length) {
      throw new Error('Invalid priority format. Use format like "1A", "2B", etc.')
    }

    return validPriorities
  }

  /**
   * Validates and parses availability from query parameters
   */
  private static validateAvailability(availability: unknown): string[] {
    let availabilityArray: string[]

    // Handle different input formats from query parameters
    if (typeof availability === 'string') {
      availabilityArray = availability.split(',').map(a => a.trim())
    } else if (Array.isArray(availability)) {
      availabilityArray = availability.map(a => String(a).trim())
    } else {
      throw new Error('Availability must be a string or array')
    }

    if (availabilityArray.length === 0) {
      throw new Error('Availability cannot be empty')
    }

    const validWeekdays = Object.values(WEEKDAYS)
    const validDays = availabilityArray.filter(day => {
      return validWeekdays.includes(day as (typeof validWeekdays)[0])
    })

    if (validDays.length !== availabilityArray.length) {
      throw new Error(ERROR_MESSAGES.INVALID_AVAILABILITY)
    }

    return validDays
  }

  /**
   * Validates weekday
   */
  private static validateWeekday(weekday: unknown): string {
    if (typeof weekday !== 'string') {
      throw new Error('FL weekday must be a string')
    }

    if (!VALIDATION_PATTERNS.WEEKDAY.test(weekday)) {
      throw new Error(ERROR_MESSAGES.INVALID_WEEKDAY)
    }

    return weekday
  }

  /**
   * Sanitizes string input
   */
  public static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  /**
   * Validates array of strings
   */
  public static validateStringArray(input: unknown, fieldName: string): string[] {
    if (!Array.isArray(input)) {
      throw new Error(`${fieldName} must be an array`)
    }

    const validStrings = input.filter(item => {
      return typeof item === 'string' && item.trim().length > 0
    })

    if (validStrings.length !== input.length) {
      throw new Error(`${fieldName} must contain only non-empty strings`)
    }

    return validStrings as string[]
  }
}
