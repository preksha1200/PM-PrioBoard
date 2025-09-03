// Enhanced PM PrioBoard - JavaScript Version with Full Functionality
import { calculateScore, sortIdeasByScore, validateIdea } from './score';
import { loadData, saveData, exportToCSV } from './utils/persistence';
import { parseStructuredText } from './utils/parser';
import type { Idea, ScoringModel, Settings } from './types';

console.log('🚀 PM PrioBoard - Enhanced JavaScript Version');

// Global state
let ideas: Idea[] = [];
let settings: Settings = {
  model: 'ICE' as ScoringModel,
  weights: { impact: 1, confidence: 1, effort: 1, reach: 1 }
};
let selectedIdea: Idea | null = null;
let isDarkMode = false;

// Initialize app
function initEnhancedApp() {
  console.log('Initializing Enhanced PM PrioBoard...');
  
  // Load data from localStorage
  const data = loadData();
  ideas = data.ideas;
  settings = data.settings;
  
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
    return;
  }
  
  renderApp(root);
  setupEventListeners();
  
  console.log('✅ Enhanced PM PrioBoard initialized successfully!');
}

// Main render function
function renderApp(root: HTMLElement) {
  root.innerHTML = `
    <div id="app" class="${isDarkMode ? 'dark' : ''}" style="min-height: 100vh; background: ${isDarkMode ? '#111827' : '#f9fafb'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; transition: all 0.3s;">
      <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: ${isDarkMode ? '#1f2937' : 'white'}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px; transition: all 0.3s;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${isDarkMode ? '#f9fafb' : '#111827'}; display: flex; align-items: center; gap: 8px;">
              🎯 PM PrioBoard
              <span style="font-size: 14px; font-weight: 400; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; background: ${isDarkMode ? '#374151' : '#f3f4f6'}; padding: 4px 8px; border-radius: 4px;">
                ${ideas.length} ideas
              </span>
            </h1>
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <select id="modelSelect" style="border: 1px solid ${isDarkMode ? '#374151' : '#d1d5db'}; background: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f9fafb' : '#111827'}; border-radius: 8px; padding: 8px 12px; font-size: 14px;">
                <option value="ICE" ${settings.model === 'ICE' ? 'selected' : ''}>ICE Model</option>
                <option value="RICE" ${settings.model === 'RICE' ? 'selected' : ''}>RICE Model</option>
              </select>
              <button id="weightsBtn" style="background: ${isDarkMode ? '#4f46e5' : '#6366f1'}; color: white; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                ⚖️ Weights
              </button>
              <button id="exportBtn" style="background: ${isDarkMode ? '#059669' : '#10b981'}; color: white; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                📤 Export
              </button>
              <button id="themeToggle" style="background: ${isDarkMode ? '#f59e0b' : '#3b82f6'}; color: white; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-size: 14px; transition: all 0.2s;">
                ${isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Add Ideas Section -->
        <div style="background: ${isDarkMode ? '#1f2937' : 'white'}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: ${isDarkMode ? '#f9fafb' : '#111827'};">💡 Add Ideas</h2>
          <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end;">
            <div>
              <textarea id="ideasInput" placeholder="Enter ideas (one per line) or use structured format:&#10;Mobile App Redesign | I:3 | C:0.8 | E:2 | R:1000 | T:ui,mobile" 
                style="width: 100%; min-height: 80px; border: 1px solid ${isDarkMode ? '#374151' : '#d1d5db'}; background: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f9fafb' : '#111827'}; border-radius: 8px; padding: 12px; font-size: 14px; font-family: inherit; resize: vertical;"></textarea>
              <div style="font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-top: 4px;">
                Structured format: Title | I:impact | C:confidence | E:effort | R:reach | T:tag1,tag2
              </div>
            </div>
            <button id="addIdeasBtn" style="background: ${isDarkMode ? '#059669' : '#10b981'}; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-size: 14px; font-weight: 500; white-space: nowrap;">
              + Add Ideas
            </button>
          </div>
        </div>
        
        <!-- Main Content Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          
          <!-- Ideas List -->
          <div style="background: ${isDarkMode ? '#1f2937' : 'white'}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: ${isDarkMode ? '#f9fafb' : '#111827'};">📋 Ideas (${ideas.length})</h2>
              <select id="sortSelect" style="border: 1px solid ${isDarkMode ? '#374151' : '#d1d5db'}; background: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f9fafb' : '#111827'}; border-radius: 6px; padding: 4px 8px; font-size: 12px;">
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
                <option value="created">Sort by Created</option>
              </select>
            </div>
            <div id="ideasList" style="max-height: 400px; overflow-y: auto;">
              ${renderIdeasList()}
            </div>
          </div>
          
          <!-- Chart Panel -->
          <div style="background: ${isDarkMode ? '#1f2937' : 'white'}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: ${isDarkMode ? '#f9fafb' : '#111827'};">📊 Impact vs Effort</h2>
            <div id="chartContainer" style="height: 400px; background: ${isDarkMode ? '#374151' : '#f3f4f6'}; border-radius: 8px; position: relative;">
              ${renderChart()}
            </div>
          </div>
          
        </div>
        
        <!-- Status Bar -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 16px; color: white; text-align: center;">
          <div style="font-weight: 600; margin-bottom: 4px;">✅ PM PrioBoard Enhanced - Fully Functional</div>
          <div style="font-size: 14px; opacity: 0.9;">
            Current Model: ${settings.model} | 
            Valid Ideas: ${ideas.filter(idea => validateIdea(idea, settings.model).length === 0).length} | 
            Total Score: ${ideas.reduce((sum, idea) => sum + (calculateScore(idea, settings.model, settings.weights) || 0), 0).toFixed(1)}
          </div>
        </div>
        
      </div>
    </div>
  `;
}

