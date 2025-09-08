import { GoogleGenAI } from '@google/genai';

interface AIScoreResult {
  reach?: number;
  impact: number;
  confidence: number;
  effort: number;
  reasoning: string;
  source?: string;
  isGeminiResponse?: boolean;
}

// Product Profile context for AI scoring
interface ProductProfileContext {
  productName?: string;
  oneLiner?: string;
  detailedDescription?: string;
  northStarMetric?: {
    name: string;
    value: string;
    unit: string;
    target: string;
  };
  audienceScale?: {
    targetAudience: string;
    mau: string;
    wau: string;
    activeAccounts: string;
  };
  businessContext?: {
    industry: string;
    businessModel: string;
    productStage: string;
  };
  funnelChannels?: {
    touchpoints: string[];
    exposureRate: string;
    openRate: string;
    clickRate: string;
    userInteraction: string;
  };
  teamEffortUnits?: {
    teamSize: string;
    monthlyPersonMonths: string;
    effortUnitPreference: 'person-weeks' | 'person-months';
    timeHorizon: 'per-week' | 'per-month';
  };
  constraintsRisk?: {
    regulatoryConstraints: boolean;
    regulatoryDetails: string;
    performanceConstraints: string;
    infrastructureConstraints: string;
    riskTolerance: 'Low' | 'Medium' | 'High';
  };
}

// Enhanced content analysis for intelligent fallback scoring
class ContentAnalyzer {
  // Check if text appears to be meaningful vs gibberish
  static isGibberish(text: string): boolean {
    if (!text || text.trim().length < 3) return true;
    
    // Count vowels and consonants
    const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
    const totalLetters = vowels + consonants;
    
    if (totalLetters === 0) return true;
    
    // Gibberish typically has poor vowel/consonant ratio
    const vowelRatio = vowels / totalLetters;
    if (vowelRatio < 0.1 || vowelRatio > 0.8) return true;
    
    // Check for excessive repeated characters
    const repeatedChars = text.match(/(.)\1{3,}/g);
    if (repeatedChars && repeatedChars.length > 0) return true;
    
    // Check for common English patterns
    const hasCommonWords = /\b(the|and|or|to|of|in|for|with|on|at|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|need|want|get|got|make|made|take|took|come|came|go|went|see|saw|know|knew|think|thought|say|said|tell|told|give|gave|find|found|work|worked|use|used|try|tried|ask|asked|seem|seemed|feel|felt|become|became|leave|left|put|put|mean|meant|keep|kept|let|let|begin|began|help|helped|show|showed|hear|heard|play|played|run|ran|move|moved|live|lived|believe|believed|bring|brought|happen|happened|write|wrote|provide|provided|sit|sat|stand|stood|lose|lost|pay|paid|meet|met|include|included|continue|continued|set|set|learn|learned|change|changed|lead|led|understand|understood|watch|watched|follow|followed|stop|stopped|create|created|speak|spoke|read|read|allow|allowed|add|added|spend|spent|grow|grew|open|opened|walk|walked|win|won|offer|offered|remember|remembered|love|loved|consider|considered|appear|appeared|buy|bought|wait|waited|serve|served|die|died|send|sent|expect|expected|build|built|stay|stayed|fall|fell|cut|cut|reach|reached|kill|killed|remain|remained|suggest|suggested|raise|raised|pass|passed|sell|sold|require|required|report|reported|decide|decided|pull|pulled|ai|agent|pipeline|model|convert|notebook|user|customer|feature|system|data|api|database|algorithm|machine|learning|artificial|intelligence|backend|frontend|infrastructure|architecture|integration|microservice|cloud|deployment|security|authentication|authorization|optimization|performance|scalability|framework|library|sdk)/i.test(text);
    
    return !hasCommonWords;
  }
  
  // Analyze technical complexity
  static getTechnicalComplexity(text: string): number {
    const techKeywords = [
      'ai', 'agent', 'pipeline', 'model', 'convert', 'notebook', 'algorithm', 'machine learning', 'artificial intelligence',
      'api', 'database', 'backend', 'frontend', 'infrastructure', 'architecture', 'integration',
      'microservice', 'cloud', 'deployment', 'security', 'authentication', 'authorization',
      'optimization', 'performance', 'scalability', 'framework', 'library', 'sdk'
    ];
    
    const lowerText = text.toLowerCase();
    const techScore = techKeywords.reduce((score, keyword) => {
      return lowerText.includes(keyword) ? score + 1 : score;
    }, 0);
    
    return Math.min(5, Math.max(1, 1 + techScore * 0.5));
  }
  
  // Analyze business impact potential
  static getBusinessImpact(text: string): number {
    const impactKeywords = [
      'user', 'customer', 'revenue', 'conversion', 'engagement', 'retention',
      'growth', 'market', 'competitive', 'efficiency', 'cost', 'save', 'profit',
      'experience', 'satisfaction', 'value', 'benefit', 'improvement', 'optimization',
      'pipeline', 'automation', 'workflow', 'productivity'
    ];
    
    const lowerText = text.toLowerCase();
    const impactScore = impactKeywords.reduce((score, keyword) => {
      return lowerText.includes(keyword) ? score + 1 : score;
    }, 0);
    
    return Math.min(5, Math.max(1, 2 + impactScore * 0.3));
  }
  
