import { StudyDay, ScheduleParams, ScheduleStats } from '../types';
/**
 * Main orchestrator for generating MCAT study schedules
 */
export declare class ScheduleOrchestrator {
    private dataLoader;
    private resourceManager;
    constructor();
    /**
     * Generates a complete study schedule
     */
    generateSchedule(params: ScheduleParams): {
        data: StudyDay[];
        stats: ScheduleStats;
    };
    /**
     * Validates input parameters
     */
    private validateParams;
    /**
     * Validates the generated schedule
     */
    private validateSchedule;
    /**
     * Gets schedule statistics
     */
    getScheduleStats(schedule: StudyDay[]): ScheduleStats;
    /**
     * Resets the orchestrator state (useful for testing)
     */
    reset(): void;
}
//# sourceMappingURL=schedule-orchestrator.d.ts.map