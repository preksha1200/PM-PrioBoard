import React from 'react';
import ReactDOM from 'react-dom/client';
import FigmaApp from './figma-app';
import './globals.css';

console.log('🚀 PM PrioBoard - Figma Implementation');

// Simple scoring functions (inline to avoid import issues)
function calculateSimpleScore(idea: any, model: string) {
  if (!idea.impact || !idea.confidence || !idea.effort) return null;
  
  if (model === 'ICE') {
    return (idea.impact * idea.confidence) / idea.effort;
  } else if (model === 'RICE') {
    if (!idea.reach) return null;
    return (idea.reach * idea.impact * idea.confidence) / idea.effort;
  }
  return null;
}

function sortIdeasByScore(ideas: any[], model: string) {
  return [...ideas].sort((a, b) => {
    const scoreA = calculateSimpleScore(a, model) || 0;
    const scoreB = calculateSimpleScore(b, model) || 0;
    return scoreB - scoreA;
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function parseSimpleText(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  const newIdeas = [];
  
  for (const line of lines) {
    if (line.includes('|')) {
      // Structured format: Title | I:2 | C:0.8 | E:1.5 | R:1000
      const parts = line.split('|').map(p => p.trim());
      const idea: any = {
        id: generateId(),
        title: parts[0],
        createdAt: new Date().toISOString()
      };
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('I:')) idea.impact = parseFloat(part.substring(2));
        else if (part.startsWith('C:')) idea.confidence = parseFloat(part.substring(2));
        else if (part.startsWith('E:')) idea.effort = parseFloat(part.substring(2));
        else if (part.startsWith('R:')) idea.reach = parseFloat(part.substring(2));
        else if (part.startsWith('T:')) idea.tags = part.substring(2).split(',').map(t => t.trim());
      }
      
      newIdeas.push(idea);
    } else {
      // Simple title only
      newIdeas.push({
        id: generateId(),
        title: line.trim(),
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return newIdeas;
}

// Local storage functions
function saveToStorage() {
  try {
    localStorage.setItem('pm_prioboard_v1', JSON.stringify({
      ideas,
      settings: { model: currentModel },
      version: 1
    }));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem('pm_prioboard_v1');
    if (data) {
      const parsed = JSON.parse(data);
      ideas = parsed.ideas || [];
      currentModel = parsed.settings?.model || 'ICE';
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
}

// Initialize app
function initEnhancedApp() {
  console.log('Initializing Enhanced PM PrioBoard...');
  
  // Load data from localStorage
  loadFromStorage();
  
  // Add sample data if empty
  if (ideas.length === 0) {
    ideas = [
      { id: '1', title: 'Mobile App Redesign', impact: 3, confidence: 0.8, effort: 2, reach: 1000, tags: ['ui', 'mobile'], createdAt: new Date().toISOString() },
      { id: '2', title: 'API Performance Optimization', impact: 2, confidence: 0.9, effort: 1, reach: 500, tags: ['backend', 'performance'], createdAt: new Date().toISOString() },
      { id: '3', title: 'User Analytics Dashboard', impact: 2.5, confidence: 0.7, effort: 1.5, reach: 800, tags: ['analytics', 'dashboard'], createdAt: new Date().toISOString() },
      { id: '4', title: 'Social Media Integration', impact: 1.5, confidence: 0.6, effort: 2.5, reach: 1200, tags: ['social', 'integration'], createdAt: new Date().toISOString() }
    ];
    saveToStorage();
  }
  
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
    return;
  }
  
  renderApp(root);
  setupEventListeners();
  
  console.log('✅ Enhanced PM PrioBoard initialized with', ideas.length, 'ideas');
}

// Main render function
function renderApp(root: HTMLElement) {
  root.innerHTML = `
    <div style="min-height: 100vh; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      
      <!-- Professional Header -->
      <div style="background: white; border-bottom: 1px solid #A8DADC; padding: 16px 24px;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 24px;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #1D3557;">PM PrioBoard</h1>
            <div style="display: inline-flex; background: #A8DADC; border-radius: 20px; padding: 3px;">
              <button id="iceBtn" class="model-btn" style="padding: 8px 20px; border: none; border-radius: 16px; background: #457B9D; color: white; font-size: 14px; cursor: pointer; font-weight: 500; transition: all 0.2s; min-width: 60px;">ICE</button>
              <button id="riceBtn" class="model-btn" style="padding: 8px 20px; border: none; border-radius: 16px; background: transparent; color: #1D3557; font-size: 14px; cursor: pointer; font-weight: 500; transition: all 0.2s; min-width: 60px;">RICE</button>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button id="advancedWeights" style="padding: 8px 16px; border: 1px solid #A8DADC; border-radius: 6px; background: white; color: #1D3557; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
              ⚙ Advanced weights
            </button>
            <button id="importBtn" style="padding: 8px 16px; border: 1px solid #A8DADC; border-radius: 6px; background: white; color: #1D3557; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
              ↑ Import
            </button>
            <button id="exportBtn" style="padding: 8px 16px; border: 1px solid #A8DADC; border-radius: 6px; background: white; color: #1D3557; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
              ↓ Export
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="max-width: 1400px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        
        <!-- Left Panel: Ideas Input -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Add Ideas Card -->
          <div style="background: white; border: 1px solid #A8DADC; border-radius: 8px; padding: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span style="color: #E63946; font-size: 18px;">+</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1D3557;">Add Ideas</h3>
            </div>
            
            <div style="margin-bottom: 16px;">
              <textarea id="ideasInput" placeholder="Enter one idea per line." style="width: 100%; height: 120px; padding: 12px; border: 1px solid #A8DADC; border-radius: 6px; font-size: 14px; resize: vertical; background: #F1FAEE;"></textarea>
            </div>
            
            <div style="font-size: 12px; color: #457B9D; margin-bottom: 16px;">
              Advanced format: Title | I:5 | C:0.8 | E:1.5 | R:100 | T:feature,ui
            </div>
            
            <div style="margin-bottom: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1D3557;">
                <input type="checkbox" id="defaultTags" checked style="margin: 0;">
                Default Tags (applied to all ideas)
              </label>
              <div style="font-size: 12px; color: #457B9D; margin-top: 4px;">
                Enter tags separated by commas (e.g., feature, ui, high-priority)
              </div>
            </div>
            
            <!-- Scoring Method -->
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1D3557;">Scoring Method</h4>
              <div style="display: flex; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #457B9D; border-radius: 6px; background: #F1FAEE; cursor: pointer; flex: 1;">
                  <input type="radio" name="scoringMethod" value="manual" checked style="margin: 0;">
                  <div>
                    <div style="font-weight: 600; color: #457B9D; font-size: 14px;">Manual Scoring</div>
                    <div style="font-size: 12px; color: #1D3557;">Set uniform scores for all ideas</div>
                  </div>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #A8DADC; border-radius: 6px; background: white; cursor: pointer; flex: 1;">
                  <input type="radio" name="scoringMethod" value="ai" style="margin: 0;">
                  <div>
                    <div style="font-weight: 600; color: #1D3557; font-size: 14px;">✨ AI Suggested Scoring</div>
                    <div style="font-size: 12px; color: #457B9D;">Let AI analyze and suggest scores</div>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Score Values -->
            <div id="scoreValues" style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1D3557;">Score Values (applied to all ideas)</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; font-size: 12px; color: #457B9D; margin-bottom: 4px;">Reach</label>
                  <input type="number" id="reachInput" value="100" style="width: 100%; padding: 8px; border: 1px solid #A8DADC; border-radius: 4px; font-size: 14px;">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; color: #457B9D; margin-bottom: 4px;">Impact (1-10)</label>
                  <input type="number" id="impactInput" value="5" min="1" max="10" style="width: 100%; padding: 8px; border: 1px solid #A8DADC; border-radius: 4px; font-size: 14px;">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; color: #457B9D; margin-bottom: 4px;">Confidence (0-1)</label>
                  <input type="number" id="confidenceInput" value="0.8" min="0" max="1" step="0.1" style="width: 100%; padding: 8px; border: 1px solid #A8DADC; border-radius: 4px; font-size: 14px;">
                </div>
                <div>
                  <label style="display: block; font-size: 12px; color: #457B9D; margin-bottom: 4px;">Effort (1-12)</label>
                  <input type="number" id="effortInput" value="3" min="1" max="12" style="width: 100%; padding: 8px; border: 1px solid #A8DADC; border-radius: 4px; font-size: 14px;">
                </div>
              </div>
            </div>
            
            <button id="addIdeasBtn" style="width: 100%; padding: 12px; background: #E63946; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s;">
              Add Ideas
            </button>
            
            <div style="text-align: center; margin: 16px 0; color: #457B9D; font-size: 12px;">or</div>
            
            <!-- Upload CSV -->
            <div style="border: 2px dashed #A8DADC; border-radius: 6px; padding: 20px; text-align: center;">
              <div style="margin-bottom: 8px; color: #1D3557;">📁 Upload CSV</div>
              <div style="font-size: 12px; color: #457B9D; margin-bottom: 12px;">
                Expected columns: title, notes, reach, impact, confidence, effort, tags
              </div>
              <input type="file" id="csvUpload" accept=".csv" style="display: none;">
              <button id="csvUploadBtn" style="padding: 8px 16px; border: 1px solid #A8DADC; border-radius: 4px; background: white; color: #1D3557; cursor: pointer; font-size: 12px; transition: all 0.2s;">
                Choose File
              </button>
            </div>
          </div>
          
        </div>
        
        <!-- Right Panel: Chart and Table -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Impact vs Effort Chart -->
          <div style="background: white; border: 1px solid #A8DADC; border-radius: 8px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1D3557;">Impact vs Effort</h3>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #457B9D;">
                <input type="checkbox" id="showLabels" checked style="margin: 0;">
                Show labels
              </label>
            </div>
            <div id="chartContainer" style="height: 300px; border: 1px solid #A8DADC; border-radius: 6px; position: relative; background: #F1FAEE;">
              <!-- Chart will be rendered here -->
            </div>
            <div style="font-size: 12px; color: #457B9D; margin-top: 8px;">
              Hover options for details • Click to view breakdown • Drag ideas to reduce clutter
            </div>
          </div>
          
        </div>
        
      </div>
      
      <!-- Ideas Table -->
      <div style="max-width: 1400px; margin: 0 auto; padding: 0 24px 24px;">
        <div style="background: white; border: 1px solid #A8DADC; border-radius: 8px; overflow: hidden;">
          <div style="padding: 20px; border-bottom: 1px solid #A8DADC;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1D3557;">Ideas</h3>
          </div>
          <div style="overflow-x: auto;">
            <table id="ideasTable" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #F1FAEE; border-bottom: 1px solid #A8DADC;">
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Title</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Reach</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Impact</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Confidence</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Effort</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Score</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Tags</th>
                  <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #1D3557; font-size: 12px; text-transform: uppercase;">Actions</th>
                </tr>
              </thead>
              <tbody id="ideasTableBody">
                <!-- Table rows will be rendered here -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  `;
  
  // Set up professional interface event listeners
  setupProfessionalEventListeners();
  
  // Render initial data
  renderChart();
  renderIdeasTable();
  
  console.log('✅ PM PrioBoard initialized successfully!');
}

// Professional interface event listeners
function setupProfessionalEventListeners() {
  // Model toggle buttons
  const iceBtn = document.getElementById('iceBtn');
  const riceBtn = document.getElementById('riceBtn');
  
  if (iceBtn && riceBtn) {
    iceBtn.addEventListener('click', () => switchModel('ICE'));
    riceBtn.addEventListener('click', () => switchModel('RICE'));
  }
  
  // Header buttons
  const advancedWeights = document.getElementById('advancedWeights');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  if (advancedWeights) {
    advancedWeights.addEventListener('click', () => {
      alert('Advanced Weights modal coming soon!');
    });
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      document.getElementById('csvUpload')?.click();
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Ideas input
  const addIdeasBtn = document.getElementById('addIdeasBtn');
  const csvUploadBtn = document.getElementById('csvUploadBtn');
  const csvUpload = document.getElementById('csvUpload');
  
  if (addIdeasBtn) {
    addIdeasBtn.addEventListener('click', addIdeasFromInput);
  }
  
  if (csvUploadBtn) {
    csvUploadBtn.addEventListener('click', () => {
      csvUpload?.click();
    });
  }
  
  if (csvUpload) {
    csvUpload.addEventListener('change', handleCSVUpload);
  }
  
  // Scoring method radio buttons
  const scoringRadios = document.querySelectorAll('input[name="scoringMethod"]');
  scoringRadios.forEach(radio => {
    radio.addEventListener('change', updateScoringMethod);
  });
  
  console.log('✅ Professional event listeners set up');
}

// Switch between ICE and RICE models
function switchModel(model: string) {
  currentModel = model;
  
  // Update button styles
  const iceBtn = document.getElementById('iceBtn');
  const riceBtn = document.getElementById('riceBtn');
  
  if (iceBtn && riceBtn) {
    if (model === 'ICE') {
      iceBtn.style.background = '#457B9D';
      iceBtn.style.color = 'white';
      riceBtn.style.background = 'transparent';
      riceBtn.style.color = '#1D3557';
    } else {
      riceBtn.style.background = '#457B9D';
      riceBtn.style.color = 'white';
      iceBtn.style.background = 'transparent';
      iceBtn.style.color = '#1D3557';
    }
  }
  
  // Update reach input visibility
  const reachInput = document.getElementById('reachInput')?.parentElement;
  if (reachInput) {
    reachInput.style.display = model === 'RICE' ? 'block' : 'none';
  }
  
  saveToStorage();
  renderChart();
  renderIdeasTable();
  
  console.log('Switched to', model, 'model');
}

// Add ideas from text input
function addIdeasFromInput() {
  const input = document.getElementById('ideasInput') as HTMLTextAreaElement;
  const text = input?.value.trim();
  
  if (!text) {
    alert('Please enter some ideas first.');
    return;
  }
  
  const newIdeas = parseSimpleText(text);
  
  // Apply default scoring values if not specified
  const reach = parseFloat((document.getElementById('reachInput') as HTMLInputElement)?.value || '100');
  const impact = parseFloat((document.getElementById('impactInput') as HTMLInputElement)?.value || '5');
  const confidence = parseFloat((document.getElementById('confidenceInput') as HTMLInputElement)?.value || '0.8');
  const effort = parseFloat((document.getElementById('effortInput') as HTMLInputElement)?.value || '3');
  
  newIdeas.forEach(idea => {
    if (!idea.reach && currentModel === 'RICE') idea.reach = reach;
    if (!idea.impact) idea.impact = impact;
    if (!idea.confidence) idea.confidence = confidence;
    if (!idea.effort) idea.effort = effort;
  });
  
  ideas.push(...newIdeas);
  input.value = '';
  
  saveToStorage();
  renderChart();
  renderIdeasTable();
  
  console.log('Added', newIdeas.length, 'new ideas');
}

// Handle CSV file upload
function handleCSVUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = e.target?.result as string;
    try {
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newIdeas = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const idea: any = {
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        
        headers.forEach((header, index) => {
          const value = values[index];
          if (header === 'title') idea.title = value;
          else if (header === 'reach') idea.reach = parseFloat(value) || undefined;
          else if (header === 'impact') idea.impact = parseFloat(value) || undefined;
          else if (header === 'confidence') idea.confidence = parseFloat(value) || undefined;
          else if (header === 'effort') idea.effort = parseFloat(value) || undefined;
          else if (header === 'tags') idea.tags = value ? value.split(';').map(t => t.trim()) : undefined;
        });
        
        return idea;
      }).filter(idea => idea.title);
      
      ideas.push(...newIdeas);
      saveToStorage();
      renderChart();
      renderIdeasTable();
      
      alert(`Imported ${newIdeas.length} ideas from CSV`);
    } catch (error) {
      alert('Error parsing CSV file. Please check the format.');
      console.error('CSV parsing error:', error);
    }
  };
  reader.readAsText(file);
}

// Export data to CSV
function exportData() {
  const headers = ['Title', 'Reach', 'Impact', 'Confidence', 'Effort', 'Score', 'Tags'];
  const rows = ideas.map(idea => {
    const score = calculateSimpleScore(idea, currentModel);
    return [
      idea.title || '',
      idea.reach || '',
      idea.impact || '',
      idea.confidence || '',
      idea.effort || '',
      score ? score.toFixed(2) : '',
      idea.tags ? idea.tags.join(';') : ''
    ];
  });
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pm-prioboard-${currentModel.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('Exported', ideas.length, 'ideas to CSV');
}

// Update scoring method
function updateScoringMethod(event: Event) {
  const method = (event.target as HTMLInputElement).value;
  const scoreValues = document.getElementById('scoreValues');
  
  if (scoreValues) {
    scoreValues.style.display = method === 'manual' ? 'block' : 'none';
  }
  
  console.log('Scoring method changed to:', method);
}

// Render interactive chart (placeholder for D3 implementation)
function renderChart() {
  const chartContainer = document.getElementById('chartContainer');
  if (!chartContainer) return;
  
  // Clear existing content
  chartContainer.innerHTML = '';
  
  // Create simple scatter plot representation
  const sortedIdeas = sortIdeasByScore(ideas, currentModel);
  
  if (sortedIdeas.length === 0) {
    chartContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #457B9D; font-size: 14px;">
        📊 Add some ideas to see them plotted on the Impact vs Effort chart
      </div>
    `;
    return;
  }
  
  // Simple visualization with positioned dots
  let chartHTML = `
    <div style="position: relative; width: 100%; height: 100%; padding: 20px;">
      <!-- Quadrant labels -->
      <div style="position: absolute; top: 10px; left: 10px; font-size: 12px; color: #1D3557; font-weight: 600;">Quick Wins</div>
      <div style="position: absolute; top: 10px; right: 10px; font-size: 12px; color: #1D3557; font-weight: 600;">Big Bets</div>
      <div style="position: absolute; bottom: 10px; left: 10px; font-size: 12px; color: #1D3557; font-weight: 600;">Fill-ins</div>
      <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: #1D3557; font-weight: 600;">Time Sinks</div>
      
      <!-- Center lines -->
      <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #A8DADC;"></div>
      <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #A8DADC;"></div>
      
      <!-- Axis labels -->
      <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #457B9D;">Effort (person-months)</div>
      <div style="position: absolute; left: -5px; top: 50%; transform: translateY(-50%) rotate(-90deg); font-size: 11px; color: #457B9D;">Impact</div>
  `;
  
  // Plot ideas as dots
  sortedIdeas.forEach((idea, index) => {
    if (!idea.impact || !idea.effort) return;
    
    const x = Math.min(90, Math.max(10, (idea.effort / 12) * 80 + 10)); // Scale effort to 10-90%
    const y = Math.min(90, Math.max(10, 90 - (idea.impact / 10) * 80)); // Scale impact to 10-90% (inverted)
    const score = calculateSimpleScore(idea, currentModel);
    
    // Color based on score quartile using new palette
    let color = '#A8DADC';
    if (score && score > 2) color = '#457B9D'; // High score - Ocean Blue
    else if (score && score > 1) color = '#CD8B76'; // Medium score - Terracotta
    else if (score && score > 0.5) color = '#E63946'; // Low score - Primary Red
    else color = '#1D3557'; // Very low score - Deep Navy
    
    chartHTML += `
      <div style="
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      " title="${idea.title} (Score: ${score ? score.toFixed(2) : 'N/A'})"></div>
    `;
  });
  
  chartHTML += '</div>';
  chartContainer.innerHTML = chartHTML;
}

// Render ideas table
function renderIdeasTable() {
  const tableBody = document.getElementById('ideasTableBody');
  if (!tableBody) return;
  
  const sortedIdeas = sortIdeasByScore(ideas, currentModel);
  
  if (sortedIdeas.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 40px; text-align: center; color: #457B9D;">
          📝 No ideas yet. Add some ideas using the form above to get started.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = sortedIdeas.map((idea, index) => {
    const score = calculateSimpleScore(idea, currentModel);
    const scoreText = score ? score.toFixed(2) : 'N/A';
    
    // Score color based on value using new palette
    let scoreColor = '#A8DADC';
    if (score && score > 2) scoreColor = '#457B9D'; // High score - Ocean Blue
    else if (score && score > 1) scoreColor = '#CD8B76'; // Medium score - Terracotta
    else if (score && score > 0.5) scoreColor = '#E63946'; // Low score - Primary Red
    else if (score) scoreColor = '#1D3557'; // Very low score - Deep Navy
    
    return `
      <tr style="border-bottom: 1px solid #A8DADC;">
        <td style="padding: 12px 16px; font-weight: 500; color: #1D3557;">${idea.title || 'Untitled'}</td>
        <td style="padding: 12px 16px; color: #457B9D;">${currentModel === 'RICE' ? (idea.reach || 'N/A') : 'N/A'}</td>
        <td style="padding: 12px 16px; color: #457B9D;">${idea.impact || 'N/A'}</td>
        <td style="padding: 12px 16px; color: #457B9D;">${idea.confidence || 'N/A'}</td>
        <td style="padding: 12px 16px; color: #457B9D;">${idea.effort || 'N/A'}</td>
        <td style="padding: 12px 16px; font-weight: 600; color: ${scoreColor};">${scoreText}</td>
        <td style="padding: 12px 16px;">
          ${idea.tags ? idea.tags.map(tag => `
            <span style="
              display: inline-block;
              background: #CD8B76;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin-right: 4px;
              margin-bottom: 2px;
            ">${tag}</span>
          `).join('') : '<span style="color: #457B9D; font-size: 12px;">No tags</span>'}
        </td>
        <td style="padding: 12px 16px;">
          <button onclick="editIdea('${idea.id}')" style="
            background: none;
            border: none;
            color: #457B9D;
            cursor: pointer;
            padding: 4px;
            margin-right: 8px;
            font-size: 14px;
            transition: all 0.2s;
          " title="Edit idea">✏️</button>
          <button onclick="deleteIdea('${idea.id}')" style="
            background: none;
            border: none;
            color: #E63946;
            cursor: pointer;
            padding: 4px;
            font-size: 14px;
            transition: all 0.2s;
          " title="Delete idea">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Edit idea function (placeholder)
function editIdea(id: string) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;
  
  const newTitle = prompt('Edit title:', idea.title);
  if (newTitle !== null) {
    idea.title = newTitle;
    saveToStorage();
    renderChart();
    renderIdeasTable();
  }
}

// Delete idea function
function deleteIdea(id: string) {
  if (confirm('Are you sure you want to delete this idea?')) {
    ideas = ideas.filter(i => i.id !== id);
    saveToStorage();
    renderChart();
    renderIdeasTable();
  }
}

// Make functions globally available for onclick handlers
(window as any).editIdea = editIdea;
(window as any).deleteIdea = deleteIdea;

// Render ideas list with scores
function renderIdeasList() {
  const ideasList = document.getElementById('ideasList');
  if (!ideasList) return;
  
  const sortedIdeas = sortIdeasByScore(ideas, currentModel);
  
  ideasList.innerHTML = sortedIdeas.map(idea => {
    const score = calculateSimpleScore(idea, currentModel);
    const scoreText = score ? score.toFixed(2) : 'N/A';
    
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin: 0 0 4px 0; font-weight: 500;">${idea.title}</h3>
            <div style="font-size: 14px; color: #6b7280;">
              Impact: ${idea.impact || 'N/A'} | Confidence: ${idea.confidence || 'N/A'} | Effort: ${idea.effort || 'N/A'}
              ${currentModel === 'RICE' ? ` | Reach: ${idea.reach || 'N/A'}` : ''}
            </div>
            ${idea.tags ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${idea.tags.join(', ')}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: #059669;">${scoreText}</div>
            <div style="font-size: 12px; color: #6b7280;">${currentModel} Score</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Add new idea function
function addNewIdea() {
  const title = prompt('Enter idea title:');
  if (!title) return;
  
  const impact = parseFloat(prompt('Impact (1-3):') || '2');
  const confidence = parseFloat(prompt('Confidence (0-1):') || '0.7');
  const effort = parseFloat(prompt('Effort (1-3):') || '1.5');
  const reach = currentModel === 'RICE' ? parseFloat(prompt('Reach (number of users):') || '1000') : undefined;
  
  const newIdea = {
    id: generateId(),
    title,
    impact,
    confidence,
    effort,
    reach,
    createdAt: new Date().toISOString()
  };
  
  ideas.push(newIdea);
  saveToStorage();
  renderIdeasList();
  
  console.log('Added new idea:', newIdea);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancedApp);
} else {
  initEnhancedApp();
}
