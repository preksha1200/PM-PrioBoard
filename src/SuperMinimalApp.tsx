import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

export default function SuperMinimalApp() {
  const { user, loading } = useAuth();
  const [testState, setTestState] = useState(0);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #457B9D',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if user is not logged in
  if (!user) {
    return <Auth />;
  }

  // Absolutely minimal authenticated content - NO database calls, NO complex state
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1D3557',
          marginBottom: '1rem'
        }}>
          Super Minimal Test
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Welcome, {user.email}!
        </p>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Test counter: {testState}
        </p>
        <button 
          onClick={() => setTestState(prev => prev + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#457B9D',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Increment Counter
        </button>
        <div style={{
          padding: '1rem',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '0.375rem',
          color: '#166534',
          marginTop: '1rem'
        }}>
          ✅ If you see this without React error #310, the issue is in the main App component's complex logic
        </div>
      </div>
    </div>
  );
}