  // Analyze confidence based on specificity
  static getConfidence(text: string): number {
    if (this.isGibberish(text)) return 0.1;
    
    const specificityIndicators = [
      /\d+/, // Contains numbers
      /\b(specific|exactly|precisely|definitely|clearly|obviously)\b/i,
      /\b(will|should|must|need to|have to)\b/i,
      /\b(because|since|due to|as a result)\b/i,
      /\b(ai|agent|pipeline|model|convert|notebook)\b/i // PM/tech specific terms
    ];
    
    const specificityScore = specificityIndicators.reduce((score, pattern) => {
      return pattern.test(text) ? score + 0.15 : score;
    }, 0.5);
    
    return Math.min(1.0, Math.max(0.1, specificityScore));
  }
}

// Real Gemini AI scoring with intelligent LLM analysis
export const generateAIScores = async (title: string, notes: string, context?: ProductProfileContext): Promise<AIScoreResult> => {
  try {
    // Try Gemini API first for real AI analysis
    const geminiResult = await callGeminiAPI(title, notes, context);
    if (geminiResult) {
      return geminiResult;
    }
  } catch (error) {
    console.warn('Gemini API unavailable, using enhanced fallback:', error);
  }

  // Enhanced fallback system if Gemini API fails
  const fullText = `${title} ${notes}`.trim();
  
  // Check if content is gibberish
  if (ContentAnalyzer.isGibberish(fullText)) {
    return {
      reach: 10, // Very low reach for nonsensical ideas
      impact: 1, // Minimal impact
      confidence: 0.1, // Very low confidence
      effort: 1, // Assume minimal effort since it's not implementable
      reasoning: 'Content appears to be nonsensical or gibberish. Assigned minimal scores.',
      source: 'enhanced_fallback'
    };
  }
  
  // Intelligent scoring for meaningful content
  const technicalComplexity = ContentAnalyzer.getTechnicalComplexity(fullText);
  const businessImpact = ContentAnalyzer.getBusinessImpact(fullText);
  const confidence = ContentAnalyzer.getConfidence(fullText);
  
  // Calculate effort based on technical complexity and content length
  const effort = Math.min(5, Math.max(0.5, technicalComplexity * 0.8 + (fullText.length > 100 ? 0.5 : 0)));
  
  // Calculate reach based on business context
  const reach = Math.max(100, businessImpact * 500 + (fullText.includes('user') ? 1000 : 0));
  
  return {
    reach: Math.round(reach),
    impact: Math.round(businessImpact),
    confidence: Math.round(confidence * 100) / 100,
    effort: Math.round(effort * 10) / 10,
    reasoning: `Enhanced fallback analysis: complexity (${technicalComplexity}/5), business impact (${businessImpact}/5). Gemini API unavailable.`,
    source: 'enhanced_fallback'
  };
};

// Gemini API integration for real AI scoring
const callGeminiAPI = async (title: string, notes: string, context?: ProductProfileContext): Promise<AIScoreResult | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.');
    return null;
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = createGeminiPrompt(title, notes, context);
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    
    const text = result.text;
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    const parsedResult = parseGeminiResponse(text);
    // Mark as Gemini response for transparency display
    return {
      ...parsedResult,
      isGeminiResponse: true
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};

