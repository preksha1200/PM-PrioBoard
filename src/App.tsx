import { useState, useEffect } from "react";

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
  const [model, setModel] = useState<ScoringModel>('RICE');
  const [newIdea, setNewIdea] = useState({
    title: '',
    notes: '',
    reach: 100,
    impact: 3,
    confidence: 0.8,
    effort: 2,
    tags: ''
  });
  
  // Enhanced Add Ideas state
  const [addSectionExpanded, setAddSectionExpanded] = useState(true);
  const [message, setMessage] = useState('');
  
  // Edit functionality state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Idea>>({});

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
      tags: newIdea.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    idea.score = calculateScore(idea, model);
    setIdeas(prev => [...prev, idea]);
    
    // Reset form
    setNewIdea({
      title: '',
      notes: '',
      reach: 100,
      impact: 1,
      confidence: 0.8,
      effort: 1,
      tags: ''
    });
    
    showMessage('Idea added successfully!');
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    showMessage('Idea deleted');
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

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            PM PrioBoard
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Beautiful ICE/RICE Toggle Button */}
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              backgroundColor: '#f1f5f9',
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
                backgroundColor: '#457B9D',
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
                  color: model === 'ICE' ? 'white' : '#64748b',
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
                  color: model === 'RICE' ? 'white' : '#64748b',
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
            
            <button
              onClick={handleExportCSV}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
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
        gridTemplateColumns: '1.3fr 1fr',
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
                color: '#E63946',
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
                    stroke="#E63946"
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
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleAddIdea} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Title *
              </label>
              <input
                type="text"
                value={newIdea.title}
                onChange={(e) => setNewIdea(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter idea title"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Notes
              </label>
              <textarea
                value={newIdea.notes}
                onChange={(e) => setNewIdea(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '60px',
                  resize: 'vertical'
                }}
                placeholder="Optional notes"
              />
            </div>
            
            {model === 'RICE' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Reach
                </label>
                <input
                  type="number"
                  value={newIdea.reach}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, reach: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  min="0"
                />
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Impact
                </label>
                <select
                  value={newIdea.impact}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, impact: parseFloat(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={1}>Low (1)</option>
                  <option value={2}>Medium (2)</option>
                  <option value={3}>High (3)</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Confidence
                </label>
                <select
                  value={newIdea.confidence}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={0.5}>Low (50%)</option>
                  <option value={0.8}>High (80%)</option>
                  <option value={1.0}>Certain (100%)</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Effort
                </label>
                <input
                  type="number"
                  value={newIdea.effort}
                  onChange={(e) => setNewIdea(prev => ({ ...prev, effort: parseFloat(e.target.value) || 1 }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newIdea.tags}
                onChange={(e) => setNewIdea(prev => ({ ...prev, tags: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                placeholder="feature, ui, backend"
              />
            </div>
            
            <button
              type="submit"
              style={{
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Add Idea
            </button>
              </form>
            </div>
          )}
        </div>

        {/* Impact vs Effort Quadrant Chart */}
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
                
                const colors = ['#E63946', '#457B9D', '#A8DADC', '#CD8B76', '#1D3557', '#F77F00', '#FCBF49'];
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
            Ideas ({ideas.length}) - Sorted by {model} Score
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
                        fontWeight: '600',
                        color: index < 3 ? '#059669' : '#374151',
                        backgroundColor: index < 3 ? '#d1fae5' : 'transparent',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
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
                                backgroundColor: '#6b7280',
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
                            <button
                              onClick={() => handleEditIdea(idea)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#457B9D',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                marginRight: '0.25rem'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Delete
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
    </div>
  );
}
