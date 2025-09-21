import { StudyDay } from '../types';
/**
 * Handles calendar generation and date calculations with optimized performance
 */
export declare class CalendarGenerator {
    private static weekdayCache;
    private static flDateCache;
    /**
     * Generates a calendar from start to test date (optimized)
     */
    static generateCalendar(startDate: string, testDate: string, availability: string[]): StudyDay[];
    /**
     * Creates a single calendar day (optimized)
     */
    private static createCalendarDayOptimized;
    /**
     * Creates a single calendar day (legacy method for compatibility)
     */
    private static createCalendarDay;
    /**
     * Validates that start date is before test date
     */
    private static validateDates;
    /**
     * Calculates the number of study days between two dates
     */
    static calculateStudyDays(startDate: string, testDate: string, availability: string[]): number;
    /**
     * Gets the weekday name from a date
     */
    static getWeekday(date: string): string;
    /**
     * Finds the next occurrence of a specific weekday from a start date
     */
    static findNextWeekday(startDate: string, targetWeekday: string): string;
    /**
     * Calculates evenly spaced dates for full-length exams (optimized with caching)
     */
    static calculateFLDates(startDate: string, testDate: string, totalExams: number, weekday: string): string[];
    /**
     * Finds the next occurrence of a specific weekday (optimized with caching)
     */
    private static findNextWeekdayOptimized;
}
//# sourceMappingURL=calendar-generator.d.ts.map