"use strict";
/**
 * Application constants for MCAT Study Scheduler
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.VALIDATION_PATTERNS = exports.WEEKDAYS = exports.CARS_PROVIDERS = exports.PROVIDERS = exports.SELECTION_LIMITS = exports.RESOURCE_DEFAULTS = exports.FL_CONFIG = exports.PHASE_CONFIG = exports.TIME_CONSTANTS = void 0;
// Time constants (in minutes)
exports.TIME_CONSTANTS = {
    TOTAL_STUDY_HOURS: 5,
    WRITTEN_REVIEW_MINUTES: 60,
    RESOURCE_MINUTES: 240,
};
// Phase configuration
exports.PHASE_CONFIG = {
    TOTAL_PHASES: 3,
    PHASE_NAMES: {
        1: 'Content Review',
        2: 'Practice',
        3: 'Final Review',
    },
};
// Full-length exam configuration
exports.FL_CONFIG = {
    TOTAL_FL_EXAMS: 6,
    MIN_DAYS_BEFORE_TEST: 7,
    DEFAULT_WEEKDAY: 'Sat',
};
// Resource selection defaults (minutes)
exports.RESOURCE_DEFAULTS = {
    KA_VIDEO: 12,
    KA_ARTICLE: 10,
    KAPLAN_SECTION: 30,
    DISCRETE_SET: 30,
    PASSAGE: 25,
    UWORLD_10Q: 30,
};
// Content selection limits
exports.SELECTION_LIMITS = {
    MAX_KA_ITEMS_PER_DAY: 3,
    MAX_DISCRETE_SETS: 2,
    MAX_PASSAGES: 2,
    MAX_AAMC_SETS: 2,
};
// Provider names (for consistent matching)
exports.PROVIDERS = {
    KHAN_ACADEMY: 'Khan Academy',
    KAPLAN: 'Kaplan',
    JACK_WESTIN: 'Jack Westin',
    UWORLD: 'UWorld',
    AAMC: 'AAMC',
    THIRD_PARTY: 'ThirdParty',
};
// CARS provider priority
exports.CARS_PROVIDERS = {
    PHASE_1_2: [exports.PROVIDERS.JACK_WESTIN],
    PHASE_3: [exports.PROVIDERS.AAMC],
};
// Weekday mappings
exports.WEEKDAYS = {
    MON: 'Mon',
    TUE: 'Tue',
    WED: 'Wed',
    THU: 'Thu',
    FRI: 'Fri',
    SAT: 'Sat',
    SUN: 'Sun',
};
// Validation patterns
exports.VALIDATION_PATTERNS = {
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    WEEKDAY: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/,
    CATEGORY: /^[0-9][A-Z]$/,
};
// Error messages
exports.ERROR_MESSAGES = {
    INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD',
    START_AFTER_TEST: 'Start date must be before test date',
    INVALID_WEEKDAY: 'Invalid weekday. Use Mon, Tue, Wed, Thu, Fri, Sat, Sun',
    INVALID_AVAILABILITY: 'Invalid availability day',
    MISSING_PARAMETERS: 'Missing required parameters: start, test, priorities, availability, fl_weekday',
    EXCEL_FILE_NOT_FOUND: 'Organized_MCAT_Topics.xlsx file not found. Please ensure the file is in the root directory.',
    INTERNAL_ERROR: 'Internal server error',
};
//# sourceMappingURL=index.js.map