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
    impact: 1,
    confidence: 0.8,
    effort: 1,
    tags: ''
  });
  const [message, setMessage] = useState('');

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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setModel('ICE')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: model === 'ICE' ? '#3b82f6' : '#f1f5f9',
                  color: model === 'ICE' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                ICE
              </button>
              <button
                onClick={() => setModel('RICE')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: model === 'RICE' ? '#3b82f6' : '#f1f5f9',
                  color: model === 'RICE' ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem'
      }}>
        {/* Add Ideas Form */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#1e293b'
          }}>
            Add New Idea
          </h2>
          
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
                  <tr key={idea.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{idea.title}</div>
                        {idea.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {idea.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    {model === 'RICE' && (
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                        {idea.reach?.toLocaleString() || '-'}
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {idea.impact}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {(idea.confidence * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
                      {idea.effort}
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
