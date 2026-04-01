// === Enums & Unions ===

export type StarterStrength = 'zwak' | 'gemiddeld' | 'sterk' | 'piek';

export type FlourType = 'T45' | 'T65' | 'T80' | 'T150' | 'spelt' | 'rogge' | 'custom';

export type GrainType = 'tarwe' | 'spelt' | 'rogge';

export type FeedingRatio = '1:1:1' | '1:2:2' | '1:5:5' | '1:10:10';

export type ProcessRoute = 'warm' | 'koud';

export type StageId =
  | 'levain'
  | 'autolyse'
  | 'mengen'
  | 'bulk'
  | 'stretch_fold'
  | 'voorvormen'
  | 'bankrust'
  | 'eindvormen'
  | 'koude_rijs'
  | 'bakken_stoom'
  | 'bakken_droog'
  | 'afkoelen';

export type BakeScore = 1 | 2 | 3 | 4 | 5;

// === Configuration ===

export interface FlourConfig {
  id: string;
  name: string;
  type: FlourType;
  grain: GrainType;
  proteinPercent: number;
  ashPercent: number;
  brand?: string;
  stockGrams?: number;
  lowStockThreshold?: number;
}

export interface RecipeConfig {
  name: string;
  route: ProcessRoute;
  hydrationPercent: number;
  starterPercent: number;
  starterStrength: StarterStrength;
  feedingRatio: FeedingRatio;
  saltPercent: number;
  flourType: FlourType;
  flourBlendId?: string; // references a preset blend
  roomTempC: number;
  targetDDT: number;
  totalFlourGrams: number;
}

// === Stage Definitions ===

export interface StageDefinition {
  id: StageId;
  name: string;
  description: string;
  instructions: string[];
  baseDurationMinutes: number;
  referenceTempC: number | null;
  usesQ10: boolean;
  expectedProperties: string[];
  physicalTest?: PhysicalTest;
}

export interface PhysicalTest {
  name: string;
  description: string;
  science: string;
  outcomes: {
    underfermented?: string;
    optimal: string;
    overfermented?: string;
  };
}

// === Active Process ===

export interface ActiveStage {
  id: StageId;
  name: string;
  startTime: number; // timestamp ms
  calculatedDurationMs: number;
  actualTempC: number | null;
  completedAt: number | null;
  stretchFoldCount?: number;
  notes?: string;
}

export type EventType =
  | 'process_started'
  | 'stage_completed'
  | 'stage_skipped'       // completed before timer ended
  | 'stretch_fold_done'
  | 'temperature_changed'
  | 'note_added'
  | 'process_completed';

export interface ProcessEvent {
  timestamp: number;
  type: EventType;
  stageId?: StageId;
  data?: Record<string, unknown>;  // flexible payload for AI analysis
}

export interface BreadProcess {
  id: string;
  config: RecipeConfig;
  startTime: number;
  stages: ActiveStage[];
  currentStageIndex: number;
  isComplete: boolean;
  createdAt: number;
  eventLog: ProcessEvent[];
}

// === Charts ===

export interface FermentationPoint {
  timeMinutes: number;
  risePercent: number;
  estimatedPh: number;
  lacticRatio: number;
}

// === Feedback / Bake Log ===

export interface BakeResult {
  id: string;
  processId: string;
  config: RecipeConfig;
  date: number;
  actualDurations: Record<StageId, number>; // actual ms per stage
  estimatedDurations: Record<StageId, number>; // planned ms per stage
  scores: BakeScores;
  notes: string;
  photoBase64?: string;
  eventLog: ProcessEvent[];  // full timestamped event log for AI analysis
}

export interface BakeScores {
  kruim: BakeScore;       // crumb structure
  korst: BakeScore;       // crust
  smaak: BakeScore;       // taste
  ovenspring: BakeScore;  // oven spring
  overall: BakeScore;
}

// === Inventory ===

export interface FlourInventoryItem extends FlourConfig {
  lastUpdated: number;
}

// === Navigation ===

export type AppView = 'setup' | 'process' | 'history' | 'inventory';
export type ProcessTab = 'tijdlijn' | 'stap' | 'grafieken';
