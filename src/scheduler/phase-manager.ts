import { PHASE_CONFIG } from '../constants'
import { StudyDay } from '../types'

/**
 * Manages study day phases and phase assignments
 */
export class PhaseManager {
  /**
   * Splits study days into phases
   */
  public static splitIntoPhases(studyDays: StudyDay[]): {
    phase1: StudyDay[]
    phase2: StudyDay[]
    phase3: StudyDay[]
  } {
    const totalStudyDays = studyDays.length
    const phaseSize = Math.floor(totalStudyDays / PHASE_CONFIG.TOTAL_PHASES)

    return {
      phase1: studyDays.slice(0, phaseSize),
      phase2: studyDays.slice(phaseSize, phaseSize * 2),
      phase3: studyDays.slice(phaseSize * 2),
    }
  }

  /**
   * Gets the phase for a specific date
   */
  public static getPhaseForDate(
    date: string,
    phases: { phase1: StudyDay[]; phase2: StudyDay[]; phase3: StudyDay[] }
  ): 1 | 2 | 3 {
    if (phases.phase1.some(day => day.date === date)) return 1
    if (phases.phase2.some(day => day.date === date)) return 2
    return 3
  }

  /**
   * Gets phase statistics
   */
  public static getPhaseStats(phases: {
    phase1: StudyDay[]
    phase2: StudyDay[]
    phase3: StudyDay[]
  }): { phase: number; count: number; percentage: number }[] {
    const total = phases.phase1.length + phases.phase2.length + phases.phase3.length

    return [
      {
        phase: 1,
        count: phases.phase1.length,
        percentage: Math.round((phases.phase1.length / total) * 100),
      },
      {
        phase: 2,
        count: phases.phase2.length,
        percentage: Math.round((phases.phase2.length / total) * 100),
      },
      {
        phase: 3,
        count: phases.phase3.length,
        percentage: Math.round((phases.phase3.length / total) * 100),
      },
    ]
  }

  /**
   * Validates that phases are properly balanced
   */
  public static validatePhaseBalance(phases: {
    phase1: StudyDay[]
    phase2: StudyDay[]
    phase3: StudyDay[]
  }): boolean {
    const stats = this.getPhaseStats(phases)
    const maxDifference =
      Math.max(...stats.map(s => s.count)) - Math.min(...stats.map(s => s.count))

    // Allow maximum difference of 2 days for reasonable balance
    return maxDifference <= 2
  }

  /**
   * Gets the name of a phase
   */
  public static getPhaseName(phase: 1 | 2 | 3): string {
    return PHASE_CONFIG.PHASE_NAMES[phase]
  }
}
