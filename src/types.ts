/**
 * Core type definitions for MCAT Study Scheduler
 */

export interface MCATTopic {
  category: string
  subtopic_number: number
  subtopic: string
  concept_number: number
  concept: string
  high_yield: 'Yes' | 'No'
  provider: string
  title: string
  url: string
  minutes: number
  type: 'video' | 'article' | 'section' | 'discrete' | 'passage' | 'set'
}

export interface StudyDay {
  date: string
  kind: 'break' | 'study' | 'full_length'
  phase?: 1 | 2 | 3
  provider?: string
  name?: string
  blocks?: StudyBlocks
}

export interface StudyDayWithBlocks extends StudyDay {
  kind: 'study'
  phase: 1 | 2 | 3
  blocks: StudyBlocks
}

export interface StudyBlocks {
  science_content?: MCATTopic[]
  science_discretes?: MCATTopic[]
  science_passages?: MCATTopic[]
  uworld_set?: MCATTopic[]
  extra_discretes?: MCATTopic[]
  cars?: MCATTopic[]
  aamc_sets?: MCATTopic[]
  aamc_cars_passages?: MCATTopic[]
  written_review_minutes: number
  total_resource_minutes: number
}

export interface UsedResource {
  schedule_id: string
  provider: string
  resource_uid: string
}

export interface ScheduleParams {
  start: string
  test: string
  priorities: string[]
  availability: string[]
  fl_weekday: string
}

export interface AnchorKey {
  category: string
  subtopic?: string
  concept?: string
  level: 0 | 1 | 2 // 0=concept, 1=subtopic, 2=category
}

export interface ScheduleStats {
  totalDays: number
  studyDays: number
  breakDays: number
  flDays: number
  phaseStats: PhaseStats[]
  flStats: FLStats
  resourceStats: ResourceStats
}

export interface PhaseStats {
  phase: number
  count: number
  percentage: number
}

export interface FLStats {
  total: number
  dates: string[]
  averageSpacing: number
}

export interface ResourceStats {
  totalUsed: number
  byProvider: Record<string, number>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ScheduleGenerationResult {
  success: boolean
  data?: StudyDay[]
  stats?: ScheduleStats
  error?: string
  generatedAt?: string
}

export interface HealthCheckResponse {
  status: 'OK' | 'ERROR'
  timestamp: string
  uptime: number
  memory: NodeJS.MemoryUsage
  version: string
}

export interface ErrorResponse {
  success: false
  error: string
  code: string
  details?: Record<string, unknown>
}

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  stats?: ScheduleStats
  generatedAt: string
}