// Render ideas list
function renderIdeasList(): string {
  if (ideas.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">
        <div style="font-size: 48px; margin-bottom: 16px;">💡</div>
        <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No ideas yet</div>
        <div style="font-size: 14px;">Add your first idea above to get started with prioritization</div>
      </div>
    `;
  }
  
  const sortedIdeas = sortIdeasByScore(ideas, settings.model, settings.weights);
  
  return sortedIdeas.map((idea, index) => {
    const score = calculateScore(idea, settings.model, settings.weights);
    const isValid = validateIdea(idea, settings.model).length === 0;
    
    return `
      <div class="idea-item" data-id="${idea.id}" style="border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}; border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; background: ${isDarkMode ? '#374151' : 'white'};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-weight: 600; color: ${isDarkMode ? '#f9fafb' : '#111827'}; font-size: 16px; line-height: 1.4;">
            <span style="color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; font-weight: 400; margin-right: 8px;">#${index + 1}</span>
            ${idea.title}
          </h3>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${score !== undefined ? `
              <span style="background: ${getScoreColor(score)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${score.toFixed(1)}
              </span>
            ` : `
              <span style="background: ${isDarkMode ? '#6b7280' : '#9ca3af'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                N/A
              </span>
            `}
            <button class="delete-idea" data-id="${idea.id}" style="background: none; border: none; color: ${isDarkMode ? '#ef4444' : '#dc2626'}; cursor: pointer; padding: 4px; font-size: 16px;">×</button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; font-size: 12px; color: ${isDarkMode ? '#d1d5db' : '#4b5563'};">
          <div><strong>Impact:</strong> ${idea.impact || 'N/A'}</div>
          <div><strong>Confidence:</strong> ${idea.confidence || 'N/A'}</div>
          <div><strong>Effort:</strong> ${idea.effort || 'N/A'}</div>
          ${settings.model === 'RICE' ? `<div><strong>Reach:</strong> ${idea.reach || 'N/A'}</div>` : ''}
        </div>
        ${idea.tags && idea.tags.length > 0 ? `
          <div style="margin-top: 8px;">
            ${idea.tags.map(tag => `<span style="background: ${isDarkMode ? '#4f46e5' : '#6366f1'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-right: 4px;">${tag}</span>`).join('')}
          </div>
        ` : ''}
        ${!isValid ? `
          <div style="margin-top: 8px; padding: 6px; background: ${isDarkMode ? '#7f1d1d' : '#fef2f2'}; border-radius: 4px; font-size: 12px; color: ${isDarkMode ? '#fca5a5' : '#dc2626'};">
            ⚠️ ${validateIdea(idea, settings.model).join(', ')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render simple chart
function renderChart(): string {
  if (ideas.length === 0) {
    return `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
          <div>Chart will appear when you add ideas</div>
        </div>
      </div>
    `;
  }
  
  // Simple scatter plot representation
  const validIdeas = ideas.filter(idea => idea.impact !== undefined && idea.effort !== undefined);
  const maxImpact = Math.max(...validIdeas.map(idea => idea.impact!));
  const maxEffort = Math.max(...validIdeas.map(idea => idea.effort!));
  
  return `
    <svg width="100%" height="100%" viewBox="0 0 400 400" style="background: ${isDarkMode ? '#1f2937' : 'white'}; border-radius: 8px;">
      <!-- Grid lines -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${isDarkMode ? '#374151' : '#e5e7eb'}" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Axes -->
      <line x1="50" y1="350" x2="350" y2="350" stroke="${isDarkMode ? '#9ca3af' : '#6b7280'}" stroke-width="2"/>
      <line x1="50" y1="50" x2="50" y2="350" stroke="${isDarkMode ? '#9ca3af' : '#6b7280'}" stroke-width="2"/>
      
      <!-- Labels -->
      <text x="200" y="380" text-anchor="middle" fill="${isDarkMode ? '#d1d5db' : '#4b5563'}" font-size="14">Effort →</text>
      <text x="25" y="200" text-anchor="middle" fill="${isDarkMode ? '#d1d5db' : '#4b5563'}" font-size="14" transform="rotate(-90, 25, 200)">← Impact</text>
      
      <!-- Quadrant labels -->
      <text x="125" y="130" text-anchor="middle" fill="${isDarkMode ? '#10b981' : '#059669'}" font-size="12" font-weight="bold">Quick Wins</text>
      <text x="275" y="130" text-anchor="middle" fill="${isDarkMode ? '#f59e0b' : '#d97706'}" font-size="12" font-weight="bold">Major Projects</text>
      <text x="125" y="320" text-anchor="middle" fill="${isDarkMode ? '#ef4444' : '#dc2626'}" font-size="12" font-weight="bold">Fill-ins</text>
      <text x="275" y="320" text-anchor="middle" fill="${isDarkMode ? '#6b7280' : '#9ca3af'}" font-size="12" font-weight="bold">Thankless Tasks</text>
      
      <!-- Data points -->
      ${validIdeas.map(idea => {
        const x = 50 + (idea.effort! / maxEffort) * 300;
        const y = 350 - (idea.impact! / maxImpact) * 300;
        const score = calculateScore(idea, settings.model, settings.weights);
        return `
          <circle cx="${x}" cy="${y}" r="6" fill="${getScoreColor(score || 0)}" stroke="white" stroke-width="2" opacity="0.8">
            <title>${idea.title} (${score?.toFixed(1) || 'N/A'})</title>
          </circle>
        `;
      }).join('')}
    </svg>
  `;
}

// Get color based on score
function getScoreColor(score: number): string {
  if (score >= 3) return '#10b981'; // Green
  if (score >= 2) return '#f59e0b'; // Yellow
  if (score >= 1) return '#ef4444'; // Red
  return '#6b7280'; // Gray
}

// Setup event listeners
function setupEventListeners() {
  // Model selector
  const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
  modelSelect?.addEventListener('change', (e) => {
    settings.model = (e.target as HTMLSelectElement).value as ScoringModel;
    saveSettings();
    renderApp(document.getElementById('root')!);
    setupEventListeners();
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    renderApp(document.getElementById('root')!);
    setupEventListeners();
  });
  
  // Add ideas
  const addIdeasBtn = document.getElementById('addIdeasBtn');
  const ideasInput = document.getElementById('ideasInput') as HTMLTextAreaElement;
  
  addIdeasBtn?.addEventListener('click', () => {
    const input = ideasInput?.value.trim();
    if (!input) return;
    
    try {
      const newIdeas = parseStructuredText(input);
      ideas.push(...newIdeas);
      saveData({ ideas, settings, version: 1 });
      ideasInput.value = '';
      renderApp(document.getElementById('root')!);
      setupEventListeners();
    } catch (error) {
      alert('Error parsing ideas: ' + error);
    }
  });
  
  // Delete ideas
  document.querySelectorAll('.delete-idea').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.target as HTMLElement).dataset.id;
      if (id && confirm('Delete this idea?')) {
        ideas = ideas.filter(idea => idea.id !== id);
        saveData({ ideas, settings, version: 1 });
        renderApp(document.getElementById('root')!);
        setupEventListeners();
      }
    });
  });
  
  // Export
  const exportBtn = document.getElementById('exportBtn');
  exportBtn?.addEventListener('click', () => {
    const csv = exportToCSV(ideas, settings.model);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pm-prioboard-${settings.model.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Save settings
function saveSettings() {
  saveData({ ideas, settings, version: 1 });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedApp);
} else {
  initEnhancedApp();
}
