import { useState } from 'react';

function MinimalApp() {
  const [test, setTest] = useState('PM PrioBoard Loading...');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {test}
        </h1>
        <button 
          onClick={() => setTest('PM PrioBoard is Working!')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Button
        </button>
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p>If you can see this, the basic React app is working.</p>
          <p>The issue might be in one of the complex components or hooks.</p>
        </div>
      </div>
    </div>
  );
}

export default MinimalApp;
