import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MinimalApp from './MinimalApp.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <MinimalApp />
  </AuthProvider>
)
