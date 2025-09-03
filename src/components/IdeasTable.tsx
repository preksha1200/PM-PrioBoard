import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Sparkles, Trash2, Copy, Tag, AlertCircle, Clock } from 'lucide-react';
import { Idea, ScoringModel, ImpactLevel } from '../types';
import { cn } from '../utils/cn';
import { IMPACT_LABELS, getIdeaStatus } from '../score';
import { ai } from '../ai';

interface IdeasTableProps {
  ideas: Idea[];
  model: ScoringModel;
  onUpdateIdea: (id: string, updates: Partial<Idea>) => void;
  onDeleteIdea: (id: string) => void;
  onSelectIdea: (idea: Idea) => void;
  selectedIdea?: Idea | null;
}

type SortField = 'title' | 'reach' | 'impact' | 'confidence' | 'effort' | 'score';
type SortDirection = 'asc' | 'desc';

export function IdeasTable({ ideas, model, onUpdateIdea, onDeleteIdea, onSelectIdea, selectedIdea }: IdeasTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterTag, setFilterTag] = useState<string>('');
  const [showIncomplete, setShowIncomplete] = useState(true);
  const [editingCell, setEditingCell] = useState<{ ideaId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Get all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach(idea => {
      idea.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [ideas]);

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas;

    // Apply tag filter
    if (filterTag) {
      filtered = filtered.filter(idea => idea.tags?.includes(filterTag));
    }

    // Apply incomplete filter
    if (!showIncomplete) {
      filtered = filtered.filter(idea => getIdeaStatus(idea, model) !== 'incomplete');
    }

    // Sort
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // Convert to comparable values
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [ideas, sortField, sortDirection, filterTag, showIncomplete, model]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const startEditing = (ideaId: string, field: string, currentValue: any) => {
    setEditingCell({ ideaId, field });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const { ideaId, field } = editingCell;
    let value: any = editValue;

    // Convert value based on field type
    if (field === 'impact') {
      const numValue = parseFloat(editValue);
      if ([0.25, 0.5, 1, 2, 3].includes(numValue)) {
        value = numValue as ImpactLevel;
      } else {
        cancelEdit();
        return;
      }
    } else if (field === 'confidence') {
      const numValue = parseFloat(editValue);
      if (numValue >= 0 && numValue <= 1) {
        value = numValue;
      } else {
        cancelEdit();
        return;
      }
    } else if (field === 'effort' || field === 'reach') {
      const numValue = parseFloat(editValue);
      if (numValue > 0) {
        value = numValue;
      } else {
        cancelEdit();
        return;
      }
    } else if (field === 'tags') {
      value = editValue.split(',').map(t => t.trim()).filter(t => t);
    }

    onUpdateIdea(ideaId, { 
      [field]: value,
      provenance: {
        ...ideas.find(i => i.id === ideaId)?.provenance,
        [field]: 'user'
      }
    });
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const applySuggestion = async (ideaId: string, field: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    try {
      const suggestions = await ai.suggestFields(idea.title);
      const value = suggestions[field as keyof typeof suggestions];
      
      if (value !== undefined) {
        onUpdateIdea(ideaId, { 
          [field]: value,
          provenance: {
            ...idea.provenance,
            [field]: 'ai'
          }
        });
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 dark:text-white hover:text-primary-ocean-blue"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const getStatusIcon = (idea: Idea) => {
    const status = getIdeaStatus(idea, model);
    if (status === 'invalid') {
      return <AlertCircle className="w-4 h-4 text-red-500" title="Invalid (effort must be > 0)" />;
    }
    if (status === 'incomplete') {
      return <Clock className="w-4 h-4 text-yellow-500" title={`Incomplete (${model === 'RICE' ? 'reach required' : 'missing data'})`} />;
    }
    return null;
  };

  const getProvenanceIcon = (idea: Idea, field: keyof Idea) => {
    const provenance = idea.provenance?.[field as keyof typeof idea.provenance];
    if (provenance === 'ai') {
      return (
        <button
          onClick={() => applySuggestion(idea.id, field)}
          className="ml-1 text-primary-terracotta hover:text-primary-terracotta/80"
          title="AI suggested value - click to refresh"
        >
          <Sparkles className="w-3 h-3" />
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ideas ({filteredAndSortedIdeas.length})
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Tag Filter */}
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Show Incomplete Toggle */}
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showIncomplete}
                onChange={(e) => setShowIncomplete(e.target.checked)}
                className="rounded border-gray-300 text-primary-ocean-blue focus:ring-primary-ocean-blue"
              />
              <span>Show incomplete</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortButton field="title">Title</SortButton>
              </th>
              {model === 'RICE' && (
                <th className="px-4 py-3 text-left w-24">
                  <SortButton field="reach">Reach</SortButton>
                </th>
              )}
              <th className="px-4 py-3 text-left w-24">
                <SortButton field="impact">Impact</SortButton>
              </th>
              <th className="px-4 py-3 text-left w-24">
                <SortButton field="confidence">Confidence</SortButton>
              </th>
              <th className="px-4 py-3 text-left w-24">
                <SortButton field="effort">Effort</SortButton>
              </th>
              <th className="px-4 py-3 text-left w-24">
                <SortButton field="score">Score</SortButton>
              </th>
              <th className="px-4 py-3 text-left w-32">Tags</th>
              <th className="px-4 py-3 text-left w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedIdeas.map((idea) => (
              <tr
                key={idea.id}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
                  selectedIdea?.id === idea.id && 'bg-primary-soft-blue/10'
                )}
                onClick={() => onSelectIdea(idea)}
              >
                {/* Title */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(idea)}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {idea.title}
                    </span>
                  </div>
                  {idea.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {idea.notes}
                    </p>
                  )}
                </td>

                {/* Reach (RICE only) */}
                {model === 'RICE' && (
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {editingCell?.ideaId === idea.id && editingCell?.field === 'reach' ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(idea.id, 'reach', idea.reach);
                          }}
                          className="text-left hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded"
                        >
                          {idea.reach || '-'}
                        </button>
                      )}
                      {getProvenanceIcon(idea, 'reach')}
                    </div>
                  </td>
                )}

                {/* Impact */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {editingCell?.ideaId === idea.id && editingCell?.field === 'impact' ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      >
                        <option value="0.25">Tiny (0.25)</option>
                        <option value="0.5">Small (0.5)</option>
                        <option value="1">Medium (1)</option>
                        <option value="2">Large (2)</option>
                        <option value="3">Massive (3)</option>
                      </select>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(idea.id, 'impact', idea.impact);
                        }}
                        className="text-left hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        {IMPACT_LABELS[idea.impact]} ({idea.impact})
                      </button>
                    )}
                    {getProvenanceIcon(idea, 'impact')}
                  </div>
                </td>

                {/* Confidence */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {editingCell?.ideaId === idea.id && editingCell?.field === 'confidence' ? (
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(idea.id, 'confidence', idea.confidence);
                        }}
                        className="text-left hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        {Math.round((idea.confidence || 0) * 100)}%
                      </button>
                    )}
                    {getProvenanceIcon(idea, 'confidence')}
                  </div>
                </td>

                {/* Effort */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {editingCell?.ideaId === idea.id && editingCell?.field === 'effort' ? (
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(idea.id, 'effort', idea.effort);
                        }}
                        className="text-left hover:bg-gray-100 dark:hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        {idea.effort}m
                      </button>
                    )}
                    {getProvenanceIcon(idea, 'effort')}
                  </div>
                </td>

                {/* Score */}
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {idea.score?.toFixed(2) || '-'}
                  </span>
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {idea.tags?.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-terracotta/20 text-primary-terracotta"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteIdea(idea.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                    title="Delete idea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedIdeas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {ideas.length === 0 ? 'No ideas yet. Add some above!' : 'No ideas match your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
