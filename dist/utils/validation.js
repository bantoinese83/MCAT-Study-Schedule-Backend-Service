"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
const constants_1 = require("../constants");
/**
 * Input validation utilities
 */
class ValidationUtils {
    /**
     * Validates schedule parameters
     */
    static validateScheduleParams(params) {
        if (!params || typeof params !== 'object') {
            throw new Error(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS);
        }
        const { start, test, priorities, availability, fl_weekday } = params;
        // Check required fields
        if (!start || !test || !priorities || !availability || !fl_weekday) {
            throw new Error(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS);
        }
        // Validate and parse parameters
        const validatedParams = {
            start: this.validateDate(start, 'start'),
            test: this.validateDate(test, 'test'),
            priorities: this.validatePriorities(priorities),
            availability: this.validateAvailability(availability),
            fl_weekday: this.validateWeekday(fl_weekday),
        };
        // Additional business logic validation
        this.validateDateOrder(validatedParams.start, validatedParams.test);
        return validatedParams;
    }
    /**
     * Validates date format and value
     */
    static validateDate(date, fieldName) {
        if (typeof date !== 'string') {
            throw new Error(`Invalid ${fieldName} date: must be a string`);
        }
        if (!constants_1.VALIDATION_PATTERNS.DATE.test(date)) {
            throw new Error(`Invalid ${fieldName} date format. Use YYYY-MM-DD`);
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid ${fieldName} date: ${date}`);
        }
        return date;
    }
    /**
     * Validates date order
     */
    static validateDateOrder(start, test) {
        if (new Date(start) >= new Date(test)) {
            throw new Error(constants_1.ERROR_MESSAGES.START_AFTER_TEST);
        }
    }
    /**
     * Validates and parses priorities from query parameters
     */
    static validatePriorities(priorities) {
        let prioritiesArray;
        // Handle different input formats from query parameters
        if (typeof priorities === 'string') {
            prioritiesArray = priorities.split(',').map(p => p.trim());
        }
        else if (Array.isArray(priorities)) {
            prioritiesArray = priorities.map(p => String(p).trim());
        }
        else {
            throw new Error('Priorities must be a string or array');
        }
        if (prioritiesArray.length === 0) {
            throw new Error('Priorities cannot be empty');
        }
        // Validate each priority follows category pattern (e.g., "1A", "2B")
        const validPriorities = prioritiesArray.filter(priority => {
            return typeof priority === 'string' && constants_1.VALIDATION_PATTERNS.CATEGORY.test(priority);
        });
        if (validPriorities.length !== prioritiesArray.length) {
            throw new Error('Invalid priority format. Use format like "1A", "2B", etc.');
        }
        return validPriorities;
    }
    /**
     * Validates and parses availability from query parameters
     */
    static validateAvailability(availability) {
        let availabilityArray;
        // Handle different input formats from query parameters
        if (typeof availability === 'string') {
            availabilityArray = availability.split(',').map(a => a.trim());
        }
        else if (Array.isArray(availability)) {
            availabilityArray = availability.map(a => String(a).trim());
        }
        else {
            throw new Error('Availability must be a string or array');
        }
        if (availabilityArray.length === 0) {
            throw new Error('Availability cannot be empty');
        }
        const validWeekdays = Object.values(constants_1.WEEKDAYS);
        const validDays = availabilityArray.filter(day => {
            return validWeekdays.includes(day);
        });
        if (validDays.length !== availabilityArray.length) {
            throw new Error(constants_1.ERROR_MESSAGES.INVALID_AVAILABILITY);
        }
        return validDays;
    }
    /**
     * Validates weekday
     */
    static validateWeekday(weekday) {
        if (typeof weekday !== 'string') {
            throw new Error('FL weekday must be a string');
        }
        if (!constants_1.VALIDATION_PATTERNS.WEEKDAY.test(weekday)) {
            throw new Error(constants_1.ERROR_MESSAGES.INVALID_WEEKDAY);
        }
        return weekday;
    }
    /**
     * Sanitizes string input
     */
    static sanitizeString(input) {
        return input.trim().replace(/[<>]/g, '');
    }
    /**
     * Validates array of strings
     */
    static validateStringArray(input, fieldName) {
        if (!Array.isArray(input)) {
            throw new Error(`${fieldName} must be an array`);
        }
        const validStrings = input.filter(item => {
            return typeof item === 'string' && item.trim().length > 0;
        });
        if (validStrings.length !== input.length) {
            throw new Error(`${fieldName} must contain only non-empty strings`);
        }
        return validStrings;
    }
}
exports.ValidationUtils = ValidationUtils;
//# sourceMappingURL=validation.js.map