import { useState, useEffect } from 'react';
import { X, Save, Calculator, Sparkles, Info, Tag, Trash2 } from 'lucide-react';
import type { Idea, ScoringModel, ImpactLevel } from '../types';
import { calculateScore, DEFAULT_WEIGHTS } from '../score';
import { ai } from '../ai';

interface SelectionDrawerProps {
  idea: Idea | null;
  isOpen: boolean;
  model: ScoringModel;
  weights: typeof DEFAULT_WEIGHTS;
  onClose: () => void;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => void;
  onDeleteIdea: (id: string) => void;
}

export function SelectionDrawer({ 
  idea, 
  isOpen, 
  model, 
  weights, 
  onClose, 
  onUpdateIdea, 
  onDeleteIdea 
}: SelectionDrawerProps) {
  const [editedIdea, setEditedIdea] = useState<Idea | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Update edited idea when prop changes
  useEffect(() => {
    if (idea) {
      setEditedIdea({ ...idea });
      loadExplanation(idea);
    } else {
      setEditedIdea(null);
      setExplanation('');
    }
  }, [idea, model]);

  const loadExplanation = async (ideaToExplain: Idea) => {
    setIsLoadingExplanation(true);
    try {
      const result = await ai.explainRanking(ideaToExplain, model);
      setExplanation(result);
    } catch (error) {
      setExplanation('Unable to generate explanation at this time.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleSave = () => {
    if (!editedIdea || !idea) return;
    
    onUpdateIdea(idea.id, {
      title: editedIdea.title,
      notes: editedIdea.notes,
      reach: editedIdea.reach,
      impact: editedIdea.impact,
      confidence: editedIdea.confidence,
      effort: editedIdea.effort,
      tags: editedIdea.tags,
      provenance: {
        ...editedIdea.provenance,
        // Mark fields as user-edited if they changed
        ...(editedIdea.reach !== idea.reach && { reach: 'user' }),
        ...(editedIdea.impact !== idea.impact && { impact: 'user' }),
        ...(editedIdea.confidence !== idea.confidence && { confidence: 'user' }),
        ...(editedIdea.effort !== idea.effort && { effort: 'user' }),
      }
    });
    onClose();
  };

  const handleCancel = () => {
    setEditedIdea(idea ? { ...idea } : null);
    onClose();
  };

  const handleDelete = () => {
    if (idea && confirm('Are you sure you want to delete this idea?')) {
      onDeleteIdea(idea.id);
      onClose();
    }
  };

  const addTag = () => {
    if (!newTag.trim() || !editedIdea) return;
    
    const tags = editedIdea.tags || [];
    if (!tags.includes(newTag.trim())) {
      setEditedIdea({
        ...editedIdea,
        tags: [...tags, newTag.trim()]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!editedIdea) return;
    
    setEditedIdea({
      ...editedIdea,
      tags: editedIdea.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const getScoreBreakdown = () => {
    if (!editedIdea) return null;
    
    const { reach, impact, confidence, effort } = editedIdea;
    const score = calculateScore(editedIdea, model, weights);
    
    if (model === 'RICE') {
      if (!reach || reach <= 0 || effort <= 0) {
        return {
          formula: 'RICE = (Reach × Impact × Confidence) / Effort',
          calculation: 'Cannot calculate - missing or invalid values',
          score: null,
          breakdown: []
        };
      }
      
      const weightedReach = Math.pow(reach, weights.reach);
      const weightedImpact = Math.pow(impact, weights.impact);
      const weightedConfidence = Math.pow(confidence, weights.confidence);
      const weightedEffort = Math.pow(effort, weights.effort);
      
      return {
        formula: 'RICE = (Reach × Impact × Confidence) / Effort',
        calculation: weights.reach === 1 && weights.impact === 1 && weights.confidence === 1 && weights.effort === 1
          ? `(${reach} × ${impact} × ${confidence}) / ${effort} = ${score?.toFixed(2)}`
          : `(${reach}^${weights.reach} × ${impact}^${weights.impact} × ${confidence}^${weights.confidence}) / ${effort}^${weights.effort} = ${score?.toFixed(2)}`,
        score,
        breakdown: [
          { label: 'Reach', value: reach, weighted: weightedReach, weight: weights.reach },
          { label: 'Impact', value: impact, weighted: weightedImpact, weight: weights.impact },
          { label: 'Confidence', value: confidence, weighted: weightedConfidence, weight: weights.confidence },
          { label: 'Effort', value: effort, weighted: weightedEffort, weight: weights.effort, isDivisor: true }
        ]
      };
    } else {
      if (effort <= 0) {
        return {
          formula: 'ICE = (Impact × Confidence) / Effort',
          calculation: 'Cannot calculate - effort must be > 0',
          score: null,
          breakdown: []
        };
      }
      
      const weightedImpact = Math.pow(impact, weights.impact);
      const weightedConfidence = Math.pow(confidence, weights.confidence);
      const weightedEffort = Math.pow(effort, weights.effort);
      
      return {
        formula: 'ICE = (Impact × Confidence) / Effort',
        calculation: weights.impact === 1 && weights.confidence === 1 && weights.effort === 1
          ? `(${impact} × ${confidence}) / ${effort} = ${score?.toFixed(2)}`
          : `(${impact}^${weights.impact} × ${confidence}^${weights.confidence}) / ${effort}^${weights.effort} = ${score?.toFixed(2)}`,
        score,
        breakdown: [
          { label: 'Impact', value: impact, weighted: weightedImpact, weight: weights.impact },
          { label: 'Confidence', value: confidence, weighted: weightedConfidence, weight: weights.confidence },
          { label: 'Effort', value: effort, weighted: weightedEffort, weight: weights.effort, isDivisor: true }
        ]
      };
    }
  };

  const getProvenanceInfo = (field: keyof Idea) => {
    const provenance = editedIdea?.provenance?.[field as keyof typeof editedIdea.provenance];
    if (provenance === 'ai') return 'AI suggested';
    if (provenance === 'ai-edited') return 'AI suggested, then edited';
    return 'User provided';
  };

  if (!isOpen || !editedIdea) return null;

  const scoreBreakdown = getScoreBreakdown();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Idea
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete idea"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={editedIdea.title}
              onChange={(e) => setEditedIdea({ ...editedIdea, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
              placeholder="Enter idea title"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={editedIdea.notes || ''}
              onChange={(e) => setEditedIdea({ ...editedIdea, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent resize-none"
              placeholder="Additional details or context"
            />
          </div>

          {/* Scoring Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Reach (RICE only) */}
            {model === 'RICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-1">
                    <span>Reach *</span>
                    <div title={getProvenanceInfo('reach')}>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </label>
                <input
                  type="number"
                  min="1"
                  value={editedIdea.reach || ''}
                  onChange={(e) => setEditedIdea({ ...editedIdea, reach: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
                  placeholder="People reached"
                />
              </div>
            )}

            {/* Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-1">
                  <span>Impact *</span>
                  <div title={getProvenanceInfo('impact')}>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </label>
              <select
                value={editedIdea.impact}
                onChange={(e) => setEditedIdea({ ...editedIdea, impact: parseFloat(e.target.value) as ImpactLevel })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
              >
                <option value={0.25}>Tiny (0.25)</option>
                <option value={0.5}>Small (0.5)</option>
                <option value={1}>Medium (1)</option>
                <option value={2}>Large (2)</option>
                <option value={3}>Massive (3)</option>
              </select>
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-1">
                  <span>Confidence *</span>
                  <div title={getProvenanceInfo('confidence')}>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={editedIdea.confidence}
                onChange={(e) => setEditedIdea({ ...editedIdea, confidence: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
                placeholder="0.0 - 1.0"
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((editedIdea.confidence || 0) * 100)}%
              </div>
            </div>

            {/* Effort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-1">
                  <span>Effort *</span>
                  <div title={getProvenanceInfo('effort')}>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={editedIdea.effort}
                onChange={(e) => setEditedIdea({ ...editedIdea, effort: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
                placeholder="Person-months"
              />
              <div className="text-xs text-gray-500 mt-1">
                {editedIdea.effort} months
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedIdea.tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-terracotta/20 text-primary-terracotta"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary-terracotta/60 hover:text-primary-terracotta"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
                placeholder="Add tag"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-primary-ocean-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Score Breakdown */}
          {scoreBreakdown && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-4 h-4 text-primary-ocean-blue" />
                <h3 className="font-medium text-gray-900 dark:text-white">Score Breakdown</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-mono text-gray-600 dark:text-gray-400">
                  {scoreBreakdown.formula}
                </div>
                <div className="font-mono text-gray-900 dark:text-white">
                  {scoreBreakdown.calculation}
                </div>
                
                {scoreBreakdown.breakdown.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {scoreBreakdown.breakdown.map(item => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.label}: {item.value} {item.weight !== 1 && `(^${item.weight})`}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          = {item.weighted.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {scoreBreakdown.score && (
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900 dark:text-white">Final Score:</span>
                      <span className="text-primary-ocean-blue">{scoreBreakdown.score.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-terracotta" />
              <h3 className="font-medium text-gray-900 dark:text-white">Explain My Ranking</h3>
            </div>
            
            {isLoadingExplanation ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Generating explanation...
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {explanation}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-ocean-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
