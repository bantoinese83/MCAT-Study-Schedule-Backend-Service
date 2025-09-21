import { MCATTopic } from '../types';
/**
 * Loads and processes MCAT topics data from Excel file
 */
export declare class DataLoader {
    private static instance;
    private cachedTopics;
    private constructor();
    static getInstance(): DataLoader;
    /**
     * Loads MCAT topics from Excel file
     */
    loadTopics(): MCATTopic[];
    /**
     * Processes raw Excel data into MCATTopic objects
     */
    private processRawData;
    /**
     * Creates a single MCATTopic from Excel row data
     */
    private createTopicFromRow;
    /**
     * Validates that a topic has all required fields
     */
    private validateTopic;
    /**
     * Parses string values, handling null/undefined
     */
    private parseString;
    /**
     * Parses numeric values, handling null/undefined
     */
    private parseNumber;
    /**
     * Parses high yield flag
     */
    private parseHighYield;
    /**
     * Determines content type based on provider
     */
    private determineType;
    /**
     * Clears cached data (useful for testing or data refresh)
     */
    clearCache(): void;
}
//# sourceMappingURL=data-loader.d.ts.map