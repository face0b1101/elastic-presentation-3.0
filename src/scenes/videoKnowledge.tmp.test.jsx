// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import VideoKnowledgeScene from './VideoKnowledgeScene'
import { ThemeProvider } from '../context/ThemeContext'

afterEach(cleanup)

describe('video-knowledge scene', () => {
  it('renders all three pages without throwing', () => {
    const { container, getByText } = render(
      <ThemeProvider>
        <VideoKnowledgeScene />
      </ThemeProvider>,
    )
    expect(container.textContent).toContain('somewhere in here')
    expect(container.textContent).toContain('Hours of review')

    fireEvent.click(getByText('The shift'))
    expect(container.textContent).toContain('00:12:41')
    expect(container.textContent).toContain('Hybrid retrieval · kNN + BM25 + RRF')

    fireEvent.click(getByText('Over to the demo'))
    expect(container.textContent).toContain('Every format, one index')
    expect(container.textContent).toContain('Agent Builder replies')
    expect(container.textContent).toContain('Over to the demo — one question, real government video')
    expect(container.querySelector('svg[aria-label="Elasticsearch"]')).not.toBeNull()
  })
})
