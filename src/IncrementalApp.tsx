import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ideasService } from './services/database';

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

export default function IncrementalApp() {
  const { user, loading } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [message, setMessage] = useState('');
console.log('preksha')
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  // STEP 1: Test ONLY database loading without any complex logic
  const loadIdeas = useCallback(async () => {
    try {
      console.log('🔄 Loading ideas from database...');
      const dbIdeas = await ideasService.getAll();
      console.log('✅ Database ideas loaded:', dbIdeas.length);
      
      const formattedIdeas: Idea[] = dbIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        notes: idea.notes || '',
        reach: idea.reach || undefined,
        impact: idea.impact,
        confidence: idea.confidence,
        effort: idea.effort,
        score: idea.score,
        tags: idea.tags || [],
        createdAt: idea.created_at
      }));
      
      console.log('📊 Formatted ideas:', formattedIdeas.length);
      setIdeas(formattedIdeas);
      
    } catch (error) {
      console.error('❌ Error loading ideas:', error);
      setMessage('Error loading ideas');
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  // STEP 2: Test useEffect with database loading
  useEffect(() => {
    console.log('🚀 useEffect triggered - user:', user?.id);
    if (user) {
      loadIdeas();
    }
  }, [user?.id]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Incremental Test - Database Loading Only</h1>
      <p>User: {user.email}</p>
      <p>Ideas loaded: {ideas.length}</p>
      
      {message && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '1rem' }}>
        <h3>Ideas:</h3>
        {ideas.map(idea => (
          <div key={idea.id} style={{ 
            padding: '0.5rem', 
            border: '1px solid #ccc', 
            margin: '0.5rem 0' 
          }}>
            {idea.title} - Score: {idea.score}
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#e3f2fd', 
        border: '1px solid #2196f3' 
      }}>
        🧪 Testing ONLY database loading + useEffect. If this causes React error #310, 
        the issue is in the database loading logic or useEffect dependency.
      </div>
    </div>
  );
}
