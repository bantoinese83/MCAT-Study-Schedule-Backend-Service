import { StudyDay } from '../types';
/**
 * Manages study day phases and phase assignments
 */
export declare class PhaseManager {
    /**
     * Splits study days into phases
     */
    static splitIntoPhases(studyDays: StudyDay[]): {
        phase1: StudyDay[];
        phase2: StudyDay[];
        phase3: StudyDay[];
    };
    /**
     * Gets the phase for a specific date
     */
    static getPhaseForDate(date: string, phases: {
        phase1: StudyDay[];
        phase2: StudyDay[];
        phase3: StudyDay[];
    }): 1 | 2 | 3;
    /**
     * Gets phase statistics
     */
    static getPhaseStats(phases: {
        phase1: StudyDay[];
        phase2: StudyDay[];
        phase3: StudyDay[];
    }): {
        phase: number;
        count: number;
        percentage: number;
    }[];
    /**
     * Validates that phases are properly balanced
     */
    static validatePhaseBalance(phases: {
        phase1: StudyDay[];
        phase2: StudyDay[];
        phase3: StudyDay[];
    }): boolean;
    /**
     * Gets the name of a phase
     */
    static getPhaseName(phase: 1 | 2 | 3): string;
}
//# sourceMappingURL=phase-manager.d.ts.map