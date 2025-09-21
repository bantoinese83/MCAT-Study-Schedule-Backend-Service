import { StudyDay } from '../types';
/**
 * Handles full-length exam scheduling
 */
export declare class FLScheduler {
    /**
     * Schedules full-length exams on the calendar
     */
    static scheduleFullLengthExams(calendar: StudyDay[], flWeekday: string, startDate: string, testDate: string): StudyDay[];
    /**
     * Validates that full-length exam scheduling is valid
     */
    static validateFLScheduling(calendar: StudyDay[], startDate: string, testDate: string): {
        isValid: boolean;
        issues: string[];
    };
    /**
     * Calculates days between two dates (exclusive)
     */
    private static calculateDaysBetween;
    /**
     * Gets FL exam statistics
     */
    static getFLStats(calendar: StudyDay[]): {
        total: number;
        dates: string[];
        averageSpacing: number;
    };
}
//# sourceMappingURL=fl-scheduler.d.ts.map