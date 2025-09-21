import * as fs from 'fs'
import * as path from 'path'

import * as XLSX from 'xlsx'

import { ERROR_MESSAGES } from '../constants'
import { MCATTopic } from '../types'
import { Logger } from '../utils/error-handling'

/**
 * Loads and processes MCAT topics data from Excel file
 */
export class DataLoader {
  private static instance: DataLoader
  private cachedTopics: MCATTopic[] | null = null

  private constructor() {}

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader()
    }
    return DataLoader.instance
  }

  /**
   * Loads MCAT topics from Excel file
   */
  public loadTopics(): MCATTopic[] {
    if (this.cachedTopics) {
      return this.cachedTopics
    }

    const filePath = path.join(process.cwd(), 'Organized_MCAT_Topics.xlsx')

    if (!fs.existsSync(filePath)) {
      throw new Error(ERROR_MESSAGES.EXCEL_FILE_NOT_FOUND)
    }

    try {
      const workbook = XLSX.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      const topics = this.processRawData(jsonData)
      this.cachedTopics = topics
      return topics
    } catch (error) {
      throw new Error(
        `Failed to load Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Processes raw Excel data into MCATTopic objects
   */
  private processRawData(jsonData: unknown[]): MCATTopic[] {
    const topics: MCATTopic[] = []

    // Skip header row
    if (Array.isArray(jsonData)) {
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]

        if (Array.isArray(row) && row.length >= 10) {
          const topic = this.createTopicFromRow(row)
          if (topic) {
            topics.push(topic)
          }
        }
      }
    }

    return topics
  }

  /**
   * Creates a single MCATTopic from Excel row data
   */
  private createTopicFromRow(row: unknown[]): MCATTopic | null {
    try {
      const topic: MCATTopic = {
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
      }

      return this.validateTopic(topic) ? topic : null
    } catch (error) {
      Logger.warn(
        `Skipping invalid row: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return null
    }
  }

  /**
   * Validates that a topic has all required fields
   */
  private validateTopic(topic: MCATTopic): boolean {
    return !!(topic.category && topic.provider && topic.title && topic.minutes > 0)
  }

  /**
   * Parses string values, handling null/undefined
   */
  private parseString(value: unknown): string {
    return value?.toString() ?? ''
  }

  /**
   * Parses numeric values, handling null/undefined
   */
  private parseNumber(value: unknown): number {
    const parsed = parseInt(value?.toString() ?? '', 10)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * Parses high yield flag
   */
  private parseHighYield(value: unknown): 'Yes' | 'No' {
    return value?.toString() === 'Yes' ? 'Yes' : 'No'
  }

  /**
   * Determines content type based on provider
   */
  private determineType(provider: string): MCATTopic['type'] {
    const providerLower = provider.toLowerCase()

    if (providerLower.includes('khan') || providerLower.includes('ka')) {
      return 'video'
    }
    if (providerLower.includes('kaplan')) {
      return 'section'
    }
    if (providerLower.includes('jack westin')) {
      return 'passage'
    }
    if (providerLower.includes('uworld')) {
      return 'set'
    }
    if (providerLower.includes('thirdparty') || providerLower.includes('aamc')) {
      return 'discrete'
    }
    return 'video'
  }

  /**
   * Clears cached data (useful for testing or data refresh)
   */
  public clearCache(): void {
    this.cachedTopics = null
  }
}