// Create specialized prompt for PM idea scoring with Product Profile context
const createGeminiPrompt = (title: string, notes: string, context?: ProductProfileContext): string => {
  // Build contextual information from Product Profile
  let contextSection = '';
  
  if (context) {
    contextSection = `

## PRODUCT CONTEXT
`;
    
    if (context.productName || context.oneLiner) {
      contextSection += `**Product**: ${context.productName || 'Not specified'}
`;
      if (context.oneLiner) {
        contextSection += `**Mission**: ${context.oneLiner}
`;
      }
      if (context.detailedDescription) {
        contextSection += `**Description**: ${context.detailedDescription}
`;
      }
    }
    
    if (context.northStarMetric?.name) {
      contextSection += `**North Star Metric**: ${context.northStarMetric.name} (Current: ${context.northStarMetric.value} ${context.northStarMetric.unit}, Target: ${context.northStarMetric.target})
`;
    }
    
    if (context.audienceScale) {
      contextSection += `**Audience Scale**: 
`;
      if (context.audienceScale.targetAudience) {
        contextSection += `  - Target Audience: ${context.audienceScale.targetAudience}
`;
      }
      if (context.audienceScale.mau) {
        contextSection += `  - Monthly Active Users: ${context.audienceScale.mau}
`;
      }
      if (context.audienceScale.wau) {
        contextSection += `  - Weekly Active Users: ${context.audienceScale.wau}
`;
      }
      if (context.audienceScale.activeAccounts) {
        contextSection += `  - Active Accounts: ${context.audienceScale.activeAccounts}
`;
      }
    }
    
    if (context.businessContext) {
      contextSection += `**Business Context**: 
`;
      contextSection += `  - Industry: ${context.businessContext.industry}
`;
      contextSection += `  - Business Model: ${context.businessContext.businessModel}
`;
      contextSection += `  - Product Stage: ${context.businessContext.productStage}
`;
    }
    
    if (context.funnelChannels) {
      contextSection += `**Distribution & Engagement**: 
`;
      if (context.funnelChannels.touchpoints?.length > 0) {
        contextSection += `  - Touchpoints: ${context.funnelChannels.touchpoints.join(', ')}
`;
      }
      if (context.funnelChannels.exposureRate) {
        contextSection += `  - Exposure Rate: ${context.funnelChannels.exposureRate}%
`;
      }
      if (context.funnelChannels.openRate) {
        contextSection += `  - Open Rate: ${context.funnelChannels.openRate}%
`;
      }
      if (context.funnelChannels.clickRate) {
        contextSection += `  - Click Rate: ${context.funnelChannels.clickRate}%
`;
      }
    }
    
    if (context.teamEffortUnits) {
      contextSection += `**Team & Resources**: 
`;
      if (context.teamEffortUnits.teamSize) {
        contextSection += `  - Team Size: ${context.teamEffortUnits.teamSize} people
`;
      }
      if (context.teamEffortUnits.monthlyPersonMonths) {
        contextSection += `  - Monthly Capacity: ${context.teamEffortUnits.monthlyPersonMonths} ${context.teamEffortUnits.effortUnitPreference}
`;
      }
    }
    
    if (context.constraintsRisk) {
      contextSection += `**Constraints & Risk**: 
`;
      contextSection += `  - Risk Tolerance: ${context.constraintsRisk.riskTolerance}
`;
      if (context.constraintsRisk.regulatoryConstraints && context.constraintsRisk.regulatoryDetails) {
        contextSection += `  - Regulatory Constraints: ${context.constraintsRisk.regulatoryDetails}
`;
      }
      if (context.constraintsRisk.performanceConstraints) {
        contextSection += `  - Performance Constraints: ${context.constraintsRisk.performanceConstraints}
`;
      }
      if (context.constraintsRisk.infrastructureConstraints) {
        contextSection += `  - Infrastructure Constraints: ${context.constraintsRisk.infrastructureConstraints}
`;
      }
    }
  }
  
  return `You are a senior product manager with 10+ years of experience. Analyze this product idea and provide ICE/RICE scoring based on the specific product context provided.${contextSection}

## FEATURE/IDEA TO ANALYZE
Title: "${title}"
Description: "${notes || 'No additional description provided'}"

## SCORING INSTRUCTIONS
Using the product context above, provide scores for:

1. **Impact**: How much will this positively affect the North Star Metric and key business objectives? Consider the specific product stage, audience scale, and business model. (1=minimal impact, 5=massive impact)

2. **Confidence**: How confident are you in your estimates given the product context, constraints, and available information? Consider the risk tolerance and any regulatory/technical constraints. (0.1=10% confident, 1.0=100% confident)

3. **Effort**: How much development work is required considering the team size, capacity, and technical constraints mentioned? (0.1=minimal effort, 5=massive effort)

4. **Reach**: How many users/customers will this affect based on the audience scale and distribution channels? Use the MAU/WAU numbers and touchpoints as reference. (number, e.g., 1000, 5000, 50000)

## CONTEXTUAL CONSIDERATIONS
- Align impact scoring with the North Star Metric and business model
- Factor in the product stage (early stage ideas may have higher uncertainty)
- Consider the team capacity and constraints when estimating effort
- Use the audience scale data to ground reach estimates in reality
- Account for distribution channels and engagement rates
- Respect the stated risk tolerance and constraints

Respond in this exact JSON format:
{
  "impact": [number 1-5],
  "confidence": [number 0.1-1.0],
  "effort": [number 0.1-5],
  "reach": [number],
  "reasoning": "Brief explanation of your scoring rationale, specifically referencing how the product context influenced your scoring decisions"
}

IMPORTANT: Respond ONLY with valid JSON, no additional text.`;
};

// Parse Gemini API response
const parseGeminiResponse = (response: string): AIScoreResult => {
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the response
    return {
      reach: parsed.reach ? Math.max(1, Math.round(parsed.reach)) : 1000,
      impact: Math.max(1, Math.min(5, Math.round(parsed.impact || 3))),
      confidence: Math.max(0.1, Math.min(1.0, parsed.confidence || 0.8)),
      effort: Math.max(0.1, Math.min(5, parsed.effort || 2)),
      reasoning: parsed.reasoning || 'Gemini AI analysis completed',
      source: 'gemini_api'
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    throw new Error('Invalid Gemini API response format');
  }
};
