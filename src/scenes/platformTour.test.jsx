// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent, act } from '@testing-library/react'
import PlatformTourScene, { buildTourSteps } from './PlatformTourScene'
import { ThemeProvider } from '../context/ThemeContext'
import { SceneMotionProvider } from '../context/SceneMotionContext'

function renderTour() {
  return render(
    <ThemeProvider>
      <SceneMotionProvider>
        <PlatformTourScene />
      </SceneMotionProvider>
    </ThemeProvider>,
  )
}

// One step per call: React flushes the state update at the end of `act`, so the
// next dwell timer is only scheduled once this one has been applied.
const advanceOneStep = (ms) => act(() => vi.advanceTimersByTime(ms))

afterEach(cleanup)

describe('platform tour scene', () => {
  it('opens on About Elastic and jumps to a page when its pill is clicked', () => {
    const { container, getByText } = renderTour()
    expect(container.textContent).toContain('5B+')

    fireEvent.click(getByText('Data Services'))
    expect(container.textContent).toContain('Intelligence specialist')

    fireEvent.click(getByText('Knowledge From Video'))
    expect(container.textContent).toContain('Searchable in Name Only')

    fireEvent.click(getByText('Unstructured Challenge'))
    expect(container.textContent).toContain('Relational databases')
  })

  it('does not auto-advance', () => {
    vi.useFakeTimers()
    try {
      const { container } = renderTour()
      expect(container.textContent).toContain('5B+')
      advanceOneStep(60000)
      expect(container.textContent).toContain('5B+')
      expect(container.textContent).not.toContain('All Your Data')
    } finally {
      vi.useRealTimers()
    }
  })

  it('advances one step on next and does not wrap', () => {
    const { container, getByLabelText, getByText } = renderTour()
    fireEvent.click(getByLabelText('Next'))
    expect(container.textContent).toContain('All Your Data')
    expect(getByLabelText('Previous').disabled).toBe(false)

    fireEvent.click(getByText('Data Services'))
    fireEvent.click(getByLabelText('Next'))
    fireEvent.click(getByLabelText('Next'))
    expect(getByLabelText('Next').disabled).toBe(true)
    fireEvent.click(getByLabelText('Next'))
    expect(container.textContent).toContain('Classic Search on One Service')
    expect(getByLabelText('Next').disabled).toBe(true)
  })

  it('holds every step between 5s and 15s', () => {
    for (const step of buildTourSteps([
      { id: 'single', title: 'Single', component: () => null },
      { id: 'fast', title: 'Fast', component: () => null, beats: [{ hold: 1200 }] },
      { id: 'slow', title: 'Slow', component: () => null, beats: [{ hold: 40000 }] },
    ])) {
      expect(step.hold).toBeGreaterThanOrEqual(5000)
      expect(step.hold).toBeLessThanOrEqual(15000)
    }
  })

  it('includes Knowledge From Video and closes on Data Services', () => {
    const { getByText } = renderTour()
    expect(getByText('Knowledge From Video')).toBeTruthy()
    expect(getByText('Data Services')).toBeTruthy()
  })

  it('gives a page one step per beat of the scene it embeds', () => {
    const steps = buildTourSteps([
      { id: 'a', title: 'A', component: () => null, beats: [{}, {}, {}] },
      { id: 'b', title: 'B', component: () => null, stepProps: [{}, {}] },
      { id: 'c', title: 'C', component: () => null },
    ])
    expect(steps.map((s) => `${s.pageIndex}:${s.stepIndex}`)).toEqual([
      '0:0', '0:1', '0:2', '1:0', '1:1', '2:0',
    ])
  })
})
