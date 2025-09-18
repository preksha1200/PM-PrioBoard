import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SuperMinimalApp from './SuperMinimalApp.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <SuperMinimalApp />
  </AuthProvider>
)
