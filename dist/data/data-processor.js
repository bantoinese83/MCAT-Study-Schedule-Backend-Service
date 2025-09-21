"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessor = void 0;
/**
 * Processes and filters MCAT topics data with optimized data structures
 */
class DataProcessor {
    /**
     * Creates optimized index for fast lookups
     */
    static createIndex(topics) {
        const byCategory = new Map();
        const byProvider = new Map();
        const byType = new Map();
        // Initialize maps
        topics.forEach(topic => {
            // By category
            if (!byCategory.has(topic.category)) {
                byCategory.set(topic.category, []);
            }
            byCategory.get(topic.category).push(topic);
            // By provider
            const providerKey = topic.provider.toLowerCase();
            if (!byProvider.has(providerKey)) {
                byProvider.set(providerKey, []);
            }
            byProvider.get(providerKey).push(topic);
            // By type
            if (!byType.has(topic.type)) {
                byType.set(topic.type, []);
            }
            byType.get(topic.type).push(topic);
        });
        // Create high-yield by category index
        const highYieldByCategory = new Map();
        topics.forEach(topic => {
            if (topic.high_yield === 'Yes') {
                if (!highYieldByCategory.has(topic.category)) {
                    highYieldByCategory.set(topic.category, []);
                }
                highYieldByCategory.get(topic.category).push(topic);
            }
        });
        this.cachedIndex = {
            byCategory,
            byProvider,
            byType,
            highYieldByCategory,
        };
    }
    /**
     * Gets or creates optimized index
     */
    static getIndex(topics) {
        if (!this.cachedIndex) {
            this.createIndex(topics);
        }
        return this.cachedIndex;
    }
    /**
     * Filters topics by high yield status and priorities (optimized)
     */
    static getHighYieldTopics(topics, priorities) {
        const index = this.getIndex(topics);
        if (!index)
            return [];
        const result = [];
        priorities.forEach(priority => {
            const categoryTopics = index?.highYieldByCategory.get(priority);
            if (categoryTopics) {
                result.push(...categoryTopics);
            }
        });
        return result;
    }
    /**
     * Filters topics by category (optimized)
     */
    static getTopicsByCategory(topics, category) {
        const index = this.getIndex(topics);
        return index?.byCategory.get(category) ?? [];
    }
    /**
     * Filters topics by provider (optimized)
     */
    static getTopicsByProvider(topics, provider) {
        const index = this.getIndex(topics);
        const providerKey = provider.toLowerCase();
        return index?.byProvider.get(providerKey) ?? [];
    }
    /**
     * Filters topics by type (optimized)
     */
    static getTopicsByType(topics, type) {
        const index = this.getIndex(topics);
        return index?.byType.get(type) ?? [];
    }
    /**
     * Gets topics for a specific anchor key with fallbacks
     */
    static getTopicsForAnchor(topics, anchor, usedResourceUIDs) {
        let candidates = topics;
        // Apply anchor filtering with fallbacks
        if (anchor.level === 0 && anchor.concept) {
            // Exact concept match
            candidates = candidates.filter(topic => topic.category === anchor.category &&
                topic.subtopic === anchor.subtopic &&
                topic.concept === anchor.concept);
        }
        else if (anchor.level === 1 && anchor.subtopic) {
            // Subtopic level match
            candidates = candidates.filter(topic => topic.category === anchor.category && topic.subtopic === anchor.subtopic);
        }
        else {
            // Category level match
            candidates = candidates.filter(topic => topic.category === anchor.category);
        }
        // Remove used resources
        candidates = candidates.filter(topic => !usedResourceUIDs.has(this.generateResourceUID(topic)));
        return candidates;
    }
    /**
     * Sorts topics by specificity, numeric order, and time-fit criteria (optimized)
     */
    static sortTopicsByCriteria(topics, targetMinutes, bandMin, bandMax) {
        // Pre-compute scores for better performance
        const topicsWithScores = topics.map(topic => ({
            topic,
            specificity: this.getSpecificityScore(topic),
            keyOrder: this.getNumericKeyOrder(topic),
            timeFit: this.getTimeFitScore(topic.minutes, targetMinutes, bandMin, bandMax),
            providerRank: this.getProviderRank(topic.provider),
        }));
        // Single-pass sort with all criteria
        topicsWithScores.sort((a, b) => {
            // Specificity (lower is more specific)
            if (a.specificity !== b.specificity) {
                return a.specificity - b.specificity;
            }
            // Numeric key order
            if (a.keyOrder !== b.keyOrder) {
                return a.keyOrder - b.keyOrder;
            }
            // Time-fit score
            if (a.timeFit !== b.timeFit) {
                return a.timeFit - b.timeFit;
            }
            // Provider rank
            if (a.providerRank !== b.providerRank) {
                return a.providerRank - b.providerRank;
            }
            // Final sort by title A-Z, then stable ID
            const titleCompare = a.topic.title.localeCompare(b.topic.title);
            if (titleCompare !== 0) {
                return titleCompare;
            }
            return a.topic.url.localeCompare(b.topic.url);
        });
        return topicsWithScores.map(item => item.topic);
    }
    /**
     * Gets specificity score for sorting (lower is more specific)
     */
    static getSpecificityScore(topic) {
        if (topic.concept)
            return 0; // Most specific
        if (topic.subtopic)
            return 1; // Medium specificity
        return 2; // Least specific
    }
    /**
     * Gets numeric key order for sorting
     */
    static getNumericKeyOrder(topic) {
        return topic.subtopic_number * 1000 + (topic.concept_number ?? 0);
    }
    /**
     * Gets time-fit score (lower is better fit)
     */
    static getTimeFitScore(actualMinutes, targetMinutes, bandMin, bandMax) {
        // Prefer items within the target band
        if (actualMinutes >= bandMin && actualMinutes <= bandMax) {
            return Math.abs(actualMinutes - targetMinutes);
        }
        // Otherwise, prefer closest to target
        return Math.abs(actualMinutes - targetMinutes) + 1000; // Penalty for being outside band
    }
    /**
     * Gets provider rank for sorting (lower is higher priority)
     */
    static getProviderRank(provider) {
        const providerLower = provider.toLowerCase();
        if (providerLower.includes('khan'))
            return 1;
        if (providerLower.includes('kaplan'))
            return 2;
        if (providerLower.includes('jack westin'))
            return 3;
        if (providerLower.includes('uworld'))
            return 4;
        if (providerLower.includes('aamc'))
            return 5;
        return 6;
    }
    /**
     * Generates a unique resource identifier
     */
    static generateResourceUID(topic) {
        // Use stable_id if present, otherwise generate from title + url
        if (topic.url && topic.title) {
            return topic.title.toLowerCase().replace(/\s+/g, '') + topic.url;
        }
        return topic.title.toLowerCase().replace(/\s+/g, '');
    }
    /**
     * Checks if a resource has been used
     */
    static isResourceUsed(topic, usedResourceUIDs) {
        const resourceUID = this.generateResourceUID(topic);
        return usedResourceUIDs.has(resourceUID);
    }
    /**
     * Gets available high-yield topics for priorities
     */
    static getAvailableHYTopics(allTopics, priorities) {
        const available = new Map();
        priorities.forEach(priority => {
            const categoryTopics = this.getTopicsByCategory(allTopics, priority).filter(topic => topic.high_yield === 'Yes');
            available.set(priority, categoryTopics);
        });
        return available;
    }
    /**
     * Gets the next available anchor from highest priority category
     */
    static getNextAnchor(availableTopics, usedAnchors) {
        for (const [, topics] of availableTopics) {
            if (topics.length === 0)
                continue;
            // Find the first unused concept in this category
            const firstTopic = topics.find(topic => {
                const anchorKey = `${topic.category}-${topic.subtopic}-${topic.concept}`;
                return !usedAnchors.has(anchorKey);
            });
            if (firstTopic) {
                return {
                    category: firstTopic.category,
                    subtopic: firstTopic.subtopic,
                    concept: firstTopic.concept,
                    level: (() => {
                        if (firstTopic.concept)
                            return 0;
                        if (firstTopic.subtopic)
                            return 1;
                        return 2;
                    })(),
                };
            }
        }
        return null;
    }
}
exports.DataProcessor = DataProcessor;
// Cache for pre-computed data structures for better performance
DataProcessor.cachedIndex = null;
//# sourceMappingURL=data-processor.js.map