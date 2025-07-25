/**
 * TypeScript type definitions for assessment-related data structures
 * Provides type safety and better developer experience
 */

// Core assessment types
export interface AssessmentQuestion {
  question_id: string;
  question: string;
  context?: string;
  rationale?: string;
  agent_name?: string;
  agent_focus?: string;
  generated_by?: string;
  session_id?: string;
}

export interface AssessmentResponse {
  question: AssessmentQuestion;
  response: string;
  timestamp: string;
}

export interface MaturityScores {
  ai_fundamentals?: number;
  machine_learning?: number;
  generative_ai?: number;
  ai_ethics?: number;
  business_application?: number;
  technical_implementation?: number;
  overall?: number;
  [key: string]: number | undefined;
}

export interface ConceptAnalysis {
  detected_concepts?: string[];
  knowledge_gaps?: string[];
  strengths?: string[];
  confidence_level?: number;
  complexity_assessment?: string;
}

export interface CrewAIMetadata {
  agents_used?: string[];
  analysis_timestamp?: string;
  session_id?: string;
  collaboration_type?: string;
}

export interface BasicInsights {
  strengths: string[];
  growthAreas: string[];
}

export interface AssessmentResults {
  totalSections: number;
  sessionId: string;
  message: string;
  overallScore: number;
  maturityScores: MaturityScores;
  maturityLevel: number;
  overallReadinessLevel?: string;
  basicInsights: BasicInsights;
  conceptAnalysis?: ConceptAnalysis;
  concept_analysis?: ConceptAnalysis; // Keep both for compatibility
  learningPath?: any;
  businessRecommendations?: any;
  confidenceAssessment?: any;
  visualAnalytics?: any;
  nextSteps?: any;
  crewai_metadata?: CrewAIMetadata;
  agents_used?: string[];
  questionsAnswered: number;
  completedAt: string;
  analysisTimestamp?: string;
  detailedScores?: { [key: string]: number };
}

export interface Assessment {
  responses: AssessmentResponse[];
  currentQuestionIndex: number;
  interactionHistory: any[];
  maturityScores: MaturityScores;
  overallScore: number;
  confidence: number;
  isComplete: boolean;
  results?: AssessmentResults;
  learningPlan?: LearningPlan;
}

// Learning plan types
export interface LearningRecommendation {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  resources?: string[];
}

export interface LearningPhase {
  title: string;
  duration: string;
  focus: string;
  objectives: string[];
  resources: string[];
}

export interface LearningPlan {
  basicRecommendations?: LearningRecommendation[];
  detailedPlan?: LearningPhase[];
  userId?: string;
  assessmentType?: string;
  generatedAt?: string;
  source?: string;
  learningPaths?: any[];
  adaptiveRecommendations?: any[];
  progressTracking?: {
    phases: any[];
    milestones: any[];
    estimatedCompletion: string | null;
  };
}

// Maturity area definition
export interface MaturityArea {
  id: string;
  title: string;
  description: string;
}

// Component prop types
export interface AssessmentColors {
  charcoal: string;
  chestnut: string;
  khaki: string;
  pearl: string;
  bone: string;
  navy?: string;
}

export interface AssessmentIntroProps {
  colors: AssessmentColors;
  maturityAreas: MaturityArea[];
  onStartAssessment: () => void;
  isLoading: boolean;
}

export interface AssessmentQuestionProps {
  colors: AssessmentColors;
  currentQuestion: AssessmentQuestion | null;
  userResponse: string;
  setUserResponse: (response: string) => void;
  onSubmitResponse: () => void;
  isLoading: boolean;
  assessment: Assessment;
  currentQuestionIndex: number;
}

export interface AssessmentResultsProps {
  colors: AssessmentColors;
  results: AssessmentResults | null;
  user: any; // TODO: Define proper User type
  maturityAreas: MaturityArea[];
  onNavigateToDashboard: () => void;
  onViewLearningPlan: () => void;
  onRetakeAssessment: () => void;
  onShowPremiumFeatures: () => void;
  getMaturityLevelText: (level: number) => string;
  getMaturityLevelColor: (level: number) => string;
}

export interface StepIndicatorProps {
  currentStep: 'intro' | 'assessment' | 'results' | 'learning';
  colors: AssessmentColors;
}

// API response types
export interface StartAssessmentResponse {
  question_id: string;
  question: string;
  context?: string;
  rationale?: string;
  agent_name?: string;
  agent_focus?: string;
  generated_by?: string;
  session_id: string;
}

export interface SubmitResponseRequest {
  questionId: string;
  answer: string;
  sessionData: {
    session_id: string;
    current_question: string;
    questionIndex: number;
  };
}

export interface SubmitResponseResponse {
  completed: boolean;
  question_id?: string;
  question?: string;
  context?: string;
  rationale?: string;
  agent_name?: string;
  agent_focus?: string;
  generated_by?: string;
  session_id: string;
  message?: string;
  analysis?: any;
  total_sections?: number;
}

// Action item types
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  source: string;
  estimatedTime?: string;
  resources?: string[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

// Project types (basic definition)
export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  organizationName: string;
  organizationSize: string;
  industry: string;
  objective: string;
  stage: string;
  budget: string;
  timeline: string;
  createdAt: string;
  updatedAt?: string;
}

// Error handling types
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export type AssessmentType = 'ai_knowledge_navigator' | 'change_readiness';

export type AssessmentStep = 'intro' | 'assessment' | 'results' | 'learning';

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

// Theme types
export interface ThemeColors {
  charcoal: string;
  chestnut: string;
  khaki: string;
  pearl: string;
  bone: string;
  navy: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gray: {
    [key: string]: string;
  };
}

export interface ComponentClasses {
  button: {
    primary: string;
    secondary: string;
    tertiary: string;
    danger: string;
    small: {
      primary: string;
      secondary: string;
    };
    large: {
      primary: string;
      secondary: string;
    };
  };
  card: {
    base: string;
    interactive: string;
    elevated: string;
  };
  input: {
    base: string;
    error: string;
    large: string;
  };
  badge: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

export default {};