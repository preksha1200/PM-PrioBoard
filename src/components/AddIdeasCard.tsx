import React, { useState, useRef } from 'react';
import { Plus, Sparkles, X, Upload } from 'lucide-react';
import { ScoringModel, Idea } from '../types';
import { cn } from '../utils/cn';
import { parseStructuredText, parseCSV } from '../utils/parser';
import { generateId } from '../utils/persistence';
import { ai } from '../ai';

interface AddIdeasCardProps {
  model: ScoringModel;
  mode: 'manual' | 'assisted' | 'auto';
  onModeChange: (mode: 'manual' | 'assisted' | 'auto') => void;
  onAddIdeas: (ideas: Omit<Idea, 'score'>[]) => void;
  onImportCSV: (file: File) => void;
}

export function AddIdeasCard({ model, mode, onModeChange, onAddIdeas, onImportCSV }: AddIdeasCardProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholder = `One idea per line or use structured format:
Title | I:2 | C:0.8 | E:1.5 | R:600 | T:feature,ui

Examples:
• Improve user onboarding flow
• Add dark mode | I:1 | C:0.9 | E:0.5 | T:ui
• Migrate to new API | I:2 | C:0.7 | E:3 | R:500 | T:infra`;

  const handleAddIdeas = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const parsedIdeas = parseStructuredText(input);
      const processedIdeas: Omit<Idea, 'score'>[] = [];

      for (const idea of parsedIdeas) {
        if (!idea.title?.trim()) continue;

        let processedIdea: Omit<Idea, 'score'> = {
          id: generateId(),
          title: idea.title,
          notes: idea.notes,
          tags: idea.tags,
          reach: idea.reach,
          impact: idea.impact || 1,
          confidence: idea.confidence || 0.7,
          effort: idea.effort || 1,
          createdAt: new Date().toISOString(),
          provenance: idea.provenance || {}
        };

        // Apply AI assistance based on mode
        if (mode === 'assisted' || mode === 'auto') {
          try {
            const suggestions = await ai.suggestFields(idea.title);
            
            // In assisted mode, only fill missing fields
            // In auto mode, fill all fields (user can edit later)
            if (mode === 'auto' || !idea.reach) {
              processedIdea.reach = suggestions.reach || processedIdea.reach;
              if (suggestions.reach) processedIdea.provenance!.reach = 'ai';
            }
            if (mode === 'auto' || !idea.impact) {
              processedIdea.impact = suggestions.impact || processedIdea.impact;
              if (suggestions.impact) processedIdea.provenance!.impact = 'ai';
            }
            if (mode === 'auto' || !idea.confidence) {
              processedIdea.confidence = suggestions.confidence || processedIdea.confidence;
              if (suggestions.confidence) processedIdea.provenance!.confidence = 'ai';
            }
            if (mode === 'auto' || !idea.effort) {
              processedIdea.effort = suggestions.effort || processedIdea.effort;
              if (suggestions.effort) processedIdea.provenance!.effort = 'ai';
            }

            // Suggest tags if none provided
            if (!processedIdea.tags?.length) {
              const suggestedTags = await ai.suggestTags(idea.title);
              if (suggestedTags.length > 0) {
                processedIdea.tags = suggestedTags;
              }
            }
          } catch (error) {
            console.warn('AI suggestion failed:', error);
          }
        }

        processedIdeas.push(processedIdea);
      }

      if (processedIdeas.length > 0) {
        onAddIdeas(processedIdeas);
        setInput('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestAll = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const parsedIdeas = parseStructuredText(input);
      const enhancedLines: string[] = [];

      for (const idea of parsedIdeas) {
        if (!idea.title?.trim()) continue;

        try {
          const suggestions = await ai.suggestFields(idea.title);
          const tags = await ai.suggestTags(idea.title);
          
          let line = idea.title;
          if (suggestions.impact) line += ` | I:${suggestions.impact}`;
          if (suggestions.confidence) line += ` | C:${suggestions.confidence}`;
          if (suggestions.effort) line += ` | E:${suggestions.effort}`;
          if (model === 'RICE' && suggestions.reach) line += ` | R:${suggestions.reach}`;
          if (tags.length > 0) line += ` | T:${tags.join(',')}`;
          
          enhancedLines.push(line);
        } catch (error) {
          enhancedLines.push(idea.title);
        }
      }

      setInput(enhancedLines.join('\n'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportCSV(file);
    }
    event.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Ideas
        </h2>
        
        {/* Mode Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as typeof mode)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent"
          >
            <option value="manual">Manual</option>
            <option value="assisted">Assisted</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* Mode Description */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'manual' && 'You provide all values. Incomplete ideas will be excluded from scoring.'}
          {mode === 'assisted' && 'AI suggests values for missing fields. You can accept or modify suggestions.'}
          {mode === 'auto' && 'AI automatically fills all fields. You can edit them afterwards.'}
        </p>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-ocean-blue focus:border-transparent resize-none"
          disabled={isProcessing}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddIdeas}
              disabled={!input.trim() || isProcessing}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
                'bg-primary-ocean-blue text-white hover:bg-opacity-90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Add Ideas'}</span>
            </button>

            {(mode === 'assisted' || mode === 'auto') && (
              <button
                onClick={handleSuggestAll}
                disabled={!input.trim() || isProcessing}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  'bg-primary-terracotta text-white hover:bg-opacity-90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>Suggest All</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFileUpload}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={() => setInput('')}
              disabled={!input.trim()}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload CSV file"
      />
    </div>
  );
}
