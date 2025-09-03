import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { ScoringModel, Idea } from '../types';
import { DEFAULT_WEIGHTS, calculateScore } from '../score';

interface WeightsModalProps {
  isOpen: boolean;
  model: ScoringModel;
  weights: typeof DEFAULT_WEIGHTS;
  onClose: () => void;
  onUpdateWeights: (weights: typeof DEFAULT_WEIGHTS) => void;
}

// Sample idea for preview
const SAMPLE_IDEA: Idea = {
  id: 'sample',
  title: 'Sample Feature',
  reach: 1000,
  impact: 2,
  confidence: 0.8,
  effort: 1.5,
  createdAt: new Date().toISOString()
};

export function WeightsModal({ isOpen, model, weights, onClose, onUpdateWeights }: WeightsModalProps) {
  const [localWeights, setLocalWeights] = useState(weights);

  useEffect(() => {
    setLocalWeights(weights);
  }, [weights, isOpen]);

  const handleSave = () => {
    onUpdateWeights(localWeights);
    onClose();
  };

  const handleReset = () => {
    setLocalWeights(DEFAULT_WEIGHTS);
  };

  const updateWeight = (field: keyof typeof DEFAULT_WEIGHTS, value: number) => {
    setLocalWeights(prev => ({ ...prev, [field]: value }));
  };

  const previewScore = calculateScore(SAMPLE_IDEA, model, localWeights);
  const defaultScore = calculateScore(SAMPLE_IDEA, model, DEFAULT_WEIGHTS);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Weights
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Adjust the weights to emphasize different factors in your scoring model. 
              Values greater than 1 increase importance, less than 1 decrease it.
            </div>

            {/* Weight Sliders */}
            <div className="space-y-4">
              {model === 'RICE' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reach Weight
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {localWeights.reach.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={localWeights.reach}
                    onChange={(e) => updateWeight('reach', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Impact Weight
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {localWeights.impact.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={localWeights.impact}
                  onChange={(e) => updateWeight('impact', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confidence Weight
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {localWeights.confidence.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={localWeights.confidence}
                  onChange={(e) => updateWeight('confidence', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Effort Weight
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {localWeights.effort.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={localWeights.effort}
                  onChange={(e) => updateWeight('effort', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Preview on Sample Idea
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {model === 'RICE' ? 'Reach: 1000, ' : ''}Impact: 2, Confidence: 80%, Effort: 1.5m
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Default score:</span>
                <span className="font-mono">{defaultScore?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-900 dark:text-white">Weighted score:</span>
                <span className="font-mono text-primary-ocean-blue">
                  {previewScore?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-primary-ocean-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Apply Weights
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
