// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { ThemeProvider, readTheme } from './ThemeContext'

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
  document.documentElement.className = ''
})

afterEach(cleanup)

describe('readTheme', () => {
  it('follows the web app key when the deck is embedded', () => {
    localStorage.setItem('theme', 'light')
    localStorage.setItem('presentation-theme', 'dark')
    expect(readTheme(localStorage, '#/platform-tour?embed=1')).toBe('light')
  })

  it('keeps the deck key on a direct visit', () => {
    localStorage.setItem('theme', 'light')
    localStorage.setItem('presentation-theme', 'dark')
    expect(readTheme(localStorage, '#/hero')).toBe('dark')
  })

  it('defaults to dark when nothing is stored', () => {
    expect(readTheme(localStorage, '#/platform-tour?embed=1')).toBe('dark')
    expect(readTheme(localStorage, '#/hero')).toBe('dark')
  })
})

describe('ThemeProvider', () => {
  it('applies a theme change from the parent app and leaves the deck key alone', () => {
    window.location.hash = '#/platform-tour?embed=1'
    localStorage.setItem('theme', 'dark')

    render(<ThemeProvider><div>tour</div></ThemeProvider>)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'light' }))
    })

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('presentation-theme')).toBeNull()
  })

  it('applies a theme posted by the parent window', () => {
    window.location.hash = '#/platform-tour?embed=1'
    render(<ThemeProvider><div>tour</div></ThemeProvider>)

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'dss-theme', theme: 'light' },
        origin: window.location.origin,
      }))
    })

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(localStorage.getItem('presentation-theme')).toBeNull()
  })
})
