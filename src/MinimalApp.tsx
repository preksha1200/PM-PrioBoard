import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

export default function MinimalApp() {
  const { user, loading } = useAuth();

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
          <p style={{ color: '#6b7280' }}>Loading PM PrioBoard...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if user is not logged in
  if (!user) {
    return <Auth />;
  }

  // Simple authenticated content
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
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
          PM PrioBoard - Minimal Test
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Welcome, {user.email}! This is a minimal version to test authentication without infinite re-renders.
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '0.375rem',
          color: '#166534'
        }}>
          ✅ Authentication working without React error #310
        </div>
      </div>
    </div>
  );
}
