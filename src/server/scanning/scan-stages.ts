// Scan stage definitions for progress tracking
export type ScanStage =
  | "initializing"
  | "downloading"
  | "scanning"
  | "analyzing"
  | "processing"
  | "completed"
  | "failed"

export const SCAN_STAGES: Record<
  ScanStage,
  {
    label: string
    description: string
    order: number
  }
> = {
  initializing: {
    label: "Initializing",
    description: "Setting up scan environment",
    order: 1,
  },
  downloading: {
    label: "Downloading",
    description: "Downloading image and vulnerability database",
    order: 2,
  },
  scanning: {
    label: "Scanning",
    description: "Scanning packages for vulnerabilities",
    order: 3,
  },
  analyzing: {
    label: "Analyzing",
    description: "Analyzing discovered vulnerabilities",
    order: 4,
  },
  processing: {
    label: "Processing",
    description: "Processing and storing results",
    order: 5,
  },
  completed: {
    label: "Completed",
    description: "Scan completed successfully",
    order: 6,
  },
  failed: {
    label: "Failed",
    description: "Scan failed with error",
    order: 7,
  },
}

// Helper function to get progress percentage from stage
export function getStageProgress(stage: ScanStage): number {
  const stageInfo = SCAN_STAGES[stage]
  if (!stageInfo) return 0

  // Calculate progress based on stage order
  // Each stage represents roughly equal progress
  const totalStages = Object.keys(SCAN_STAGES).length - 2 // Exclude completed and failed
  return Math.round((stageInfo.order / totalStages) * 100)
}

// Helper function to get next stage
export function getNextStage(currentStage: ScanStage): ScanStage | null {
  const stages = Object.keys(SCAN_STAGES) as ScanStage[]
  const currentIndex = stages.indexOf(currentStage)

  if (currentIndex === -1 || currentIndex >= stages.length - 1) {
    return null
  }

  return stages[currentIndex + 1]
}

// Helper function to check if stage is terminal
export function isTerminalStage(stage: ScanStage): boolean {
  return stage === "completed" || stage === "failed"
}
