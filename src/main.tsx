import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UltraMinimalApp from './UltraMinimalApp.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <UltraMinimalApp />
  </AuthProvider>
)
