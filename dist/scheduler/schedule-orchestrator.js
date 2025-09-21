"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleOrchestrator = void 0;
const data_loader_1 = require("../data/data-loader");
const data_processor_1 = require("../data/data-processor");
const error_handling_1 = require("../utils/error-handling");
const calendar_generator_1 = require("./calendar-generator");
const fl_scheduler_1 = require("./fl-scheduler");
const phase_manager_1 = require("./phase-manager");
const resource_manager_1 = require("./resource-manager");
/**
 * Main orchestrator for generating MCAT study schedules
 */
class ScheduleOrchestrator {
    constructor() {
        this.dataLoader = data_loader_1.DataLoader.getInstance();
        this.resourceManager = new resource_manager_1.ResourceManager();
    }
    /**
     * Generates a complete study schedule
     */
    generateSchedule(params) {
        try {
            // Step 1: Load and validate data
            const allTopics = this.dataLoader.loadTopics();
            this.validateParams(params);
            // Step 2: Generate calendar
            const calendar = calendar_generator_1.CalendarGenerator.generateCalendar(params.start, params.test, params.availability);
            // Step 3: Split into phases
            const studyDays = calendar.filter(day => day.kind === 'study');
            const phases = phase_manager_1.PhaseManager.splitIntoPhases(studyDays);
            // Step 4: Schedule full-length exams
            const calendarWithFL = fl_scheduler_1.FLScheduler.scheduleFullLengthExams(calendar, params.fl_weekday, params.start, params.test);
            // Step 5: Prepare high-yield topics
            const availableTopics = data_processor_1.DataProcessor.getAvailableHYTopics(allTopics, params.priorities);
            // Step 6: Generate study day content
            const schedule = [];
            for (const day of calendarWithFL) {
                if (day.kind === 'study') {
                    const phase = phase_manager_1.PhaseManager.getPhaseForDate(day.date, phases);
                    const studyDay = this.resourceManager.generateStudyDay(day, phase, allTopics, availableTopics);
                    // Track resources
                    if ('blocks' in studyDay) {
                        this.resourceManager.trackUsedResources(studyDay);
                    }
                    schedule.push(studyDay);
                }
                else {
                    schedule.push(day);
                }
            }
            // Step 7: Validate final schedule
            this.validateSchedule(schedule, params);
            // Step 8: Generate statistics
            const stats = this.getScheduleStats(schedule);
            return { data: schedule, stats };
        }
        catch (error) {
            throw new Error(`Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validates input parameters
     */
    validateParams(params) {
        if (!params.start ||
            !params.test ||
            !params.priorities ||
            !params.availability ||
            !params.fl_weekday) {
            throw new Error('Missing required parameters: start, test, priorities, availability, fl_weekday');
        }
        // Validate date format and order
        const startDate = new Date(params.start);
        const testDate = new Date(params.test);
        if (isNaN(startDate.getTime()) || isNaN(testDate.getTime())) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        if (startDate >= testDate) {
            throw new Error('Start date must be before test date');
        }
        // Validate weekday format
        const validWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        if (!validWeekdays.includes(params.fl_weekday)) {
            throw new Error('Invalid fl_weekday. Use Mon, Tue, Wed, Thu, Fri, Sat, Sun');
        }
        // Validate availability
        params.availability.forEach(day => {
            if (!validWeekdays.includes(day)) {
                throw new Error(`Invalid availability day: ${day}`);
            }
        });
    }
    /**
     * Validates the generated schedule
     */
    validateSchedule(schedule, params) {
        // Check phase balance
        const studyDays = schedule.filter(day => day.kind === 'study');
        const phases = phase_manager_1.PhaseManager.splitIntoPhases(studyDays);
        if (!phase_manager_1.PhaseManager.validatePhaseBalance(phases)) {
            error_handling_1.Logger.warn('Phase balance is not optimal');
        }
        // Validate FL scheduling
        const flValidation = fl_scheduler_1.FLScheduler.validateFLScheduling(schedule, params.start, params.test);
        if (!flValidation.isValid) {
            error_handling_1.Logger.warn('FL scheduling validation issues:', flValidation.issues.join(', '));
        }
        else {
            // Check if we have fewer than expected FLs due to safety constraints
            const flDays = schedule.filter(day => day.kind === 'full_length');
            if (flDays.length < 6) {
                error_handling_1.Logger.info(`Scheduled ${flDays.length} FL exams (fewer than target of 6 due to 7-day buffer constraint)`);
            }
        }
    }
    /**
     * Gets schedule statistics
     */
    getScheduleStats(schedule) {
        const studyDays = schedule.filter(day => day.kind === 'study');
        const phases = phase_manager_1.PhaseManager.splitIntoPhases(studyDays);
        const flStats = fl_scheduler_1.FLScheduler.getFLStats(schedule);
        return {
            totalDays: schedule.length,
            studyDays: studyDays.length,
            breakDays: schedule.filter(day => day.kind === 'break').length,
            flDays: schedule.filter(day => day.kind === 'full_length').length,
            phaseStats: phase_manager_1.PhaseManager.getPhaseStats(phases),
            flStats,
            resourceStats: this.resourceManager.getResourceStats(),
        };
    }
    /**
     * Resets the orchestrator state (useful for testing)
     */
    reset() {
        this.resourceManager.reset();
        this.dataLoader.clearCache();
    }
}
exports.ScheduleOrchestrator = ScheduleOrchestrator;
//# sourceMappingURL=schedule-orchestrator.js.map