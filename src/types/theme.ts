export type Theme = 'dark' | 'light' | 'system'

export interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}
