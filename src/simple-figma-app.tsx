import React, { useState, useEffect } from 'react';
import type { Idea, ScoringModel } from './types';

// Simple scoring function
function calculateScore(idea: Idea, model: ScoringModel): number {
  if (idea.effort <= 0) return 0;
  
  if (model === 'ICE') {
    return (idea.impact * idea.confidence) / idea.effort;
  } else {
    if (!idea.reach || idea.reach <= 0) return 0;
    return (idea.reach * idea.impact * idea.confidence) / idea.effort;
  }
}

// Create sample data
function createSampleData(): Idea[] {
  return [
    {
      id: '1',
      title: 'Improve user onboarding',
      impact: 3,
      confidence: 0.8,
      effort: 2,
      reach: 1000,
      tags: ['ux', 'growth'],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2', 
      title: 'Add dark mode',
      impact: 1,
      confidence: 0.9,
      effort: 1,
      reach: 500,
      tags: ['ui', 'feature'],
      createdAt: new Date().toISOString(),
    }
  ];
}

export default function SimpleFigmaApp() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [model, setModel] = useState<ScoringModel>('ICE');

  // Load sample data on mount
  useEffect(() => {
    const sampleIdeas = createSampleData();
    const ideasWithScores = sampleIdeas.map(idea => ({
      ...idea,
      score: calculateScore(idea, model)
    }));
    setIdeas(ideasWithScores);
  }, [model]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-medium text-gray-900">PM PrioBoard</h1>
          
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                model === 'ICE' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
              onClick={() => setModel('ICE')}
            >
              ICE
            </button>
            <button
              className={`px-3 py-1.5 rounded-md transition-all text-sm font-medium ${
                model === 'RICE' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-white/50'
              }`}
              onClick={() => setModel('RICE')}
            >
              RICE
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            ⚙ Advanced
          </button>
          <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            ↑ Import
          </button>
          <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
            ↓ Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          {/* Add Ideas Section */}
          <div className="space-y-6">
            <div className="border rounded-lg bg-white p-6">
              <h3 className="font-medium mb-4 text-gray-900">Add Ideas</h3>
              <textarea
                className="w-full h-32 p-3 border rounded-md resize-none"
                placeholder="Enter ideas one per line or use structured format:&#10;Title | I:2 | C:0.8 | E:1.5 | R:600 | T:feature,ui"
              />
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Ideas
              </button>
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="space-y-6">
            <div className="border rounded-lg bg-white p-6">
              <h3 className="font-medium mb-4 text-gray-900">Impact vs Effort Chart</h3>
              <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-blue-600 mb-2">Interactive Chart</p>
                  <p className="text-gray-700 text-sm">{ideas.length} ideas loaded</p>
                  <p className="text-gray-700 text-sm">Model: {model}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ideas Table */}
        <div className="border rounded-lg bg-white p-6">
          <h3 className="font-medium mb-4 text-gray-900">Ideas ({ideas.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Impact</th>
                  <th className="text-left py-2">Confidence</th>
                  <th className="text-left py-2">Effort</th>
                  {model === 'RICE' && <th className="text-left py-2">Reach</th>}
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{idea.title}</td>
                    <td className="py-2">{idea.impact}</td>
                    <td className="py-2">{idea.confidence}</td>
                    <td className="py-2">{idea.effort}</td>
                    {model === 'RICE' && <td className="py-2">{idea.reach}</td>}
                    <td className="py-2 font-medium">{idea.score?.toFixed(2) || '0'}</td>
                    <td className="py-2">
                      {idea.tags?.map(tag => (
                        <span key={tag} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1">
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
