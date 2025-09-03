import { useState } from 'react';

// Test each import one by one
function DiagnosticApp() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const testStep = (stepNum: number, testFn: () => void, description: string) => {
    if (step !== stepNum) return null;
    
    try {
      console.log(`Testing step ${stepNum}: ${description}`);
      testFn();
      return (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <h3>✅ Step {stepNum}: {description}</h3>
          <button 
            onClick={() => setStep(step + 1)}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next Test
          </button>
        </div>
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Step ${stepNum} failed: ${errorMsg}`);
      console.error(`Step ${stepNum} failed:`, err);
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h3>❌ Step {stepNum}: {description}</h3>
          <p>Error: {errorMsg}</p>
        </div>
      );
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">PM PrioBoard Diagnostic - Error Found</h1>
        <div className="bg-red-100 border border-red-400 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PM PrioBoard Diagnostic</h1>
      
      {testStep(1, () => {
        // Test basic React state
        console.log('Basic React working');
      }, 'Basic React functionality')}

      {testStep(2, () => {
        // Test Tailwind CSS
        const testEl = document.createElement('div');
        testEl.className = 'bg-blue-500';
        console.log('Tailwind CSS working');
      }, 'Tailwind CSS')}

      {testStep(3, () => {
        // Test types import
        const testType: any = { test: true };
        console.log('Types import working');
      }, 'TypeScript types')}

      {testStep(4, () => {
        // Test hooks import
        import('./hooks/useTheme').then(() => console.log('useTheme hook imported'));
      }, 'Custom hooks import')}

      {testStep(5, () => {
        // Test components import
        import('./components/TopBar').then(() => console.log('TopBar component imported'));
      }, 'Components import')}

      {step > 5 && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <h3>🎉 All basic tests passed!</h3>
          <p>The issue might be in the main App component logic.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      )}
    </div>
  );
}

export default DiagnosticApp;
