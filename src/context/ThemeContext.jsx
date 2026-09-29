import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()
const THEME_STORAGE_KEY = 'presentation-theme'
const APP_THEME_STORAGE_KEY = 'theme'
const THEME_MESSAGE = 'dss-theme'

export function isEmbeddedDeck(hash = window.location.hash) {
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  return new URLSearchParams(query).get('embed') === '1'
}

function storedTheme(storage, key) {
  const saved = storage.getItem(key)
  return saved === 'light' || saved === 'dark' ? saved : null
}

/** Embedded tour follows the web app key. A direct deck visit keeps its own. */
export function readTheme(storage = localStorage, hash = window.location.hash) {
  if (isEmbeddedDeck(hash)) {
    return storedTheme(storage, APP_THEME_STORAGE_KEY) ?? 'dark'
  }
  return storedTheme(storage, THEME_STORAGE_KEY) ?? 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readTheme())

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    if (!isEmbeddedDeck()) {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  useEffect(() => {
    if (!isEmbeddedDeck()) return undefined
    const apply = (value) => {
      if (value === 'light' || value === 'dark') setTheme(value)
    }
    const onStorage = (event) => {
      if (event.key === APP_THEME_STORAGE_KEY) apply(event.newValue)
    }
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.type !== THEME_MESSAGE) return
      apply(event.data.theme)
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('message', onMessage)
    if (window.parent !== window) {
      window.parent.postMessage({ type: `${THEME_MESSAGE}-request` }, window.location.origin)
    }
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('message', onMessage)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
