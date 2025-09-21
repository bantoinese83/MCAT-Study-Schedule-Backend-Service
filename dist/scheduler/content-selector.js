"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSelector = void 0;
const constants_1 = require("../constants");
const data_processor_1 = require("../data/data-processor");
const error_handling_1 = require("../utils/error-handling");
/**
 * Handles content selection for different phases with optimized algorithms
 */
class ContentSelector {
    /**
     * Clears the selection cache (useful for testing or memory management)
     */
    static clearCache() {
        this.selectionCache.clear();
    }
    /**
     * Selects science content for Phase 1 (with caching)
     */
    static selectPhase1ScienceContent(anchor, allTopics, usedResourceUIDs) {
        try {
            // Create cache key based on anchor and used resources
            const usedUIDsArray = Array.from(usedResourceUIDs).sort();
            const cacheKey = `phase1-${anchor.category}-${anchor.subtopic}-${anchor.concept}-${usedUIDsArray.join(',')}`;
            // Use cached result if available
            if (this.selectionCache.has(cacheKey)) {
                return this.selectionCache.get(cacheKey);
            }
            const candidates = data_processor_1.DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs);
            const selected = [];
            // Get Kaplan section first (only if not used)
            const availableKaplan = data_processor_1.DataProcessor.getTopicsByProvider(candidates, 'Kaplan').filter(topic => !data_processor_1.DataProcessor.isResourceUsed(topic, usedResourceUIDs));
            if (availableKaplan.length > 0) {
                selected.push(availableKaplan[0]);
                usedResourceUIDs.add(data_processor_1.DataProcessor.generateResourceUID(availableKaplan[0]));
            }
            // Get matching Khan Academy content (only unused)
            const availableKA = data_processor_1.DataProcessor.getTopicsByProvider(candidates, 'Khan Academy').filter(topic => !data_processor_1.DataProcessor.isResourceUsed(topic, usedResourceUIDs));
            const sortedKA = data_processor_1.DataProcessor.sortTopicsByCriteria(availableKA, constants_1.RESOURCE_DEFAULTS.KA_VIDEO, 10, 15);
            // Add up to max KA items
            let kaCount = 0;
            for (const topic of sortedKA) {
                if (kaCount >= constants_1.SELECTION_LIMITS.MAX_KA_ITEMS_PER_DAY)
                    break;
                selected.push(topic);
                usedResourceUIDs.add(data_processor_1.DataProcessor.generateResourceUID(topic));
                kaCount++;
            }
            // Cache the result
            this.selectionCache.set(cacheKey, [...selected]);
            return selected;
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectPhase1ScienceContent:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects science discretes
     */
    static selectScienceDiscretes(anchor, allTopics, usedResourceUIDs, excludeUIDs = []) {
        try {
            let candidates = data_processor_1.DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs);
            // Filter for discrete sets
            candidates = candidates.filter(topic => (topic.provider.toLowerCase().includes('khan') ||
                topic.provider.toLowerCase().includes('jack westin')) &&
                topic.type === 'discrete');
            // Exclude specified UIDs
            candidates = candidates.filter(topic => !excludeUIDs.includes(data_processor_1.DataProcessor.generateResourceUID(topic)));
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(candidates, constants_1.RESOURCE_DEFAULTS.DISCRETE_SET, 25, 35);
            return sorted.slice(0, constants_1.SELECTION_LIMITS.MAX_DISCRETE_SETS);
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectScienceDiscretes:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects CARS passages
     */
    static selectCARSPassages(phase, allTopics, usedResourceUIDs, count) {
        try {
            const providers = phase <= 2 ? constants_1.CARS_PROVIDERS.PHASE_1_2 : constants_1.CARS_PROVIDERS.PHASE_3;
            let candidates = [];
            // Try each provider in priority order
            for (const provider of providers) {
                const providerTopics = data_processor_1.DataProcessor.getTopicsByProvider(allTopics, provider).filter(topic => topic.type === 'passage');
                candidates = [...candidates, ...providerTopics];
            }
            candidates = candidates.filter(topic => !data_processor_1.DataProcessor.isResourceUsed(topic, usedResourceUIDs));
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(candidates, constants_1.RESOURCE_DEFAULTS.PASSAGE, 20, 25);
            return sorted.slice(0, count);
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectCARSPassages:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects science passages for Phase 2
     */
    static selectSciencePassages(anchor, allTopics, usedResourceUIDs) {
        try {
            let candidates = data_processor_1.DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs);
            // Filter for passages (excluding Jack Westin which is used for CARS)
            candidates = candidates.filter(topic => topic.type === 'passage' && !topic.provider.toLowerCase().includes('jack westin'));
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(candidates, constants_1.RESOURCE_DEFAULTS.PASSAGE, 20, 25);
            return sorted.slice(0, constants_1.SELECTION_LIMITS.MAX_PASSAGES);
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectSciencePassages:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects UWorld sets
     */
    static selectUWorldSet(anchor, allTopics) {
        try {
            const uworldTopics = data_processor_1.DataProcessor.getTopicsByProvider(allTopics, 'UWorld').filter(topic => topic.category === anchor.category);
            // UWorld sets can repeat, so we don't check used resources
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(uworldTopics, constants_1.RESOURCE_DEFAULTS.UWORLD_10Q, 25, 35);
            return sorted.slice(0, 1);
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectUWorldSet:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects AAMC sets for Phase 3
     */
    static selectAAMCSets(allTopics, usedResourceUIDs) {
        try {
            const aamcTopics = data_processor_1.DataProcessor.getTopicsByProvider(allTopics, 'AAMC').filter(topic => topic.type === 'discrete');
            const available = aamcTopics.filter(topic => !data_processor_1.DataProcessor.isResourceUsed(topic, usedResourceUIDs));
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(available, constants_1.RESOURCE_DEFAULTS.DISCRETE_SET, 25, 35);
            // Try to select from different packs
            const selected = [];
            const packs = new Set();
            for (const topic of sorted) {
                if (selected.length >= constants_1.SELECTION_LIMITS.MAX_AAMC_SETS)
                    break;
                const packMatch = topic.title.match(/Pack ([A-Z])/);
                const pack = packMatch ? packMatch[1] : 'Unknown';
                if (packs.size < 2 || !packs.has(pack)) {
                    selected.push(topic);
                    packs.add(pack);
                }
            }
            return selected;
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectAAMCSets:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
    /**
     * Selects AAMC CARS passages for Phase 3
     */
    static selectAAMCCARSPassages(allTopics, usedResourceUIDs, count) {
        try {
            const aamcCarsTopics = data_processor_1.DataProcessor.getTopicsByProvider(allTopics, 'AAMC').filter(topic => topic.type === 'passage');
            const available = aamcCarsTopics.filter(topic => !data_processor_1.DataProcessor.isResourceUsed(topic, usedResourceUIDs));
            const sorted = data_processor_1.DataProcessor.sortTopicsByCriteria(available, constants_1.RESOURCE_DEFAULTS.PASSAGE, 20, 25);
            return sorted.slice(0, count);
        }
        catch (error) {
            error_handling_1.Logger.warn('Error in selectAAMCCARSPassages:', error instanceof Error ? error.message : String(error));
            return [];
        }
    }
}
exports.ContentSelector = ContentSelector;
// Cache for content selection results to avoid redundant calculations
ContentSelector.selectionCache = new Map();
//# sourceMappingURL=content-selector.js.map