export type ScoringModel = "ICE" | "RICE";
export type ImpactLevel = 0.25 | 0.5 | 1 | 2 | 3;

export type Idea = {
  id: string;
  title: string;
  notes?: string;
  tags?: string[];
  reach?: number;          // required for RICE
  impact: ImpactLevel;     // Tiny=0.25, Small=0.5, Medium=1, Large=2, Massive=3
  confidence: number;      // 0..1
  effort: number;          // person-months (>0)
  score?: number;          // computed
  createdAt: string;       // ISO
  isComplete?: boolean;    // Whether all required fields are filled
  provenance?: {           // who set fields
    reach?: "user" | "ai" | "ai-edited";
    impact?: "user" | "ai" | "ai-edited";
    confidence?: "user" | "ai" | "ai-edited";
    effort?: "user" | "ai" | "ai-edited";
  };
}

export interface Settings {
  model: 'ICE' | 'RICE';
  weights: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
  };
  chartThresholds: 'median' | 'custom';
  customThresholds?: {
    impact: number;
    effort: number;
  };
  mode: "manual" | "assisted" | "auto"; // AI assist mode (default "assisted")
  chart: { 
    xMedian?: number; 
    yMedian?: number; 
    useMedians: boolean; 
  }; // default useMedians=true
}

// Impact options for scoring
export const IMPACT_OPTIONS = [
  { value: 1, label: 'Minimal', description: 'Very small impact on users/business' },
  { value: 2, label: 'Low', description: 'Some positive impact' },
  { value: 3, label: 'Medium', description: 'Moderate positive impact' },
  { value: 4, label: 'High', description: 'Significant positive impact' },
  { value: 5, label: 'Massive', description: 'Transformational impact' }
];

// Confidence presets for scoring
export const CONFIDENCE_PRESETS = [
  { value: 0.1, label: '10%', description: 'Very uncertain' },
  { value: 0.3, label: '30%', description: 'Low confidence' },
  { value: 0.5, label: '50%', description: 'Moderate confidence' },
  { value: 0.8, label: '80%', description: 'High confidence' },
  { value: 1.0, label: '100%', description: 'Completely certain' }
];



// Chart data types
export interface ChartPoint {
  id: string;
  x: number; // Impact
  y: number; // Effort (inverted for chart)
  title: string;
  score: number;
  color: string;
  idea: Idea;
}

// Form types
export interface IdeaFormData {
  title: string;
  notes?: string;
  reach?: number;
  impact: number;
  confidence: number;
  effort: number;
  tags: string[];
}

// Export/Import types
export interface ExportData {
  ideas: Idea[];
  settings: Settings;
  exportedAt: Date;
  version: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// UI State types
export type ValidationError = {
  field: keyof Idea;
  message: string;
};

export type IdeaStatus = "valid" | "invalid" | "incomplete";

export type QuadrantLabel = "Quick Wins" | "Big Bets" | "Maybes" | "Time Sinks";

export type Quadrant = {
  label: QuadrantLabel;
  description: string;
  position: { x: "left" | "right"; y: "top" | "bottom" };
};

// Theme types
export type Theme = "light" | "dark";

// Toast notification types
export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};
