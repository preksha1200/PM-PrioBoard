import React from 'react';

export default function MinimalApp() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">PM PrioBoard - Minimal Test</h1>
      <p className="text-gray-700">If you can see this, React is working!</p>
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <p className="text-sm">This is a minimal test to verify the app loads correctly.</p>
      </div>
    </div>
  );
}
