"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const XLSX = __importStar(require("xlsx"));
const constants_1 = require("../constants");
const error_handling_1 = require("../utils/error-handling");
/**
 * Loads and processes MCAT topics data from Excel file
 */
class DataLoader {
    constructor() {
        this.cachedTopics = null;
    }
    static getInstance() {
        if (!DataLoader.instance) {
            DataLoader.instance = new DataLoader();
        }
        return DataLoader.instance;
    }
    /**
     * Loads MCAT topics from Excel file
     */
    loadTopics() {
        if (this.cachedTopics) {
            return this.cachedTopics;
        }
        const filePath = path.join(process.cwd(), 'Organized_MCAT_Topics.xlsx');
        if (!fs.existsSync(filePath)) {
            throw new Error(constants_1.ERROR_MESSAGES.EXCEL_FILE_NOT_FOUND);
        }
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const topics = this.processRawData(jsonData);
            this.cachedTopics = topics;
            return topics;
        }
        catch (error) {
            throw new Error(`Failed to load Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Processes raw Excel data into MCATTopic objects
     */
    processRawData(jsonData) {
        const topics = [];
        // Skip header row
        if (Array.isArray(jsonData)) {
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (Array.isArray(row) && row.length >= 10) {
                    const topic = this.createTopicFromRow(row);
                    if (topic) {
                        topics.push(topic);
                    }
                }
            }
        }
        return topics;
    }
    /**
     * Creates a single MCATTopic from Excel row data
     */
    createTopicFromRow(row) {
        try {
            const topic = {
                category: this.parseString(row[0]),
                subtopic_number: this.parseNumber(row[1]),
                subtopic: this.parseString(row[2]),
                concept_number: this.parseNumber(row[3]),
                concept: this.parseString(row[4]),
                high_yield: this.parseHighYield(row[5]),
                provider: this.parseString(row[6]),
                title: this.parseString(row[7]),
                url: this.parseString(row[8]),
                minutes: this.parseNumber(row[9]),
                type: this.determineType(this.parseString(row[6])),
            };
            return this.validateTopic(topic) ? topic : null;
        }
        catch (error) {
            error_handling_1.Logger.warn(`Skipping invalid row: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }
    /**
     * Validates that a topic has all required fields
     */
    validateTopic(topic) {
        return !!(topic.category && topic.provider && topic.title && topic.minutes > 0);
    }
    /**
     * Parses string values, handling null/undefined
     */
    parseString(value) {
        return value?.toString() ?? '';
    }
    /**
     * Parses numeric values, handling null/undefined
     */
    parseNumber(value) {
        const parsed = parseInt(value?.toString() ?? '', 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    /**
     * Parses high yield flag
     */
    parseHighYield(value) {
        return value?.toString() === 'Yes' ? 'Yes' : 'No';
    }
    /**
     * Determines content type based on provider
     */
    determineType(provider) {
        const providerLower = provider.toLowerCase();
        if (providerLower.includes('khan') || providerLower.includes('ka')) {
            return 'video';
        }
        if (providerLower.includes('kaplan')) {
            return 'section';
        }
        if (providerLower.includes('jack westin')) {
            return 'passage';
        }
        if (providerLower.includes('uworld')) {
            return 'set';
        }
        if (providerLower.includes('thirdparty') || providerLower.includes('aamc')) {
            return 'discrete';
        }
        return 'video';
    }
    /**
     * Clears cached data (useful for testing or data refresh)
     */
    clearCache() {
        this.cachedTopics = null;
    }
}
exports.DataLoader = DataLoader;
//# sourceMappingURL=data-loader.js.map