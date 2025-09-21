import { MCATTopic, StudyDayWithBlocks, StudyDay } from '../types';
/**
 * Manages resource usage tracking and time calculations
 */
export declare class ResourceManager {
    private usedResourceUIDs;
    private usedAnchors;
    /**
     * Generates study day content with resource tracking
     */
    generateStudyDay(day: StudyDay, phase: 1 | 2 | 3, allTopics: MCATTopic[], availableTopics: Map<string, MCATTopic[]>): StudyDayWithBlocks;
    /**
     * Creates empty blocks structure
     */
    private createEmptyBlocks;
    /**
     * Generates content for specific phase
     */
    private generatePhaseContent;
    /**
     * Generates Phase 1 content
     */
    private generatePhase1Content;
    /**
     * Generates Phase 2 content
     */
    private generatePhase2Content;
    /**
     * Generates Phase 3 content
     */
    private generatePhase3Content;
    /**
     * Tracks resources used in a study day
     */
    trackUsedResources(studyDay: StudyDayWithBlocks): void;
    /**
     * Gets resource usage statistics
     */
    getResourceStats(): {
        totalUsed: number;
        byProvider: Record<string, number>;
    };
    /**
     * Resets resource tracking (useful for testing)
     */
    reset(): void;
}
//# sourceMappingURL=resource-manager.d.ts.map