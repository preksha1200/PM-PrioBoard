import { useState, useEffect } from "react";
import type { 
  Idea, 
  Settings
} from "./types";
import { createSampleIdeas } from "./data/sampleData";
import { TopBar } from "./components/TopBar";
import { AddIdeasCard } from "./components/AddIdeasCard";
import { IdeasTable } from "./components/IdeasTable";
import { QuadrantChart } from "./components/QuadrantChart";
import { SelectionDrawer } from "./components/SelectionDrawer";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Define utility functions inline to ensure they work properly
function calculateScore(idea: Idea, model: 'ICE' | 'RICE'): number {
  if (idea.effort <= 0) return 0;
  
  if (model === 'ICE') {
    return (idea.impact * idea.confidence) / idea.effort;
  } else {
    if (!idea.reach || idea.reach <= 0) return 0;
    return (idea.reach * idea.impact * idea.confidence) / idea.effort;
  }
}

function isIdeaComplete(idea: Idea, model: 'ICE' | 'RICE'): boolean {
  const baseComplete = !!idea.title && idea.impact > 0 && idea.confidence > 0 && idea.effort > 0;
  if (model === 'RICE') {
    return baseComplete && !!idea.reach && idea.reach > 0;
  }
  return baseComplete;
}

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    model: 'RICE',
    mode: 'manual',
    weights: { reach: 1, impact: 1, confidence: 1, effort: 1 },
    chartThresholds: 'median',
    chart: {
      useMedians: true,
      xMedian: 1,
      yMedian: 1
    }
  });

  // Load sample data on mount
  useEffect(() => {
    setIdeas(createSampleIdeas());
  }, []);

  // Update scores when model changes
  useEffect(() => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => ({
        ...idea,
        score: calculateScore(idea, settings.model),
        isComplete: isIdeaComplete(idea, settings.model)
      }))
    );
  }, [settings.model]);

  const handleModelChange = (model: 'ICE' | 'RICE') => {
    setSettings(prev => ({ ...prev, model }));
    toast.success(`Switched to ${model} scoring model`);
  };

  const handleAddIdeas = (ideaDataList: Array<{title: string; impact?: number; confidence?: number; effort?: number; reach?: number; tags?: string[]}>) => {
    const newIdeas: Idea[] = ideaDataList.map(ideaData => {
      const idea: Idea = {
        id: crypto.randomUUID(),
        title: ideaData.title.trim(),
        notes: '',
        reach: ideaData.reach || (settings.model === 'RICE' ? 100 : undefined),
        impact: (ideaData.impact || 1) as ImpactLevel,
        confidence: ideaData.confidence || 0.8,
        effort: ideaData.effort || 1,
        score: 0,
        tags: ideaData.tags || [],
        createdAt: new Date().toISOString(),
        isComplete: false
      };
      
      idea.score = calculateScore(idea, settings.model);
      idea.isComplete = isIdeaComplete(idea, settings.model);
      return idea;
    });

    setIdeas(prev => [...prev, ...newIdeas]);
    toast.success(`Added ${newIdeas.length} idea${newIdeas.length > 1 ? 's' : ''}`);
  };

  const handleUpdateIdea = (id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => {
      if (idea.id === id) {
        const updated = { ...idea, ...updates };
        updated.score = calculateScore(updated, settings.model);
        updated.isComplete = isIdeaComplete(updated, settings.model);
        return updated;
      }
      return idea;
    }));
    
    // Update selected idea if it's the one being edited
    if (selectedIdea?.id === id) {
      setSelectedIdea(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        updated.score = calculateScore(updated, settings.model);
        updated.isComplete = isIdeaComplete(updated, settings.model);
        return updated;
      });
    }
    
    toast.success('Idea updated');
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    if (selectedIdea?.id === id) {
      setSelectedIdea(null);
      setIsDrawerOpen(false);
    }
    toast.success('Idea deleted');
  };

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setIsDrawerOpen(true);
  };

  const handleImportCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newIdeas: Idea[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length || !values[0]?.trim()) continue;
        
        const idea: Partial<Idea> = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          tags: []
        };
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (!value) return;
          
          switch (header) {
            case 'title':
              idea.title = value;
              break;
            case 'notes':
              idea.notes = value;
              break;
            case 'reach':
              idea.reach = parseFloat(value) || 0;
              break;
            case 'impact':
              const impactValue = parseFloat(value) || 1;
              idea.impact = Math.min(3, Math.max(1, Math.round(impactValue))) as ImpactLevel;
              break;
            case 'confidence':
              idea.confidence = parseFloat(value) || 0.8;
              break;
            case 'effort':
              idea.effort = parseFloat(value) || 1;
              break;
            case 'tags':
              idea.tags = value.split(';').map(tag => tag.trim()).filter(Boolean);
              break;
          }
        });
        
        if (idea.title) {
          const completeIdea = idea as Idea;
          completeIdea.impact = (completeIdea.impact || 1) as ImpactLevel;
          completeIdea.confidence = completeIdea.confidence || 0.8;
          completeIdea.effort = completeIdea.effort || 1;
          completeIdea.tags = completeIdea.tags || [];
          
          completeIdea.score = calculateScore(completeIdea, settings.model);
          completeIdea.isComplete = isIdeaComplete(completeIdea, settings.model);
          newIdeas.push(completeIdea);
        }
      }
      
      if (newIdeas.length > 0) {
        setIdeas(prev => [...prev, ...newIdeas]);
        toast.success(`Imported ${newIdeas.length} ideas from CSV`);
      } else {
        toast.error('No valid ideas found in CSV');
      }
    } catch (error) {
      toast.error('Error importing CSV file');
    }
  };

  const handleExport = () => {
    const headers = settings.model === 'RICE' 
      ? ['title', 'reach', 'impact', 'confidence', 'effort', 'score', 'tags']
      : ['title', 'impact', 'confidence', 'effort', 'score', 'tags'];
    
    const csvContent = [
      headers.join(','),
      ...ideas.map(idea => {
        const row = [
          `"${idea.title}"`,
          ...(settings.model === 'RICE' ? [idea.reach?.toString() || ''] : []),
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
    a.download = `pm-prioboard-${settings.model.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Ideas exported to CSV');
  };

  const handleAdvancedWeights = () => {
    toast.info('Advanced weights feature coming soon!');
  };

  const incompleteCount = ideas.filter(idea => !idea.isComplete).length;
  const completeIdeas = ideas.filter(idea => idea.isComplete);

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        model={settings.model}
        onModelChange={handleModelChange}
        onImport={() => document.getElementById('csv-input')?.click()}
        onExport={handleExport}
        onOpenWeights={handleAdvancedWeights}
      />
      
      {/* Hidden CSV input */}
      <input
        id="csv-input"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportCSV(file);
          e.target.value = '';
        }}
      />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {incompleteCount > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive font-medium">
              {incompleteCount} idea{incompleteCount > 1 ? 's are' : ' is'} incomplete. 
              Complete all fields to include {incompleteCount > 1 ? 'them' : 'it'} in ranking.
            </p>
          </div>
        )}
        
        {/* Dynamic layout based on data presence */}
        {completeIdeas.length >= 2 ? (
          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
            {/* Left side - Add Ideas and Table */}
            <div className="2xl:col-span-8 space-y-6">
              <AddIdeasCard
                onAddIdeas={handleAddIdeas}
                onImportCSV={handleImportCSV}
                model={settings.model}
              />
              
              <IdeasTable
                ideas={ideas}
                model={settings.model}
                onUpdateIdea={handleUpdateIdea}
                onDeleteIdea={handleDeleteIdea}
                onSelectIdea={handleSelectIdea}
              />
            </div>
            
            {/* Right side - Chart */}
            <div className="2xl:col-span-4 space-y-6">
              <QuadrantChart
                ideas={ideas}
                model={settings.model}
                onSelectIdea={handleSelectIdea}
                onUpdateIdea={handleUpdateIdea}
                useMedians={settings.chart.useMedians}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AddIdeasCard
                  model={settings.model}
                  onUpdateIdea={handleUpdateIdea}
                  onDeleteIdea={handleDeleteIdea}
                  onSelectIdea={handleSelectIdea}
                />
              </div>
              
              <div className="xl:col-span-1">
                <QuadrantChart
                  ideas={ideas}
                  model={settings.model}
                  onSelectIdea={handleSelectIdea}
                  onUpdateIdea={handleUpdateIdea}
                  useMedians={settings.chart.useMedians}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <SelectionDrawer
        idea={selectedIdea}
        model={settings.model}
        weights={settings.weights}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedIdea(null);
        }}
        onUpdateIdea={handleUpdateIdea}
        onDeleteIdea={handleDeleteIdea}
      />
      
      <Toaster />
    </div>
  );
}

export default App;
