import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { applyTheme } from '@/stores/useThemeStore'

applyTheme('system')

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(<App />)
}
