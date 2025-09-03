import React, { useState, useEffect } from 'react';
import type { Idea, ScoringModel } from './types';
import { createSampleIdeas } from './data/sampleData';
// import { QuadrantChart } from './components/QuadrantChart';

// Utility functions
function calculateScore(idea: Idea, model: ScoringModel): number {
  if (idea.effort <= 0) return 0;
  
  if (model === 'ICE') {
    return (idea.impact * idea.confidence) / idea.effort;
  } else {
    if (!idea.reach || idea.reach <= 0) return 0;
    return (idea.reach * idea.impact * idea.confidence) / idea.effort;
  }
}

function isIdeaComplete(idea: Idea, model: ScoringModel): boolean {
  const baseComplete = Boolean(idea.title && idea.impact > 0 && idea.confidence > 0 && idea.effort > 0);
  if (model === 'RICE') {
    return Boolean(baseComplete && idea.reach && idea.reach > 0);
  }
  return baseComplete;
}

// Simple TopBar component
function TopBar({ model, onModelChange, onImport, onExport, onAdvancedWeights }: {
  model: ScoringModel;
  onModelChange: (model: ScoringModel) => void;
  onImport: () => void;
  onExport: () => void;
  onAdvancedWeights: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b bg-card">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-medium" style={{ color: '#1D3557' }}>PM PrioBoard</h1>
        
        <div className="flex rounded-lg bg-muted p-1">
          <button
            className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
              model === 'ICE' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
            style={{ color: model === 'ICE' ? '#1D3557' : '#6b7280' }}
            onClick={() => onModelChange('ICE')}
          >
            ICE
          </button>
          <button
            className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
              model === 'RICE' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            }`}
            style={{ color: model === 'RICE' ? '#1D3557' : '#6b7280' }}
            onClick={() => onModelChange('RICE')}
          >
            RICE
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1.5 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
          style={{ color: '#1D3557' }}
          onClick={onAdvancedWeights}
        >
          ⚙ Advanced weights
        </button>
        
        <button 
          className="px-3 py-1.5 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
          style={{ color: '#1D3557' }}
          onClick={onImport}
        >
          ↑ Import
        </button>
        
        <button 
          className="px-3 py-1.5 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
          style={{ color: '#1D3557' }}
          onClick={onExport}
        >
          ↓ Export
        </button>
      </div>
    </div>
  );
}

// Simple AddIdeasCard component
function AddIdeasCard({ onAddIdeas, model }: {
  onAddIdeas: (ideas: Array<{title: string; impact?: number; confidence?: number; effort?: number; reach?: number; tags?: string[]}>) => void;
  model: ScoringModel;
}) {
  const [bulkText, setBulkText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddIdeas = () => {
    if (!bulkText.trim()) return;
    
    const ideaTitles = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (ideaTitles.length === 0) return;

    const ideas = ideaTitles.map(title => ({
      title,
      impact: 1,
      confidence: 0.8,
      effort: 1,
      ...(model === 'RICE' && { reach: 100 }),
      tags: []
    }));
    
    onAddIdeas(ideas);
    setBulkText('');
  };

  return (
    <div className="w-full border rounded-lg bg-card">
      <div 
        className="p-6 cursor-pointer select-none border-b"
        onClick={() => setIsCollapsed(prev => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium" style={{ color: '#E63946' }}>+ Add Ideas</span>
          </div>
          <span className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}>
            ⌄
          </span>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#1D3557' }}>Ideas</label>
            <textarea
              placeholder={`Enter one idea per line...\n\nAdvanced format: Title | I:5 | C:0.8 | E:3${model === 'RICE' ? ' | R:100' : ''} | T:feature,ui`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={4}
              className="w-full p-3 border border-input rounded-md resize-none"
              style={{ backgroundColor: '#F1FAEE', color: '#1D3557' }}
            />
          </div>

          <button 
            onClick={handleAddIdeas}
            disabled={!bulkText.trim()}
            className="px-4 py-2 rounded-md font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1D3557' }}
          >
            Add Ideas
          </button>
        </div>
      )}
    </div>
  );
}

// Simple IdeasTable component
function IdeasTable({ ideas, model, onUpdateIdea, onDeleteIdea, onSelectIdea }: {
  ideas: Idea[];
  model: ScoringModel;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => void;
  onDeleteIdea: (id: string) => void;
  onSelectIdea: (idea: Idea) => void;
}) {
  const sortedIdeas = [...ideas].sort((a, b) => (b.score || 0) - (a.score || 0));

  if (ideas.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-12 text-center">
        <h3 className="text-lg font-medium mb-2" style={{ color: '#1D3557' }}>No ideas yet</h3>
        <p style={{ color: '#6b7280' }}>Add some ideas to get started</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-medium" style={{ color: '#1D3557' }}>Ideas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Title</th>
              {model === 'RICE' && <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Reach</th>}
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Impact</th>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Confidence</th>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Effort</th>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Score</th>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Tags</th>
              <th className="text-left p-3 font-medium" style={{ color: '#1D3557' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedIdeas.map((idea, index) => (
              <tr 
                key={idea.id}
                className={`border-b hover:bg-muted/20 cursor-pointer transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
                onClick={() => onSelectIdea(idea)}
              >
                <td className="p-3">
                  <span className="font-medium" style={{ color: '#1D3557' }}>{idea.title}</span>
                </td>
                {model === 'RICE' && (
                  <td className="p-3" style={{ color: '#1D3557' }}>{idea.reach || '—'}</td>
                )}
                <td className="p-3" style={{ color: '#1D3557' }}>{idea.impact}</td>
                <td className="p-3" style={{ color: '#1D3557' }}>{Math.round(idea.confidence * 100)}%</td>
                <td className="p-3" style={{ color: '#1D3557' }}>{idea.effort}</td>
                <td className="p-3">
                  <span className="font-medium" style={{ color: '#1D3557' }}>{Math.round(idea.score || 0)}</span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {idea.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#CD8B76', color: 'white' }}>
                        {tag}
                      </span>
                    ))}
                    {(idea.tags?.length || 0) > 2 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium border" style={{ color: '#CD8B76' }}>
                        +{(idea.tags?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Edit title:', idea.title);
                        if (newTitle && newTitle !== idea.title) {
                          onUpdateIdea(idea.id, { title: newTitle });
                        }
                      }}
                      className="p-1 hover:bg-accent rounded"
                      style={{ color: '#1D3557' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this idea?')) {
                          onDeleteIdea(idea.id);
                        }
                      }}
                      className="p-1 hover:bg-accent rounded"
                      style={{ color: '#E63946' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main App Component
export default function FigmaApp() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [model, setModel] = useState<ScoringModel>('ICE');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // Load sample data on mount
  useEffect(() => {
    setIdeas(createSampleIdeas());
  }, []);

  // Update scores when model changes
  useEffect(() => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => ({
        ...idea,
        score: calculateScore(idea, model)
      }))
    );
  }, [model]);

  const handleAddIdeas = (ideaDataList: Array<{title: string; impact?: number; confidence?: number; effort?: number; reach?: number; tags?: string[]}>) => {
    const newIdeas: Idea[] = ideaDataList.map(ideaData => {
      const idea: Idea = {
        id: crypto.randomUUID(),
        title: ideaData.title.trim(),
        notes: '',
        reach: ideaData.reach || (model === 'RICE' ? 100 : undefined),
        impact: (ideaData.impact || 1) as any,
        confidence: ideaData.confidence || 0.8,
        effort: ideaData.effort || 1,
        score: 0,
        tags: ideaData.tags || [],
        createdAt: new Date().toISOString()
      };
      
      idea.score = calculateScore(idea, model);
      return idea;
    });

    setIdeas(prev => [...prev, ...newIdeas]);
  };

  const handleUpdateIdea = (id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => {
      if (idea.id === id) {
        const updated = { ...idea, ...updates };
        updated.score = calculateScore(updated, model);
        return updated;
      }
      return idea;
    }));
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    console.log('Selected idea:', idea);
  };

  const handleExport = () => {
    const headers = model === 'RICE' 
      ? ['title', 'reach', 'impact', 'confidence', 'effort', 'score', 'tags']
      : ['title', 'impact', 'confidence', 'effort', 'score', 'tags'];
    
    const csvContent = [
      headers.join(','),
      ...ideas.map(idea => {
        const row = [
          `"${idea.title}"`,
          ...(model === 'RICE' ? [idea.reach?.toString() || ''] : []),
          idea.impact.toString(),
          idea.confidence.toString(),
          idea.effort.toString(),
          Math.round(idea.score || 0).toString(),
          `"${idea.tags?.join(';') || ''}"`
        ];
        return row.join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pm-prioboard-${model.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        model={model}
        onModelChange={setModel}
        onImport={() => console.log('Import clicked')}
        onExport={handleExport}
        onAdvancedWeights={() => console.log('Advanced weights clicked')}
      />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AddIdeasCard
              onAddIdeas={handleAddIdeas}
              model={model}
            />
          </div>
          
          <div className="space-y-6">
            <div className="border rounded-lg bg-card p-6">
              <h3 className="font-medium mb-4" style={{ color: '#1D3557' }}>Impact vs Effort Chart</h3>
              <div className="h-80 flex items-center justify-center border rounded-lg" style={{ backgroundColor: '#F1FAEE' }}>
                <div className="text-center">
                  <p style={{ color: '#457B9D' }} className="mb-2">Interactive Chart</p>
                  <p style={{ color: '#1D3557' }} className="text-sm">{ideas.length} ideas loaded</p>
                  <p style={{ color: '#1D3557' }} className="text-sm">Model: {model}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <IdeasTable
          ideas={ideas}
          model={model}
          onUpdateIdea={handleUpdateIdea}
          onDeleteIdea={handleDeleteIdea}
          onSelectIdea={handleSelectIdea}
        />
      </div>
    </div>
  );
}
