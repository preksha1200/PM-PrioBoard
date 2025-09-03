import type { Persisted, Settings, Idea, ScoringModel } from '../types';
import { DEFAULT_WEIGHTS } from '../score';

const STORAGE_KEY = 'pm_prioboard_v1';

export const DEFAULT_SETTINGS: Settings = {
  model: 'ICE',
  weights: DEFAULT_WEIGHTS,
  mode: 'assisted',
  chart: {
    useMedians: true
  }
};

export const SEED_DATA: Idea[] = [
  {
    id: '1',
    title: 'Reduce pipeline retry failures via backoff',
    reach: 300,
    impact: 2,
    confidence: 0.7,
    effort: 1.5,
    tags: ['infra', 'reliability'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  },
  {
    id: '2',
    title: 'Inline status update generator for PMs',
    reach: 500,
    impact: 2,
    confidence: 0.8,
    effort: 1,
    tags: ['feature', 'ai'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  },
  {
    id: '3',
    title: 'Kubeflow run summarizer',
    reach: 120,
    impact: 3,
    confidence: 0.6,
    effort: 2,
    tags: ['infra', 'ai'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  },
  {
    id: '4',
    title: 'Improve onboarding copy',
    reach: 2000,
    impact: 0.5,
    confidence: 0.9,
    effort: 0.2,
    tags: ['ui', 'growth'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  },
  {
    id: '5',
    title: 'Model registry diff explainer',
    reach: 150,
    impact: 2,
    confidence: 0.7,
    effort: 1.2,
    tags: ['infra', 'ml'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  },
  {
    id: '6',
    title: 'Idea board quadrant polish',
    reach: 800,
    impact: 1,
    confidence: 0.8,
    effort: 0.6,
    tags: ['ui'],
    createdAt: new Date().toISOString(),
    provenance: {
      reach: 'user',
      impact: 'user',
      confidence: 'user',
      effort: 'user'
    }
  }
];

export function loadData(): Persisted {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First time - return seed data
      return {
        ideas: SEED_DATA,
        settings: DEFAULT_SETTINGS,
        version: 1
      };
    }
    
    const parsed = JSON.parse(stored) as Persisted;
    
    // Handle version migrations if needed
    if (parsed.version !== 1) {
      console.warn('Unsupported data version, resetting to defaults');
      return {
        ideas: SEED_DATA,
        settings: DEFAULT_SETTINGS,
        version: 1
      };
    }
    
    // Merge with defaults to handle missing settings
    return {
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
        weights: {
          ...DEFAULT_WEIGHTS,
          ...parsed.settings.weights
        },
        chart: {
          ...DEFAULT_SETTINGS.chart,
          ...parsed.settings.chart
        }
      }
    };
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    return {
      ideas: SEED_DATA,
      settings: DEFAULT_SETTINGS,
      version: 1
    };
  }
}

export function saveData(data: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
    throw new Error('Failed to save data. Storage may be full.');
  }
}

export function exportToCSV(ideas: Idea[], model: ScoringModel): string {
  const headers = model === 'RICE' 
    ? ['title', 'notes', 'reach', 'impact', 'confidence', 'effort', 'score', 'tags']
    : ['title', 'notes', 'impact', 'confidence', 'effort', 'score', 'tags'];
    
  const rows = ideas.map(idea => {
    const baseRow = [
      `"${idea.title.replace(/"/g, '""')}"`,
      `"${(idea.notes || '').replace(/"/g, '""')}"`,
    ];
    
    if (model === 'RICE') {
      baseRow.push(String(idea.reach || ''));
    }
    
    baseRow.push(
      String(idea.impact),
      String(idea.confidence),
      String(idea.effort),
      String(idea.score?.toFixed(2) || ''),
      `"${(idea.tags || []).join(', ')}"`
    );
    
    return baseRow.join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

export function exportToMarkdown(ideas: Idea[], model: ScoringModel): string {
  const date = new Date().toLocaleDateString();
  const sortedIdeas = [...ideas].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  let markdown = `# PM PrioBoard Export (${model})\n\n`;
  markdown += `Generated on ${date}\n\n`;
  
  // Group by quadrants (simplified)
  const quickWins = sortedIdeas.filter(idea => (idea.impact >= 2 && idea.effort <= 1));
  const bigBets = sortedIdeas.filter(idea => (idea.impact >= 2 && idea.effort > 1));
  const maybes = sortedIdeas.filter(idea => (idea.impact < 2 && idea.effort <= 1));
  const timeSinks = sortedIdeas.filter(idea => (idea.impact < 2 && idea.effort > 1));
  
  const sections = [
    { title: '🚀 Quick Wins', ideas: quickWins },
    { title: '🎯 Big Bets', ideas: bigBets },
    { title: '🤔 Maybes', ideas: maybes },
    { title: '⚠️ Time Sinks', ideas: timeSinks }
  ];
  
  sections.forEach(section => {
    if (section.ideas.length > 0) {
      markdown += `## ${section.title}\n\n`;
      section.ideas.forEach(idea => {
        markdown += `### ${idea.title}\n`;
        if (idea.notes) markdown += `${idea.notes}\n\n`;
        markdown += `**Score:** ${idea.score?.toFixed(2) || 'N/A'} | `;
        if (model === 'RICE') markdown += `**Reach:** ${idea.reach || 'N/A'} | `;
        markdown += `**Impact:** ${idea.impact} | **Confidence:** ${Math.round((idea.confidence || 0) * 100)}% | **Effort:** ${idea.effort} months\n`;
        if (idea.tags?.length) markdown += `**Tags:** ${idea.tags.join(', ')}\n`;
        markdown += '\n---\n\n';
      });
    }
  });
  
  return markdown;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
