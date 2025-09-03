import { Idea, ScoringModel } from '../types';

export interface PrioAI {
  explainRanking(idea: Idea, model: ScoringModel): Promise<string>;
  suggestFields(title: string): Promise<Partial<Pick<Idea, "reach" | "impact" | "confidence" | "effort">> & { why: Record<string, string> }>;
  suggestTags(title: string): Promise<string[]>;
}
