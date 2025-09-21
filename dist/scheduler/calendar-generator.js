"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarGenerator = void 0;
const moment_1 = __importDefault(require("moment"));
const constants_1 = require("../constants");
/**
 * Handles calendar generation and date calculations with optimized performance
 */
class CalendarGenerator {
    /**
     * Generates a calendar from start to test date (optimized)
     */
    static generateCalendar(startDate, testDate, availability) {
        this.validateDates(startDate, testDate);
        const start = (0, moment_1.default)(startDate);
        const test = (0, moment_1.default)(testDate);
        const totalDays = test.diff(start, 'days');
        // Pre-allocate array for better performance
        const days = new Array(totalDays);
        // Create availability set for O(1) lookups
        const availabilitySet = new Set(availability);
        for (let i = 0; i < totalDays; i++) {
            const currentDate = start.clone().add(i, 'days');
            days[i] = this.createCalendarDayOptimized(currentDate, availabilitySet);
        }
        return days;
    }
    /**
     * Creates a single calendar day (optimized)
     */
    static createCalendarDayOptimized(date, availabilitySet) {
        const dateKey = date.format('YYYY-MM-DD');
        // Use cached weekday calculation or compute and cache
        let dayName = this.weekdayCache.get(dateKey);
        if (!dayName) {
            dayName = date.format('ddd');
            this.weekdayCache.set(dateKey, dayName);
        }
        const isStudyDay = availabilitySet.has(dayName);
        return {
            date: dateKey,
            kind: isStudyDay ? 'study' : 'break',
        };
    }
    /**
     * Creates a single calendar day (legacy method for compatibility)
     */
    static createCalendarDay(date, availability) {
        const dayName = date.format('ddd');
        const isStudyDay = availability.includes(constants_1.WEEKDAYS[dayName]);
        return {
            date: date.format('YYYY-MM-DD'),
            kind: isStudyDay ? 'study' : 'break',
        };
    }
    /**
     * Validates that start date is before test date
     */
    static validateDates(startDate, testDate) {
        const start = (0, moment_1.default)(startDate);
        const test = (0, moment_1.default)(testDate);
        if (!start.isValid() || !test.isValid()) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        if (!start.isBefore(test)) {
            throw new Error('Start date must be before test date');
        }
    }
    /**
     * Calculates the number of study days between two dates
     */
    static calculateStudyDays(startDate, testDate, availability) {
        const calendar = this.generateCalendar(startDate, testDate, availability);
        return calendar.filter(day => day.kind === 'study').length;
    }
    /**
     * Gets the weekday name from a date
     */
    static getWeekday(date) {
        return (0, moment_1.default)(date).format('ddd');
    }
    /**
     * Finds the next occurrence of a specific weekday from a start date
     */
    static findNextWeekday(startDate, targetWeekday) {
        const currentDate = (0, moment_1.default)(startDate).clone();
        while (currentDate.format('ddd') !== targetWeekday) {
            currentDate.add(1, 'day');
        }
        return currentDate.format('YYYY-MM-DD');
    }
    /**
     * Calculates evenly spaced dates for full-length exams (optimized with caching)
     */
    static calculateFLDates(startDate, testDate, totalExams, weekday) {
        // Create cache key
        const cacheKey = `${startDate}-${testDate}-${totalExams}-${weekday}`;
        // Use cached result if available
        if (this.flDateCache.has(cacheKey)) {
            return this.flDateCache.get(cacheKey);
        }
        const start = (0, moment_1.default)(startDate);
        const test = (0, moment_1.default)(testDate);
        const totalDays = test.diff(start, 'days');
        if (totalDays <= 0) {
            throw new Error('Invalid date range');
        }
        const flDates = [];
        const spacing = Math.floor(totalDays / totalExams);
        // Pre-calculate the minimum safe date (7 days before test)
        const minSafeDate = test.clone().subtract(7, 'days');
        for (let i = 1; i <= totalExams; i++) {
            const targetDate = start.clone().add(i * spacing, 'days');
            const flDate = this.findNextWeekdayOptimized(targetDate.format('YYYY-MM-DD'), weekday);
            // Ensure not in last 7 days before test
            if ((0, moment_1.default)(flDate).isBefore(minSafeDate)) {
                flDates.push(flDate);
            }
        }
        // Cache the result
        this.flDateCache.set(cacheKey, flDates);
        return flDates;
    }
    /**
     * Finds the next occurrence of a specific weekday (optimized with caching)
     */
    static findNextWeekdayOptimized(startDate, targetWeekday) {
        const cacheKey = `${startDate}-${targetWeekday}`;
        // Use cached result if available
        if (this.weekdayCache.has(cacheKey)) {
            return this.weekdayCache.get(cacheKey);
        }
        const result = this.findNextWeekday(startDate, targetWeekday);
        this.weekdayCache.set(cacheKey, result);
        return result;
    }
}
exports.CalendarGenerator = CalendarGenerator;
// Cache for weekday calculations to avoid repeated moment operations
CalendarGenerator.weekdayCache = new Map();
// Cache for FL date calculations
CalendarGenerator.flDateCache = new Map();
//# sourceMappingURL=calendar-generator.js.map