import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "ravenclaw" | "gryffindor" | "slytherin" | "hufflepuff"
export type ColorMode = "light" | "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultMode?: ColorMode
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  mode: ColorMode
  setMode: (mode: ColorMode) => void
  effectsEnabled: boolean
  setEffectsEnabled: (enabled: boolean) => void
  bgOpacity: number
  setBgOpacity: (opacity: number) => void
}

const initialState: ThemeProviderState = {
  theme: "ravenclaw",
  setTheme: () => null,
  mode: "dark",
  setMode: () => null,
  effectsEnabled: true,
  setEffectsEnabled: () => null,
  bgOpacity: 30,
  setBgOpacity: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "ravenclaw",
  defaultMode = "dark",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [mode, setMode] = useState<ColorMode>(
    () => (localStorage.getItem(`${storageKey}-mode`) as ColorMode) || defaultMode
  )
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${storageKey}-effects`)
    return saved !== null ? saved === "true" : true
  })
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem(`${storageKey}-opacity`)
    return saved !== null ? parseInt(saved, 10) : 30
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme and mode classes
    root.classList.remove(
      "theme-ravenclaw", "theme-gryffindor", "theme-slytherin", "theme-hufflepuff",
      "light", "dark"
    )

    // Add current theme and mode class
    root.classList.add(`theme-${theme}`, mode)
  }, [theme, mode])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    mode,
    setMode: (mode: ColorMode) => {
      localStorage.setItem(`${storageKey}-mode`, mode)
      setMode(mode)
    },
    effectsEnabled,
    setEffectsEnabled: (enabled: boolean) => {
      localStorage.setItem(`${storageKey}-effects`, String(enabled))
      setEffectsEnabled(enabled)
    },
    bgOpacity,
    setBgOpacity: (opacity: number) => {
      localStorage.setItem(`${storageKey}-opacity`, String(opacity))
      setBgOpacity(opacity)
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