import { useState } from 'react';
import type { ScoringModel } from './types';

function SimpleApp() {
  const [model, setModel] = useState<ScoringModel>('ICE');
  const [ideas] = useState([
    {
      id: '1',
      title: 'Test Idea',
      impact: 2,
      confidence: 0.8,
      effort: 1.5,
      createdAt: new Date().toISOString()
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              PM PrioBoard
            </h1>
            <div className="flex items-center gap-4">
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value as ScoringModel)}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="ICE">ICE Model</option>
                <option value="RICE">RICE Model</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ideas List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Ideas ({ideas.length})</h2>
            <div className="space-y-3">
              {ideas.map(idea => (
                <div key={idea.id} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-medium">{idea.title}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    Impact: {idea.impact} | Confidence: {idea.confidence} | Effort: {idea.effort}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Impact vs Effort Chart</h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart will go here</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-800">
            ✅ PM PrioBoard is working! Current model: {model}
          </p>
          <p className="text-sm text-green-600 mt-1">
            If you can see this, the basic app structure is functional.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;
