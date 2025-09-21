import { ScheduleParams } from '../types';
/**
 * Input validation utilities
 */
export declare class ValidationUtils {
    /**
     * Validates schedule parameters
     */
    static validateScheduleParams(params: unknown): ScheduleParams;
    /**
     * Validates date format and value
     */
    private static validateDate;
    /**
     * Validates date order
     */
    private static validateDateOrder;
    /**
     * Validates and parses priorities from query parameters
     */
    private static validatePriorities;
    /**
     * Validates and parses availability from query parameters
     */
    private static validateAvailability;
    /**
     * Validates weekday
     */
    private static validateWeekday;
    /**
     * Sanitizes string input
     */
    static sanitizeString(input: string): string;
    /**
     * Validates array of strings
     */
    static validateStringArray(input: unknown, fieldName: string): string[];
}
//# sourceMappingURL=validation.d.ts.map