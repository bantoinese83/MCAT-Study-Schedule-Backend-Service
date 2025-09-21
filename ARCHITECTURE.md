# MCAT Study Schedule API - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   /health       │  │   /full-plan    │  │   /stats        │  │
│  │   (Health Check)│  │   (Main API)    │  │   (Statistics)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Sanitization│  │   Logging   │  │   Timeout   │  │ Error   │ │
│  │             │  │             │  │             │  │ Handler │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SCHEDULE ORCHESTRATOR                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Main Coordination Logic                       │ │
│  │  • Data Loading & Validation                              │ │
│  │  • Calendar Generation                                    │ │
│  │  • Phase Management                                       │ │
│  │  • FL Scheduling                                          │ │
│  │  • Content Selection                                      │ │
│  │  • Resource Management                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CORE MODULES                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │Data Loader  │  │Data Processor│  │Calendar Gen │  │Phase Mgr│ │
│  │             │  │             │  │             │  │         │ │
│  │• Excel Load │  │• Filtering  │  │• Date Calc  │  │• Split  │ │
│  │• Caching    │  │• Indexing   │  │• Weekdays   │  │• Stats  │ │
│  │• Validation │  │• Sorting    │  │• Holidays   │  │• Balance│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │FL Scheduler │  │Content Sel  │  │Resource Mgr │  │Utils    │ │
│  │             │  │             │  │             │  │         │ │
│  │• 6 FL Exams │  │• HY Priority│  │• Track Used │  │• Valid  │ │
│  │• Spacing    │  │• Tie-breaks │  │• Never Rep  │  │• Error  │ │
│  │• Validation │  │• Matching   │  │• UID Gen    │  │• Logger │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              In-Memory Data Storage                        │ │
│  │  • Excel File (Organized_MCAT_Topics.xlsx)                │ │
│  │  • Cached Topics & Resources                              │ │
│  │  • Used Resource Tracking                                 │ │
│  │  • Performance Optimizations                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Key Components

### 1. **Express Server** (`src/index.ts`)

- **Purpose**: HTTP server and API endpoints
- **Endpoints**:
  - `GET /health` - Health check and system status
  - `GET /full-plan` - Main schedule generation endpoint
  - `GET /stats` - Schedule statistics endpoint
- **Features**: Request validation, error handling, logging

### 2. **Schedule Orchestrator** (`src/scheduler/schedule-orchestrator.ts`)

- **Purpose**: Main coordination logic
- **Responsibilities**:
  - Data loading and validation
  - Calendar generation
  - Phase management
  - FL scheduling
  - Content selection
  - Resource management
  - Statistics generation

### 3. **Data Layer** (`src/data/`)

- **Data Loader** (`data-loader.ts`):
  - Excel file loading and caching
  - Data validation and processing
  - Singleton pattern for efficiency
- **Data Processor** (`data-processor.ts`):
  - Topic filtering and indexing
  - High-yield prioritization
  - Performance optimizations with Maps and Sets

### 4. **Scheduling Modules** (`src/scheduler/`)

- **Calendar Generator** (`calendar-generator.ts`):
  - Date calculations and weekday handling
  - Study vs break day determination
  - Caching for performance
- **Phase Manager** (`phase-manager.ts`):
  - Study day splitting into phases
  - Phase statistics and validation
- **FL Scheduler** (`fl-scheduler.ts`):
  - 6 AAMC full-length exam scheduling
  - Even spacing and 7-day buffer
  - Validation and statistics
- **Content Selector** (`content-selector.ts`):
  - High-yield priority system
  - Tie-breaking algorithms
  - Resource matching and selection
- **Resource Manager** (`resource-manager.ts`):
  - Never-repeat tracking
  - Resource UID generation
  - Phase-specific content generation

### 5. **Utilities** (`src/utils/`)

- **Validation** (`validation.ts`):
  - Input sanitization and validation
  - Parameter type checking
  - Error handling
- **Error Handling** (`error-handling.ts`):
  - Custom error classes
  - Centralized error management
  - Logging utilities

### 6. **Types & Constants** (`src/types.ts`, `src/constants/`)

- **Type Definitions**: Comprehensive TypeScript interfaces
- **Constants**: Centralized configuration and magic numbers
- **Error Messages**: Standardized error responses

## 🚀 Performance Optimizations

1. **Data Structures**:
   - Maps for O(1) lookups instead of array filtering
   - Sets for efficient duplicate checking
   - Caching at multiple levels

2. **Algorithms**:
   - Single-pass sorting with pre-computed scores
   - Efficient resource tracking
   - Optimized content selection

3. **Memory Management**:
   - Singleton pattern for data loading
   - Efficient object creation
   - Garbage collection optimization

## 🔒 Security & Validation

1. **Input Sanitization**: All user inputs are sanitized
2. **Type Safety**: Comprehensive TypeScript typing
3. **Error Handling**: Graceful error responses
4. **Request Timeouts**: 60-second timeout for schedule generation
5. **Validation**: Parameter validation and type checking

## 📊 Monitoring & Logging

1. **Health Endpoint**: System status and memory usage
2. **Statistics**: Comprehensive schedule analytics
3. **Logging**: Structured logging with different levels
4. **Error Tracking**: Centralized error management
