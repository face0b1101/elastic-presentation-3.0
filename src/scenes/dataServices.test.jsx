// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import DataServicesScene, { BEATS } from './DataServicesScene'
import { ThemeProvider } from '../context/ThemeContext'

afterEach(cleanup)

describe('DataServicesScene beats', () => {
  it('exports three beats in tour order', () => {
    expect(BEATS.map((b) => b.key)).toEqual(['services', 'decoupled', 'access'])
  })

  it('gives every beat a hold the tour can clamp', () => {
    for (const beat of BEATS) {
      expect(beat.hold).toBeGreaterThan(0)
      expect(beat.step).toBeTruthy()
      expect(beat.titleAccent).toBeTruthy()
    }
  })

  it('sends the access CTA to home', () => {
    const { getByText } = render(
      <ThemeProvider>
        <DataServicesScene />
      </ThemeProvider>,
    )
    fireEvent.click(getByText('Access'))
    const cta = getByText('Over to the demo')
    expect(cta.getAttribute('href')).toBe('/')
    expect(cta.getAttribute('target')).toBe('_top')
  })
})
