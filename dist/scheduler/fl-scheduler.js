"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLScheduler = void 0;
const moment_1 = __importDefault(require("moment"));
const constants_1 = require("../constants");
const calendar_generator_1 = require("./calendar-generator");
/**
 * Handles full-length exam scheduling
 */
class FLScheduler {
    /**
     * Schedules full-length exams on the calendar
     */
    static scheduleFullLengthExams(calendar, flWeekday, startDate, testDate) {
        const flDates = calendar_generator_1.CalendarGenerator.calculateFLDates(startDate, testDate, constants_1.FL_CONFIG.TOTAL_FL_EXAMS, flWeekday);
        return calendar.map(day => {
            if (flDates.includes(day.date)) {
                return {
                    ...day,
                    kind: 'full_length',
                    provider: 'AAMC',
                    name: `FL #${flDates.indexOf(day.date) + 1}`,
                };
            }
            return day;
        });
    }
    /**
     * Validates that full-length exam scheduling is valid
     */
    static validateFLScheduling(calendar, startDate, testDate) {
        const issues = [];
        const flDays = calendar.filter(day => day.kind === 'full_length');
        // Check total count
        if (flDays.length !== constants_1.FL_CONFIG.TOTAL_FL_EXAMS) {
            issues.push(`Expected ${constants_1.FL_CONFIG.TOTAL_FL_EXAMS} FL exams, got ${flDays.length}`);
        }
        // Check spacing
        const flDates = flDays.map(day => day.date).sort();
        for (let i = 1; i < flDates.length; i++) {
            const daysBetween = this.calculateDaysBetween(flDates[i - 1], flDates[i]);
            if (daysBetween < 7) {
                issues.push(`FL exams too close: ${flDates[i - 1]} to ${flDates[i]} (${daysBetween} days)`);
            }
        }
        // Check minimum distance from test
        const lastFL = flDates[flDates.length - 1];
        const daysFromTest = this.calculateDaysBetween(lastFL, testDate);
        if (daysFromTest <= constants_1.FL_CONFIG.MIN_DAYS_BEFORE_TEST) {
            issues.push(`Last FL too close to test: ${lastFL} (${daysFromTest} days before test)`);
        }
        return {
            isValid: issues.length === 0,
            issues,
        };
    }
    /**
     * Calculates days between two dates (exclusive)
     */
    static calculateDaysBetween(date1, date2) {
        const moment1 = (0, moment_1.default)(date1);
        const moment2 = (0, moment_1.default)(date2);
        return Math.abs(moment2.diff(moment1, 'days'));
    }
    /**
     * Gets FL exam statistics
     */
    static getFLStats(calendar) {
        const flDays = calendar.filter(day => day.kind === 'full_length');
        const flDates = flDays.map(day => day.date).sort();
        let totalSpacing = 0;
        for (let i = 1; i < flDates.length; i++) {
            totalSpacing += this.calculateDaysBetween(flDates[i - 1], flDates[i]);
        }
        const averageSpacing = flDates.length > 1 ? totalSpacing / (flDates.length - 1) : 0;
        return {
            total: flDays.length,
            dates: flDates,
            averageSpacing: Math.round(averageSpacing),
        };
    }
}
exports.FLScheduler = FLScheduler;
//# sourceMappingURL=fl-scheduler.js.map