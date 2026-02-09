import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />
    if (theme === 'light') return <Sun className="w-4 h-4" />
    return <Moon className="w-4 h-4" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground"
    >
      {getIcon()}
    </Button>
  )
}
