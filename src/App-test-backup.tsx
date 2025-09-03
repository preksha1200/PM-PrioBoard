import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  console.log("App component rendering...");

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Inter, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1e293b'
      }}>
        PM PrioBoard - Test Mode
      </h1>
      
      <p style={{ 
        marginBottom: '1rem',
        color: '#64748b'
      }}>
        React is working! This is a test to verify the app mounts properly.
      </p>
      
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Count: {count}
      </button>
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#1e293b'
        }}>
          Debug Info
        </h2>
        <p style={{ color: '#64748b' }}>
          If you can see this, React is mounting correctly and the blank page issue is resolved.
        </p>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Next step: Fix the component imports and Tailwind CSS configuration.
        </p>
      </div>
    </div>
  );
}
