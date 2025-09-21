"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhaseManager = void 0;
const constants_1 = require("../constants");
/**
 * Manages study day phases and phase assignments
 */
class PhaseManager {
    /**
     * Splits study days into phases
     */
    static splitIntoPhases(studyDays) {
        const totalStudyDays = studyDays.length;
        const phaseSize = Math.floor(totalStudyDays / constants_1.PHASE_CONFIG.TOTAL_PHASES);
        return {
            phase1: studyDays.slice(0, phaseSize),
            phase2: studyDays.slice(phaseSize, phaseSize * 2),
            phase3: studyDays.slice(phaseSize * 2),
        };
    }
    /**
     * Gets the phase for a specific date
     */
    static getPhaseForDate(date, phases) {
        if (phases.phase1.some(day => day.date === date))
            return 1;
        if (phases.phase2.some(day => day.date === date))
            return 2;
        return 3;
    }
    /**
     * Gets phase statistics
     */
    static getPhaseStats(phases) {
        const total = phases.phase1.length + phases.phase2.length + phases.phase3.length;
        return [
            {
                phase: 1,
                count: phases.phase1.length,
                percentage: Math.round((phases.phase1.length / total) * 100),
            },
            {
                phase: 2,
                count: phases.phase2.length,
                percentage: Math.round((phases.phase2.length / total) * 100),
            },
            {
                phase: 3,
                count: phases.phase3.length,
                percentage: Math.round((phases.phase3.length / total) * 100),
            },
        ];
    }
    /**
     * Validates that phases are properly balanced
     */
    static validatePhaseBalance(phases) {
        const stats = this.getPhaseStats(phases);
        const maxDifference = Math.max(...stats.map(s => s.count)) - Math.min(...stats.map(s => s.count));
        // Allow maximum difference of 2 days for reasonable balance
        return maxDifference <= 2;
    }
    /**
     * Gets the name of a phase
     */
    static getPhaseName(phase) {
        return constants_1.PHASE_CONFIG.PHASE_NAMES[phase];
    }
}
exports.PhaseManager = PhaseManager;
//# sourceMappingURL=phase-manager.js.map