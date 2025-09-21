import { MCATTopic, AnchorKey } from '../types';
/**
 * Handles content selection for different phases with optimized algorithms
 */
export declare class ContentSelector {
    private static selectionCache;
    /**
     * Clears the selection cache (useful for testing or memory management)
     */
    static clearCache(): void;
    /**
     * Selects science content for Phase 1 (with caching)
     */
    static selectPhase1ScienceContent(anchor: AnchorKey, allTopics: MCATTopic[], usedResourceUIDs: Set<string>): MCATTopic[];
    /**
     * Selects science discretes
     */
    static selectScienceDiscretes(anchor: AnchorKey, allTopics: MCATTopic[], usedResourceUIDs: Set<string>, excludeUIDs?: string[]): MCATTopic[];
    /**
     * Selects CARS passages
     */
    static selectCARSPassages(phase: 1 | 2 | 3, allTopics: MCATTopic[], usedResourceUIDs: Set<string>, count: number): MCATTopic[];
    /**
     * Selects science passages for Phase 2
     */
    static selectSciencePassages(anchor: AnchorKey, allTopics: MCATTopic[], usedResourceUIDs: Set<string>): MCATTopic[];
    /**
     * Selects UWorld sets
     */
    static selectUWorldSet(anchor: AnchorKey, allTopics: MCATTopic[]): MCATTopic[];
    /**
     * Selects AAMC sets for Phase 3
     */
    static selectAAMCSets(allTopics: MCATTopic[], usedResourceUIDs: Set<string>): MCATTopic[];
    /**
     * Selects AAMC CARS passages for Phase 3
     */
    static selectAAMCCARSPassages(allTopics: MCATTopic[], usedResourceUIDs: Set<string>, count: number): MCATTopic[];
}
//# sourceMappingURL=content-selector.d.ts.map