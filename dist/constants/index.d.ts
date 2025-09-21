/**
 * Application constants for MCAT Study Scheduler
 */
export declare const TIME_CONSTANTS: {
    readonly TOTAL_STUDY_HOURS: 5;
    readonly WRITTEN_REVIEW_MINUTES: 60;
    readonly RESOURCE_MINUTES: 240;
};
export declare const PHASE_CONFIG: {
    readonly TOTAL_PHASES: 3;
    readonly PHASE_NAMES: {
        readonly 1: "Content Review";
        readonly 2: "Practice";
        readonly 3: "Final Review";
    };
};
export declare const FL_CONFIG: {
    readonly TOTAL_FL_EXAMS: 6;
    readonly MIN_DAYS_BEFORE_TEST: 7;
    readonly DEFAULT_WEEKDAY: "Sat";
};
export declare const RESOURCE_DEFAULTS: {
    readonly KA_VIDEO: 12;
    readonly KA_ARTICLE: 10;
    readonly KAPLAN_SECTION: 30;
    readonly DISCRETE_SET: 30;
    readonly PASSAGE: 25;
    readonly UWORLD_10Q: 30;
};
export declare const SELECTION_LIMITS: {
    readonly MAX_KA_ITEMS_PER_DAY: 3;
    readonly MAX_DISCRETE_SETS: 2;
    readonly MAX_PASSAGES: 2;
    readonly MAX_AAMC_SETS: 2;
};
export declare const PROVIDERS: {
    readonly KHAN_ACADEMY: "Khan Academy";
    readonly KAPLAN: "Kaplan";
    readonly JACK_WESTIN: "Jack Westin";
    readonly UWORLD: "UWorld";
    readonly AAMC: "AAMC";
    readonly THIRD_PARTY: "ThirdParty";
};
export declare const CARS_PROVIDERS: {
    readonly PHASE_1_2: readonly ["Jack Westin"];
    readonly PHASE_3: readonly ["AAMC"];
};
export declare const WEEKDAYS: {
    readonly MON: "Mon";
    readonly TUE: "Tue";
    readonly WED: "Wed";
    readonly THU: "Thu";
    readonly FRI: "Fri";
    readonly SAT: "Sat";
    readonly SUN: "Sun";
};
export declare const VALIDATION_PATTERNS: {
    readonly DATE: RegExp;
    readonly WEEKDAY: RegExp;
    readonly CATEGORY: RegExp;
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_DATE_FORMAT: "Invalid date format. Use YYYY-MM-DD";
    readonly START_AFTER_TEST: "Start date must be before test date";
    readonly INVALID_WEEKDAY: "Invalid weekday. Use Mon, Tue, Wed, Thu, Fri, Sat, Sun";
    readonly INVALID_AVAILABILITY: "Invalid availability day";
    readonly MISSING_PARAMETERS: "Missing required parameters: start, test, priorities, availability, fl_weekday";
    readonly EXCEL_FILE_NOT_FOUND: "Organized_MCAT_Topics.xlsx file not found. Please ensure the file is in the root directory.";
    readonly INTERNAL_ERROR: "Internal server error";
};
//# sourceMappingURL=index.d.ts.map