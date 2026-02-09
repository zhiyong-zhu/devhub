import { Moon, Wifi, Info } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'

export function StatusBar() {
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <div className="flex h-8 items-center justify-between px-4 border-t bg-card text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            未连接
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            DevHub v0.1.0
          </span>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="p-1 rounded-md hover:bg-accent transition-colors"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="ml-2">
          {theme === 'dark' ? '亮色' : '暗色'}
        </span>
      </button>
    </div>
  )
}
