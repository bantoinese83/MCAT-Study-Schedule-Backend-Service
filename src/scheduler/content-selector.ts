import { SELECTION_LIMITS, RESOURCE_DEFAULTS, CARS_PROVIDERS } from '../constants'
import { DataProcessor } from '../data/data-processor'
import { MCATTopic, AnchorKey } from '../types'
import { Logger } from '../utils/error-handling'

/**
 * Handles content selection for different phases with optimized algorithms
 */
export class ContentSelector {
  // Cache for content selection results to avoid redundant calculations
  private static selectionCache = new Map<string, MCATTopic[]>()

  /**
   * Clears the selection cache (useful for testing or memory management)
   */
  public static clearCache(): void {
    this.selectionCache.clear()
  }
  /**
   * Selects science content for Phase 1 (with caching)
   */
  public static selectPhase1ScienceContent(
    anchor: AnchorKey,
    allTopics: MCATTopic[],
    usedResourceUIDs: Set<string>
  ): MCATTopic[] {
    try {
      // Create cache key based on anchor and used resources
      const usedUIDsArray = Array.from(usedResourceUIDs).sort()
      const cacheKey = `phase1-${anchor.category}-${anchor.subtopic}-${anchor.concept}-${usedUIDsArray.join(',')}`

      // Use cached result if available
      if (this.selectionCache.has(cacheKey)) {
        return this.selectionCache.get(cacheKey)!
      }

      const candidates = DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs)
      const selected: MCATTopic[] = []

      // Get Kaplan section first (only if not used)
      const availableKaplan = DataProcessor.getTopicsByProvider(candidates, 'Kaplan').filter(
        topic => !DataProcessor.isResourceUsed(topic, usedResourceUIDs)
      )

      if (availableKaplan.length > 0) {
        selected.push(availableKaplan[0])
        usedResourceUIDs.add(DataProcessor.generateResourceUID(availableKaplan[0]))
      }

      // Get matching Khan Academy content (only unused)
      const availableKA = DataProcessor.getTopicsByProvider(candidates, 'Khan Academy').filter(
        topic => !DataProcessor.isResourceUsed(topic, usedResourceUIDs)
      )

      const sortedKA = DataProcessor.sortTopicsByCriteria(
        availableKA,
        RESOURCE_DEFAULTS.KA_VIDEO,
        10,
        15
      )

      // Add up to max KA items
      let kaCount = 0
      for (const topic of sortedKA) {
        if (kaCount >= SELECTION_LIMITS.MAX_KA_ITEMS_PER_DAY) break
        selected.push(topic)
        usedResourceUIDs.add(DataProcessor.generateResourceUID(topic))
        kaCount++
      }

      // Cache the result
      this.selectionCache.set(cacheKey, [...selected])
      return selected
    } catch (error) {
      Logger.warn(
        'Error in selectPhase1ScienceContent:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects science discretes
   */
  public static selectScienceDiscretes(
    anchor: AnchorKey,
    allTopics: MCATTopic[],
    usedResourceUIDs: Set<string>,
    excludeUIDs: string[] = []
  ): MCATTopic[] {
    try {
      let candidates = DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs)

      // Filter for discrete sets
      candidates = candidates.filter(
        topic =>
          (topic.provider.toLowerCase().includes('khan') ||
            topic.provider.toLowerCase().includes('jack westin')) &&
          topic.type === 'discrete'
      )

      // Exclude specified UIDs
      candidates = candidates.filter(
        topic => !excludeUIDs.includes(DataProcessor.generateResourceUID(topic))
      )

      const sorted = DataProcessor.sortTopicsByCriteria(
        candidates,
        RESOURCE_DEFAULTS.DISCRETE_SET,
        25,
        35
      )

      return sorted.slice(0, SELECTION_LIMITS.MAX_DISCRETE_SETS)
    } catch (error) {
      Logger.warn(
        'Error in selectScienceDiscretes:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects CARS passages
   */
  public static selectCARSPassages(
    phase: 1 | 2 | 3,
    allTopics: MCATTopic[],
    usedResourceUIDs: Set<string>,
    count: number
  ): MCATTopic[] {
    try {
      const providers = phase <= 2 ? CARS_PROVIDERS.PHASE_1_2 : CARS_PROVIDERS.PHASE_3
      let candidates: MCATTopic[] = []

      // Try each provider in priority order
      for (const provider of providers) {
        const providerTopics = DataProcessor.getTopicsByProvider(allTopics, provider).filter(
          topic => topic.type === 'passage'
        )

        candidates = [...candidates, ...providerTopics]
      }

      candidates = candidates.filter(
        topic => !DataProcessor.isResourceUsed(topic, usedResourceUIDs)
      )

      const sorted = DataProcessor.sortTopicsByCriteria(
        candidates,
        RESOURCE_DEFAULTS.PASSAGE,
        20,
        25
      )

      return sorted.slice(0, count)
    } catch (error) {
      Logger.warn(
        'Error in selectCARSPassages:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects science passages for Phase 2
   */
  public static selectSciencePassages(
    anchor: AnchorKey,
    allTopics: MCATTopic[],
    usedResourceUIDs: Set<string>
  ): MCATTopic[] {
    try {
      let candidates = DataProcessor.getTopicsForAnchor(allTopics, anchor, usedResourceUIDs)

      // Filter for passages (excluding Jack Westin which is used for CARS)
      candidates = candidates.filter(
        topic => topic.type === 'passage' && !topic.provider.toLowerCase().includes('jack westin')
      )

      const sorted = DataProcessor.sortTopicsByCriteria(
        candidates,
        RESOURCE_DEFAULTS.PASSAGE,
        20,
        25
      )

      return sorted.slice(0, SELECTION_LIMITS.MAX_PASSAGES)
    } catch (error) {
      Logger.warn(
        'Error in selectSciencePassages:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects UWorld sets
   */
  public static selectUWorldSet(anchor: AnchorKey, allTopics: MCATTopic[]): MCATTopic[] {
    try {
      const uworldTopics = DataProcessor.getTopicsByProvider(allTopics, 'UWorld').filter(
        topic => topic.category === anchor.category
      )

      // UWorld sets can repeat, so we don't check used resources
      const sorted = DataProcessor.sortTopicsByCriteria(
        uworldTopics,
        RESOURCE_DEFAULTS.UWORLD_10Q,
        25,
        35
      )

      return sorted.slice(0, 1)
    } catch (error) {
      Logger.warn(
        'Error in selectUWorldSet:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects AAMC sets for Phase 3
   */
  public static selectAAMCSets(allTopics: MCATTopic[], usedResourceUIDs: Set<string>): MCATTopic[] {
    try {
      const aamcTopics = DataProcessor.getTopicsByProvider(allTopics, 'AAMC').filter(
        topic => topic.type === 'discrete'
      )

      const available = aamcTopics.filter(
        topic => !DataProcessor.isResourceUsed(topic, usedResourceUIDs)
      )

      const sorted = DataProcessor.sortTopicsByCriteria(
        available,
        RESOURCE_DEFAULTS.DISCRETE_SET,
        25,
        35
      )

      // Try to select from different packs
      const selected: MCATTopic[] = []
      const packs = new Set<string>()

      for (const topic of sorted) {
        if (selected.length >= SELECTION_LIMITS.MAX_AAMC_SETS) break

        const packMatch = topic.title.match(/Pack ([A-Z])/)
        const pack = packMatch ? packMatch[1] : 'Unknown'

        if (packs.size < 2 || !packs.has(pack)) {
          selected.push(topic)
          packs.add(pack)
        }
      }

      return selected
    } catch (error) {
      Logger.warn(
        'Error in selectAAMCSets:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }

  /**
   * Selects AAMC CARS passages for Phase 3
   */
  public static selectAAMCCARSPassages(
    allTopics: MCATTopic[],
    usedResourceUIDs: Set<string>,
    count: number
  ): MCATTopic[] {
    try {
      const aamcCarsTopics = DataProcessor.getTopicsByProvider(allTopics, 'AAMC').filter(
        topic => topic.type === 'passage'
      )

      const available = aamcCarsTopics.filter(
        topic => !DataProcessor.isResourceUsed(topic, usedResourceUIDs)
      )

      const sorted = DataProcessor.sortTopicsByCriteria(
        available,
        RESOURCE_DEFAULTS.PASSAGE,
        20,
        25
      )

      return sorted.slice(0, count)
    } catch (error) {
      Logger.warn(
        'Error in selectAAMCCARSPassages:',
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  }
}
