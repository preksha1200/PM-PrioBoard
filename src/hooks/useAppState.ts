import { useState, useEffect, useCallback } from 'react';
import type { Idea, Settings, ScoringModel, Persisted } from '../types';
import { loadData, saveData } from '../utils/persistence';
import { calculateScore, sortIdeasByScore } from '../score';

export function useAppState() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [settings, setSettings] = useState<Settings>({} as Settings);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const data = loadData();
    setIdeas(data.ideas);
    setSettings(data.settings);
  }, []);

  // Save data whenever ideas or settings change
  useEffect(() => {
    if (ideas.length > 0 || Object.keys(settings).length > 0) {
      const data: Persisted = { ideas, settings, version: 1 };
      saveData(data);
    }
  }, [ideas, settings]);

  // Recompute scores when ideas or settings change
  useEffect(() => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => ({
        ...idea,
        score: calculateScore(idea, settings.model, settings.weights)
      }))
    );
  }, [settings.model, settings.weights]);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id 
        ? { 
            ...idea, 
            ...updates,
            score: calculateScore({ ...idea, ...updates }, settings.model, settings.weights)
          }
        : idea
    ));
  }, [settings.model, settings.weights]);

  const addIdea = useCallback((idea: Omit<Idea, 'score'>) => {
    const newIdea: Idea = {
      ...idea,
      score: calculateScore(idea, settings.model, settings.weights)
    };
    setIdeas(prev => [...prev, newIdea]);
  }, [settings.model, settings.weights]);

  const addIdeas = useCallback((newIdeas: Omit<Idea, 'score'>[]) => {
    const ideasWithScores = newIdeas.map(idea => ({
      ...idea,
      score: calculateScore(idea, settings.model, settings.weights)
    }));
    setIdeas(prev => [...prev, ...ideasWithScores]);
  }, [settings.model, settings.weights]);

  const deleteIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    if (selectedIdea?.id === id) {
      setSelectedIdea(null);
      setIsDrawerOpen(false);
    }
  }, [selectedIdea]);

  const deleteIdeas = useCallback((ids: string[]) => {
    setIdeas(prev => prev.filter(idea => !ids.includes(idea.id)));
    if (selectedIdea && ids.includes(selectedIdea.id)) {
      setSelectedIdea(null);
      setIsDrawerOpen(false);
    }
  }, [selectedIdea]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateModel = useCallback((model: ScoringModel) => {
    setSettings(prev => ({ ...prev, model }));
  }, []);

  const openDrawer = useCallback((idea: Idea) => {
    setSelectedIdea(idea);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedIdea(null);
  }, []);

  const sortedIdeas = sortIdeasByScore(ideas, settings.model, settings.weights);

  return {
    ideas,
    sortedIdeas,
    settings,
    selectedIdea,
    isDrawerOpen,
    updateIdea,
    addIdea,
    addIdeas,
    deleteIdea,
    deleteIdeas,
    updateSettings,
    updateModel,
    openDrawer,
    closeDrawer,
    setIdeas
  };
}
