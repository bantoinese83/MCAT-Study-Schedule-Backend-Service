"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManager = void 0;
const constants_1 = require("../constants");
const data_processor_1 = require("../data/data-processor");
const content_selector_1 = require("./content-selector");
/**
 * Manages resource usage tracking and time calculations
 */
class ResourceManager {
    constructor() {
        this.usedResourceUIDs = new Set();
        this.usedAnchors = new Set();
    }
    /**
     * Generates study day content with resource tracking
     */
    generateStudyDay(day, phase, allTopics, availableTopics) {
        const blocks = this.createEmptyBlocks();
        // Select anchor for the day
        const anchor = data_processor_1.DataProcessor.getNextAnchor(availableTopics, this.usedAnchors);
        if (!anchor) {
            // No more anchors available, create empty day
            return {
                ...day,
                kind: 'study',
                phase,
                blocks,
            };
        }
        // Mark anchor as used
        const anchorKey = `${anchor.category}-${anchor.subtopic}-${anchor.concept}`;
        this.usedAnchors.add(anchorKey);
        // Generate content for each phase
        this.generatePhaseContent(blocks, anchor, phase, allTopics);
        return {
            ...day,
            kind: 'study',
            phase,
            blocks,
        };
    }
    /**
     * Creates empty blocks structure
     */
    createEmptyBlocks() {
        return {
            written_review_minutes: constants_1.TIME_CONSTANTS.WRITTEN_REVIEW_MINUTES,
            total_resource_minutes: constants_1.TIME_CONSTANTS.RESOURCE_MINUTES,
        };
    }
    /**
     * Generates content for specific phase
     */
    generatePhaseContent(blocks, anchor, phase, allTopics) {
        switch (phase) {
            case 1:
                this.generatePhase1Content(blocks, anchor, allTopics);
                break;
            case 2:
                this.generatePhase2Content(blocks, anchor, allTopics);
                break;
            case 3:
                this.generatePhase3Content(blocks, allTopics);
                break;
        }
    }
    /**
     * Generates Phase 1 content
     */
    generatePhase1Content(blocks, anchor, allTopics) {
        // Science content
        blocks.science_content = content_selector_1.ContentSelector.selectPhase1ScienceContent(anchor, allTopics, this.usedResourceUIDs);
        // Science discretes
        blocks.science_discretes = content_selector_1.ContentSelector.selectScienceDiscretes(anchor, allTopics, this.usedResourceUIDs);
        // CARS passages
        blocks.cars = content_selector_1.ContentSelector.selectCARSPassages(1, allTopics, this.usedResourceUIDs, 2);
    }
    /**
     * Generates Phase 2 content
     */
    generatePhase2Content(blocks, anchor, allTopics) {
        // Science passages
        blocks.science_passages = content_selector_1.ContentSelector.selectSciencePassages(anchor, allTopics, this.usedResourceUIDs);
        // UWorld set
        blocks.uworld_set = content_selector_1.ContentSelector.selectUWorldSet(anchor, allTopics);
        // Extra discretes (not used in Phase 1)
        const phase1UIDs = Array.from(this.usedResourceUIDs);
        blocks.extra_discretes = content_selector_1.ContentSelector.selectScienceDiscretes(anchor, allTopics, this.usedResourceUIDs, phase1UIDs);
        // CARS passages
        blocks.cars = content_selector_1.ContentSelector.selectCARSPassages(2, allTopics, this.usedResourceUIDs, 2);
    }
    /**
     * Generates Phase 3 content
     */
    generatePhase3Content(blocks, allTopics) {
        // AAMC sets
        blocks.aamc_sets = content_selector_1.ContentSelector.selectAAMCSets(allTopics, this.usedResourceUIDs);
        // AAMC CARS passages
        blocks.aamc_cars_passages = content_selector_1.ContentSelector.selectAAMCCARSPassages(allTopics, this.usedResourceUIDs, 2);
    }
    /**
     * Tracks resources used in a study day
     */
    trackUsedResources(studyDay) {
        if (!studyDay.blocks)
            return;
        const allContent = [
            ...(studyDay.blocks.science_content ?? []),
            ...(studyDay.blocks.science_discretes ?? []),
            ...(studyDay.blocks.science_passages ?? []),
            ...(studyDay.blocks.cars ?? []),
            ...(studyDay.blocks.aamc_sets ?? []),
            ...(studyDay.blocks.aamc_cars_passages ?? []),
        ];
        allContent.forEach(topic => {
            const resourceUID = data_processor_1.DataProcessor.generateResourceUID(topic);
            this.usedResourceUIDs.add(resourceUID);
        });
    }
    /**
     * Gets resource usage statistics
     */
    getResourceStats() {
        const byProvider = {};
        // This would need access to the original topics to get provider info
        // For now, return basic stats
        return {
            totalUsed: this.usedResourceUIDs.size,
            byProvider,
        };
    }
    /**
     * Resets resource tracking (useful for testing)
     */
    reset() {
        this.usedResourceUIDs.clear();
        this.usedAnchors.clear();
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resource-manager.js.map