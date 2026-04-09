import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "ravenclaw" | "gryffindor" | "slytherin" | "hufflepuff"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectsEnabled: boolean
  setEffectsEnabled: (enabled: boolean) => void
}

const initialState: ThemeProviderState = {
  theme: "ravenclaw",
  setTheme: () => null,
  effectsEnabled: true,
  setEffectsEnabled: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "ravenclaw",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${storageKey}-effects`)
    return saved !== null ? saved === "true" : true
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove("theme-ravenclaw", "theme-gryffindor", "theme-slytherin", "theme-hufflepuff")

    // Add current theme class
    root.classList.add(`theme-${theme}`)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    effectsEnabled,
    setEffectsEnabled: (enabled: boolean) => {
      localStorage.setItem(`${storageKey}-effects`, String(enabled))
      setEffectsEnabled(enabled)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}