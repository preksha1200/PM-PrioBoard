import type { Idea, ScoringModel, ImpactLevel } from './types';

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  0.25: 'Tiny',
  0.5: 'Small', 
  1: 'Medium',
  2: 'Large',
  3: 'Massive'
};

export const DEFAULT_WEIGHTS = {
  reach: 1,
  impact: 1,
  confidence: 1,
  effort: 1
};

/**
 * Calculate ICE score: (Impact × Confidence) / Effort
 */
export function scoreICE(idea: Idea, weights = DEFAULT_WEIGHTS): number | undefined {
  if (idea.effort <= 0) return undefined;
  
  const { impact, confidence, effort } = idea;
  
  // Apply weights as exponents
  const weightedImpact = Math.pow(impact, weights.impact);
  const weightedConfidence = Math.pow(confidence, weights.confidence);
  const weightedEffort = Math.pow(effort, weights.effort);
  
  return (weightedImpact * weightedConfidence) / weightedEffort;
}

/**
 * Calculate RICE score: (Reach × Impact × Confidence) / Effort
 */
export function scoreRICE(idea: Idea, weights = DEFAULT_WEIGHTS): number | undefined {
  if (idea.effort <= 0) return undefined;
  if (idea.reach === undefined || idea.reach <= 0) return undefined;
  
  const { reach, impact, confidence, effort } = idea;
  
  // Apply weights as exponents
  const weightedReach = Math.pow(reach, weights.reach);
  const weightedImpact = Math.pow(impact, weights.impact);
  const weightedConfidence = Math.pow(confidence, weights.confidence);
  const weightedEffort = Math.pow(effort, weights.effort);
  
  return (weightedReach * weightedImpact * weightedConfidence) / weightedEffort;
}

/**
 * Calculate score based on the current model
 */
export function calculateScore(idea: Idea, model: ScoringModel, weights = DEFAULT_WEIGHTS): number | undefined {
  return model === 'ICE' ? scoreICE(idea, weights) : scoreRICE(idea, weights);
}

/**
 * Get the status of an idea (valid, invalid, incomplete)
 */
export function getIdeaStatus(idea: Idea, model: ScoringModel): 'valid' | 'invalid' | 'incomplete' {
  if (idea.effort <= 0) return 'invalid';
  if (model === 'RICE' && (idea.reach === undefined || idea.reach <= 0)) return 'incomplete';
  return 'valid';
}

/**
 * Sort ideas by score with tie-breaking rules
 */
export function sortIdeasByScore(ideas: Idea[], model: ScoringModel, weights = DEFAULT_WEIGHTS): Idea[] {
  return [...ideas].sort((a, b) => {
    const scoreA = calculateScore(a, model, weights);
    const scoreB = calculateScore(b, model, weights);
    
    // Handle undefined scores (invalid/incomplete ideas go to bottom)
    if (scoreA === undefined && scoreB === undefined) return 0;
    if (scoreA === undefined) return 1;
    if (scoreB === undefined) return -1;
    
    // Primary sort: higher score wins
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // Tie-break 1: higher impact wins
    if (a.impact !== b.impact) return b.impact - a.impact;
    
    // Tie-break 2: lower effort wins
    return a.effort - b.effort;
  });
}

/**
 * Calculate median values for chart axes
 */
export function calculateMedians(ideas: Idea[], model: ScoringModel): { effort: number; impact: number } {
  const validIdeas = ideas.filter(idea => getIdeaStatus(idea, model) === 'valid');
  
  if (validIdeas.length === 0) {
    return { effort: 1, impact: 1 };
  }
  
  const efforts = validIdeas.map(idea => idea.effort).sort((a, b) => a - b);
  const impacts = validIdeas.map(idea => idea.impact).sort((a, b) => a - b);
  
  const effortMedian = efforts[Math.floor(efforts.length / 2)];
  const impactMedian = impacts[Math.floor(impacts.length / 2)];
  
  return { effort: effortMedian, impact: impactMedian };
}

/**
 * Get score quartiles for color coding
 */
export function getScoreQuartiles(ideas: Idea[], model: ScoringModel, weights = DEFAULT_WEIGHTS): number[] {
  const scores = ideas
    .map(idea => calculateScore(idea, model, weights))
    .filter((score): score is number => score !== undefined)
    .sort((a, b) => a - b);
    
  if (scores.length === 0) return [0, 0, 0, 0];
  
  const q1 = scores[Math.floor(scores.length * 0.25)];
  const q2 = scores[Math.floor(scores.length * 0.5)];
  const q3 = scores[Math.floor(scores.length * 0.75)];
  
  return [scores[0], q1, q2, q3, scores[scores.length - 1]];
}

/**
 * Get color for score based on quartile
 */
export function getScoreColor(score: number | undefined, quartiles: number[]): string {
  if (score === undefined) return 'var(--color-gray-300)';
  
  const [, q1, q2, q3] = quartiles;
  
  if (score >= q3) return 'var(--color-primary-red)';
  if (score >= q2) return 'var(--color-terracotta)';
  if (score >= q1) return 'var(--color-soft-blue)';
  return 'var(--color-gray-500)';
}

/**
 * Validate idea fields
 */
export function validateIdea(idea: Partial<Idea>, model: ScoringModel): string[] {
  const errors: string[] = [];
  
  if (!idea.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (idea.effort !== undefined && idea.effort <= 0) {
    errors.push('Effort must be greater than 0');
  }
  
  if (idea.confidence !== undefined && (idea.confidence < 0 || idea.confidence > 1)) {
    errors.push('Confidence must be between 0 and 1');
  }
  
  if (model === 'RICE' && idea.reach !== undefined && idea.reach <= 0) {
    errors.push('Reach must be greater than 0 for RICE model');
  }
  
  return errors;
}
