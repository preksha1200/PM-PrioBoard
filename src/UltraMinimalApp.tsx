import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

export default function UltraMinimalApp() {
  const { user, loading } = useAuth();
  const [counter, setCounter] = useState(0);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  // ABSOLUTELY MINIMAL - no useEffect, no database calls, no complex state
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ultra Minimal Test</h1>
      <p>User: {user.email}</p>
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter(c => c + 1)}>
        +1
      </button>
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#e7f5e7', 
        border: '1px solid #4caf50' 
      }}>
        ✅ If this works without React error #310, the issue is in the main App's useEffect or state logic
      </div>
    </div>
  );
}
