import { TIME_CONSTANTS } from '../constants'
import { DataProcessor } from '../data/data-processor'
import { MCATTopic, StudyDayWithBlocks, StudyDay, StudyBlocks, AnchorKey } from '../types'

import { ContentSelector } from './content-selector'

/**
 * Manages resource usage tracking and time calculations
 */
export class ResourceManager {
  private usedResourceUIDs: Set<string> = new Set()
  private usedAnchors: Set<string> = new Set()

  /**
   * Generates study day content with resource tracking
   */
  public generateStudyDay(
    day: StudyDay,
    phase: 1 | 2 | 3,
    allTopics: MCATTopic[],
    availableTopics: Map<string, MCATTopic[]>
  ): StudyDayWithBlocks {
    const blocks = this.createEmptyBlocks()

    // Select anchor for the day
    const anchor = DataProcessor.getNextAnchor(availableTopics, this.usedAnchors)

    if (!anchor) {
      // No more anchors available, create empty day
      return {
        ...day,
        kind: 'study',
        phase,
        blocks,
      }
    }

    // Mark anchor as used
    const anchorKey = `${anchor.category}-${anchor.subtopic}-${anchor.concept}`
    this.usedAnchors.add(anchorKey)

    // Generate content for each phase
    this.generatePhaseContent(blocks, anchor, phase, allTopics)

    return {
      ...day,
      kind: 'study',
      phase,
      blocks,
    }
  }

  /**
   * Creates empty blocks structure
   */
  private createEmptyBlocks() {
    return {
      written_review_minutes: TIME_CONSTANTS.WRITTEN_REVIEW_MINUTES,
      total_resource_minutes: TIME_CONSTANTS.RESOURCE_MINUTES,
    }
  }

  /**
   * Generates content for specific phase
   */
  private generatePhaseContent(
    blocks: StudyBlocks,
    anchor: AnchorKey,
    phase: 1 | 2 | 3,
    allTopics: MCATTopic[]
  ): void {
    switch (phase) {
      case 1:
        this.generatePhase1Content(blocks, anchor, allTopics)
        break
      case 2:
        this.generatePhase2Content(blocks, anchor, allTopics)
        break
      case 3:
        this.generatePhase3Content(blocks, allTopics)
        break
    }
  }

  /**
   * Generates Phase 1 content
   */
  private generatePhase1Content(
    blocks: StudyBlocks,
    anchor: AnchorKey,
    allTopics: MCATTopic[]
  ): void {
    // Science content
    blocks.science_content = ContentSelector.selectPhase1ScienceContent(
      anchor,
      allTopics,
      this.usedResourceUIDs
    )

    // Science discretes
    blocks.science_discretes = ContentSelector.selectScienceDiscretes(
      anchor,
      allTopics,
      this.usedResourceUIDs
    )

    // CARS passages
    blocks.cars = ContentSelector.selectCARSPassages(1, allTopics, this.usedResourceUIDs, 2)
  }

  /**
   * Generates Phase 2 content
   */
  private generatePhase2Content(
    blocks: StudyBlocks,
    anchor: AnchorKey,
    allTopics: MCATTopic[]
  ): void {
    // Science passages
    blocks.science_passages = ContentSelector.selectSciencePassages(
      anchor,
      allTopics,
      this.usedResourceUIDs
    )

    // UWorld set
    blocks.uworld_set = ContentSelector.selectUWorldSet(anchor, allTopics)

    // Extra discretes (not used in Phase 1)
    const phase1UIDs = Array.from(this.usedResourceUIDs)
    blocks.extra_discretes = ContentSelector.selectScienceDiscretes(
      anchor,
      allTopics,
      this.usedResourceUIDs,
      phase1UIDs
    )

    // CARS passages
    blocks.cars = ContentSelector.selectCARSPassages(2, allTopics, this.usedResourceUIDs, 2)
  }

  /**
   * Generates Phase 3 content
   */
  private generatePhase3Content(blocks: StudyBlocks, allTopics: MCATTopic[]): void {
    // AAMC sets
    blocks.aamc_sets = ContentSelector.selectAAMCSets(allTopics, this.usedResourceUIDs)

    // AAMC CARS passages
    blocks.aamc_cars_passages = ContentSelector.selectAAMCCARSPassages(
      allTopics,
      this.usedResourceUIDs,
      2
    )
  }

  /**
   * Tracks resources used in a study day
   */
  public trackUsedResources(studyDay: StudyDayWithBlocks): void {
    if (!studyDay.blocks) return

    const allContent = [
      ...(studyDay.blocks.science_content ?? []),
      ...(studyDay.blocks.science_discretes ?? []),
      ...(studyDay.blocks.science_passages ?? []),
      ...(studyDay.blocks.cars ?? []),
      ...(studyDay.blocks.aamc_sets ?? []),
      ...(studyDay.blocks.aamc_cars_passages ?? []),
    ]

    allContent.forEach(topic => {
      const resourceUID = DataProcessor.generateResourceUID(topic)
      this.usedResourceUIDs.add(resourceUID)
    })
  }

  /**
   * Gets resource usage statistics
   */
  public getResourceStats(): {
    totalUsed: number
    byProvider: Record<string, number>
  } {
    const byProvider: Record<string, number> = {}

    // This would need access to the original topics to get provider info
    // For now, return basic stats
    return {
      totalUsed: this.usedResourceUIDs.size,
      byProvider,
    }
  }

  /**
   * Resets resource tracking (useful for testing)
   */
  public reset(): void {
    this.usedResourceUIDs.clear()
    this.usedAnchors.clear()
  }
}
