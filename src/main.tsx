import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IncrementalApp from './IncrementalApp.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <IncrementalApp />
  </AuthProvider>
)
