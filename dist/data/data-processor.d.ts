import { MCATTopic, AnchorKey } from '../types';
/**
 * Processes and filters MCAT topics data with optimized data structures
 */
export declare class DataProcessor {
    private static cachedIndex;
    /**
     * Creates optimized index for fast lookups
     */
    private static createIndex;
    /**
     * Gets or creates optimized index
     */
    private static getIndex;
    /**
     * Filters topics by high yield status and priorities (optimized)
     */
    static getHighYieldTopics(topics: MCATTopic[], priorities: string[]): MCATTopic[];
    /**
     * Filters topics by category (optimized)
     */
    static getTopicsByCategory(topics: MCATTopic[], category: string): MCATTopic[];
    /**
     * Filters topics by provider (optimized)
     */
    static getTopicsByProvider(topics: MCATTopic[], provider: string): MCATTopic[];
    /**
     * Filters topics by type (optimized)
     */
    static getTopicsByType(topics: MCATTopic[], type: MCATTopic['type']): MCATTopic[];
    /**
     * Gets topics for a specific anchor key with fallbacks
     */
    static getTopicsForAnchor(topics: MCATTopic[], anchor: AnchorKey, usedResourceUIDs: Set<string>): MCATTopic[];
    /**
     * Sorts topics by specificity, numeric order, and time-fit criteria (optimized)
     */
    static sortTopicsByCriteria(topics: MCATTopic[], targetMinutes: number, bandMin: number, bandMax: number): MCATTopic[];
    /**
     * Gets specificity score for sorting (lower is more specific)
     */
    private static getSpecificityScore;
    /**
     * Gets numeric key order for sorting
     */
    private static getNumericKeyOrder;
    /**
     * Gets time-fit score (lower is better fit)
     */
    private static getTimeFitScore;
    /**
     * Gets provider rank for sorting (lower is higher priority)
     */
    private static getProviderRank;
    /**
     * Generates a unique resource identifier
     */
    static generateResourceUID(topic: MCATTopic): string;
    /**
     * Checks if a resource has been used
     */
    static isResourceUsed(topic: MCATTopic, usedResourceUIDs: Set<string>): boolean;
    /**
     * Gets available high-yield topics for priorities
     */
    static getAvailableHYTopics(allTopics: MCATTopic[], priorities: string[]): Map<string, MCATTopic[]>;
    /**
     * Gets the next available anchor from highest priority category
     */
    static getNextAnchor(availableTopics: Map<string, MCATTopic[]>, usedAnchors: Set<string>): AnchorKey | null;
}
//# sourceMappingURL=data-processor.d.ts.map