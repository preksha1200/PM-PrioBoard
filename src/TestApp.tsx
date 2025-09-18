import { useState, useEffect, useMemo } from "react";
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

// Minimal test component to isolate React error #310
export default function TestApp() {
  const { user, loading } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [model, setModel] = useState<'ICE' | 'RICE'>('ICE');

  // Show loading screen while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show authentication screen if user is not logged in
  if (!user) {
    return <Auth />;
  }

  // Minimal render to test for infinite re-renders
  return (
    <div>
      <h1>Test App - No React Error #310</h1>
      <p>Model: {model}</p>
      <button onClick={() => setModel(model === 'ICE' ? 'RICE' : 'ICE')}>
        Toggle Model
      </button>
      <p>Ideas count: {ideas.length}</p>
    </div>
  );
}
