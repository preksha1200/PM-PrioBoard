import { Idea, ScoringModel, ImpactLevel } from '../types';
import { PrioAI } from './types';

export class LocalStubAI implements PrioAI {
  async explainRanking(idea: Idea, model: ScoringModel): Promise<string> {
    const { title, impact, confidence, effort, reach, score } = idea;
    
    if (!score) {
      return "This idea cannot be scored due to missing or invalid values.";
    }
    
    const impactLabel = this.getImpactLabel(impact);
    const confidencePercent = Math.round(confidence * 100);
    
    let explanation = `"${title}" scores ${score.toFixed(2)} in the ${model} model. `;
    
    if (model === 'RICE' && reach) {
      explanation += `With ${reach} people reached, ${impactLabel.toLowerCase()} impact (${impact}), ${confidencePercent}% confidence, and ${effort} person-months of effort, `;
    } else {
      explanation += `With ${impactLabel.toLowerCase()} impact (${impact}), ${confidencePercent}% confidence, and ${effort} person-months of effort, `;
    }
    
    // Suggest improvements
    const improvements: string[] = [];
    if (confidence < 0.8) improvements.push("gather more data to increase confidence");
    if (effort > 2) improvements.push("break down into smaller chunks to reduce effort");
    if (impact < 2) improvements.push("explore ways to increase impact");
    
    if (improvements.length > 0) {
      explanation += `you could improve the score by: ${improvements.join(', ')}.`;
    } else {
      explanation += "this is already well-positioned for execution.";
    }
    
    return explanation;
  }

  async suggestFields(title: string): Promise<Partial<Pick<Idea, "reach" | "impact" | "confidence" | "effort">> & { why: Record<string, string> }> {
    const titleLower = title.toLowerCase();
    const suggestions: Partial<Pick<Idea, "reach" | "impact" | "confidence" | "effort">> = {};
    const why: Record<string, string> = {};
    
    // Effort estimation based on keywords
    if (/migrate|migration|integration|infra|infrastructure|platform/.test(titleLower)) {
      suggestions.effort = 2.5;
      why.effort = "Infrastructure and migration work typically requires significant effort";
    } else if (/copy|cta|tiny|typo|fix|small/.test(titleLower)) {
      suggestions.effort = 0.3;
      why.effort = "Copy changes and small fixes are typically quick wins";
    } else if (/new feature|build|create|develop/.test(titleLower)) {
      suggestions.effort = 1.5;
      why.effort = "New feature development requires moderate effort";
    } else {
      suggestions.effort = 1;
      why.effort = "Standard development effort for typical features";
    }
    
    // Impact estimation
    if (/onboarding|retention|reliability|billing|revenue/.test(titleLower)) {
      suggestions.impact = 2;
      why.impact = "Features affecting user onboarding, retention, or revenue have high impact";
    } else if (/copy|minor|small|typo/.test(titleLower)) {
      suggestions.impact = 0.5;
      why.impact = "Minor changes typically have small impact";
    } else if (/strategic|platform-wide|new|core/.test(titleLower)) {
      suggestions.impact = 3;
      why.impact = "Strategic and platform-wide changes have massive impact";
    } else {
      suggestions.impact = 1;
      why.impact = "Standard feature impact for typical improvements";
    }
    
    // Confidence estimation
    if (/experiment|hypothesis|test|try/.test(titleLower)) {
      suggestions.confidence = 0.6;
      why.confidence = "Experimental features have lower confidence until validated";
    } else if (/data|request|feedback|user|customer/.test(titleLower)) {
      suggestions.confidence = 0.8;
      why.confidence = "Features backed by data or user feedback have high confidence";
    } else {
      suggestions.confidence = 0.7;
      why.confidence = "Standard confidence level for well-understood features";
    }
    
    // Reach estimation (for RICE)
    if (/onboarding|email|notification|login/.test(titleLower)) {
      suggestions.reach = 2000;
      why.reach = "Onboarding and notification features reach most users";
    } else if (/admin|internal|tooling|dashboard/.test(titleLower)) {
      suggestions.reach = 200;
      why.reach = "Admin and internal tools have limited reach";
    } else if (/core|main|primary/.test(titleLower)) {
      suggestions.reach = 1500;
      why.reach = "Core features reach a large portion of users";
    } else {
      suggestions.reach = 600;
      why.reach = "Standard reach for typical feature improvements";
    }
    
    return { ...suggestions, why };
  }

  async suggestTags(title: string): Promise<string[]> {
    const titleLower = title.toLowerCase();
    const tags: string[] = [];
    
    // Extract and map keywords to tags
    if (/ui|interface|design|copy|button|form/.test(titleLower)) tags.push('ui');
    if (/feature|functionality|capability/.test(titleLower)) tags.push('feature');
    if (/infra|infrastructure|platform|system|migration/.test(titleLower)) tags.push('infra');
    if (/growth|onboarding|retention|conversion/.test(titleLower)) tags.push('growth');
    if (/ml|ai|model|algorithm/.test(titleLower)) tags.push('ml');
    if (/reliability|performance|bug|fix/.test(titleLower)) tags.push('reliability');
    if (/analytics|data|metrics|tracking/.test(titleLower)) tags.push('analytics');
    if (/security|auth|permission/.test(titleLower)) tags.push('security');
    
    // Extract simple nouns as potential tags
    const words = title.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const commonTags = ['dashboard', 'admin', 'user', 'api', 'integration', 'workflow', 'automation'];
    
    for (const word of words) {
      if (commonTags.includes(word) && !tags.includes(word)) {
        tags.push(word);
      }
    }
    
    return tags.slice(0, 3); // Limit to 3 tags
  }
  
  private getImpactLabel(impact: ImpactLevel): string {
    const labels: Record<ImpactLevel, string> = {
      0.25: 'Tiny',
      0.5: 'Small',
      1: 'Medium', 
      2: 'Large',
      3: 'Massive'
    };
    return labels[impact];
  }
}
