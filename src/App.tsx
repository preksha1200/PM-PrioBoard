import { useState, useEffect } from "react";
import { generateAIScores } from './services/aiService';
import ProductProfile from './ProductProfile';

// Types
interface Idea {
  id: string;
  title: string;
  notes?: string;
  reach?: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;
  tags: string[];
  createdAt: string;
}

type ScoringModel = 'ICE' | 'RICE';

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

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Sample data
function createSampleIdeas(): Idea[] {
  return [
    {
      id: generateId(),
      title: "Mobile App Push Notifications",
      notes: "Implement push notifications to increase user engagement",
      reach: 15000,
      impact: 3,
      confidence: 0.8,
      effort: 2,
      score: 0,
      tags: ["mobile", "engagement"],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: "Advanced Analytics Dashboard",
      notes: "Create comprehensive analytics for business insights",
      reach: 5000,
      impact: 2,
      confidence: 0.6,
      effort: 3,
      score: 0,
      tags: ["analytics", "dashboard"],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: "User Onboarding Redesign",
      notes: "Improve new user experience and retention",
      reach: 8000,
      impact: 3,
      confidence: 0.9,
      effort: 1.5,
      score: 0,
      tags: ["ux", "onboarding"],
      createdAt: new Date().toISOString()
    }
  ];
}

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [model, setModel] = useState<ScoringModel>('ICE');
  const [currentPage, setCurrentPage] = useState<'main' | 'product-profile'>('main');
  const [newIdea, setNewIdea] = useState({
    title: '',
    notes: '',
    reach: 100,
    impact: 3,
    confidence: 0.8,
    effort: 2,
    tags: [] as string[],
    bulkText: '',
    defaultTags: [] as string[],
    scoringMethod: 'manual'
  });
  
  // Enhanced Add Ideas state
  const [addSectionExpanded, setAddSectionExpanded] = useState(true);
  const [message, setMessage] = useState('');
  
  // Edit functionality state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Idea>>({});
  
  // Delete confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    ideaId: string | null;
    ideaTitle: string;
  }>({ isOpen: false, ideaId: null, ideaTitle: '' });
  
  // AI scoring preview state
  const [aiScoredPreview, setAiScoredPreview] = useState<Idea[]>([]);

  // Load sample data on mount
  useEffect(() => {
    const sampleIdeas = createSampleIdeas();
    const ideasWithScores = sampleIdeas.map(idea => ({
      ...idea,
      score: calculateScore(idea, model)
    }));
    setIdeas(ideasWithScores);
  }, []);

  // Recalculate scores when model changes
  useEffect(() => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => ({
        ...idea,
        score: calculateScore(idea, model)
      }))
    );
  }, [model]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIdea.title.trim()) {
      showMessage('Please enter a title');
      return;
    }

    const idea: Idea = {
      id: generateId(),
      title: newIdea.title.trim(),
      notes: newIdea.notes.trim(),
      reach: model === 'RICE' ? newIdea.reach : undefined,
      impact: newIdea.impact,
      confidence: newIdea.confidence,
      effort: newIdea.effort,
      score: 0,
      tags: newIdea.tags || [],
      createdAt: new Date().toISOString()
    };

    idea.score = calculateScore(idea, model);
    setIdeas(prev => [...prev, idea]);
    
    // Reset form
    setNewIdea({
      title: '',
      notes: '',
      reach: 100,
      impact: 3,
      confidence: 0.8,
      effort: 2,
      tags: [],
      bulkText: '',
      defaultTags: [],
      scoringMethod: 'manual'
    });
    
    showMessage('Idea added successfully!');
  };

  const handleDeleteIdea = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea) {
      setDeleteConfirmation({
        isOpen: true,
        ideaId: id,
        ideaTitle: idea.title
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.ideaId) {
      setIdeas(prev => prev.filter(idea => idea.id !== deleteConfirmation.ideaId));
      showMessage('Idea deleted successfully');
      setDeleteConfirmation({ isOpen: false, ideaId: null, ideaTitle: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, ideaId: null, ideaTitle: '' });
  };

  // Edit functionality
  const handleEditIdea = (idea: Idea) => {
    setEditingId(idea.id);
    setEditForm({
      title: idea.title,
      notes: idea.notes || '',
      reach: idea.reach,
      impact: idea.impact,
      confidence: idea.confidence,
      effort: idea.effort,
      tags: idea.tags
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.title) return;
    
    setIdeas(prev => prev.map(idea => {
      if (idea.id === editingId) {
        const updatedIdea = {
          ...idea,
          title: editForm.title || idea.title,
          notes: editForm.notes || '',
          reach: editForm.reach || idea.reach,
          impact: editForm.impact || idea.impact,
          confidence: editForm.confidence || idea.confidence,
          effort: editForm.effort || idea.effort,
          tags: editForm.tags || idea.tags
        };
        updatedIdea.score = calculateScore(updatedIdea, model);
        return updatedIdea;
      }
      return idea;
    }));
    
    setEditingId(null);
    setEditForm({});
    showMessage('Idea updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Bulk Add functionality
  const parseIdeaFromText = (text: string) => {
    const parts = text.split('|').map(part => part.trim());
    const idea: any = {
      title: parts[0] || text.trim(),
      notes: '',
      reach: newIdea.reach,
      impact: newIdea.impact,
      confidence: newIdea.confidence,
      effort: newIdea.effort,
      tags: []
    };

    // Parse advanced format: Title | I:5 | C:0.8 | E:1.5 | R:100 | T:feature,ui
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('I:')) {
        idea.impact = parseInt(part.substring(2)) || newIdea.impact;
      } else if (part.startsWith('C:')) {
        let confidenceStr = part.substring(2).trim();
        if (confidenceStr.endsWith('%')) {
          idea.confidence = parseFloat(confidenceStr.slice(0, -1)) / 100 || newIdea.confidence;
        } else {
          idea.confidence = parseFloat(confidenceStr) || newIdea.confidence;
        }
      } else if (part.startsWith('E:')) {
        idea.effort = parseFloat(part.substring(2)) || newIdea.effort;
      } else if (part.startsWith('R:')) {
        idea.reach = parseInt(part.substring(2)) || newIdea.reach;
      } else if (part.startsWith('T:')) {
        idea.tags = part.substring(2).split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    return idea;
  };

  const handleGenerateAIScoring = async () => {
    if (!newIdea.bulkText?.trim()) {
      showMessage('Please enter some ideas first to generate AI scoring');
      return;
    }

    showMessage('AI Scoring generation started...');
    
    try {
      const lines = newIdea.bulkText.split('\n').filter(line => line.trim());
      const newIdeas: Idea[] = [];

      for (const line of lines) {
        const parsedIdea = parseIdeaFromText(line.trim());
        if (parsedIdea) {
          // Apply default tags if specified
          const allTags = [...(parsedIdea.tags || []), ...(newIdea.defaultTags || [])]
            .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
          
          // Generate AI-suggested scores based on content analysis
          const aiScores = await generateAIScores(parsedIdea.title, parsedIdea.notes || '');
          
          newIdeas.push({
            ...parsedIdea,
            tags: allTags,
            ...aiScores
          });
        }
      }

      if (newIdeas.length === 0) {
        showMessage('No valid ideas found. Please check the format.');
        return;
      }

      // Calculate scores for new ideas and store in preview
      const newIdeasWithScores = newIdeas.map(idea => ({
        ...idea,
        score: calculateScore(idea, model)
      }));
      setAiScoredPreview(newIdeasWithScores);
      showMessage(`AI generated scores for ${newIdeas.length} idea${newIdeas.length === 1 ? '' : 's'}. Review below and click "Add Ideas" to confirm.`);
    } catch (error) {
      console.error('AI scoring failed:', error);
      showMessage('AI scoring failed. Please try again.');
    }
  };



  // Add AI-scored preview to main list
  const handleAddAIScoredIdeas = () => {
    if (aiScoredPreview.length === 0) {
      showMessage('No AI-scored ideas to add. Generate AI scoring first.');
      return;
    }

    setIdeas(prev => [...prev, ...aiScoredPreview]);
    showMessage(`Added ${aiScoredPreview.length} AI-scored idea${aiScoredPreview.length === 1 ? '' : 's'} successfully!`);
    
    // Clear preview and reset form
    setAiScoredPreview([]);
    setNewIdea({
      title: '',
      notes: '',
      reach: 100,
      impact: 3,
      confidence: 0.8,
      effort: 2,
      tags: [],
      bulkText: '',
      defaultTags: [],
      scoringMethod: 'manual'
    });
  };

  const handleBulkAdd = () => {
    // If AI scoring mode and there are previewed ideas, add them
    if (newIdea.scoringMethod === 'ai' && aiScoredPreview.length > 0) {
      handleAddAIScoredIdeas();
      return;
    }

    // Manual scoring mode - process ideas normally
    if (!newIdea.bulkText?.trim()) {
      showMessage('Please enter some ideas to add');
      return;
    }

    const lines = newIdea.bulkText.split('\n').filter(line => line.trim());
    const newIdeas: Idea[] = [];

    lines.forEach(line => {
      const parsedIdea = parseIdeaFromText(line.trim());
      if (parsedIdea) {
        // Apply default tags if specified
        const allTags = [...(parsedIdea.tags || []), ...(newIdea.defaultTags || [])]
          .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
        
        newIdeas.push({
          ...parsedIdea,
          tags: allTags,
          // Apply manual scoring values if manual mode
          ...(newIdea.scoringMethod === 'manual' && {
            reach: newIdea.reach || 100,
            impact: newIdea.impact || 3,
            confidence: newIdea.confidence || 0.8,
            effort: newIdea.effort || 2
          })
        });
      }
    });

    if (newIdeas.length === 0) {
      showMessage('No valid ideas found. Please check the format.', 'error');
      return;
    }

    // Calculate scores for new ideas before adding them
    const newIdeasWithScores = newIdeas.map(idea => ({
      ...idea,
      score: calculateScore(idea, model)
    }));
    setIdeas(prev => [...prev, ...newIdeasWithScores]);
    showMessage(`Added ${newIdeas.length} idea${newIdeas.length === 1 ? '' : 's'} successfully!`);
    
    // Reset form
    setNewIdea({
      title: '',
      notes: '',
      reach: 100,
      impact: 3,
      confidence: 0.8,
      effort: 2,
      tags: [],
      bulkText: '',
      defaultTags: [],
      scoringMethod: 'manual'
    });
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        showMessage('CSV file must have at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const newIdeas: Idea[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length < headers.length) continue;

        const idea: Idea = {
          id: generateId(),
          title: values[headers.indexOf('title')] || `Idea ${i}`,
          notes: values[headers.indexOf('notes')] || '',
          reach: model === 'RICE' ? parseInt(values[headers.indexOf('reach')]) || 100 : undefined,
          impact: parseInt(values[headers.indexOf('impact')]) || 3,
          confidence: (() => {
            const confidenceStr = values[headers.indexOf('confidence')]?.trim() || '0.8';
            if (confidenceStr.endsWith('%')) {
              return parseFloat(confidenceStr.slice(0, -1)) / 100 || 0.8;
            } else {
              return parseFloat(confidenceStr) || 0.8;
            }
          })(),
          effort: parseFloat(values[headers.indexOf('effort')]) || 2,
          score: 0,
          tags: values[headers.indexOf('tags')] ? 
            values[headers.indexOf('tags')].split(';').map(tag => tag.trim()).filter(Boolean) : [],
          createdAt: new Date().toISOString()
        };

        idea.score = calculateScore(idea, model);
        newIdeas.push(idea);
      }

      setIdeas(prev => [...prev, ...newIdeas]);
      showMessage(`Imported ${newIdeas.length} idea${newIdeas.length > 1 ? 's' : ''} from CSV!`);
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const handleExportCSV = () => {
    const headers = model === 'RICE' 
      ? ['Title', 'Reach', 'Impact', 'Confidence', 'Effort', 'Score', 'Tags']
      : ['Title', 'Impact', 'Confidence', 'Effort', 'Score', 'Tags'];
    
    const csvContent = [
      headers.join(','),
      ...ideas.map(idea => {
        const row = [
          `"${idea.title}"`,
          ...(model === 'RICE' ? [idea.reach?.toString() || ''] : []),
          idea.impact.toString(),
          idea.confidence.toString(),
          idea.effort.toString(),
          Math.round(idea.score).toString(),
          `"${idea.tags.join(';')}"`
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
    
    showMessage('CSV exported successfully!');
  };

  const sortedIdeas = [...ideas].sort((a, b) => b.score - a.score);

  // Handle page navigation
  if (currentPage === 'product-profile') {
    return (
      <ProductProfile onBack={() => setCurrentPage('main')} />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1e293b'
            }}>
              PM PrioBoard
            </h1>
            
            {/* Beautiful ICE/RICE Toggle Button */}
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '4px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Sliding Background Indicator */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: model === 'ICE' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
                height: 'calc(100% - 8px)',
                backgroundColor: '#F8F4E3',
                borderRadius: '8px',
                transition: 'left 0.2s ease-in-out',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} />
              
              {/* ICE Button */}
              <button
                onClick={() => setModel('ICE')}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '8px 20px',
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'color 0.2s ease-in-out',
                  minWidth: '60px'
                }}
              >
                ICE
              </button>
              
              {/* RICE Button */}
              <button
                onClick={() => setModel('RICE')}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '8px 20px',
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'color 0.2s ease-in-out',
                  minWidth: '60px'
                }}
              >
                RICE
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Product Profile Button */}
            <button
              onClick={() => setCurrentPage('product-profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#F8F4E3',
                color: 'black',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0ead6';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F4E3';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Modern Settings/Profile Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17.5-3.5L19 12l-1.5 1.5M5 10.5L6.5 12 5 13.5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
              </svg>
              Product Profile
            </button>
            
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#F8F4E3',
                color: 'black',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0ead6';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8F4E3';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Modern Download/Export Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '0.375rem',
          zIndex: 1000,
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 2rem',
        display: 'grid',
        gap: '3rem'
      }}>
        {/* Enhanced Add Ideas Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Collapsible Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: addSectionExpanded ? '1px solid #e2e8f0' : 'none'
          }}>
            <button
              onClick={() => setAddSectionExpanded(!addSectionExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'none',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#133C55',
                cursor: 'pointer',
                padding: '0',
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: addSectionExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out'
              }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.5 2.25L8.25 6L4.5 9.75"
                    stroke="#133C55"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              Add Ideas
            </button>
          </div>
          
          {/* Expandable Content */}
          {addSectionExpanded && (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Bulk Text Input Area */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1D3557' 
                }}>
                  Bulk Text Input
                </label>
                <textarea
                  value={newIdea.bulkText || ''}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, bulkText: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    minHeight: '120px',
                    resize: 'vertical',
                    fontFamily: 'monospace'
                  }}
                  placeholder="Enter one idea per line...&#10;&#10;Advanced format: Title | I:5 | C:0.8 | E:1.5 | R:100 | T:feature,ui&#10;Simple format: Just the idea title"
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#386FA4',
                  marginTop: '0.25rem'
                }}>
                  Advanced format: Title | I:impact | C:confidence | E:effort | R:reach | T:tags
                </div>
              </div>

              {/* Default Tags Section */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1D3557' 
                }}>
                  Default Tags
                </label>
                <input
                  type="text"
                  value={Array.isArray(newIdea.defaultTags) ? newIdea.defaultTags.join(', ') : newIdea.defaultTags || ''}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, defaultTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="feature, enhancement, ui"
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#386FA4',
                  marginTop: '0.25rem'
                }}>
                  These tags will be applied to all ideas automatically
                </div>
              </div>

              {/* Manual vs AI Suggested Scoring Toggle */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1D3557' 
                }}>
                  Scoring Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: (newIdea.scoringMethod || 'manual') === 'manual' ? '#f0f9ff' : '#ffffff'
                  }}>
                    <input
                      type="radio"
                      name="scoringMethod"
                      value="manual"
                      checked={(newIdea.scoringMethod || 'manual') === 'manual'}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, scoringMethod: e.target.value }))}
                      style={{ marginTop: '0.125rem' }}
                    />
                    {/* Calculator Icon for Manual Scoring */}
                    <div style={{ marginTop: '0.125rem' }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="4"
                          y="2"
                          width="16"
                          height="20"
                          rx="2"
                          fill="#457B9D"
                        />
                        <rect
                          x="6"
                          y="4"
                          width="12"
                          height="3"
                          rx="1"
                          fill="white"
                        />
                        <circle cx="8" cy="10" r="1" fill="white" />
                        <circle cx="12" cy="10" r="1" fill="white" />
                        <circle cx="16" cy="10" r="1" fill="white" />
                        <circle cx="8" cy="13" r="1" fill="white" />
                        <circle cx="12" cy="13" r="1" fill="white" />
                        <circle cx="16" cy="13" r="1" fill="white" />
                        <circle cx="8" cy="16" r="1" fill="white" />
                        <circle cx="12" cy="16" r="1" fill="white" />
                        <rect
                          x="15"
                          y="15"
                          width="2"
                          height="4"
                          rx="1"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1D3557', marginBottom: '0.25rem' }}>
                        Manual Scoring
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#386FA4' }}>
                        Set uniform scores for all ideas
                      </div>
                    </div>
                  </label>
                  
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: (newIdea.scoringMethod || 'manual') === 'ai' ? '#f0f9ff' : '#ffffff'
                  }}>
                    <input
                      type="radio"
                      name="scoringMethod"
                      value="ai"
                      checked={(newIdea.scoringMethod || 'manual') === 'ai'}
                      onChange={(e) => setNewIdea(prev => ({ ...prev, scoringMethod: e.target.value }))}
                      style={{ marginTop: '0.125rem' }}
                    />
                    {/* Brain Icon for AI Suggested Scoring */}
                    <div style={{ marginTop: '0.125rem' }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C8.5 2 6 4.5 6 8C6 8.5 6.1 9 6.2 9.5C5.5 10.2 5 11.1 5 12.2C5 13.8 6.2 15.1 7.8 15.4C8.5 16.4 9.7 17 11 17H13C14.3 17 15.5 16.4 16.2 15.4C17.8 15.1 19 13.8 19 12.2C19 11.1 18.5 10.2 17.8 9.5C17.9 9 18 8.5 18 8C18 4.5 15.5 2 12 2Z"
                          fill="#133C55"
                        />
                        <path
                          d="M9 19C9 20.1 9.9 21 11 21H13C14.1 21 15 20.1 15 19V18H9V19Z"
                          fill="#133C55"
                        />
                        <circle cx="9.5" cy="9" r="1" fill="white" />
                        <circle cx="14.5" cy="9" r="1" fill="white" />
                        <circle cx="12" cy="11" r="0.8" fill="white" />
                        <circle cx="10" cy="12.5" r="0.6" fill="white" />
                        <circle cx="14" cy="12.5" r="0.6" fill="white" />
                        <path
                          d="M8 7C7.4 7 7 7.4 7 8C7 8.6 7.4 9 8 9"
                          stroke="white"
                          strokeWidth="0.8"
                          fill="none"
                        />
                        <path
                          d="M16 7C16.6 7 17 7.4 17 8C17 8.6 16.6 9 16 9"
                          stroke="white"
                          strokeWidth="0.8"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#1D3557', marginBottom: '0.25rem' }}>
                        AI Suggested Scoring
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#386FA4' }}>
                        Let AI analyze and suggest scores
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Conditional Score Values Section or Generate AI Scoring Button */}
              {(newIdea.scoringMethod || 'manual') === 'manual' ? (
                /* Score Values Section - Only for Manual Scoring */
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#1D3557' 
                  }}>
                    Score Values (Applied to all ideas)
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: model === 'RICE' ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', 
                    gap: '0.75rem' 
                  }}>
                    {model === 'RICE' && (
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.25rem', 
                          fontSize: '0.75rem', 
                          fontWeight: '500', 
                          color: '#374151' 
                        }}>
                          Reach
                        </label>
                        <input
                          type="number"
                          value={newIdea.reach || 100}
                          onChange={(e) => setNewIdea(prev => ({ ...prev, reach: parseInt(e.target.value) || 100 }))}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                          min="0"
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.25rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#374151' 
                      }}>
                        Impact
                      </label>
                      <select
                        value={newIdea.impact || 3}
                        onChange={(e) => setNewIdea(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Medium</option>
                        <option value={3}>3 - High</option>
                        <option value={4}>4 - Very High</option>
                        <option value={5}>5 - Critical</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.25rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#374151' 
                      }}>
                        Confidence
                      </label>
                      <select
                        value={newIdea.confidence || 0.8}
                        onChange={(e) => setNewIdea(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <option value={0.1}>10% - Very Low</option>
                        <option value={0.3}>30% - Low</option>
                        <option value={0.5}>50% - Medium</option>
                        <option value={0.8}>80% - High</option>
                        <option value={1.0}>100% - Certain</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.25rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        color: '#374151' 
                      }}>
                        Effort
                      </label>
                      <input
                        type="number"
                        value={newIdea.effort || 2}
                        onChange={(e) => setNewIdea(prev => ({ ...prev, effort: parseFloat(e.target.value) || 2 }))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}
                        min="0.1"
                        max="10"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Generate AI Scoring Button - Only for AI Scoring */
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#1D3557' 
                  }}>
                    AI Scoring Generation
                  </label>
                  <button
                    onClick={handleGenerateAIScoring}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#F87171',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    🧠 Generate AI Scoring
                  </button>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#386FA4',
                    marginTop: '0.5rem',
                    textAlign: 'center'
                  }}>
                    AI will analyze your ideas and suggest appropriate scores based on content and context
                  </div>
                </div>
              )}

              {/* AI Scoring Preview Section */}
              {aiScoredPreview.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1D3557'
                  }}>AI Scoring Preview ({aiScoredPreview.length} idea{aiScoredPreview.length === 1 ? '' : 's'})</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {aiScoredPreview.map((idea, index) => (
                      <div key={index} style={{
                        padding: '0.75rem',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        fontSize: '0.8125rem'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1D3557', marginBottom: '0.25rem' }}>
                          {idea.title}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#386FA4' }}>
                          {model === 'RICE' && <span>Reach: {idea.reach}</span>}
                          <span>Impact: {idea.impact}</span>
                          <span>Confidence: {Math.round(idea.confidence * 100)}%</span>
                          <span>Effort: {idea.effort}</span>
                          <span style={{ fontWeight: '600', color: '#133C55' }}>Score: {idea.score}</span>
                        </div>
                        {(idea as any).reasoning && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            color: '#475569',
                            fontStyle: 'italic'
                          }}>
                            <strong>AI Reasoning:</strong> {(idea as any).reasoning}
                            <div style={{
                              marginTop: '0.25rem',
                              fontSize: '0.625rem',
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              {(idea as any).isGeminiResponse ? '🤖 Powered by Google Gemini 2.0 Flash' : '⚡ Enhanced Fallback System'}
                            </div>
                          </div>
                        )}
                        {idea.tags && idea.tags.length > 0 && (
                          <div style={{ marginTop: '0.25rem' }}>
                            {idea.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} style={{
                                display: 'inline-block',
                                padding: '0.125rem 0.375rem',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                borderRadius: '0.25rem',
                                fontSize: '0.6875rem',
                                marginRight: '0.25rem'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    color: '#0369a1',
                    textAlign: 'center'
                  }}>
                    💡 Review the AI-generated scores above. Click "Add Ideas" below to add them to your prioritization board.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', justifyContent: 'flex-start' }}>
                <button
                  onClick={handleBulkAdd}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#133C55',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Add Ideas
                </button>
                <button
                  onClick={() => document.getElementById('csvFileInput')?.click()}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#386FA4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Upload CSV
                </button>
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* CSV Format Info */}
              <div style={{
                fontSize: '0.75rem',
                color: '#386FA4',
                fontStyle: 'italic'
              }}>
                CSV format: Title, {model === 'RICE' ? 'Reach, ' : ''}Impact, Confidence, Effort, Tags
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ideas Table - Full Width Below */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto 0',
        padding: '0 2rem'
      }}>
        {/* Ideas Table */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            Ideas
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Title
                  </th>
                  {model === 'RICE' && (
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Reach
                    </th>
                  )}
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Impact
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Confidence
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Effort
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Score
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Tags
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedIdeas.map((idea, index) => (
                  <tr key={idea.id} style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: editingId === idea.id ? '#fef3c7' : 'transparent'
                  }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {editingId === idea.id ? (
                        <div>
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              marginBottom: '0.25rem'
                            }}
                            placeholder="Idea title"
                          />
                          <textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              resize: 'vertical',
                              minHeight: '2rem'
                            }}
                            placeholder="Notes (optional)"
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: '500', color: '#1e293b' }}>{idea.title}</div>
                          {idea.notes && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {idea.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    {model === 'RICE' && (
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                        {editingId === idea.id ? (
                          <input
                            type="number"
                            value={editForm.reach || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, reach: parseInt(e.target.value) || 0 }))}
                            style={{
                              width: '80px',
                              padding: '0.25rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem'
                            }}
                            min="0"
                          />
                        ) : (
                          idea.reach?.toLocaleString() || '-'
                        )}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {editingId === idea.id ? (
                        <input
                          type="number"
                          value={editForm.impact || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, impact: parseInt(e.target.value) || 1 }))}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                          min="1"
                          max="5"
                        />
                      ) : (
                        idea.impact
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {editingId === idea.id ? (
                        <input
                          type="number"
                          value={editForm.confidence ? (editForm.confidence * 100).toFixed(0) : ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, confidence: (parseInt(e.target.value) || 0) / 100 }))}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                          min="0"
                          max="100"
                        />
                      ) : (
                        `${(idea.confidence * 100).toFixed(0)}%`
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {editingId === idea.id ? (
                        <input
                          type="number"
                          value={editForm.effort || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, effort: parseFloat(e.target.value) || 1 }))}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                          min="0.1"
                          max="10"
                          step="0.1"
                        />
                      ) : (
                        idea.effort
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{
                        fontWeight: '500',
                        color: '#1e40af',
                        backgroundColor: 'transparent',
                        padding: '0',
                        borderRadius: '0'
                      }}>
                        {Math.round(idea.score)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {idea.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {editingId === idea.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#386FA4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Edit Icon Button */}
                            <button
                              onClick={() => handleEditIdea(idea)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                color: '#457B9D',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '0.25rem',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Edit idea"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            {/* Delete Icon Button */}
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Delete idea"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3 6H5H21"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 11V17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14 11V17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Impact vs Effort Analysis Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto 0 auto',
        padding: '0 2rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#1D3557',
            textAlign: 'center'
          }}>
            Impact vs Effort Analysis
          </h2>
          
          {ideas.length > 0 ? (
            <div style={{
              width: '100%',
              height: '500px',
              position: 'relative',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '2rem',
              margin: '0 auto'
            }}>
              {/* Grid lines for better visual structure */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '2rem',
                right: '2rem',
                height: '1px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute',
                top: '75%',
                left: '2rem',
                right: '2rem',
                height: '1px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute',
                top: '2rem',
                bottom: '2rem',
                left: '25%',
                width: '1px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute',
                top: '2rem',
                bottom: '2rem',
                left: '75%',
                width: '1px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />
              
              {/* Main quadrant lines (thicker) */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '2rem',
                right: '2rem',
                height: '2px',
                backgroundColor: '#cbd5e1',
                zIndex: 2
              }} />
              <div style={{
                position: 'absolute',
                top: '2rem',
                bottom: '2rem',
                left: '50%',
                width: '2px',
                backgroundColor: '#cbd5e1',
                zIndex: 2
              }} />
              
              {/* Quadrant labels */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                fontSize: '0.8rem',
                color: '#059669',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #d1fae5'
              }}>
                🎯 Quick Wins
              </div>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                fontSize: '0.8rem',
                color: '#dc2626',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #fecaca',
                textAlign: 'right'
              }}>
                🚀 Major Projects
              </div>
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                fontSize: '0.8rem',
                color: '#64748b',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #e2e8f0'
              }}>
                💭 Fill-ins
              </div>
              <div style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                fontSize: '0.8rem',
                color: '#dc2626',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #fecaca',
                textAlign: 'right'
              }}>
                ❌ Avoid
              </div>
              
              {/* Data points */}
              {ideas.map((idea, index) => {
                const impacts = ideas.map(i => i.impact);
                const efforts = ideas.map(i => i.effort);
                
                const minImpact = Math.min(...impacts);
                const maxImpact = Math.max(...impacts);
                const minEffort = Math.min(...efforts);
                const maxEffort = Math.max(...efforts);
                
                const impactRange = maxImpact - minImpact || 1;
                const effortRange = maxEffort - minEffort || 1;
                
                const normalizedEffort = (idea.effort - minEffort) / effortRange;
                const normalizedImpact = (idea.impact - minImpact) / impactRange;
                
                const x = 15 + (normalizedEffort * 70);
                const y = 85 - (normalizedImpact * 70);
                
                const colors = ['#133C55', '#457B9D', '#A8DADC', '#CD8B76', '#1D3557', '#F77F00', '#FCBF49'];
                const color = colors[index % colors.length];
                
                const pointSize = 14 + (idea.score / Math.max(...ideas.map(i => i.score))) * 6;
                
                return (
                  <div
                    key={idea.id}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${pointSize}px`,
                      height: `${pointSize}px`,
                      backgroundColor: color,
                      borderRadius: '50%',
                      border: '3px solid white',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 3,
                      transition: 'all 0.2s ease'
                    }}
                    title={`${idea.title}\nImpact: ${idea.impact}, Effort: ${idea.effort}\nScore: ${Math.round(idea.score)}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)';
                      e.currentTarget.style.zIndex = '4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                      e.currentTarget.style.zIndex = '3';
                    }}
                  />
                );
              })}
              
              {/* Axis labels */}
              <div style={{
                position: 'absolute',
                bottom: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: '600',
                backgroundColor: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                Effort →
              </div>
              <div style={{
                position: 'absolute',
                left: '-60px',
                top: '50%',
                transform: 'translateY(-50%) rotate(-90deg)',
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: '600',
                backgroundColor: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }}>
                Impact →
              </div>
            </div>
          ) : (
            <div style={{
              height: '400px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}>
              No data to display
            </div>
          )}
          
          {/* Legend */}
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: '#64748b',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            Point size reflects {model} score • Hover for details
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Delete Idea
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#386FA4',
                  margin: '0.25rem 0 0 0'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              Are you sure you want to delete <strong>"{deleteConfirmation.ideaTitle}"</strong>? This will permanently remove the idea from your list.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Simple Footer */}
      <footer style={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '1rem 0',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '0 3rem'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0,
            fontWeight: '400'
          }}>
            Made with ❤️ for product managers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
