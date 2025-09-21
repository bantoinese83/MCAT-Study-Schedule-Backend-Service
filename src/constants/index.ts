/**
 * Application constants for MCAT Study Scheduler
 */

// Time constants (in minutes)
export const TIME_CONSTANTS = {
  TOTAL_STUDY_HOURS: 5,
  WRITTEN_REVIEW_MINUTES: 60,
  RESOURCE_MINUTES: 240,
} as const

// Phase configuration
export const PHASE_CONFIG = {
  TOTAL_PHASES: 3,
  PHASE_NAMES: {
    1: 'Content Review',
    2: 'Practice',
    3: 'Final Review',
  } as const,
} as const

// Full-length exam configuration
export const FL_CONFIG = {
  TOTAL_FL_EXAMS: 6,
  MIN_DAYS_BEFORE_TEST: 7,
  DEFAULT_WEEKDAY: 'Sat',
} as const

// Resource selection defaults (minutes)
export const RESOURCE_DEFAULTS = {
  KA_VIDEO: 12,
  KA_ARTICLE: 10,
  KAPLAN_SECTION: 30,
  DISCRETE_SET: 30,
  PASSAGE: 25,
  UWORLD_10Q: 30,
} as const

// Content selection limits
export const SELECTION_LIMITS = {
  MAX_KA_ITEMS_PER_DAY: 3,
  MAX_DISCRETE_SETS: 2,
  MAX_PASSAGES: 2,
  MAX_AAMC_SETS: 2,
} as const

// Provider names (for consistent matching)
export const PROVIDERS = {
  KHAN_ACADEMY: 'Khan Academy',
  KAPLAN: 'Kaplan',
  JACK_WESTIN: 'Jack Westin',
  UWORLD: 'UWorld',
  AAMC: 'AAMC',
  THIRD_PARTY: 'ThirdParty',
} as const

// CARS provider priority
export const CARS_PROVIDERS = {
  PHASE_1_2: [PROVIDERS.JACK_WESTIN],
  PHASE_3: [PROVIDERS.AAMC],
} as const

// Weekday mappings
export const WEEKDAYS = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
} as const

// Validation patterns
export const VALIDATION_PATTERNS = {
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  WEEKDAY: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/,
  CATEGORY: /^[0-9][A-Z]$/,
} as const

// Error messages
export const ERROR_MESSAGES = {
  INVALID_DATE_FORMAT: 'Invalid date format. Use YYYY-MM-DD',
  START_AFTER_TEST: 'Start date must be before test date',
  INVALID_WEEKDAY: 'Invalid weekday. Use Mon, Tue, Wed, Thu, Fri, Sat, Sun',
  INVALID_AVAILABILITY: 'Invalid availability day',
  MISSING_PARAMETERS:
    'Missing required parameters: start, test, priorities, availability, fl_weekday',
  EXCEL_FILE_NOT_FOUND:
    'Organized_MCAT_Topics.xlsx file not found. Please ensure the file is in the root directory.',
  INTERNAL_ERROR: 'Internal server error',
} as const
