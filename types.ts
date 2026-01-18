
export interface Interaction {
  timestamp: string;
  learnerQuestion: string;
  mentorAnswer: string;
  effectivenessScore: number; // 0-100
  analysis: string;
  strengths: string[];
  improvements: string[];
}

export interface EvaluationResult {
  overallScore: number;
  metrics: {
    clarity: number;
    empathy: number;
    accuracy: number;
    pacing: number;
  };
  summary: string;
  interactions: Interaction[];
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
